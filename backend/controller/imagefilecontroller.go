package controller

import (
	"net/http"

	"github.com/gin-gonic/gin"
	"github.com/NPimtrll/Project/entity"
)

// POST /image_files
func CreateImageFile(c *gin.Context) {
	var imageFile entity.ImageFile
	if err := c.ShouldBindJSON(&imageFile); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}
	if err := entity.DB().Create(&imageFile).Error; err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}
	c.JSON(http.StatusOK, gin.H{"data": imageFile})
}

// GET /image_file/:id
func GetImageFile(c *gin.Context) {
	var imageFile entity.ImageFile
	id := c.Param("id")
	if err := entity.DB().Raw("SELECT * FROM image_files WHERE id = ?", id).Scan(&imageFile).Error; err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}
	c.JSON(http.StatusOK, gin.H{"data": imageFile})
}

// GET /image_files
func ListImageFiles(c *gin.Context) {
	var imageFiles []entity.ImageFile
	if err := entity.DB().Raw("SELECT * FROM image_files").Scan(&imageFiles).Error; err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}
	c.JSON(http.StatusOK, gin.H{"data": imageFiles})
}

// DELETE /image_files/:id
func DeleteImageFile(c *gin.Context) {
	id := c.Param("id")
	if tx := entity.DB().Exec("DELETE FROM image_files WHERE id = ?", id); tx.RowsAffected == 0 {
		c.JSON(http.StatusBadRequest, gin.H{"error": "image file not found"})
		return
	}
	c.JSON(http.StatusOK, gin.H{"data": id})
}

// PATCH /image_files
func UpdateImageFile(c *gin.Context) {
	var imageFile entity.ImageFile
	if err := c.ShouldBindJSON(&imageFile); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}
	if tx := entity.DB().Where("id = ?", imageFile.ID).First(&imageFile); tx.RowsAffected == 0 {
		c.JSON(http.StatusBadRequest, gin.H{"error": "image file not found"})
		return
	}
	if err := entity.DB().Save(&imageFile).Error; err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}
	c.JSON(http.StatusOK, gin.H{"data": imageFile})
}
