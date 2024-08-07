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
	req.Header.Set("Authorization", "Bearer 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") // เปลี่ยน YOUR_HUGGINGFACE_TOKEN เป็น Token ของคุณ
	req.Header.Set("Content-Type", "application/json")

	client := &http.Client{}
	resp, err := client.Do(req)
	if err != nil {
		return nil, err
	}
	defer resp.Body.Close()

	if resp.StatusCode != http.StatusOK {
		return nil, fmt.Errorf("TextToSpeech API error: %s", resp.Status)
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

// POST /conversions
func CreateConversion(c *gin.Context) {
    // อ่านข้อมูลจาก request body
    var conversion entity.Conversion
    if err := c.ShouldBindJSON(&conversion); err != nil {
        c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
        return
    }

    // ตรวจสอบว่ามี PDFID และ AudioID หรือไม่
    if conversion.PDFID == nil {
        c.JSON(http.StatusBadRequest, gin.H{"error": "PDFID is required"})
        return
    }

    // ตรวจสอบว่ามี PDF file หรือไม่
    var pdfFile entity.PDFFile
    if err := entity.DB().First(&pdfFile, conversion.PDFID).Error; err != nil {
        c.JSON(http.StatusBadRequest, gin.H{"error": "PDF file not found"})
        return
    }

    // ตรวจสอบว่ามี Audio file หรือไม่
    var audioFile entity.AudioFile
    if conversion.AudioID != nil {
        if err := entity.DB().First(&audioFile, conversion.AudioID).Error; err != nil {
            c.JSON(http.StatusBadRequest, gin.H{"error": "Audio file not found"})
            return
        }
    }

    // ตั้งค่าสถานะเริ่มต้น
    conversion.Status = "in_progress"
    conversion.ConversionDate = time.Now()

    // บันทึกข้อมูลลงฐานข้อมูล
    if err := entity.DB().Create(&conversion).Error; err != nil {
        c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to create conversion record"})
        return
    }

    // เริ่มกระบวนการแปลงข้อความเป็นไฟล์เสียง
    go func() {
        var audioData []byte
        var err error
        if audioFile.ID == 0 {
            audioData, err = TextToSpeechLongText(pdfFile.Text)
            if err != nil {
                conversion.Status = "failed"
                conversion.ErrorMessage = err.Error()
                entity.DB().Save(&conversion)
                return
            }

            // สร้างชื่อไฟล์เสียงและ path
            audioFilename := filepath.Base(pdfFile.Filename) + ".wav"
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

            // กำหนดค่าของ PDFID ให้เป็น pointer
			pdfID := pdfFile.ID

			audioFile = entity.AudioFile{
				Filename:     audioFilename,
				FilePath:     audioPath,
				Status:       "generated",
				Size:         int64(len(audioData)),
				ConversionDate: time.Now(),
				Format:       "wav",
				Duration:     0, // คุณสามารถตั้งค่า duration ตามที่จำเป็น
				PDFID:        &pdfID, // เปลี่ยน pdfID เป็น pointer
				UserID:       conversion.UserID,
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
        }

        // อัพเดต conversion record เป็น completed
        conversion.Status = "completed"
        entity.DB().Save(&conversion)
    }()

    // ตอบกลับด้วยข้อมูลการแปลงที่ถูกสร้าง
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