import React, { useState } from 'react';
import { Container, Button } from '@mui/material';
import TextField from '@mui/material/TextField';
import Box from '@mui/material/Box';
import Card from '@mui/material/Card';
import { HfInference } from "@huggingface/inference";

const Try: React.FC = () => {
  const [text, setText] = useState<string>('');
  const [audioUrl, setAudioUrl] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [correctedText, setCorrectedText] = useState('');

  const inference = new HfInference("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");

  async function query(data: { input: string }) {
    try {
      const response = await fetch(
        "http://localhost:8080/ocr", // Replace with your backend endpoint
        {
          headers: {
            Authorization: "Bearer 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",
            "Content-Type": "application/json",
          },
          method: "POST",
          body: JSON.stringify(data),
        }
      );

      if (!response.ok) {
        const errorText = await response.text();
        console.error('Error:', errorText);
        setError('Error: ' + errorText);
        return null;
      }

      const result = await response.blob();
      return result;
    } catch (error) {
      console.error('Fetch error:', error);
      setError('Fetch error: ' +  (error as Error).message);
      return null;
    }
  }

  async function query1(inputs: string) {
    let correctedText = '';

    for await (const chunk of inference.chatCompletionStream({
      model: "meta-llama/Meta-Llama-3-8B-Instruct",
      messages: [{ role: "user", content: `Correct the spelling mistakes in the following text "and send out only the corrected text, without any additional messages, especially not 'Here is the corrected text: '": ${inputs}` }],
      max_tokens: 500,
    })) {
      correctedText += chunk.choices[0]?.delta?.content || "";
    }

    return correctedText;
  }

  const handleButtonClick = async () => {
    const corrected = await query1(text);
    setCorrectedText(corrected);
    const audioBlob = await query({ input: corrected });
    if (audioBlob) {
      const url = window.URL.createObjectURL(audioBlob);
      setAudioUrl(url);
    }
  };

  return (
    <Container>
      <TextField
        id="filled-helperText"
        label="Enter text"
        value={text}
        onChange={(e) => setText(e.target.value)}
        helperText="Enter the text you want to check for spelling mistakes."
        variant="filled"
        fullWidth
      />
      <Button onClick={handleButtonClick} variant="contained" style={{ marginTop: '20px' }}>
        Check Spelling & Convert to Speech
      </Button>
      <Card sx={{ display: 'flex', marginTop: '20px', padding: '20px' }}>
        <Box sx={{ display: 'flex', flexDirection: 'column' }}>
          {error && <p style={{ color: 'red' }}>{error}</p>}
          {correctedText && <p>{correctedText}</p>}
          {audioUrl && <audio controls src={audioUrl} />}
        </Box>
      </Card>
    </Container>
  );
};

export default Try;
