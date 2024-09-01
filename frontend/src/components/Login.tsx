import React, { useState } from 'react';
import { Container, TextField, Button, Typography, Link, Box } from '@mui/material';
import { useNavigate } from 'react-router-dom';
import { loginUser } from '../services/http';

// ใช้รูปภาพพื้นหลัง
const backgroundImage = 'background2.png';

interface LoginProps {
  setIsLoggedIn: (value: boolean) => void;
}

const Login: React.FC<LoginProps> = ({ setIsLoggedIn }) => {
  const navigate = useNavigate();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  const handleLogin = async () => {
    try {
      const { token, user } = await loginUser({ username, password });
      setIsLoggedIn(true);
      navigate('/home');
      localStorage.setItem('authToken', token); // Ensure 'authToken' is the correct key name
      localStorage.setItem('user', JSON.stringify(user));
    } catch (err) {
      setError('Invalid username or password');
    }
  };

  return (
    <Box
      sx={{
        backgroundImage: `url(${backgroundImage})`,
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        height: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        textAlign: 'center',
        padding: '2rem',
        color: 'white'
      }}
    >
      <Container maxWidth="xs">
        <Box sx={{
          backgroundColor: 'rgba(0, 0, 0, 0.5)', // เพิ่มพื้นหลังสีดำทึบเพื่อให้ข้อความอ่านง่ายขึ้น
          padding: '2rem',
          borderRadius: '8px',
        }}>
          <Typography variant="h4" fontWeight="bold" gutterBottom>Login to your account</Typography>
          <Typography variant="subtitle1" gutterBottom style={{ color: 'white' }}>
            Please enter your email and password to continue
          </Typography>

          <TextField 
            label="Username" 
            variant="outlined" 
            fullWidth 
            margin="normal" 
            value={username} 
            onChange={(e) => setUsername(e.target.value)} 
            sx={{ 
        
              '& .MuiOutlinedInput-root': { 
                '& fieldset': {
                  borderColor: 'white', // กรอบของช่องกรอกข้อมูล
                },
                '&:hover fieldset': {
                  borderColor: 'white', // กรอบเมื่อช่องกรอกข้อมูลถูกชี้ไปยัง (hover)
                },
                '&.Mui-focused fieldset': {
                  borderColor: 'white', // กรอบเมื่อช่องกรอกข้อมูลได้รับการโฟกัส
                },
              },
              '& .MuiInputLabel-root': {
                color: 'white', // สีของตัวอักษร label
                '&.MuiInputLabel-shrink': {
                  color: 'white', // สีของตัวอักษร label เมื่อเลื่อนขึ้น
                }
              },
              '& .MuiInputBase-input': {
                color: 'white', // สีของตัวอักษรภายในช่องกรอกข้อมูล
              }
            }}
          />
          <TextField 
            label="Password" 
            type="password" 
            variant="outlined" 
            fullWidth 
            margin="normal" 
            value={password} 
            onChange={(e) => setPassword(e.target.value)} 
            sx={{ 
              marginBottom: '1.5rem',
              '& .MuiOutlinedInput-root': { 
                '& fieldset': {
                  borderColor: 'white', // กรอบของช่องกรอกข้อมูล
                },
                '&:hover fieldset': {
                  borderColor: 'white', // กรอบเมื่อช่องกรอกข้อมูลถูกชี้ไปยัง (hover)
                },
                '&.Mui-focused fieldset': {
                  borderColor: 'white', // กรอบเมื่อช่องกรอกข้อมูลได้รับการโฟกัส
                },
              },
              '& .MuiInputLabel-root': {
                color: 'white', // สีของตัวอักษร label
                '&.MuiInputLabel-shrink': {
                  color: 'white', // สีของตัวอักษร label เมื่อเลื่อนขึ้น
                }
              },
              '& .MuiInputBase-input': {
                color: 'white', // สีของตัวอักษรภายในช่องกรอกข้อมูล
              }
            }}
          />
          <Button 
            variant="contained" 
            fullWidth 
            onClick={handleLogin}
            style={{ 
              backgroundColor: '#6A0DAD', 
              color: 'white', 
              padding: '0.75rem' 
            }} 
            sx={{
              '&:active': {
                backgroundColor: 'black',
              },
            }}
          >
            Login
          </Button>

          {error && (
            <Typography color="error" variant="subtitle1" style={{ marginTop: '1rem' }}>
              Invalid username or password.{' '}
              <Link 
                component="button" 
                onClick={() => navigate('/forgot-password')} // เปลี่ยน path ไปยังหน้า Forgot Password
                style={{ color: '#d32f2f' }}
              >
                Forgot password?
              </Link>
            </Typography>
          )}

          <Typography variant="body2" style={{ marginTop: '1.5rem' ,marginBottom: '1rem' }}>
            Don't have an account?{' '}
            <Link 
              component="button" 
              onClick={() => navigate('/register')}
              style={{ color: '#D2B2E5' }} // เปลี่ยนสีเป็นสีม่วง
            >
              Register here
            </Link>
          </Typography>
        </Box>
      </Container>
    </Box>
  );
};

export default Login;
