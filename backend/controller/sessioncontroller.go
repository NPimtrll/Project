package controller

import (
	"crypto/rand"
	"encoding/base64"
	"log"
	"net/http"
	"time"

	"github.com/NPimtrll/Project/entity"
	"github.com/gin-gonic/gin"
	"golang.org/x/crypto/bcrypt"
	"gorm.io/gorm"
)

// POST /login
func Login(c *gin.Context) {
	var loginRequest struct {
		Username string `json:"username" binding:"required"`
		Password string `json:"password" binding:"required"`
	}
	if err := c.ShouldBindJSON(&loginRequest); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	var user entity.User
	if err := entity.DB().Where("username = ?", loginRequest.Username).First(&user).Error; err != nil {
		if err == gorm.ErrRecordNotFound {
			c.JSON(http.StatusUnauthorized, gin.H{"error": "invalid username or password"})
			return
		}
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	// ตรวจสอบรหัสผ่าน
	if err := bcrypt.CompareHashAndPassword([]byte(user.Password), []byte(loginRequest.Password)); err != nil {
		c.JSON(http.StatusUnauthorized, gin.H{"error": "invalid username or password"})
		return
	}

	session := entity.Session{
		UserID:       &user.ID, // Use &user.ID to assign to *uint
		LoginTime:    time.Now(),
		SessionToken: GenerateSessionToken(), // ใช้ฟังก์ชันเพื่อสร้างโทเค็นที่ไม่ซ้ำกัน
	}

	if err := entity.DB().Create(&session).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	// ส่งกลับ token และข้อมูลผู้ใช้
	c.JSON(http.StatusOK, gin.H{
		"token": session.SessionToken,
		"user":  user,
	})
}

// POST /sessions
func CreateSession(c *gin.Context) {
	var loginRequest struct {
		Username string `json:"username" binding:"required"`
		Password string `json:"password" binding:"required"`
	}
	if err := c.ShouldBindJSON(&loginRequest); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	var user entity.User
	if err := entity.DB().Where("username = ?", loginRequest.Username).First(&user).Error; err != nil {
		c.JSON(http.StatusUnauthorized, gin.H{"error": "invalid username or password"})
		return
	}

	// ตรวจสอบรหัสผ่าน
	if err := bcrypt.CompareHashAndPassword([]byte(user.Password), []byte(loginRequest.Password)); err != nil {
		c.JSON(http.StatusUnauthorized, gin.H{"error": "invalid username or password"})
		return
	}

	session := entity.Session{
		UserID:       &user.ID, // Use &user.ID to assign to *uint
		LoginTime:    time.Now(),
		SessionToken: GenerateSessionToken(), // ใช้ฟังก์ชันเพื่อสร้างโทเค็น
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
	if err := entity.DB().Where("id = ?", id).First(&session).Error; err != nil {
		if err == gorm.ErrRecordNotFound {
			c.JSON(http.StatusBadRequest, gin.H{"error": "session not found"})
			return
		}
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
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

// GenerateSessionToken generates a unique session token
func GenerateSessionToken() string {
    token := make([]byte, 32)
    _, err := rand.Read(token)
    if err != nil {
        log.Fatalf("Error generating random token: %v", err)
    }
    return base64.URLEncoding.EncodeToString(token)
}
