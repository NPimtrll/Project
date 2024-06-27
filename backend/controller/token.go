package controller

import (
	"crypto/rand"
	"encoding/base64"
	"log"
)

func generateSessionToken() string {
	b := make([]byte, 32)
	_, err := rand.Read(b)
	if err != nil {
		log.Fatalf("Error generating random token: %v", err)
	}
	return base64.URLEncoding.EncodeToString(b)
}
