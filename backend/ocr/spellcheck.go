package ocr

import (
    "bytes"
    "encoding/json"
    "fmt"
    "io/ioutil"
    "net/http"
)

const apiKey ="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"  // ใส่ API Key ของคุณที่นี่

type RequestPayload struct {
    Model     string `json:"model"`
    Messages  []Message `json:"messages"`
    MaxTokens int    `json:"max_tokens,omitempty"`
}

type Message struct {
    Role    string `json:"role"`
    Content string `json:"content"`
}

type APIError struct {
    Message string `json:"message"`
    Type    string `json:"type"`
    Param   string `json:"param"`
    Code    string `json:"code"`
}

type APIResponse struct {
    Error APIError `json:"error"`
}

func SpellCheck(text string) (string, error) {
    url := "https://api.openai.com/v1/chat/completions"
    prompt := fmt.Sprintf("Correct the spelling mistakes in the following text:\n%s", text)

    payload := RequestPayload{
        Model:     "gpt-3.5-turbo",
        Messages: []Message{
            {
                Role:    "system",
                Content: "You are a helpful assistant.",
            },
            {
                Role:    "user",
                Content: prompt,
            },
        },
        MaxTokens: 500,
    }

    jsonPayload, err := json.Marshal(payload)
    if err != nil {
        return "", err
    }

    req, err := http.NewRequest("POST", url, bytes.NewBuffer(jsonPayload))
    if err != nil {
        return "", err
    }
    req.Header.Add("Content-Type", "application/json")
    req.Header.Add("Authorization", fmt.Sprintf("Bearer %s", apiKey))

    res, err := http.DefaultClient.Do(req)
    if err != nil {
        return "", err
    }
    defer res.Body.Close()

    body, err := ioutil.ReadAll(res.Body)
    if err != nil {
        return "", err
    }

    // Check for API errors
    var apiResponse APIResponse
    err = json.Unmarshal(body, &apiResponse)
    if err == nil && apiResponse.Error.Message != "" {
        return "", fmt.Errorf("API error: %s", apiResponse.Error.Message)
    }

    // Parse response and return checked text
    var result map[string]interface{}
    json.Unmarshal(body, &result)
    choices := result["choices"].([]interface{})
    firstChoice := choices[0].(map[string]interface{})
    message := firstChoice["message"].(map[string]interface{})
    content := message["content"].(string)

    return content, nil
}
