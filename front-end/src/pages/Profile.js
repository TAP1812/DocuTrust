import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Box, Typography, Paper, Button, TextField } from '@mui/material';

function Profile() {
  const user = JSON.parse(localStorage.getItem('user'));
  const navigate = useNavigate();
  const [fullName, setFullName] = useState(user.fullName || '');
  const [username, setUsername] = useState(user.username || '');
  const [email, setEmail] = useState(user.email || '');
  const [success, setSuccess] = useState('');
  const [error, setError] = useState('');
  if (!user) return null;

  const handleUpdate = async (e) => {
    e.preventDefault();
    setSuccess(''); setError('');
    try {
      const res = await fetch(`http://localhost:3001/api/profile`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ fullName, username, email })
      });
      const data = await res.json();
      if (res.ok) {
        setSuccess('Cập nhật thành công!');
        localStorage.setItem('user', JSON.stringify({ ...user, fullName, username, email }));
      } else {
        setError(data.message || 'Cập nhật thất bại');
      }
    } catch {
      setError('Network error');
    }
  };

  return (
    <Box display="flex" justifyContent="center" alignItems="center" minHeight="80vh">
      <Paper elevation={4} sx={{ p: 4, minWidth: 350 }}>
        <Typography variant="h4" gutterBottom>Thông tin cá nhân</Typography>
        <form onSubmit={handleUpdate}>
          <TextField label="Họ tên" value={fullName} onChange={e=>setFullName(e.target.value)} fullWidth margin="normal" />
          <TextField label="Username" value={username} onChange={e=>setUsername(e.target.value)} fullWidth margin="normal" />
          <TextField label="Email" value={email} onChange={e=>setEmail(e.target.value)} fullWidth margin="normal" />
          <Typography sx={{ mt: 2 }}><b>Public Key:</b></Typography>
          <Paper variant="outlined" sx={{ p: 1, mt: 1, mb: 2, fontSize: 12, wordBreak: 'break-all', background: '#f5f5f5' }}>
            {user.publicKey || 'Chưa cập nhật'}
          </Paper>
          {error && <Typography color="error">{error}</Typography>}
          {success && <Typography color="success.main">{success}</Typography>}
          <Button type="submit" variant="contained" sx={{ mt: 2, mr: 2 }}>Cập nhật</Button>
          <Button variant="outlined" sx={{ mt: 2 }} onClick={()=>navigate('/dashboard')}>Quay lại Dashboard</Button>
        </form>
      </Paper>
    </Box>
  );
}

export default Profile;
