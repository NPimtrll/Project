package main

import (
	"io/ioutil"
	"log"
	"net/http"
	"os"

	"github.com/NPimtrll/Project/controller"
	"github.com/NPimtrll/Project/entity"
	"github.com/NPimtrll/Project/middlewares"
	"github.com/NPimtrll/Project/ocr" // import package ocr
	"github.com/gin-gonic/gin"
	"github.com/joho/godotenv"
)

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
