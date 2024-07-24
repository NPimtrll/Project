import React, { useState, useEffect } from 'react';
import { Container, Button, Typography, CircularProgress, Grid, LinearProgress, Box } from '@mui/material';
import GetAppIcon from '@mui/icons-material/GetApp';
import CloudUploadIcon from '@mui/icons-material/CloudUpload';
import { uploadPDF } from '../services/http/index'; // import function

const Home: React.FC = () => {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [audioUrl, setAudioUrl] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [converting, setConverting] = useState(false);
  const [uploadMessage, setUploadMessage] = useState<string | null>(null);
  const [progress, setProgress] = useState<number>(0);

  useEffect(() => {
    // รีเซ็ตสถานะเมื่อคอมโพเนนต์ถูกสร้างขึ้น (mounted) หรือรีเฟรชหน้า
    setSelectedFile(null);
    setAudioUrl(null);
    setLoading(false);
    setConverting(false);
    setUploadMessage(null);
    setProgress(0);
  }, []);

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.files && event.target.files.length > 0) {
      setSelectedFile(event.target.files[0]);
      uploadFile(event.target.files[0]);
    }
  };

  const uploadFile = async (file: File) => {
    setLoading(true);
    setConverting(true);
    setProgress(0);

    try {
      const response = await uploadPDF(file);
      setUploadMessage('PDF uploaded successfully');
      setAudioUrl('path/to/converted/audio/file'); // Update this based on your actual implementation

      // Mocking progress increment for conversion
      let progressInterval = setInterval(() => {
        setProgress(prev => {
          if (prev >= 100) {
            clearInterval(progressInterval);
            setConverting(false);
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
    // ฟังก์ชั่นการดาวน์โหลดไฟล์เสียง
  };

  return (
    <Container>
      <Typography variant="h4" gutterBottom>Home</Typography>
      <Typography variant="subtitle1" gutterBottom>
        Convert PDF to Audio
      </Typography>

      <Grid container spacing={2} alignItems="center">
        <Grid item xs={12} md={6} sx={{ border: '2px dashed #ccc', padding: '20px', textAlign: 'center', position: 'relative' }}>
          <input
            type="file"
            accept=".pdf"
            onChange={handleFileChange}
            style={{ display: 'none' }}
            id="pdf-upload"
          />
          <label htmlFor="pdf-upload">
            <CloudUploadIcon fontSize="large" color="primary" />
            <Typography variant="body1" sx={{ marginTop: 1 }}>Drop PDF Here</Typography>
          </label>
          {selectedFile && <Typography variant="subtitle1">Uploaded file: {selectedFile.name}</Typography>}
          {converting && (
            <CircularProgress size={60} style={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)' }} />
          )}
        </Grid>

        <Grid item xs={12} md={6}>
          {converting && (
            <Box sx={{ width: '100%', marginTop: 2 }}>
              <LinearProgress variant="determinate" value={progress} />
              <Typography variant="body2" color="textSecondary">{`${Math.round(progress)}%`}</Typography>
            </Box>
          )}
          {audioUrl && !converting && (
            <>
              <audio controls src={audioUrl}></audio>
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
            <Typography variant="subtitle1" color="error">{uploadMessage}</Typography>
          )}
        </Grid>
      </Grid>
    </Container>
  );
};

export default Home;
