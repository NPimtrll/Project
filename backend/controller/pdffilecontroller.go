package controller

import (
	"net/http"
    "path/filepath"
	"github.com/gin-gonic/gin"
	"github.com/NPimtrll/Project/entity"
)

// POST /upload_pdf
func UploadPDFFile(c *gin.Context) {
	file, err := c.FormFile("file")
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "File upload failed"})
		return
	}

	filename := filepath.Base(file.Filename)
	filepath := "./uploads/pdf/" + filename

	if err := c.SaveUploadedFile(file, filepath); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "File save failed"})
		return
	}

	userID := uint(1) // Replace with actual user ID

	pdfFile := entity.PDFFile{
		Filename: filename,
		FilePath: filepath,
		Status:   "uploaded",
		Size:     file.Size,
		Source:   "uploaded",
		UserID:   &userID,
	}

	if err := entity.DB().Create(&pdfFile).Error; err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Database save failed"})
		return
	}

	c.JSON(http.StatusOK, gin.H{"data": pdfFile})
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