package entity

import (
    "time"
	"gorm.io/gorm"
)

type AudioFile struct {
    gorm.Model
    Filename      string    
    FilePath      string    
    ConversionDate time.Time `gorm:"autoCreateTime"`
    Format        string     // 'mp3', 'wav'
    Duration      float64   
    Size          int64     
    Status        string    
    DownloadLink  string    


	PDFID  *uint
    PDFFile PDFFile `gorm:"foreignKey:PDFID"`

    UserID *uint
    User   User `gorm:"foreignKey:UserID"`

    Conversions []Conversion   `gorm:"foreignKey:AudioID"`
}
