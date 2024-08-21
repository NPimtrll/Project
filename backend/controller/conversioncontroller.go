package controller

import (
	"bytes"
	"encoding/json"
	"fmt"
	"net/http"
	"os"
	"path/filepath"
	"time"

	"io"

	"github.com/NPimtrll/Project/entity"
	"github.com/gin-gonic/gin"
	"gorm.io/gorm"
)

type TextToSpeechRequest struct {
	Inputs string `json:"inputs"`
}

func SplitText(text string, chunkSize int) []string {
	var chunks []string
	for len(text) > chunkSize {
		chunks = append(chunks, text[:chunkSize])
		text = text[chunkSize:]
	}
	chunks = append(chunks, text)
	return chunks
}

func TextToSpeechChunk(text string) ([]byte, error) {
	url := "https://api-inference.huggingface.co/models/Nithu/text-to-speech"
	reqBody := TextToSpeechRequest{Inputs: text}
	jsonData, err := json.Marshal(reqBody)
	if err != nil {
		return nil, err
	}

	req, err := http.NewRequest("POST", url, bytes.NewBuffer(jsonData))
	if err != nil {
		return nil, err
	}
	req.Header.Set("Authorization", "Bearer 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")
	req.Header.Set("Content-Type", "application/json")

	client := &http.Client{}
	resp, err := client.Do(req)
	if err != nil {
		return nil, err
	}
	defer resp.Body.Close()

	if resp.StatusCode != http.StatusOK {
		body, _ := io.ReadAll(resp.Body)
		return nil, fmt.Errorf("TextToSpeech API error: %s - %s", resp.Status, body)
	}

	audioData, err := io.ReadAll(resp.Body)
	if err != nil {
		return nil, err
	}

	return audioData, nil
}

func TextToSpeechLongText(text string) ([]byte, error) {
	const chunkSize = 500 // ปรับขนาด chunk ตามขีดจำกัดของ API
	textChunks := SplitText(text, chunkSize)

	var audioData []byte
	for _, chunk := range textChunks {
		chunkAudioData, err := TextToSpeechChunk(chunk)
		if err != nil {
			return nil, err
		}
		audioData = append(audioData, chunkAudioData...)
	}

	return audioData, nil
}

func CreateConversion(c *gin.Context) {
	var conversion entity.Conversion
	if err := c.ShouldBindJSON(&conversion); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	if conversion.PDFID == nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "PDFID is required"})
		return
	}

	var pdfFile entity.PDFFile
	if err := entity.DB().First(&pdfFile, conversion.PDFID).Error; err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "PDF file not found"})
		return
	}

	conversion.Status = "in_progress"
	conversion.ConversionDate = time.Now()

	// Save initial conversion status to database
	if err := entity.DB().Save(&conversion).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to save initial conversion status"})
		return
	}

	var audioData []byte
	var err error

	audioData, err = TextToSpeechLongText(pdfFile.Text)
	if err != nil {
		conversion.Status = "failed"
		conversion.ErrorMessage = err.Error()
		entity.DB().Save(&conversion)
		return
	}

	audioFilename := filepath.Base(pdfFile.Filename) + ".wav"
	audioPath := filepath.Join("uploads/audio", audioFilename)

	if err := os.MkdirAll(filepath.Dir(audioPath), 0755); err != nil {
		conversion.Status = "failed"
		conversion.ErrorMessage = err.Error()
		entity.DB().Save(&conversion)
		return
	}

	if err := os.WriteFile(audioPath, audioData, 0644); err != nil {
		conversion.Status = "failed"
		conversion.ErrorMessage = err.Error()
		entity.DB().Save(&conversion)
		return
	}

	audioFile := entity.AudioFile{
		Filename:       audioFilename,
		FilePath:       audioPath,
		Status:         "generated",
		Size:           int64(len(audioData)),
		ConversionDate: time.Now(),
		Format:         "wav",
		Duration:       0,
		PDFID:          conversion.PDFID,
		UserID:         conversion.UserID,
	}

	if err := entity.DB().Create(&audioFile).Error; err != nil {
		conversion.Status = "failed"
		conversion.ErrorMessage = err.Error()
		entity.DB().Save(&conversion)
		return
	}

	// Use the created audioFile directly to update conversion
	fmt.Print("&audioFile.ID", audioFile.ID)
	conversion.AudioID = &audioFile.ID
	conversion.Status = "completed"
	conversion.ErrorMessage = ""

	if err := entity.DB().Save(&conversion).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to update conversion record"})
		return
	}

	audioUrl := fmt.Sprintf("/uploads/audio/%s", audioFilename)

	// Send success response with audio URL
	c.JSON(http.StatusOK, gin.H{"message": "Conversion completed", "data": conversion, "audioUrl": audioUrl})
}

// GET /conversion/:id/status
func GetConversionStatus(c *gin.Context) {
	id := c.Param("id")

	// ตรวจสอบรูปแบบ ID
	if id == "" {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid ID"})
		return
	}

	var conversion entity.Conversion
	if err := entity.DB().First(&conversion, id).Error; err != nil {
		// หากไม่พบการแปลงที่ตรงกัน
		if err == gorm.ErrRecordNotFound {
			c.JSON(http.StatusNotFound, gin.H{"error": "Conversion not found"})
		} else {
			c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		}
		return
	}

	// ส่งข้อมูลสถานะของการแปลงกลับ
	c.JSON(http.StatusOK, gin.H{
		"status":         conversion.Status,
		"conversionID":   conversion.ID,
		"errorMessage":   conversion.ErrorMessage,   // เพิ่มข้อมูล error message ถ้ามี
		"conversionDate": conversion.ConversionDate, // เพิ่มข้อมูลวันที่สร้าง
	})
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
