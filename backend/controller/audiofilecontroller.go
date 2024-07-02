package controller

import (
	"net/http"
	"path/filepath"

	"github.com/NPimtrll/Project/entity"
	"github.com/gin-gonic/gin"
)

// POST /upload_audio
func UploadAudioFile(c *gin.Context) {
	file, err := c.FormFile("file")
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "File upload failed"})
		return
	}

	filename := filepath.Base(file.Filename)
	filepath := "./uploads/audio/" + filename

	if err := c.SaveUploadedFile(file, filepath); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "File save failed"})
		return
	}

	userID := uint(1)

	audioFile := entity.AudioFile{
		Filename: filename,
		FilePath: filepath,
		// ควรจะตั้งค่า ConversionDate, Format, Duration, Size, และอื่นๆ ตามที่ต้องการ
		Status: "uploaded",
		Size:   file.Size,
		UserID: &userID, // Replace with actual user ID
	}

	if err := entity.DB().Create(&audioFile).Error; err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Database save failed"})
		return
	}

	c.JSON(http.StatusOK, gin.H{"data": audioFile})
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
func ListAudioFiles(c *gin.Context) {
	var audioFiles []entity.AudioFile
	if err := entity.DB().Raw("SELECT * FROM audio_files").Scan(&audioFiles).Error; err != nil {
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
func DownloadAudioFile(c *gin.Context) {
	id := c.Param("id")
	var audioFile entity.AudioFile

	if err := entity.DB().First(&audioFile, id).Error; err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Audio file not found"})
		return
	}

	c.File(audioFile.FilePath)
}