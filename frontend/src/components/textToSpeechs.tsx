import React, { useState } from 'react';
import { Container, Button } from '@mui/material';
import TextField from '@mui/material/TextField';
import { useTheme } from '@mui/material/styles';
import Box from '@mui/material/Box';
import Card from '@mui/material/Card';

const Try: React.FC = () => {
  const [text, setText] = useState<string>('');
  const [audioUrl, setAudioUrl] = useState<string | null>(null);

  async function query(data: { inputs: string }) {
    const response = await fetch(
      "https://api-inference.huggingface.co/models/Nithu/text-to-speech",
      {
        headers: {
          Authorization: "Bearer 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",
        },
        method: "POST",
        body: JSON.stringify(data),
      }
    );
    const result = await response.blob();
    return result;
  }
  
  const speechs = async () => {
    query({ inputs: text }).then((response) => {
      const url = window.URL.createObjectURL(response);
      setAudioUrl(url);
    });
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
