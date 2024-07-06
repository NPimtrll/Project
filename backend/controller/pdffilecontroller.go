package controller

import (
	"net/http"
	"os"
	"path/filepath"
	"time"

	"github.com/NPimtrll/Project/entity"
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

	// สร้างข้อมูลไฟล์ที่จะเก็บในฐานข้อมูล
	pdf := entity.PDFFile{
		Filename:   filename,
		FilePath:   path,
		UploadDate: time.Now(),
		Size:       file.Size,
		Status:     "uploaded",
	}

	// บันทึกข้อมูลลงฐานข้อมูล
	if err := entity.DB().Create(&pdf).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Cannot save file information"})
		return
	}

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

// PATCH /pdf_files
func UpdatePDFFile(c *gin.Context) {
	var pdfFile entity.PDFFile
	if err := c.ShouldBindJSON(&pdfFile); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}
	if tx := entity.DB().Where("id = ?", pdfFile.ID).First(&pdfFile); tx.RowsAffected == 0 {
		c.JSON(http.StatusBadRequest, gin.H{"error": "pdf file not found"})
		return
	}
	if err := entity.DB().Save(&pdfFile).Error; err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}
	c.JSON(http.StatusOK, gin.H{"data": pdfFile})
}
