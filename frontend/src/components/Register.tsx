import React, { useState } from 'react';
import { Container, TextField, Button, Typography } from '@mui/material';
import { useNavigate } from 'react-router-dom';
import { createUser } from '../services/http/index'; // import function
import { IUser } from '../interfaces/IUser';

const Register: React.FC = () => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [email, setEmail] = useState('');
  const [birthday, setBirthday] = useState('');
  const [errorMessage, setErrorMessage] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const navigate = useNavigate();

  const handleRegister = async () => {
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
    <Container maxWidth="xs">
      <Typography variant="h4" gutterBottom>Register</Typography>
      <TextField label="Username" variant="outlined" fullWidth margin="normal" value={username} onChange={(e) => setUsername(e.target.value)} />
      <TextField label="Password" type="password" variant="outlined" fullWidth margin="normal" value={password} onChange={(e) => setPassword(e.target.value)} />
      <TextField label="Email" variant="outlined" fullWidth margin="normal" value={email} onChange={(e) => setEmail(e.target.value)} />
      <TextField label="Birthday" type="date" variant="outlined" fullWidth margin="normal" InputLabelProps={{ shrink: true }} value={birthday} onChange={(e) => setBirthday(e.target.value)} />
      {errorMessage && <Typography color="error" variant="subtitle1">{errorMessage}</Typography>}
      {successMessage && <Typography color="primary" variant="subtitle1">{successMessage}</Typography>}
      <Button variant="contained" color="primary" fullWidth onClick={handleRegister}>Register</Button>
    </Container>
  );
};

export default Register;
