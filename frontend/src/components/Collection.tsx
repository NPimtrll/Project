import React, { useState, useRef } from 'react';
import { Container, List, ListItem, ListItemText, Button, Typography, Slider, Grid, IconButton, CircularProgress } from '@mui/material';
import PlayArrowIcon from '@mui/icons-material/PlayArrow';
import PauseIcon from '@mui/icons-material/Pause';
import SkipNextIcon from '@mui/icons-material/SkipNext';
import SkipPreviousIcon from '@mui/icons-material/SkipPrevious';
import VolumeUpIcon from '@mui/icons-material/VolumeUp';
import GetAppIcon from '@mui/icons-material/GetApp';

const Collection: React.FC = () => {
  const audioFiles = [
    { name: 'เสียงที่แปลงแล้ว 1.mp3', url: '/path/to/audio1.mp3' },
    { name: 'เสียงที่แปลงแล้ว 2.mp3', url: '/path/to/audio2.mp3' },
    // เพิ่มไฟล์เสียงเพิ่มเติมตามต้องการ
  ];

  const [currentAudio, setCurrentAudio] = useState<HTMLAudioElement | null>(null);
  const [currentTime, setCurrentTime] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const audioRef = useRef<HTMLAudioElement>(null);
  const [loading, setLoading] = useState(false);

  const handlePlay = (url: string) => {
    if (currentAudio) {
      currentAudio.pause();
      currentAudio.currentTime = 0;
    }
    const audio = new Audio(url);
    setCurrentAudio(audio);
    audio.currentTime = currentTime;
    audio.play();
    setIsPlaying(true);
  };

  const handlePause = () => {
    if (currentAudio) {
      currentAudio.pause();
      setIsPlaying(false);
    }
  };

  const handleSeek = (event: Event, newValue: number | number[], activeThumb: number) => {
    if (currentAudio) {
      setCurrentTime(newValue as number);
      currentAudio.currentTime = newValue as number;
    }
  };

  const handleVolumeChange = (event: Event, newValue: number | number[], activeThumb: number) => {
    if (currentAudio) {
      currentAudio.volume = newValue as number;
    }
  };

  const handleSkipPrevious = () => {
    if (currentAudio) {
      const newTime = currentAudio.currentTime - 10;
      currentAudio.currentTime = newTime < 0 ? 0 : newTime;
    }
  };

  const handleSkipNext = () => {
    if (currentAudio) {
      const newTime = currentAudio.currentTime + 10;
      currentAudio.currentTime = newTime > currentAudio.duration ? currentAudio.duration : newTime;
    }
  };

  const handleDownload = () => {
    // ฟังก์ชั่นการดาวน์โหลดไฟล์เสียง
  };

  return (
    <Container>
      <Typography variant="h4" gutterBottom>Collection</Typography>
      <List>
        {audioFiles.map((file, index) => (
          <ListItem key={index}>
            <ListItemText primary={file.name} />
            <Grid container spacing={2} alignItems="center">
              <Grid item xs={2}>
                <IconButton color="primary" onClick={() => handlePlay(file.url)} disabled={isPlaying}>
                  <PlayArrowIcon />
                </IconButton>
                <IconButton color="secondary" onClick={handlePause} disabled={!isPlaying}>
                  <PauseIcon />
                </IconButton>
              </Grid>
              <Grid item xs={6}>
                <audio ref={audioRef} src={file.url} />
                <Slider
                  value={currentTime}
                  max={currentAudio?.duration || 0}
                  onChange={handleSeek}
                  aria-labelledby="continuous-slider"
                  sx={{ width: '100%' }}
                />
              </Grid>
              <Grid item xs={4}>
                <IconButton onClick={handleSkipPrevious}>
                  <SkipPreviousIcon />
                </IconButton>
                <IconButton onClick={handleSkipNext}>
                  <SkipNextIcon />
                </IconButton>
                <IconButton onClick={handleDownload}>
                  <GetAppIcon />
                </IconButton>
              </Grid>
            </Grid>
          </ListItem>
        ))}
      </List>
    </Container>
  );
};

export default Collection;
