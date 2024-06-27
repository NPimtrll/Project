package entity

import (
	"gorm.io/driver/sqlite"
    //"golang.org/x/crypto/bcrypt"
	//"gorm.io/driver/sqlite"
	"gorm.io/gorm"
)

var db *gorm.DB

func DB() *gorm.DB {

	return db

}

func SetupDatabase() {

	database, err := gorm.Open(sqlite.Open("db1.db"), &gorm.Config{})

	if err != nil {

		panic("failed to connect database")

	}

	// Migrate the schema

	database.AutoMigrate(
		&User{},
		&PDFFile{},
		&AudioFile{},
		&Conversion{},
		&ImageFile{},
		&Session{},
	)

	db = database

}
