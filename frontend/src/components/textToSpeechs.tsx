import React, { useState } from 'react';
import { Container, Button } from '@mui/material';
import TextField from '@mui/material/TextField';
import Box from '@mui/material/Box';
import Card from '@mui/material/Card';

const Try: React.FC = () => {
  const [text, setText] = useState<string>('');
  const [audioUrl, setAudioUrl] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  async function query(data: { inputs: string }) {
    try {
      const response = await fetch(
        "https://api-inference.huggingface.co/models/Nithu/text-to-speech",
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
      
      return null;
    }
  }

  const speechs = async () => {
    const audioBlob = await query({ inputs: text });
    if (audioBlob) {
      const url = window.URL.createObjectURL(audioBlob);
      setAudioUrl(url);
    }
  };

  return (
    <Container>
      <TextField
        id="filled-helperText"
        label="Helper text"
        value={text}
        onChange={(e) => setText(e.target.value)}
        helperText="Some important text"
        variant="filled"
      />
      <Card sx={{ display: 'flex' }}>
        <Box sx={{ display: 'flex', flexDirection: 'column' }}>
          {error && <p style={{ color: 'red' }}>{error}</p>}
        </Box>
        {audioUrl && (
          <Box>
            <audio controls src={audioUrl}>
              Your browser does not support the audio element.
            </audio>
          </Box>
        )}
      </Card>
      <Button onClick={speechs}>Button</Button>
    </Container>
  );
};

export default Try;
