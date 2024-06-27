package controller

import (
	"net/http"
	"time"

	"github.com/NPimtrll/Project/entity"
	"github.com/gin-gonic/gin"
)

// UploadPDFFile ฟังก์ชันจัดการการอัปโหลดไฟล์ PDF
func UploadPDFFile(c *gin.Context) {
	file, err := c.FormFile("pdf")
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "No file is received"})
		return
	}

	// บันทึกไฟล์ลงในโฟลเดอร์
	filePath := "uploads/" + file.Filename
	if err := c.SaveUploadedFile(file, filePath); err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	// สร้าง record สำหรับไฟล์ PDF ในฐานข้อมูล
	pdfFile := entity.PDFFile{
		Filename:   file.Filename,
		FilePath:   filePath,
		UploadDate: time.Now(),
		Size:       file.Size,
		Status:     "uploaded",
		Source:     "uploaded",
	}

	if err := entity.DB().Create(&pdfFile).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	// ส่งข้อมูลกลับไปยัง frontend
	c.JSON(http.StatusOK, gin.H{"message": "File uploaded successfully", "file": file.Filename})
}

// GET /pdf_file/:id
func GetPDFFile(c *gin.Context) {
	var pdfFile entity.PDFFile
	id := c.Param("id")
	if err := entity.DB().Raw("SELECT * FROM pdf_files WHERE id = ?", id).Scan(&pdfFile).Error; err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}
	c.JSON(http.StatusOK, gin.H{"data": pdfFile})
}

// GET /pdf_files
func ListPDFFiles(c *gin.Context) {
	var pdfFiles []entity.PDFFile
	if err := entity.DB().Raw("SELECT * FROM pdf_files").Scan(&pdfFiles).Error; err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}
	c.JSON(http.StatusOK, gin.H{"data": pdfFiles})
}

// DELETE /pdf_files/:id
func DeletePDFFile(c *gin.Context) {
	id := c.Param("id")
	if tx := entity.DB().Exec("DELETE FROM pdf_files WHERE id = ?", id); tx.RowsAffected == 0 {
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
