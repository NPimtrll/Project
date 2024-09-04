package controller

import (
	"net/http"
	"strconv"

	"github.com/NPimtrll/Project/entity"
	"github.com/gin-gonic/gin"
)

// GET /users/audio_files
func AudioFilesByUserId(c *gin.Context) {
	// ดึง UserID จาก context
	userID, exists := c.Get("userID")
	if !exists {
		c.JSON(http.StatusUnauthorized, gin.H{"error": "User ID not found"})
		return
	}

	// ตรวจสอบว่าค่า userID เป็นประเภทที่ถูกต้องหรือไม่
	userIDUint, ok := userID.(uint)
	if !ok {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Invalid user ID format"})
		return
	}

	var audioFiles []entity.AudioFile
	if err := entity.DB().Where("user_id = ?", userIDUint).Find(&audioFiles).Error; err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	c.JSON(http.StatusOK, gin.H{"data": audioFiles})
}


// POST /audio_files
func CreateAudioFile(c *gin.Context) {
	var audioFile entity.AudioFile
	if err := c.ShouldBindJSON(&audioFile); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}
	if err := entity.DB().Create(&audioFile).Error; err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}
	c.JSON(http.StatusOK, gin.H{"data": audioFile})
}

// GET /audio_file/:id
func GetAudioFile(c *gin.Context) {
	var audioFile entity.AudioFile
	id := c.Param("id")
	if err := entity.DB().Raw("SELECT * FROM audio_files WHERE id = ?", id).Scan(&audioFile).Error; err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}
	c.JSON(http.StatusOK, gin.H{"data": audioFile})
}

// GET /audio_files
// backend/controller/audiofilecontroller.go
func ListAudioFiles(c *gin.Context) {
	userId, _ := strconv.Atoi(c.Query("user_id"))
	var audioFiles []entity.AudioFile
	if err := entity.DB().Where("user_id = ?", userId).Find(&audioFiles).Error; err != nil {
	  c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
	  return
	}
	c.JSON(http.StatusOK, gin.H{"data": audioFiles})
  }
  

// DELETE /audio_files/:id
func DeleteAudioFile(c *gin.Context) {
	id := c.Param("id")
	if tx := entity.DB().Exec("DELETE FROM audio_files WHERE id = ?", id); tx.RowsAffected == 0 {
		c.JSON(http.StatusBadRequest, gin.H{"error": "audio file not found"})
		return
	}
	c.JSON(http.StatusOK, gin.H{"data": id})
}

// PATCH /audio_files
func UpdateAudioFile(c *gin.Context) {
	var audioFile entity.AudioFile
	if err := c.ShouldBindJSON(&audioFile); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}
	if tx := entity.DB().Where("id = ?", audioFile.ID).First(&audioFile); tx.RowsAffected == 0 {
		c.JSON(http.StatusBadRequest, gin.H{"error": "audio file not found"})
		return
	}
	if err := entity.DB().Save(&audioFile).Error; err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}
	c.JSON(http.StatusOK, gin.H{"data": audioFile})
}

// GET /download_audio/:id
// GET /download_audio/:id
func DownloadAudioFile(c *gin.Context) {
    id := c.Param("id")
    var audioFile entity.AudioFile

    if err := entity.DB().First(&audioFile, id).Error; err != nil {
        c.JSON(http.StatusBadRequest, gin.H{"error": "Audio file not found"})
        return
    }

    // Set headers to force download
    c.Header("Content-Description", "File Transfer")
    c.Header("Content-Disposition", "attachment; filename="+audioFile.Filename)
    c.Header("Content-Type", "application/octet-stream")
    c.Header("Content-Transfer-Encoding", "binary")
    c.Header("Expires", "0")
    c.Header("Cache-Control", "must-revalidate")
    c.Header("Pragma", "public")

    c.File(audioFile.FilePath)
}
