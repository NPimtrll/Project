import React, { useState, useEffect } from 'react';
import { Container, Grid, Card, CardContent, Typography, Button, CircularProgress, Box, IconButton } from '@mui/material';
import GetAppIcon from '@mui/icons-material/GetApp';
import DeleteIcon from '@mui/icons-material/Delete'; 
import { getAudioFilesByUserId , deleteAudioFile } from '../services/http/index';
import { IAudioFile } from '../interfaces/IAudioFile';
import { apiUrl } from '../services/http/index';

const Collection: React.FC = () => {
  const [audioFiles, setAudioFiles] = useState<IAudioFile[]>([]);
  const [loading, setLoading] = useState(true);
  const [userId, setUserId] = useState<number | null>(1);

  useEffect(() => {
    const fetchAudioFiles = async () => {
      if (userId) {
        try {
          const files = await getAudioFilesByUserId();
          if (files) {
            setAudioFiles(files);
          } else {
            console.error('Invalid data format:', files);
            setAudioFiles([]);
          }
        } catch (error) {
          console.error('Failed to fetch audio files:', error);
          setAudioFiles([]);
        } finally {
          setLoading(false);
        }
      }
    };

    fetchAudioFiles();
  }, [userId]);

  const handleDownload = async (id: number, filename: string) => {
    try {
      const response = await fetch(`${apiUrl}/download_audio/${id}`);
  
      if (!response.ok) {
        throw new Error('Failed to download audio file');
      }
  
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = filename || 'audio.mp3';
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      window.URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Error downloading file:', error);
    }
  };

  const handleDelete = async (id: number) => {
    try {
      await deleteAudioFile(id);
      setAudioFiles(audioFiles.filter(file => file.ID !== id)); // อัปเดต state หลังจากลบไฟล์
    } catch (error) {
      console.error('Failed to delete audio file:', error);
    }
  };

  if (loading) return <CircularProgress />;

  return (
    <Container>
      <Typography variant="h4" gutterBottom sx={{ color: 'black', fontWeight: 'bold', marginBottom: 4 , marginTop: 4 }}>
        Your File Collection
      </Typography>
      <Grid container spacing={3} sx={{ marginBottom: 4 }}>
        {audioFiles.length > 0 ? (
          audioFiles.map((file) => (
            <Grid item xs={12} sm={6} md={4} key={file.ID}>
              <Card sx={{ borderRadius: 2, border: '1px solid purple', padding: 2 }}>
                <CardContent>
                  {/* ชื่อไฟล์ */}
                  <Typography variant="h6">{file.Filename}</Typography>

                  {/* วันที่แปลงไฟล์ */}
                  <Typography variant="body2" color="textSecondary" sx={{ marginBottom: 2 }}>
                    Conversion Date: {new Date(file.ConversionDate).toLocaleDateString()}
                  </Typography>

                  {/* ตัวเล่นไฟล์ */}
                  <Box sx={{ marginBottom: 2 }}>
                  <audio 
                    controls 
                    src={`${apiUrl}/${file.FilePath.replace('\\', '/')}`} 
                    preload="auto" 
                    controlsList="nodownload" 
                    crossOrigin="anonymous" 
                    style={{ width: '100%' }}>
                      Your browser does not support the audio element.
                  </audio>

                  </Box>
                  {/* ปุ่มดาวน์โหลดและลบ */}
                  <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                    <Button
                      onClick={() => handleDownload(file.ID!, file.Filename)}
                      variant="outlined"
                      sx={{
                        color: 'purple',
                        borderColor: 'purple',
                        borderRadius: '8px',
                        textTransform: 'none',
                        width: '80%', // เพิ่มตรงนี้เพื่อให้ปุ่มกว้างเต็มที่
                      }}
                    >
                      <GetAppIcon sx={{ marginRight: '4px' }} />
                      Download
                    </Button>
                    <IconButton
                      onClick={() => handleDelete(file.ID!)}
                      sx={{
                        color: 'purple',
                        borderColor: 'purple',
                        borderRadius: '8px',
                        width: '15%', // ปรับขนาดปุ่มให้แคบลง
                        border: '1px solid purple', // เพิ่มกรอบสี่เหลี่ยมสีม่วง
                      }}
                    >
                      <DeleteIcon />
                    </IconButton>
                  </Box>
                </CardContent>
              </Card>
            </Grid>
          ))
        ) : (
          <Typography>No audio files found.</Typography>
        )}
      </Grid>
    </Container>
  );
};

export default Collection;
