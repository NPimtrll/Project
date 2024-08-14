import React, { useState, useEffect } from 'react';
import { Container, List, ListItem, ListItemText, Typography, CircularProgress, Box, IconButton } from '@mui/material';
import GetAppIcon from '@mui/icons-material/GetApp';
import { getAudioFilesByUserId } from '../services/http/index';
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
          const files = await getAudioFilesByUserId(userId);
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
  
  if (loading) return <CircularProgress />;

  return (
    <Container>
      <Typography variant="h4" gutterBottom>Collection</Typography>
      <List>
        {audioFiles.length > 0 ? (
          audioFiles.map((file) => (
            <ListItem key={file.ID}>
              <ListItemText primary={file.Filename} />
              <Box sx={{ display: 'flex', alignItems: 'center' }}>
                <audio controls src={`${apiUrl}/${file.FilePath.replace('\\', '/')}`}>
                  Your browser does not support the audio element.
                </audio>
                {file.ID !== undefined && (
                  <IconButton onClick={() => handleDownload(file.ID!, file.Filename)}>
                    <GetAppIcon />
                  </IconButton>
                )}
              </Box>
            </ListItem>
          ))
        ) : (
          <Typography>No audio files found.</Typography>
        )}
      </List>
    </Container>
  );
};

export default Collection;
