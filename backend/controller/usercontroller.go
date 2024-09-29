package controller

import (
	"net/http"

	"github.com/gin-gonic/gin"
	"golang.org/x/crypto/bcrypt"

	"github.com/NPimtrll/Project/entity"
)

// POST /users
func CreateUser(c *gin.Context) {
	var user entity.User

	// Bind JSON request body to user struct
	if err := c.ShouldBindJSON(&user); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	// Hash the user's password
	hashedPassword, err := bcrypt.GenerateFromPassword([]byte(user.Password), bcrypt.DefaultCost)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to hash password"})
		return
	}
	user.Password = string(hashedPassword)

	// Create user in the database
	if err := entity.DB().Create(&user).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	c.JSON(http.StatusOK, gin.H{"data": user})
}


// GET /user/profile
func GetUserProfile(c *gin.Context) {
    // ดึง UserID จาก context
    userID, exists := c.Get("userID")
    if !exists {
        c.JSON(http.StatusUnauthorized, gin.H{"error": "User ID not found"})
        return
    }

    // ตรวจสอบว่า userID เป็นประเภทที่ถูกต้องหรือไม่
    userIDUint, ok := userID.(uint)
    if !ok {
        c.JSON(http.StatusInternalServerError, gin.H{"error": "Invalid user ID format"})
        return
    }

    var user entity.User
    if err := entity.DB().Where("id = ?", userIDUint).First(&user).Error; err != nil {
        c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
        return
    }

    // ส่งข้อมูล user กลับไป
    c.JSON(http.StatusOK, gin.H{"data": user})
}


// GET /users
func ListUsers(c *gin.Context) {

	var users []entity.User

	if err := entity.DB().Raw("SELECT * FROM users").Scan(&users).Error; err != nil {

		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})

		return

	}

	c.JSON(http.StatusOK, gin.H{"data": users})

}

// DELETE /users/:id

func DeleteUser(c *gin.Context) {

	id := c.Param("id")

	if tx := entity.DB().Exec("DELETE FROM users WHERE id = ?", id); tx.RowsAffected == 0 {

		c.JSON(http.StatusBadRequest, gin.H{"error": "user not found"})

		return

	}

	c.JSON(http.StatusOK, gin.H{"data": id})

}

// PATCH /users

func UpdateUser(c *gin.Context) {

	var user entity.User

	if err := c.ShouldBindJSON(&user); err != nil {

		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})

		return

	}

	if tx := entity.DB().Where("id = ?", user.ID).First(&user); tx.RowsAffected == 0 {

		c.JSON(http.StatusBadRequest, gin.H{"error": "user not found"})

		return

	}

	if err := entity.DB().Save(&user).Error; err != nil {

		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})

		return

	}

	c.JSON(http.StatusOK, gin.H{"data": user})

}