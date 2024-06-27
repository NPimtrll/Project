package service

import (
	"errors"
	"github.com/NPimtrll/Project/entity"
	"gorm.io/gorm"
)

// ValidateToken checks the validity of a session token and returns the session information if valid
func ValidateToken(token string) (*entity.Session, error) {
	var session entity.Session
	if err := entity.DB().Where("session_token = ?", token).First(&session).Error; err != nil {
		if err == gorm.ErrRecordNotFound {
			return nil, errors.New("invalid session token")
		}
		return nil, err
	}

	// Check if the session is still valid (e.g., not expired or already logged out)
	if session.LogoutTime != nil {
		return nil, errors.New("session has expired")
	}

	return &session, nil
}
