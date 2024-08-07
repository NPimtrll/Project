package controller

import (
	"log"
	"net/http"
	"os"
	"path/filepath"
	"time"

	"github.com/NPimtrll/Project/entity"
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

	log.Printf("Sending %d bytes to OCR API", len(fileBytes))

	// เรียกใช้ OCR เพื่อแปลง PDF เป็นข้อความ
	ocrText, err := ocr.RunOCR(fileBytes) // ใช้ฟังก์ชันจาก package ocr
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "OCR processing failed"})
		return
	}

	// // เรียกใช้ Spellcheck เพื่อปรับปรุงข้อความ
	// checkedText, err := ocr.SpellCheck(ocrText) // ใช้ฟังก์ชัน SpellCheck จาก package ocr
	// if err != nil {
	// 	c.JSON(http.StatusInternalServerError, gin.H{"error": "Spellcheck processing failed"})
	// 	return
	// }

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

	// // บันทึก conversion record ลงฐานข้อมูล
	if err := entity.DB().Create(&conversion).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to create conversion record"})
		return
	}

	// // เริ่มกระบวนการแปลงข้อความเป็นไฟล์เสียง
	go func() {
		audioData, err := TextToSpeechLongText(ocrText)
		if err != nil {
			conversion.Status = "failed"
			conversion.ErrorMessage = err.Error()
			entity.DB().Save(&conversion)
			return
		}

		audioFilename := filepath.Base(filename) + ".wav"
		audioPath := filepath.Join("uploads/audio", audioFilename)

		// สร้างโฟลเดอร์ถ้าไม่มี
		if err := os.MkdirAll(filepath.Dir(audioPath), os.ModePerm); err != nil {
			conversion.Status = "failed"
			conversion.ErrorMessage = err.Error()
			entity.DB().Save(&conversion)
			return
		}

		// บันทึกไฟล์เสียง
		if err := os.WriteFile(audioPath, audioData, os.ModePerm); err != nil {
			conversion.Status = "failed"
			conversion.ErrorMessage = err.Error()
			entity.DB().Save(&conversion)
			return
		}

		// สร้างข้อมูลไฟล์เสียงที่จะเก็บในฐานข้อมูล
		audioFile := entity.AudioFile{
			Filename: audioFilename,
			FilePath: audioPath,
			Status:   "generated",
			Size:     int64(len(audioData)),
			UserID:   userIDUint,
			PDFID:    &pdf.ID,
		}

		// บันทึกข้อมูลไฟล์เสียงลงฐานข้อมูล
		if err := entity.DB().Create(&audioFile).Error; err != nil {
			conversion.Status = "failed"
			conversion.ErrorMessage = err.Error()
			entity.DB().Save(&conversion)
			return
		}

		// อัพเดต conversion record กับข้อมูล AudioID
		conversion.AudioID = &audioFile.ID
		conversion.Status = "completed"
		entity.DB().Save(&conversion)
	}()

	// ตอบกลับ
	c.JSON(http.StatusOK, gin.H{"message": "File uploaded successfully", "pdf": pdf})
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
