package controller

import (
	"net/http"

	"github.com/gin-gonic/gin"
	"github.com/NPimtrll/Project/entity"
)

// POST /conversions
func CreateConversion(c *gin.Context) {
	var conversion entity.Conversion
	if err := c.ShouldBindJSON(&conversion); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}
	if err := entity.DB().Create(&conversion).Error; err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}
	c.JSON(http.StatusOK, gin.H{"data": conversion})
}

// GET /conversion/:id
func GetConversion(c *gin.Context) {
	var conversion entity.Conversion
	id := c.Param("id")
	if err := entity.DB().Raw("SELECT * FROM conversions WHERE id = ?", id).Scan(&conversion).Error; err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}
	c.JSON(http.StatusOK, gin.H{"data": conversion})
}

// GET /conversions
func ListConversions(c *gin.Context) {
	var conversions []entity.Conversion
	if err := entity.DB().Raw("SELECT * FROM conversions").Scan(&conversions).Error; err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}
	c.JSON(http.StatusOK, gin.H{"data": conversions})
}

// DELETE /conversions/:id
func DeleteConversion(c *gin.Context) {
	id := c.Param("id")
	if tx := entity.DB().Exec("DELETE FROM conversions WHERE id = ?", id); tx.RowsAffected == 0 {
		c.JSON(http.StatusBadRequest, gin.H{"error": "conversion not found"})
		return
	}
	c.JSON(http.StatusOK, gin.H{"data": id})
}

// PATCH /conversions
func UpdateConversion(c *gin.Context) {
	var conversion entity.Conversion
	if err := c.ShouldBindJSON(&conversion); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}
	if tx := entity.DB().Where("id = ?", conversion.ID).First(&conversion); tx.RowsAffected == 0 {
		c.JSON(http.StatusBadRequest, gin.H{"error": "conversion not found"})
		return
	}
	if err := entity.DB().Save(&conversion).Error; err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}
	c.JSON(http.StatusOK, gin.H{"data": conversion})
}