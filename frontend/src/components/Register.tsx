import React, { useState } from 'react';
import { Container, TextField, Button, Typography, Box } from '@mui/material';
import { useNavigate } from 'react-router-dom';
import { createUser } from '../services/http/index'; // import function
import { IUser } from '../interfaces/IUser';

// ใช้รูปภาพพื้นหลัง
const backgroundImage = 'background4.png';

const Register: React.FC = () => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [email, setEmail] = useState('');
  const [birthday, setBirthday] = useState('');
  const [errorMessage, setErrorMessage] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const navigate = useNavigate();

  const handleRegister = async () => {
    if (password !== confirmPassword) {
      setErrorMessage('Passwords do not match.');
      return;
    }

    try {
      const userData: IUser = {
        Username: username,
        Password: password,
        Email: email,
        Birthday: new Date(birthday),
        CreatedAt: new Date(), // Optional if handled by backend
        UpdatedAt: new Date(), // Optional if handled by backend
        PDFFiles: [],
        AudioFiles: [],
        Conversions: [],
        Sessions: [],
        ImageFiles: [],
      };

      await createUser(userData);
      setSuccessMessage('Registration successful! Redirecting to login...');
      setTimeout(() => {
        navigate('/login');
      }, 2000); // Redirect to login after 2 seconds
    } catch (error) {
      setErrorMessage('Error registering user. Please try again.');
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
          marginTop: '2rem',
          marginBottom: '2rem',
        }}>
          <Typography variant="h4" fontWeight="bold" gutterBottom>Register</Typography>
          
          <TextField 
            label="Username" 
            variant="outlined" 
            fullWidth 
            margin="normal" 
            value={username} 
            onChange={(e) => setUsername(e.target.value)} 
            sx={{ 
              marginBottom: '1rem',
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
              marginBottom: '1rem',
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
            label="Confirm Password" 
            type="password" 
            variant="outlined" 
            fullWidth 
            margin="normal" 
            value={confirmPassword} 
            onChange={(e) => setConfirmPassword(e.target.value)} 
            sx={{ 
              marginBottom: '1rem',
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
            label="Email" 
            variant="outlined" 
            fullWidth 
            margin="normal" 
            value={email} 
            onChange={(e) => setEmail(e.target.value)} 
            sx={{ 
              marginBottom: '1rem',
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
            label="Birthday" 
            type="date" 
            variant="outlined" 
            fullWidth 
            margin="normal" 
            InputLabelProps={{ shrink: true }} 
            value={birthday} 
            onChange={(e) => setBirthday(e.target.value)} 
            sx={{ 
              marginBottom: '1rem',
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
                '& input::-webkit-calendar-picker-indicator': {
                  filter: 'invert(1)', // เปลี่ยนสีของไอคอนปฏิทินให้เป็นสีขาว
                  cursor: 'pointer',
                },
                '& input[type="date"]': {
                  color: 'white', // สีของตัวอักษรภายในช่องกรอกข้อมูล
                }
              },
              '& .MuiInputLabel-root': {
                color: 'white', // สีของตัวอักษร label
                '&.MuiInputLabel-shrink': {
                  color: 'white', // สีของตัวอักษร label เมื่อเลื่อนขึ้น
                }
              },
            }}
          />


          {errorMessage && <Typography color="error" variant="subtitle1">{errorMessage}</Typography>}
          {successMessage && <Typography color="primary" variant="subtitle1">{successMessage}</Typography>}
          <Button 
            variant="contained" 
            color="primary" 
            fullWidth 
            onClick={handleRegister}
            sx={{
              marginTop: '1rem',
              padding: '0.75rem',
              backgroundColor: '#6A0DAD',
              color: 'white',
              '&:hover': {
                backgroundColor: '#4a0072', // สีม่วงเข้มขึ้นเมื่อ hover
              }
            }}
          >
            Register
          </Button>
        </Box>
      </Container>
    </Box>
  );
};

export default Register;