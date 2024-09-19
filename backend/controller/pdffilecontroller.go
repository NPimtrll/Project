package controller

import (
	"bytes"
	"encoding/json"
	"fmt"
	"io"
	"net/http"
	"os"
	"path/filepath"
	"time"

	"github.com/NPimtrll/Project/entity"
	"github.com/NPimtrll/Project/llm"
	"github.com/NPimtrll/Project/ocr"
	"github.com/gin-gonic/gin"
)

// UploadPDFFile อัพโหลดไฟล์ PDF
func UploadPDFFile(c *gin.Context) {
	file, err := c.FormFile("file")

	// ตรวจสอบว่ามีไฟล์หรือไม่
	if err != nil || file == nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "No file is received"})
		return
	}

	// สร้าง path ที่จะเก็บไฟล์
	filename := filepath.Base(file.Filename)
	path := filepath.Join("uploads", filename)

	// ตรวจสอบว่ามีโฟลเดอร์หรือไม่ ถ้าไม่มีให้สร้างขึ้นมา
	if err := os.MkdirAll("uploads", os.ModePerm); err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Cannot create directory"})
		return
	}

	// บันทึกไฟล์
	if err := c.SaveUploadedFile(file, path); err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Cannot save file"})
		return
	}

	// อ่านไฟล์ PDF เป็น bytes
	fileBytes, err := os.ReadFile(path)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Cannot read file"})
		return
	}

    // เรียกใช้ OCR เพื่อแปลง PDF เป็นข้อความ
    ocrText, err := ocr.RunOCR(fileBytes)
    if err != nil {
        c.JSON(http.StatusInternalServerError, gin.H{"error": "OCR processing failed", "details": err.Error()})
        return
    }

    // เรียกใช้ LLM เพื่อแก้ไขการสะกดคำ
    checkedText, err := llm.SpellCheck(ocrText)
    if err != nil {
        c.JSON(http.StatusInternalServerError, gin.H{"error": "Spellcheck processing failed", "details": err.Error()})
        return
    }

	// ดึง UserID จาก context
	userID, exists := c.Get("userID")
	var userIDUint *uint
	if exists {
		userIDValue := userID.(uint)
		userIDUint = &userIDValue
	} else {
		userIDUint = nil
	}

	// สร้างข้อมูลไฟล์ที่จะเก็บในฐานข้อมูล
	pdf := entity.PDFFile{
		Filename:   filename,
		FilePath:   path,
		UploadDate: time.Now(),
		Size:       file.Size,
		Status:     "processed", // เปลี่ยนสถานะเป็น processed หลังจาก OCR เสร็จสิ้น
		UserID:     userIDUint,
		Text:       ocrText, // เพิ่มข้อมูลข้อความที่ได้จาก OCR และการตรวจสอบคำ
	    TextCorrect: checkedText,
	}

	// บันทึกข้อมูลลงฐานข้อมูล
	if err := entity.DB().Create(&pdf).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Cannot save file information"})
		return
	}

	// สร้าง conversion record
	conversion := entity.Conversion{
		ConversionDate: time.Now(),
		Status:         "in_progress",
		PDFID:          &pdf.ID,
		UserID:         userIDUint,
	}

	// ส่ง HTTP request เพื่อสร้าง conversion record
	conversionURL := "http://localhost:8080/conversions" // ปรับ URL ตามที่ใช้งานจริง
	conversionRequest := map[string]interface{}{
		"PDFID":          pdf.ID,
		"AudioID":        nil,
		"ConversionDate": conversion.ConversionDate,
		"Status":         conversion.Status,
		"ErrorMessage":   conversion.ErrorMessage,
		"UserID":         conversion.UserID,
	}

	reqBody, _ := json.Marshal(conversionRequest)
	resp, err := http.Post(conversionURL, "application/json", bytes.NewBuffer(reqBody))
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to create conversion record"})
		return
	}
	defer resp.Body.Close()

	if resp.StatusCode != http.StatusOK {
		body, _ := io.ReadAll(resp.Body)
		c.JSON(http.StatusInternalServerError, gin.H{"error": fmt.Sprintf("Failed to create conversion record: %s", body)})
		return
	}
    // อ่าน response จาก CreateConversion API
	var conversionResponse map[string]interface{}
	if err := json.NewDecoder(resp.Body).Decode(&conversionResponse); err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to decode conversion response"})
		return
	}
    
	// ตรวจสอบว่ามี audioUrl หรือไม่
	audioUrl, ok := conversionResponse["audioUrl"].(string)
    if !ok {
        c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to retrieve audio URL"})
        return
    }
	// ส่ง response กลับไปที่ frontend
	c.JSON(http.StatusOK, gin.H{
		"message":    "File uploaded and conversion started successfully",
		"pdf":        pdf,
		"conversion": conversionResponse,
		"audioUrl":   audioUrl, // รวม URL ของไฟล์เสียงในคำตอบ
	})
}

// GET /pdf_file/:id
func GetPDFFile(c *gin.Context) {
	var pdfFile entity.PDFFile
	id := c.Param("id")
	if err := entity.DB().First(&pdfFile, id).Error; err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}
	c.JSON(http.StatusOK, gin.H{"data": pdfFile})
}

// GET /pdf_files
func ListPDFFiles(c *gin.Context) {
	var pdfFiles []entity.PDFFile
	if err := entity.DB().Find(&pdfFiles).Error; err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}
	c.JSON(http.StatusOK, gin.H{"data": pdfFiles})
}

// DELETE /pdf_files/:id
func DeletePDFFile(c *gin.Context) {
	id := c.Param("id")
	if tx := entity.DB().Delete(&entity.PDFFile{}, id); tx.RowsAffected == 0 {
		c.JSON(http.StatusBadRequest, gin.H{"error": "pdf file not found"})
		return
	}
	c.JSON(http.StatusOK, gin.H{"data": id})
}