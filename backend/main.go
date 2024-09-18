package main

import (
	"io/ioutil"
	"log"
	"net/http"
	"os"
	"path/filepath"

	"github.com/NPimtrll/Project/controller"
	"github.com/NPimtrll/Project/entity"
	"github.com/NPimtrll/Project/middlewares"
	"github.com/NPimtrll/Project/ocr" // import package ocr
	"github.com/gin-gonic/gin"
	"github.com/joho/godotenv"
)

func uploadAudiotest(c *gin.Context) {
	// รับไฟล์จาก request
	file, _, err := c.Request.FormFile("audio")
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}
	defer file.Close()

	// สร้างไฟล์ใหม่ในโฟลเดอร์ uploads
	out, err := os.Create("./uploads/test/audio-file.wav") // เปลี่ยนชื่อไฟล์และตำแหน่งตามต้องการ
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to create file"})
		return
	}
	defer out.Close()

	// คัดลอกเนื้อหาจาก file ไปยังไฟล์ใหม่
	_, err = out.ReadFrom(file)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to save file"})
		return
	}

	// ส่ง URL ของไฟล์ที่อัปโหลดกลับไปให้ frontend
	fileURL := "http://localhost:8080/uploads/audio-file.wav"
	c.JSON(http.StatusOK, gin.H{"url": fileURL})
}
func listAudioFiles(c *gin.Context) {
	files, err := filepath.Glob("./uploads/test/*")
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to list files"})
		return
	}

	// สร้าง URL สำหรับไฟล์
	var fileUrls []string
	for _, file := range files {
		fileName := filepath.Base(file)
		fileUrl := "http://localhost:8080/uploads/test/" + fileName
		fileUrls = append(fileUrls, fileUrl)
	}

	c.JSON(http.StatusOK, gin.H{"files": fileUrls})
}

func main() {
	entity.SetupDatabase()

	err := godotenv.Load()
	if err != nil {
		log.Fatal("Error loading .env file")
	}

	// Access environment variables
	apiKey := os.Getenv("HUGGING_FACE_API_KEY")
	if apiKey == "" {
		log.Fatal("HUGGING_FACE_API_KEY is not set")
	}


	r := gin.Default()
	r.Use(CORSMiddleware())
	
	// เสิร์ฟไฟล์จากโฟลเดอร์ uploads/audio
	r.Static("/uploads/audio", "./uploads/audio")
	
	// User routes
	r.POST("/user", controller.CreateUser)
	r.GET("/user/:id", controller.GetUser)
	r.GET("/users", controller.ListUsers)
	r.DELETE("/user/:id", controller.DeleteUser)
	r.PATCH("/user", controller.UpdateUser)

	// Session routes
	r.POST("/login", controller.Login)
	r.GET("/sessions", controller.ListSessions)
	r.DELETE("/session", controller.DeleteSession)

	// Protected routes
	protected := r.Group("/")
	protected.Use(middlewares.AuthorizeJWT())
	{
		protected.POST("/upload_pdf", controller.UploadPDFFile) // Endpoint สำหรับอัปโหลด PDF
		protected.GET("/pdf_file/:id", controller.GetPDFFile)
		protected.GET("/pdf_files", controller.ListPDFFiles)
		protected.DELETE("/pdf_files/:id", controller.DeletePDFFile)

		protected.GET("/users/audio_files", controller.AudioFilesByUserId) 
		protected.POST("/audio_files", controller.CreateAudioFile)
		protected.GET("/audio_file/:id", controller.GetAudioFile)
		protected.GET("/audio_files", controller.ListAudioFiles)
		protected.DELETE("/audio_files/:id", controller.DeleteAudioFile)
		protected.PATCH("/audio_files", controller.UpdateAudioFile)
		protected.GET("/download_audio/:id", controller.DownloadAudioFile) // Endpoint สำหรับดาวน์โหลด Audio

		protected.POST("/conversions", controller.CreateConversion)
		protected.GET("/conversion/:id", controller.GetConversion)
		protected.GET("/conversion/:id/status", controller.GetConversionStatus)
		protected.GET("/conversions", controller.ListConversions)
		protected.DELETE("/conversions/:id", controller.DeleteConversion)
		protected.PATCH("/conversions", controller.UpdateConversion)

		protected.POST("/image_files", controller.CreateImageFile)
		protected.GET("/image_file/:id", controller.GetImageFile)
		protected.GET("/image_files", controller.ListImageFiles)
		protected.DELETE("/image_files/:id", controller.DeleteImageFile)
		protected.PATCH("/image_files", controller.UpdateImageFile)

		protected.GET("/textPdf", controller.GetLatestTextCorrect)

		protected.GET("/protected_resource", func(c *gin.Context) {
			c.JSON(http.StatusOK, gin.H{"message": "This is a protected resource"})
		})

		protected.POST("/ocr", func(c *gin.Context) {
			file, _, err := c.Request.FormFile("file") // อ่านไฟล์ PDF จาก form
			if err != nil {
				c.JSON(http.StatusBadRequest, gin.H{"error": "Failed to get file from request", "details": err.Error()})
				return
			}
			defer file.Close()
		
			pdfBytes, err := ioutil.ReadAll(file)
			if err != nil {
				c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to read file", "details": err.Error()})
				return
			}
		
			// Run OCR
			ocrOutput, err := ocr.RunOCR(pdfBytes)
			if err != nil {
				c.JSON(http.StatusInternalServerError, gin.H{"error": "OCR processing failed", "details": err.Error()})
				return
			}
			// Run Spell Check
			// spellCheckedOutput, err := ocr.SpellCheck(ocrOutput)
			// if err != nil {
			// 	c.JSON(http.StatusInternalServerError, gin.H{"error": "Spell check processing failed", "details": err.Error()})
			// 	return
			// }
		
			c.JSON(http.StatusOK, gin.H{"ocr_output": ocrOutput})
		})
	}
	r.Static("/uploads/test", "./uploads/test")
	// กำหนด API Endpoint ที่จะลิสต์ไฟล์ทั้งหมด
	r.GET("/list-audio-files", listAudioFiles)
	r.POST("/uploadtest", uploadAudiotest)
	// r.Static("/uploads", "./uploads")
	r.Run()
}

func CORSMiddleware() gin.HandlerFunc {
	return func(c *gin.Context) {
		c.Writer.Header().Set("Access-Control-Allow-Origin", "*")
		c.Writer.Header().Set("Access-Control-Allow-Credentials", "true")
		c.Writer.Header().Set("Access-Control-Allow-Headers", "Content-Type, Content-Length, Accept-Encoding, X-CSRF-Token, Authorization, accept, origin, Cache-Control, X-Requested-With")
		c.Writer.Header().Set("Access-Control-Allow-Methods", "POST, OPTIONS, GET, PUT, DELETE")


		if c.Request.Method == "OPTIONS" {
			c.AbortWithStatus(204)
			return
		}

		c.Next()
	}
}
