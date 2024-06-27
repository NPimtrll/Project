package entity

import (
	"time"

	"gorm.io/gorm"
)

type ImageFile struct {
	gorm.Model
	Filename    string
	FilePath    string
	Status      string
	Size        int64
	UpdatedDate time.Time `gorm:"autoUpdateTime"`

	UserID *uint
    User   User `gorm:"foreignKey:UserID"`

    PDFID  *uint
    PDF    PDFFile `gorm:"foreignKey:PDFID"`
}
