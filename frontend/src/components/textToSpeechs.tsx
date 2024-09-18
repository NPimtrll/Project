// import React, { useState } from 'react';
// import { Container, Button } from '@mui/material';
// import TextField from '@mui/material/TextField';
// import Box from '@mui/material/Box';
// import Card from '@mui/material/Card';
// import { HfInference } from "@huggingface/inference";

// const Try: React.FC = () => {
//   const [text, setText] = useState<string>('');
//   const [audioUrl, setAudioUrl] = useState<string | null>(null);
//   const [error, setError] = useState<string | null>(null);
//   const [correctedText, setCorrectedText] = useState('');

//   const inference = new HfInference("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");

//   async function query(data: { inputs: string }) {
//     const response = await fetch(
//       "https://api-inference.huggingface.co/models/Nithu/text-to-speech",
//       {
//         headers: {
//           Authorization: "Bearer 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",
//         },
//         method: "POST",
//         body: JSON.stringify(data),
//       }
//     );
//     const result = await response.blob();
//     return result;
//   }

//   async function query1(inputs: string) {
//     let correctedText = '';

//     for await (const chunk of inference.chatCompletionStream({
//       model: "meta-llama/Meta-Llama-3-8B-Instruct",
//       messages: [{ role: "user", content: `Correct the spelling mistakes in the following text "and send out only the corrected text, without any additional messages, especially not 'Here is the corrected text: '": ${inputs}` }],
//       max_tokens: 500,
//     })) {
//       correctedText += chunk.choices[0]?.delta?.content || "";
//     }

//     return correctedText;
//   }

//   const handleButtonClick = async () => {
//     const corrected = await query1(text);
//     setCorrectedText(corrected);
//     const audioBlob = await query({ inputs: corrected });
//     console.log(audioBlob)
//     if (audioBlob) {
//       const url = window.URL.createObjectURL(audioBlob);
//       setAudioUrl(url);
//       console.log(url)
//     }
//   };

//   return (
//     <Container>
//       <TextField
//         id="filled-helperText"
//         label="Enter text"
//         value={text}
//         onChange={(e) => setText(e.target.value)}
//         helperText="Enter the text you want to check for spelling mistakes."
//         variant="filled"
//         fullWidth
//       />
//       <Button onClick={handleButtonClick} variant="contained" style={{ marginTop: '20px' }}>
//         Check Spelling & Convert to Speech
//       </Button>
//       <Card sx={{ display: 'flex', marginTop: '20px', padding: '20px' }}>
//         <Box sx={{ display: 'flex', flexDirection: 'column' }}>
//           {error && <p style={{ color: 'red' }}>{error}</p>}
//           {correctedText && <p>{correctedText}</p>}
//           {audioUrl && <audio controls src={audioUrl} />}
//         </Box>
//       </Card>
//     </Container>
//   );
// };

// export default Try;




import React, { useState,useEffect } from 'react';
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
    const audioBlob = await query({ inputs: corrected });
  
    if (audioBlob) {
      // สร้าง URL ชั่วคราวสำหรับฟังไฟล์เสียง
      const url = window.URL.createObjectURL(audioBlob);
      setAudioUrl(url);
  
      // อัปโหลดไฟล์เสียงไปยัง backend
      const formData = new FormData();
      formData.append('audio', audioBlob, 'audio-file.wav'); // ชื่อไฟล์และชนิดไฟล์อาจต้องปรับให้เหมาะสม
  
      try {
        const response = await fetch('http://localhost:8080/uploadtest', {
          method: 'POST',
          body: formData
        });
        const result = await response.json();
        console.log('Upload successful:', result);
      } catch (error) {
        console.error('Upload failed:', error);
      }
    }
  };
  const [audioFiles, setAudioFiles] = useState([]);

  useEffect(() => {
    // ฟังก์ชันที่เรียก API
    const fetchAudioFiles = async () => {
      try {
        const response = await fetch('http://localhost:8080/list-audio-files');
        if (!response.ok) {
          throw new Error('Network response was not ok');
        }
        const data = await response.json();
        setAudioFiles(data.files);
      } catch (error) {
        console.error('Error fetching audio files:', error);
      }
    };

    // เรียกใช้ฟังก์ชัน
    fetchAudioFiles();
  }, []);


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
      <Card sx={{ display: 'flex', marginTop: '20px', padding: '20px' }}>
      <div>
      <h1>Audio Files</h1>
      <ul>
        {audioFiles.map((url, index) => (
          <li key={index}>
            <audio controls>
              <source src={url} type="audio/wav" />
              Your browser does not support the audio element.
            </audio>
          </li>
        ))}
      </ul>
    </div>
      </Card>
    </Container>
  );
};

export default Try;
