package controller

import (
	"net/http"
	"time"

	"github.com/gin-gonic/gin"
	"github.com/NPimtrll/Project/entity"
	"gorm.io/gorm"
)

// POST /login
func Login(c *gin.Context) {
	var loginRequest struct {
		Username string `json:"username"`
		Password string `json:"password"`
	}
	if err := c.ShouldBindJSON(&loginRequest); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	var user entity.User
	if err := entity.DB().Where("username = ? AND password = ?", loginRequest.Username, loginRequest.Password).First(&user).Error; err != nil {
		if err == gorm.ErrRecordNotFound {
			c.JSON(http.StatusUnauthorized, gin.H{"error": "invalid username or password"})
			return
		}
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	session := entity.Session{
		UserID:       &user.ID,
		LoginTime:    time.Now(),
		SessionToken: generateSessionToken(), // ใช้ฟังก์ชันเพื่อสร้างโทเค็นที่ไม่ซ้ำกัน
	}

	if err := entity.DB().Create(&session).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	c.JSON(http.StatusOK, gin.H{"data": session})
}

// POST /sessions
func CreateSession(c *gin.Context) {
	var user entity.User
	if err := c.ShouldBindJSON(&user); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	// ตรวจสอบว่าผู้ใช้มีอยู่หรือไม่
	if err := entity.DB().Where("username = ? AND password = ?", user.Username, user.Password).First(&user).Error; err != nil {
		c.JSON(http.StatusUnauthorized, gin.H{"error": "invalid username or password"})
		return
	}

	// สร้าง session ใหม่
	session := entity.Session{
		UserID:       &user.ID,
		LoginTime:    time.Now(),
		SessionToken: generateSessionToken(), // ใช้ฟังก์ชันเพื่อสร้างโทเค็น
	}

	if err := entity.DB().Create(&session).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	c.JSON(http.StatusOK, gin.H{"data": session})
}

// DELETE /sessions/:id
func DeleteSession(c *gin.Context) {
	id := c.Param("id")

	var session entity.Session
	if tx := entity.DB().Where("id = ?", id).First(&session); tx.Error != nil {
		if tx.Error == gorm.ErrRecordNotFound {
			c.JSON(http.StatusBadRequest, gin.H{"error": "session not found"})
			return
		}
		c.JSON(http.StatusInternalServerError, gin.H{"error": tx.Error.Error()})
		return
	}

	logoutTime := time.Now()
	session.LogoutTime = &logoutTime

	if err := entity.DB().Save(&session).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	c.JSON(http.StatusOK, gin.H{"data": id})
}

// GET /sessions
func ListSessions(c *gin.Context) {
	var sessions []entity.Session
	if err := entity.DB().Find(&sessions).Error; err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}
	c.JSON(http.StatusOK, gin.H{"data": sessions})
}
