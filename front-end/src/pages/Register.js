import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Container, Box, Typography, TextField, Button, Alert, InputAdornment, IconButton, Paper } from '@mui/material';
import KeyIcon from '@mui/icons-material/VpnKey';
import PersonIcon from '@mui/icons-material/Person';
import EmailIcon from '@mui/icons-material/Email';
import Visibility from '@mui/icons-material/Visibility';
import VisibilityOff from '@mui/icons-material/VisibilityOff';

// Hàm sinh cặp khóa RSA (bảo mật, sinh phía client, không gửi private key lên server)
async function generateKeyPair() {
  const keyPair = await window.crypto.subtle.generateKey(
    {
      name: 'RSA-PSS',
      modulusLength: 2048,
      publicExponent: new Uint8Array([1, 0, 1]),
      hash: 'SHA-256',
    },
    true,
    ['sign', 'verify']
  );
  // Export public key (PEM)
  const spki = await window.crypto.subtle.exportKey('spki', keyPair.publicKey);
  const pubPem = `-----BEGIN PUBLIC KEY-----\n${btoa(String.fromCharCode(...new Uint8Array(spki))).replace(/(.{64})/g,'$1\n')}\n-----END PUBLIC KEY-----`;
  // Export private key (PEM)
  const pkcs8 = await window.crypto.subtle.exportKey('pkcs8', keyPair.privateKey);
  const privPem = `-----BEGIN PRIVATE KEY-----\n${btoa(String.fromCharCode(...new Uint8Array(pkcs8))).replace(/(.{64})/g,'$1\n')}\n-----END PRIVATE KEY-----`;
  return { pubPem, privPem };
}

function Register() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [email, setEmail] = useState('');
  const [fullName, setFullName] = useState('');
  const [publicKey, setPublicKey] = useState('');
  const [privateKey, setPrivateKey] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const navigate = useNavigate();

  const handleGenerateKey = async () => {
    setError(''); setSuccess('');
    try {
      const { pubPem, privPem } = await generateKeyPair();
      setPublicKey(pubPem);
      setPrivateKey(privPem);
      setSuccess('Đã sinh cặp khóa! Hãy lưu lại private key.');
    } catch {
      setError('Không thể sinh cặp khóa trên trình duyệt này!');
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(''); setSuccess('');
    try {
      const res = await fetch('http://localhost:3001/api/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password, email, fullName, publicKey })
      });
      const data = await res.json();
      if (res.ok) {
        setSuccess('Đăng ký thành công!');
        setTimeout(()=>navigate('/login'), 1000);
      } else {
        setError(data.message || 'Đăng ký thất bại');
      }
    } catch {
      setError('Network error');
    }
  };

  return (
    <Container maxWidth="sm">
      <Paper elevation={3} sx={{ p: 4, mt: 6 }}>
        <Typography variant="h4" align="center" gutterBottom>Đăng ký</Typography>
        <Button variant="outlined" startIcon={<KeyIcon />} fullWidth sx={{ mb: 2 }} onClick={handleGenerateKey}>
          Tạo cặp khóa RSA
        </Button>
        {privateKey && (
          <Alert severity="info" sx={{ mb: 2 }}>
            <b>Private Key (bảo mật, chỉ lưu trên máy bạn):</b>
            <TextField value={privateKey} multiline fullWidth rows={4} InputProps={{ readOnly: true }} sx={{ mt: 1 }} />
          </Alert>
        )}
        <form onSubmit={handleSubmit}>
          <TextField label="Họ tên" value={fullName} onChange={e => setFullName(e.target.value)} fullWidth required margin="normal" InputProps={{ startAdornment: <InputAdornment position="start"><PersonIcon /></InputAdornment> }} />
          <TextField label="Email" value={email} onChange={e => setEmail(e.target.value)} fullWidth required margin="normal" InputProps={{ startAdornment: <InputAdornment position="start"><EmailIcon /></InputAdornment> }} />
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
          <TextField label="Public Key (PEM)" value={publicKey} onChange={e => setPublicKey(e.target.value)} fullWidth required margin="normal" multiline rows={4} />
          <Button type="submit" variant="contained" color="primary" fullWidth sx={{ mt: 2 }}>Đăng ký</Button>
        </form>
        {error && <Alert severity="error" sx={{ mt: 2 }}>{error}</Alert>}
        {success && <Alert severity="success" sx={{ mt: 2 }}>{success}</Alert>}
        <Typography align="center" sx={{ mt: 2 }}>
          Đã có tài khoản?{' '}
          <Button color="secondary" onClick={()=>navigate('/login')}>Đăng nhập</Button>
        </Typography>
      </Paper>
    </Container>
  );
}

export default Register;
