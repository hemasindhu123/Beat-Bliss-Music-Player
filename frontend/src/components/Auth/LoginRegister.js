import React, { useState, useContext } from 'react';
import axios from '../../api/axios';
import { useNavigate } from 'react-router-dom';

import {
  Container, TextField, Button, Typography, Box,
  ToggleButtonGroup, ToggleButton, Alert, Paper, Divider
} from '@mui/material';
import { AuthContext } from '../../context/AuthContext';

const LoginRegister = () => {
  const [mode, setMode] = useState('login');
  const [formData, setFormData] = useState({ username: '', password: '' });
  const [error, setError] = useState('');
  const [msg, setMsg] = useState('');
  const { login } = useContext(AuthContext); 
  const navigate = useNavigate();

  const handleChange = (e) => {
    setFormData(prev => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setMsg('');
    try {
      if (mode === 'login') {
        await login(formData);  
        navigate('/player');    
      } else {
        // Register flow
        const res = await axios.post('/auth/register', formData);
        setMsg(res.data.msg);
        setMode('login');       // Switch to login after successful registration
      }
    } catch (err) {
      setError(err?.response?.data?.msg || 'Something went wrong');
    }
  };

  return (
    <Container maxWidth="sm" sx={{ mt: 8 }}>
      <Paper elevation={4} sx={{ p: 4, borderRadius: 3 }}>
        <Box sx={{ textAlign: 'center', mb: 3 }}>
          <Typography variant="h4" fontWeight="bold" color="primary">
            BeatBliss 🎵
          </Typography>
          <Typography variant="subtitle1" color="text.secondary" sx={{ mt: 1 }}>
            {mode === 'login' ? 'Welcome back! Sing your heart out.' : 'Join the BeatBliss family!'}
          </Typography>
          <ToggleButtonGroup
            value={mode}
            exclusive
            onChange={(e, val) => val && setMode(val)}
            sx={{ mt: 3 }}
          >
            <ToggleButton value="login">Login</ToggleButton>
            <ToggleButton value="register">Register</ToggleButton>
          </ToggleButtonGroup>
        </Box>

        <Divider sx={{ mb: 3 }} />

        {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}
        {msg && <Alert severity="success" sx={{ mb: 2 }}>{msg}</Alert>}

        <form onSubmit={handleSubmit}>
          <TextField
            fullWidth
            margin="normal"
            label="Username"
            name="username"
            variant="outlined"
            value={formData.username}
            onChange={handleChange}
            required
          />
          <TextField
            fullWidth
            margin="normal"
            label="Password"
            name="password"
            type="password"
            variant="outlined"
            value={formData.password}
            onChange={handleChange}
            required
          />
          <Button
            type="submit"
            variant="contained"
            fullWidth
            sx={{ mt: 3, py: 1.5 }}
            color="primary"
          >
            {mode === 'login' ? 'Login to BeatBliss' : 'Create your account'}
          </Button>
        </form>
      </Paper>
    </Container>
  );
};

export default LoginRegister;
