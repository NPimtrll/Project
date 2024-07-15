import React, { useState } from 'react';
import { Container, TextField, Button, Typography, Link } from '@mui/material';
import { useNavigate } from 'react-router-dom';
import { loginUser } from '../services/http';

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
    <Container maxWidth="xs">
      <Typography variant="h4" gutterBottom>Login</Typography>
      <TextField 
        label="Username" 
        variant="outlined" 
        fullWidth 
        margin="normal" 
        value={username} 
        onChange={(e) => setUsername(e.target.value)} 
      />
      <TextField 
        label="Password" 
        type="password" 
        variant="outlined" 
        fullWidth 
        margin="normal" 
        value={password} 
        onChange={(e) => setPassword(e.target.value)} 
      />
      {error && <Typography color="error" variant="subtitle1">{error}</Typography>}
      <Button variant="contained" color="primary" fullWidth onClick={handleLogin}>Login</Button>
      <Typography variant="body2" style={{ marginTop: '1rem' }}>
        Don't have an account? <Link component="button" onClick={() => navigate('/register')}>Register here</Link>
      </Typography>
    </Container>
  );
};

export default Login;
