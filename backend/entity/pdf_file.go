package entity

import (
	"time"

	"gorm.io/gorm"
)

type PDFFile struct {
	gorm.Model
	Filename   string
	FilePath   string
	UploadDate time.Time `gorm:"autoCreateTime"`
	Size       int64
	Status     string
	Source     string // 'uploaded', 'converted_from_image'

	UserID *uint
	User   User `gorm:"foreignKey:UserID"`

	AudioFiles  []AudioFile  `gorm:"foreignKey:PDFID"`
	Conversions []Conversion `gorm:"foreignKey:PDFID"`
	Images      []ImageFile  `gorm:"foreignKey:PDFID"`
}
