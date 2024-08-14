import React, { useState } from 'react';
import { Container, Button, Typography, CircularProgress, Grid, LinearProgress, Box } from '@mui/material';
import GetAppIcon from '@mui/icons-material/GetApp';
import CloudUploadIcon from '@mui/icons-material/CloudUpload';
import { uploadPDF } from '../services/http/index';

const Home: React.FC = () => {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [audioUrl, setAudioUrl] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [uploadMessage, setUploadMessage] = useState<string | null>(null);
  const [progress, setProgress] = useState<number>(0);
  const [pdfText, setPdfText] = useState<string | null>(null);

  const resetState = () => {
    setSelectedFile(null);
    setAudioUrl(null);
    setLoading(false);
    setUploadMessage(null);
    setProgress(0);
    setPdfText(null);
  };

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.files && event.target.files.length > 0) {
      setSelectedFile(event.target.files[0]);
      uploadFile(event.target.files[0]);
    }
  };
  const uploadFile = async (file: File) => {
    setLoading(true);
    setProgress(0);
  
    try {
      const uploadResponse = await uploadPDF(file);
  
      console.log('Upload Response:', uploadResponse); // Debugging
  
      setUploadMessage('PDF uploaded successfully');
      setPdfText(uploadResponse.Text || null);
      setAudioUrl(uploadResponse.audioUrl || null);
  
      // Simulate progress update (can be removed if not needed)
      let progressInterval = setInterval(() => {
        setProgress(prev => {
          if (prev >= 100) {
            clearInterval(progressInterval);
            return 100;
          }
          return prev + 10;
        });
      }, 500);
  
    } catch (error) {
      setUploadMessage('Error uploading file');
    } finally {
      setLoading(false);
    }
  };
  

  const handleDownload = () => {
    if (audioUrl) {
      window.open(audioUrl, '_blank');
    }
  };

  return (
    <Container>
      <Typography variant="h4" gutterBottom>Home</Typography>
      <Typography variant="subtitle1" gutterBottom>Convert PDF to Audio</Typography>

      <Grid container spacing={2} alignItems="center">
        <Grid item xs={12} md={6} sx={{ border: '2px dashed #ccc', padding: '20px', textAlign: 'center', position: 'relative' }}>
          <input
            type="file"
            accept=".pdf"
            onChange={handleFileChange}
            style={{ display: 'none' }}
            id="pdf-upload"
          />
          <label htmlFor="pdf-upload" style={{ cursor: 'pointer' }}>
            <CloudUploadIcon fontSize="large" color="primary" />
            <Typography variant="body1" sx={{ marginTop: 1 }}>Drop PDF Here</Typography>
          </label>
          {selectedFile && <Typography variant="subtitle1">Uploaded file: {selectedFile.name}</Typography>}
          {loading && (
            <CircularProgress size={60} style={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)' }} />
          )}
        </Grid>

        <Grid item xs={12} md={6}>
          {loading && (
            <Box sx={{ width: '100%', marginTop: 2 }}>
              <LinearProgress variant="determinate" value={progress} />
              <Typography variant="body2" color="textSecondary">{`${Math.round(progress)}%`}</Typography>
            </Box>
          )}
          {audioUrl && !loading && (
            <>
              <audio controls src={audioUrl} style={{ width: '100%' }}></audio>
              <Button
                variant="contained"
                color="primary"
                onClick={handleDownload}
                startIcon={<GetAppIcon />}
                style={{ marginTop: 10 }}
              >
                Download Audio File
              </Button>
            </>
          )}

          {uploadMessage && (
            <Typography variant="subtitle1" color={uploadMessage.includes('Error') ? 'error' : 'primary'}>{uploadMessage}</Typography>
          )}
          {pdfText && (
            <Box sx={{ marginTop: 2 }}>
              <Typography variant="h6">Extracted Text from PDF:</Typography>
              <Typography variant="body1" sx={{ whiteSpace: 'pre-wrap' }}>{pdfText}</Typography>
            </Box>
          )}
        </Grid>
      </Grid>
    </Container>
  );
};

export default Home;
