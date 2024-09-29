import React, { useEffect, useState } from 'react';
import { AppBar, Toolbar, Typography, Button, Box } from '@mui/material';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { deleteSession, getUserProfile } from '../services/http/index';
import './Navbar.css'; // เปลี่ยนเป็น path ที่ถูกต้อง
import { Avatar } from '@mui/material';

interface NavbarProps {
  isLoggedIn: boolean;
  setIsLoggedIn: (isLoggedIn: boolean) => void;
}

const Navbar: React.FC<NavbarProps> = ({ isLoggedIn, setIsLoggedIn }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const [username, setUsername] = useState<string | null>(null);

  // ใช้ useEffect เพื่อติดตามการเปลี่ยนแปลงของ isLoggedIn
  useEffect(() => {
    const token = localStorage.getItem('authToken');
    if (token) {
      setIsLoggedIn(true);
      fetchUserProfile();  // เรียก fetchUserProfile ทันทีเมื่อผู้ใช้ล็อกอิน
    }
  }, [isLoggedIn, setIsLoggedIn]); // รัน useEffect เมื่อ isLoggedIn เปลี่ยน

  const fetchUserProfile = async () => {
    try {
      const userProfile = await getUserProfile();
      setUsername(userProfile.Username); // เก็บชื่อผู้ใช้ใน state
    } catch (error) {
      console.error('Error fetching user profile:', error);
    }
  };

  const handleLogout = async () => {
    const token = localStorage.getItem('authToken');
    if (token) {
      await deleteSession(token);
    }
    localStorage.clear();
    setIsLoggedIn(false);
    setUsername(null); // ล้างชื่อผู้ใช้เมื่อออกจากระบบ
    navigate('/home');
    window.location.reload();
  };

  const scrollToContact = () => {
    const footerElement = document.getElementById('footer');
    if (footerElement) {
      footerElement.scrollIntoView({ behavior: 'smooth' });
    }
  };

  const scrollToFAQ = () => {
    if (location.pathname !== '/home') {
      navigate('/home'); 
      setTimeout(() => {
        const howItWorksSection = document.getElementById('how-it-works');
        if (howItWorksSection) {
          howItWorksSection.scrollIntoView({ behavior: 'smooth' });
        }
      }, 300);
    } else {
      const howItWorksSection = document.getElementById('how-it-works');
      if (howItWorksSection) {
        howItWorksSection.scrollIntoView({ behavior: 'smooth' });
      }
    }
  };

  const getButtonStyle = (path: string) => ({
    color: location.pathname === path ? '#6A0DAD' : 'grey',
    borderBottom: location.pathname === path ? '2px solid #6A0DAD' : 'none',
    marginRight: '20px',
    textTransform: 'none' as const,
  });

  return (
    <AppBar position="static" elevation={3} style={{ backgroundColor: 'white', color: 'grey' }}>
      <Toolbar>
        <Box sx={{ display: 'flex', alignItems: 'center', marginRight: '20px' }}>
          <img src="/logo1.png" alt="Logo" style={{ height: '40px', marginRight: '10px' }} />
          <Typography
            variant="h6"
            component={Link}
            to="/home"
            style={{ textDecoration: 'none', color: 'black', fontWeight: 'bold' }}
          >
            PDFtoAudio
          </Typography>
        </Box>
        <Box sx={{ display: 'flex', flexGrow: 1 }}>
          <Button component={Link} to="/home" sx={getButtonStyle('/home')}>
            Home
          </Button>
          <Button onClick={scrollToContact} sx={getButtonStyle('/contact')}>
            Contact Us
          </Button>
          <Button onClick={scrollToFAQ} sx={getButtonStyle('/faqs')}>
            FAQs
          </Button>
          {isLoggedIn && (
            <Button component={Link} to="/collection" sx={getButtonStyle('/collection')}>
              Collection
            </Button>
          )}
        </Box>
        {isLoggedIn ? (
          <>
            <Box sx={{ display: 'flex', alignItems: 'center', marginRight: '15px' }}>
              <Typography
                variant="body1"
                className="username"
                style={{ marginRight: '20px', fontWeight: 'bold' }}
              >
                Hi, {username}!
              </Typography>
              <Avatar
                sx={{
                  background: `linear-gradient(120deg,#FF33A1 , #6A0DAD )`,
                  color: '#fff',
                  width: 35,
                  height: 35,
                  boxShadow: '0px 4px 6px rgba(0, 0, 0, 0.2)',
                  fontSize: '1rem',
                }}
              >
                {username ? username.charAt(0).toUpperCase() : ''} {/* ใช้อักษรตัวแรกของชื่อผู้ใช้ */}
              </Avatar>
            </Box>
            <Button 
              onClick={handleLogout} 
              sx={{ 
                backgroundColor: '#6A0DAD',  
                color: 'white',              
                marginRight: '5px' 
              }}
              variant="contained"
            >
              Logout
            </Button>
          </>
        ) : (
          <>
            <Button
              component={Link}
              to="/register"
              sx={{
                borderColor: '#6A0DAD',
                color: '#6A0DAD',
                marginRight: '10px',
              }}
              variant="outlined"
            >
              Sign Up
            </Button>
            <Button
              component={Link}
              to="/login"
              sx={{
                backgroundColor: '#6A0DAD',
                color: 'white',
              }}
              variant="contained"
            >
              Get Started
            </Button>
          </>
        )}
      </Toolbar>
    </AppBar>
  );
};

export default Navbar;
