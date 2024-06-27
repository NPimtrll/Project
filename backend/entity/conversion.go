package entity

import (
	"time"

	"gorm.io/gorm"
)

type Conversion struct {
	gorm.Model
	ConversionDate time.Time `gorm:"autoCreateTime"`
	Status         string    `gorm:"not null"` // 'in_progress', 'completed', 'error'
	ErrorMessage   string    `gorm:"type:text"`
	
	
	UserID  *uint
    User    User `gorm:"foreignKey:UserID"`

    PDFID   *uint
    PDF     PDFFile `gorm:"foreignKey:PDFID"`

    AudioID *uint
    Audio   AudioFile `gorm:"foreignKey:AudioID"`
}
