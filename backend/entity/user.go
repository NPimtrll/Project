package entity

import (
	"time"

	"gorm.io/gorm"
)

type User struct {
	gorm.Model
	Username  string    
	Password  string   
	Email     string    `gorm:"unique;not null"`
	Birthday  time.Time
	CreatedAt time.Time `gorm:"autoCreateTime"`
	UpdatedAt time.Time `gorm:"autoUpdateTime"`

	PDFFiles    []PDFFile    `gorm:"foreignKey:UserID"`
	AudioFiles  []AudioFile  `gorm:"foreignKey:UserID"`
	Conversions []Conversion `gorm:"foreignKey:UserID"`
	Sessions    []Session    `gorm:"foreignKey:UserID"`
	ImageFiles  []ImageFile  `gorm:"foreignKey:UserID"`
}
