import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Container, Box, Typography, TextField, Button, Alert, InputAdornment, IconButton, Paper } from '@mui/material';
import KeyIcon from '@mui/icons-material/VpnKey';
import PersonIcon from '@mui/icons-material/Person';
import Visibility from '@mui/icons-material/Visibility';
import VisibilityOff from '@mui/icons-material/VisibilityOff';

function Login() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    try {
      const res = await fetch('http://localhost:3001/api/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password })
      });
      const data = await res.json();
      if (res.ok) {
        localStorage.setItem('token', data.token);
        localStorage.setItem('user', JSON.stringify(data.user));
        // Nếu backend trả về redirect, chuyển hướng sang dashboard
        if (data.redirect) {
          navigate(data.redirect);
        } else {
          navigate('/dashboard');
        }
      } else {
        setError(data.message || 'Login failed');
      }
    } catch {
      setError('Network error');
    }
  };

  return (
    <Container maxWidth="sm">
      <Paper elevation={3} sx={{ p: 4, mt: 8 }}>
        <Typography variant="h4" align="center" gutterBottom>Đăng nhập</Typography>
        <form onSubmit={handleSubmit}>
          <TextField label="Username" value={username} onChange={e => setUsername(e.target.value)} fullWidth required margin="normal" InputProps={{ startAdornment: <InputAdornment position="start"><PersonIcon /></InputAdornment> }} />
          <TextField label="Password" type={showPassword ? 'text' : 'password'} value={password} onChange={e => setPassword(e.target.value)} fullWidth required margin="normal"
            InputProps={{
              startAdornment: <InputAdornment position="start"><KeyIcon /></InputAdornment>,
              endAdornment: (
                <InputAdornment position="end">
                  <IconButton onClick={()=>setShowPassword(s=>!s)} edge="end">
                    {showPassword ? <VisibilityOff /> : <Visibility />}
                  </IconButton>
                </InputAdornment>
              )
            }}
          />
          <Button type="submit" variant="contained" color="primary" fullWidth sx={{ mt: 2 }}>Đăng nhập</Button>
        </form>
        {error && <Alert severity="error" sx={{ mt: 2 }}>{error}</Alert>}
        <Typography align="center" sx={{ mt: 2 }}>
          Bạn chưa có tài khoản?{' '}
          <Button color="secondary" onClick={()=>navigate('/register')}>Đăng ký</Button>
        </Typography>
      </Paper>
    </Container>
  );
}

export default Login;
