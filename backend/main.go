package main

import (
	"net/http"

	"github.com/gin-gonic/gin"

	"github.com/NPimtrll/Project/controller"

	"github.com/NPimtrll/Project/entity"

	"github.com/NPimtrll/Project/middlewares"
)

func main() {

	entity.SetupDatabase()

	r := gin.Default()

	r.Use(CORSMiddleware())

	// User routes
	r.POST("/user", controller.CreateUser)
	r.GET("/user/:id", controller.GetUser)
	r.GET("/users", controller.ListUsers)
	r.DELETE("/user/:id", controller.DeleteUser)
	r.PATCH("/user", controller.UpdateUser)

	// PDF File routes
	r.POST("/upload_pdf", controller.UploadPDFFile) // Endpoint สำหรับอัปโหลด PDF
	r.GET("/pdf_file/:id", controller.GetPDFFile)
	r.GET("/pdf_files", controller.ListPDFFiles)
	r.DELETE("/pdf_files/:id", controller.DeletePDFFile)
	r.PATCH("/pdf_files", controller.UpdatePDFFile)

	// Audio File routes
	r.POST("/upload_audio", controller.UploadAudioFile) // Endpoint สำหรับอัปโหลด Audio
	r.POST("/audio_files", controller.CreateAudioFile)
	r.GET("/audio_file/:id", controller.GetAudioFile)
	r.GET("/audio_files", controller.ListAudioFiles)
	r.DELETE("/audio_files/:id", controller.DeleteAudioFile)
	r.PATCH("/audio_files", controller.UpdateAudioFile)
	r.GET("/download_audio/:id", controller.DownloadAudioFile) // Endpoint สำหรับดาวน์โหลด Audio

	// Conversion routes
	r.POST("/conversions", controller.CreateConversion)
	r.GET("/conversion/:id", controller.GetConversion)
	r.GET("/conversions", controller.ListConversions)
	r.DELETE("/conversions/:id", controller.DeleteConversion)
	r.PATCH("/conversions", controller.UpdateConversion)

	// Image File routes
	r.POST("/image_files", controller.CreateImageFile)
	r.GET("/image_file/:id", controller.GetImageFile)
	r.GET("/image_files", controller.ListImageFiles)
	r.DELETE("/image_files/:id", controller.DeleteImageFile)
	r.PATCH("/image_files", controller.UpdateImageFile)

	// Session routes
	r.POST("/login", controller.Login)
	r.POST("/sessions", controller.CreateSession)
	r.GET("/sessions", controller.ListSessions)
	r.DELETE("/sessions/:id", controller.DeleteSession)

	// Protected routes (example)
	protected := r.Group("/")
	protected.Use(middlewares.AuthorizeJWT())
	{
		protected.GET("/protected_resource", func(c *gin.Context) {
			c.JSON(http.StatusOK, gin.H{"message": "This is a protected resource"})
		})
	}

	r.Run()

}

func CORSMiddleware() gin.HandlerFunc {

	return func(c *gin.Context) {

		c.Writer.Header().Set("Access-Control-Allow-Origin", "*")

		c.Writer.Header().Set("Access-Control-Allow-Credentials", "true")

		c.Writer.Header().Set("Access-Control-Allow-Headers", "Content-Type, Content-Length, Accept-Encoding, X-CSRF-Token, Authorization, accept, origin, Cache-Control, X-Requested-With")

		c.Writer.Header().Set("Access-Control-Allow-Methods", "POST, OPTIONS, GET, PUT")

		if c.Request.Method == "OPTIONS" {

			c.AbortWithStatus(204)

			return

		}

		c.Next()

	}

}
