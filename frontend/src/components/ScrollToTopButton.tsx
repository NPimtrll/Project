import React, { useState, useEffect } from 'react';
import { Button, Box } from '@mui/material';
import KeyboardArrowUpIcon from '@mui/icons-material/KeyboardArrowUp';

const ScrollToTopButton: React.FC = () => {
  const [isVisible, setIsVisible] = useState(false);

  // ฟังก์ชันเลื่อนกลับไปที่ส่วนบนของหน้า
  const scrollToTop = () => {
    window.scrollTo({
      top: 0,
      behavior: 'smooth',
    });
  };

  // ฟังก์ชันตรวจสอบว่าเลื่อนลงไปมากพอที่จะทำให้ปุ่มแสดงหรือไม่
  const toggleVisibility = () => {
    if (window.pageYOffset > 300) {
      setIsVisible(true);
    } else {
      setIsVisible(false);
    }
  };

  useEffect(() => {
    window.addEventListener('scroll', toggleVisibility);
    return () => window.removeEventListener('scroll', toggleVisibility);
  }, []);

  return (
    <Box
      sx={{
        position: 'fixed',
        bottom: '30px',
        right: '30px',
        zIndex: 1000,
        display: isVisible ? 'block' : 'none', // แสดงปุ่มเมื่อเลื่อนลงมากกว่า 300px
      }}
    >
      <Button
        onClick={scrollToTop}
        variant="contained"
        sx={{
          backgroundColor: '#6A0DAD',
          color: '#fff',
          borderRadius: '50%',  // ทำให้ปุ่มเป็นวงกลม
          width: '50px',        // กำหนดความกว้าง
          height: '50px',       // กำหนดความสูง
          minWidth: 'unset',    // ยกเลิกค่า minWidth ที่อาจตั้งค่ามาก่อน
          padding: 0,           // ลบ padding ออกเพื่อไม่ให้ปุ่มขยายเกินขนาด
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          '&:hover': {
            backgroundColor: '#5e0ca0',
          },
        }}
      >
        <KeyboardArrowUpIcon fontSize="large" />
      </Button>
    </Box>
  );
};

export default ScrollToTopButton;
