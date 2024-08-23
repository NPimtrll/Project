package ocr

import (
	"bytes"
	"encoding/json"
	"fmt"
	"io"
	"mime/multipart"
	"net/http"
)

// RunOCR รับไฟล์ PDF และแปลงเป็นข้อความโดยเรียก API OCR
func RunOCR(pdfBytes []byte) (string, error) {
	url := "http://127.0.0.1:5000/ocr"

	// สร้าง buffer และ multipart writer
	var b bytes.Buffer
	w := multipart.NewWriter(&b)

	// เขียนไฟล์ PDF ลงใน buffer
	fw, err := w.CreateFormFile("file", "file.pdf")
	if err != nil {
		return "", err
	}
	_, err = fw.Write(pdfBytes)
	if err != nil {
		return "", err
	}
	w.Close()

	// สร้างคำขอ HTTP
	req, err := http.NewRequest("POST", url, &b)
	if err != nil {
		return "", err
	}
	req.Header.Set("Content-Type", w.FormDataContentType())

	client := &http.Client{}
	resp, err := client.Do(req)
	if err != nil {
		return "", err
	}
	defer resp.Body.Close()

	// อ่านข้อมูลการตอบกลับ
	bodyBytes, _ := io.ReadAll(resp.Body)
	if resp.StatusCode != http.StatusOK {
		return "", fmt.Errorf("OCR API returned status %d, body: %s", resp.StatusCode, string(bodyBytes))
	}

	var result map[string]interface{}
	if err := json.NewDecoder(bytes.NewReader(bodyBytes)).Decode(&result); err != nil {
		return "", err
	}

	text, ok := result["text"].(string)
	if !ok {
		return "", fmt.Errorf("failed to get OCR text from response")
	}

	return text, nil
}