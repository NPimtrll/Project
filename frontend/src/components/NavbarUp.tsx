import React, { useEffect } from 'react';
import { AppBar, Toolbar, Typography, Button } from '@mui/material';
import { Link, useNavigate } from 'react-router-dom';
import { deleteSession } from '../services/http/index'; // import deleteSession function

interface NavbarProps {
  isLoggedIn: boolean;
  setIsLoggedIn: (isLoggedIn: boolean) => void;
}


const Navbar: React.FC<NavbarProps> = ({ isLoggedIn, setIsLoggedIn }) => {
  const navigate = useNavigate();

  useEffect(() => {
    // ตรวจสอบว่า token ยังคงอยู่ใน localStorage หรือไม่
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

  return (
    <AppBar position="static">
      <Toolbar>
        <Typography variant="h6" style={{ flexGrow: 1 }}>
          แปลงไฟล์เป็นเสียง
        </Typography>
        <Button color="inherit" component={Link} to="/home">Home</Button>
        {isLoggedIn ? (
          <>
            <Button color="inherit" component={Link} to="/collection">Collection</Button>
            <Button color="inherit" onClick={handleLogout}>Logout</Button>
          </>
        ) : (
          <Button color="inherit" component={Link} to="/login">Login</Button>
        )}
      </Toolbar>
    </AppBar>
  );
};

export default Navbar;

