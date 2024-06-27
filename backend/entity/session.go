package entity

import (
	"time"
	"gorm.io/gorm"
)

type Session struct {
    gorm.Model
    LoginTime    time.Time `gorm:"autoCreateTime"`
    LogoutTime   *time.Time
    SessionToken string

	UserID *uint
    User   User `gorm:"foreignKey:UserID"`
}
