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

	// Session routes
	r.POST("/login", controller.Login)
	r.GET("/sessions", controller.ListSessions)
	r.DELETE("/sessions/:id", controller.DeleteSession)

	// Protected routes
	protected := r.Group("/")
	protected.Use(middlewares.AuthorizeJWT())
	{
		protected.POST("/upload_pdf", controller.UploadPDFFile) // Endpoint สำหรับอัปโหลด PDF
		protected.GET("/pdf_file/:id", controller.GetPDFFile)
		protected.GET("/pdf_files", controller.ListPDFFiles)
		protected.DELETE("/pdf_files/:id", controller.DeletePDFFile)
		protected.PATCH("/pdf_files", controller.UpdatePDFFile)

		protected.POST("/upload_audio", controller.UploadAudioFile) // Endpoint สำหรับอัปโหลด Audio
		protected.POST("/audio_files", controller.CreateAudioFile)
		protected.GET("/audio_file/:id", controller.GetAudioFile)
		protected.GET("/audio_files", controller.ListAudioFiles)
		protected.DELETE("/audio_files/:id", controller.DeleteAudioFile)
		protected.PATCH("/audio_files", controller.UpdateAudioFile)
		protected.GET("/download_audio/:id", controller.DownloadAudioFile) // Endpoint สำหรับดาวน์โหลด Audio

		protected.POST("/conversions", controller.CreateConversion)
		protected.GET("/conversion/:id", controller.GetConversion)
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
