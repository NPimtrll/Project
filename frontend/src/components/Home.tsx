import React, { useState } from 'react';
import { Box, Button, Typography, LinearProgress } from '@mui/material';
import CloudUploadIcon from '@mui/icons-material/CloudUpload';
import ArrowUpwardIcon from '@mui/icons-material/ArrowUpward';
import LoopIcon from '@mui/icons-material/Loop';
import VolumeUpIcon from '@mui/icons-material/VolumeUp';
import { uploadPDF } from '../services/http/index';
import { apiUrl } from '../services/http/index';

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
      resetState(); // รีเซ็ต state ก่อนเริ่มอัปโหลดใหม่
      setSelectedFile(event.target.files[0]);
      uploadFile(event.target.files[0]);
    }
  };

  const uploadFile = async (file: File) => {
    setLoading(true);
    setProgress(0);

    try {
      let progressInterval = setInterval(() => {
        setProgress(prev => {
          if (prev >= 99) {
            clearInterval(progressInterval);
            return 99;
          }
          return prev + 1;
        });
      }, 100);

      const uploadResponse = await uploadPDF(file);

      console.log('Upload Response:', uploadResponse);

      setUploadMessage('PDF uploaded successfully!!');
      setPdfText(uploadResponse.Text || null);

      if (uploadResponse.audioUrl) {
        const url = `${apiUrl}${uploadResponse.audioUrl.replace('\\', '/')}`;
        setAudioUrl(url);

        // Automatically download the audio file
        const response = await fetch(url);
        if (response.ok) {
          const blob = await response.blob();
          const downloadUrl = window.URL.createObjectURL(blob);
          const a = document.createElement('a');
          a.href = downloadUrl;
          a.download = selectedFile?.name.replace('.pdf', '.mp3') || 'audio.mp3';
          document.body.appendChild(a);
          a.click();
          document.body.removeChild(a);
          window.URL.revokeObjectURL(downloadUrl);
        }
      } else {
        setAudioUrl(null);
      }

      setProgress(100);

    } catch (error) {
      setUploadMessage('Error uploading file');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box>
      <Box 
        sx={{ 
          width: '100vw',
          height: '100vh',
          overflow: 'hidden',
          backgroundImage: `url('./background.png')`,
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          display: 'flex', 
          flexDirection: 'column', 
          alignItems: 'center', 
          justifyContent: 'center',
          textAlign: 'center',
          position: 'relative',
        }}
      >
        <Box 
          sx={{ 
            position: 'absolute',
            top: 0,
            left: 0,
            width: '100%',
            height: '100%',
            backgroundColor: 'rgba(0, 0, 0, 0.5)',
            zIndex: 1,
          }} 
        />
        
        <Box sx={{ zIndex: 2, position: 'relative', width: '80%', maxWidth: '600px' }}>
          <Typography variant="h2" fontWeight="bold" gutterBottom color="#fff">Convert PDFs to Audio</Typography>
          <Typography variant="h5" gutterBottom color="#fff">Effortlessly transform your PDFs into audio files</Typography>
          
          <Box sx={{ border: '2px dashed #fff', borderRadius: '10px', p: 3, mb: 2 }}>
            <Button
              variant="contained"
              color="primary"
              onClick={() => document.getElementById('pdf-upload')?.click()}
              startIcon={<CloudUploadIcon />}
              sx={{ backgroundColor: '#6A0DAD', borderRadius: '6px' }}
            >
              Drag & Drop or Click to Browse
            </Button>
            <input
              type="file"
              accept=".pdf"
              onChange={handleFileChange}
              style={{ display: 'none' }}
              id="pdf-upload"
            />
            <Typography color="#fff" mt={2}>Or, select a PDF file from your computer</Typography>
          </Box>
    
          {loading && (
            <Box sx={{ width: '100%', mt: 2 }}>
              <LinearProgress variant="determinate" value={progress} />
              <Typography variant="body1" color="#fff" mt={1}>Uploading... {progress}%</Typography>
            </Box>
          )}
    
          {uploadMessage && (
            <Typography variant="h6" color="#fff" mt={2}>{uploadMessage}</Typography>
          )}
    
          {audioUrl && selectedFile && (
            <Box sx={{ mt: 2 }}>
              <Typography color="#fff" mt={1}>
                Your audio file, "{selectedFile.name.replace('.pdf', '.mp3')}", has been successfully processed!
              </Typography>
              <Box sx={{ mt: 2 }}>
                <audio controls src={audioUrl} />
              </Box>
            </Box>
          )}
        </Box>
      </Box>

      {/* How it Works Section */}
      <Box 
        sx={{ 
          backgroundColor: '#fff',
          padding: '4rem 2rem',
          textAlign: 'center',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
        }}
      >
        <Typography variant="h3" fontWeight="bold" color="#000" mb={4}>How it Works</Typography>
        
        <Box 
          sx={{ 
            display: 'flex',
            justifyContent: 'space-around',
            flexWrap: 'wrap',
            width: '100%',
            maxWidth: '900px',
          }}
        >
          {/* Step 1 */}
          <Box sx={{ textAlign: 'center' }}>
            <ArrowUpwardIcon sx={{ fontSize: '4rem', color: '#6A0DAD' }} />
            <Typography variant="h6" color="#000" mt={2}>Step 1: Upload your PDF</Typography>
          </Box>

          {/* Step 2 */}
          <Box sx={{ textAlign: 'center' }}>
            <LoopIcon sx={{ fontSize: '4rem', color: '#6A0DAD' }} />
            <Typography variant="h6" color="#000" mt={2}>Step 2: Click 'Convert'</Typography>
          </Box>

          {/* Step 3 */}
          <Box sx={{ textAlign: 'center' }}>
            <VolumeUpIcon sx={{ fontSize: '4rem', color: '#6A0DAD' }} />
            <Typography variant="h6" color="#000" mt={2}>Step 3: Enjoy your Audio</Typography>
          </Box>
        </Box>
      </Box>

      {/* Features Section */}
      <Box 
        sx={{ 
          backgroundColor: '#fff',
          padding: '4rem 2rem',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
        }}
      >
        <Typography variant="h3" fontWeight="bold" color="#000" mb={4}>Our Features</Typography>
        
        <Box 
          sx={{ 
            display: 'flex',
            flexWrap: 'wrap',
            justifyContent: 'space-between',
            width: '100%',
            maxWidth: '1200px',
          }}
        >
          {/* Feature 1: Smart Learning */}
          <Box 
            sx={{ 
              flex: '1 1 45%',
              maxWidth: '45%',
              border: '1px solid #d0d0d0',
              borderRadius: '8px',
              p: 3,
              mb: 4,
              boxSizing: 'border-box',
            }}
          >
            <Typography variant="h6" fontWeight="bold" color="#000" mb={2}>
              Smart Learning
            </Typography>
            <Typography variant="body1" color="#666">
              Our algorithms are refined and proofread to ensure a seamless listening experience.
            </Typography>
          </Box>

          {/* Feature 2: User Library */}
          <Box 
            sx={{ 
              flex: '1 1 45%',
              maxWidth: '45%',
              border: '1px solid #d0d0d0',
              borderRadius: '8px',
              p: 3,
              mb: 4,
              boxSizing: 'border-box',
            }}
          >
            <Typography variant="h6" fontWeight="bold" color="#000" mb={2}>
              User Library
            </Typography>
            <Typography variant="body1" color="#666">
              Store all your converted files in your personal library for easy access.
            </Typography>
          </Box>

          {/* Feature 3: Custom Playback */}
          <Box 
            sx={{ 
              flex: '1 1 45%',
              maxWidth: '45%',
              border: '1px solid #d0d0d0',
              borderRadius: '8px',
              p: 3,
              mb: 4,
              boxSizing: 'border-box',
            }}
          >
            <Typography variant="h6" fontWeight="bold" color="#000" mb={2}>
              Custom Playback
            </Typography>
            <Typography variant="body1" color="#666">
              Adjust playback speed and choose from a variety of voices for your convenience.
            </Typography>
          </Box>

          {/* Feature 4: No Hidden Fees */}
          <Box 
            sx={{ 
              flex: '1 1 45%',
              maxWidth: '45%',
              border: '1px solid #d0d0d0',
              borderRadius: '8px',
              p: 3,
              mb: 4,
              boxSizing: 'border-box',
            }}
          >
            <Typography variant="h6" fontWeight="bold" color="#000" mb={2}>
              No Hidden Fees
            </Typography>
            <Typography variant="body1" color="#666">
              Enjoy our services with a free-to-use model and no unexpected costs.
            </Typography>
          </Box>
        </Box>
      </Box>
    </Box>
  );
};

export default Home;
