import React, { useEffect } from 'react';
import { AppBar, Toolbar, Typography, Button, Box } from '@mui/material';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { deleteSession } from '../services/http/index';

interface NavbarProps {
  isLoggedIn: boolean;
  setIsLoggedIn: (isLoggedIn: boolean) => void;
}

const Navbar: React.FC<NavbarProps> = ({ isLoggedIn, setIsLoggedIn }) => {
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    const token = localStorage.getItem('authToken');
    if (token) {
      setIsLoggedIn(true);
    }
  }, [setIsLoggedIn]);

  const handleLogout = async () => {
    const token = localStorage.getItem('authToken');
    if (token) {
      await deleteSession(token);
    }
    localStorage.clear();
    setIsLoggedIn(false);
    navigate('/home');
    window.location.reload();
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
          <Button component={Link} to="/contact" sx={getButtonStyle('/contact')}>
            Contact Us
          </Button>
          <Button component={Link} to="/faqs" sx={getButtonStyle('/faqs')}>
            FAQs
          </Button>
          {isLoggedIn && (
            <Button component={Link} to="/collection" sx={getButtonStyle('/collection')}>
              Collection
            </Button>
          )}
        </Box>
        {isLoggedIn ? (
          <Button 
            onClick={handleLogout} 
            sx={{ 
              backgroundColor: '#6A0DAD',  
              color: 'white',              
              marginRight: '20px' 
            }}
            variant="contained"
          >
            Logout
          </Button>
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
