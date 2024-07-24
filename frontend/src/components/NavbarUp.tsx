import React from 'react';
import { AppBar, Toolbar, Typography, Button } from '@mui/material';
import { Link, useNavigate } from 'react-router-dom';
import { deleteSession } from '../services/http/index'; // import deleteSession function

interface NavbarProps {
  isLoggedIn: boolean;
  setIsLoggedIn: (value: boolean) => void;
}

const Navbar: React.FC<NavbarProps> = ({ isLoggedIn, setIsLoggedIn }) => {
  const navigate = useNavigate();

  const handleLogout = async () => {
    // ลบ token และข้อมูลอื่นๆ จาก local storage
    const token = localStorage.getItem('token');
    if (token) {
      await deleteSession(token);
    }
    localStorage.clear(); // ลบข้อมูลทั้งหมดจาก local storage

    // reset state ที่เกี่ยวข้องกับการล็อกอิน
    setIsLoggedIn(false);
    // นำผู้ใช้ไปยังหน้า home
    navigate('/home');
    // รีเฟรชหน้า home
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
