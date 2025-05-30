import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Container, Box, Typography, TextField, Button, Alert, InputAdornment, IconButton, Paper, Grid, Tooltip, Checkbox, FormControlLabel } from '@mui/material';
import KeyIcon from '@mui/icons-material/VpnKey';
import PersonIcon from '@mui/icons-material/Person';
import EmailIcon from '@mui/icons-material/Email';
import Visibility from '@mui/icons-material/Visibility';
import VisibilityOff from '@mui/icons-material/VisibilityOff';
import ContentCopyIcon from '@mui/icons-material/ContentCopy';
import { ethers } from 'ethers';

function Register() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [email, setEmail] = useState('');
  const [fullName, setFullName] = useState('');
  
  const [generatedEthPrivateKey, setGeneratedEthPrivateKey] = useState('');
  const [generatedEthMnemonic, setGeneratedEthMnemonic] = useState('');
  const [generatedEthPublicKey, setGeneratedEthPublicKey] = useState('');
  
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [keysGenerated, setKeysGenerated] = useState(false);
  const [confirmedBackup, setConfirmedBackup] = useState(false);

  const navigate = useNavigate();

  const handleGenerateEthKeys = async () => {
    setError(''); setSuccess('');
    setConfirmedBackup(false);
    try {
      const wallet = ethers.Wallet.createRandom();
      setGeneratedEthPrivateKey(wallet.privateKey);
      if (wallet.mnemonic) {
        setGeneratedEthMnemonic(wallet.mnemonic.phrase);
      }
      setGeneratedEthPublicKey(wallet.publicKey);
      setKeysGenerated(true);
      setSuccess('Đã tạo cặp khóa Ethereum (secp256k1) mới! Vui lòng sao lưu Private Key và Mnemonic Phrase một cách cẩn thận.');
    } catch (err) {
      console.error("Lỗi khi tạo khóa Ethereum:", err);
      setError('Không thể tạo cặp khóa Ethereum. Vui lòng thử lại.');
      setKeysGenerated(false);
    }
  };

  const handleCopyToClipboard = (textToCopy, type) => {
    navigator.clipboard.writeText(textToCopy).then(() => {
      setSuccess(`Đã sao chép ${type} vào clipboard!`);
      setTimeout(() => setSuccess(''), 2000);
    }).catch(err => {
      console.error('Không thể sao chép:', err);
      setError('Không thể sao chép vào clipboard.');
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(''); setSuccess('');

    if (!keysGenerated) {
      setError('Vui lòng tạo cặp khóa trước khi đăng ký.');
      return;
    }
    if (!confirmedBackup) {
      setError('Vui lòng xác nhận bạn đã sao lưu Private Key và Mnemonic Phrase.');
      return;
    }
    if (!generatedEthPublicKey) {
        setError('Không có Public Key để đăng ký. Vui lòng tạo lại khóa.');
        return;
    }

    try {
      const res = await fetch('http://localhost:3001/api/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password, email, fullName, publicKey: generatedEthPublicKey })
      });
      const data = await res.json();
      if (res.ok) {
        setSuccess('Đăng ký thành công! Bạn sẽ được chuyển đến trang đăng nhập.');
        setGeneratedEthPrivateKey('');
        setGeneratedEthMnemonic('');
        setKeysGenerated(false);
        setConfirmedBackup(false);
        setTimeout(()=>navigate('/login'), 2000);
      } else {
        setError(data.message || 'Đăng ký thất bại');
      }
    } catch (err) {
      console.error("Lỗi mạng hoặc server:", err);
      setError('Lỗi mạng hoặc không thể kết nối tới server.');
    }
  };

  return (
    <Container maxWidth="sm">
      <Paper elevation={3} sx={{ p: 4, mt: 6 }}>
        <Typography variant="h4" align="center" gutterBottom>Đăng ký Tài Khoản Mới</Typography>
        
        <Box sx={{ mb: 3, textAlign: 'center' }}>
          <Button variant="contained" startIcon={<KeyIcon />} onClick={handleGenerateEthKeys} size="large">
            1. Tạo Cặp Khóa Ethereum (Secp256k1)
          </Button>
        </Box>

        {keysGenerated && (
          <Alert severity="warning" sx={{ mb: 2 }}>
            <Typography variant="h6" gutterBottom>Thông Tin Khóa Quan Trọng!</Typography>
            <Typography variant="body2" sx={{ mb: 1}}>
              Vui lòng sao lưu <b>Private Key</b> và <b>Mnemonic Phrase</b> dưới đây một cách an toàn.
              Nếu mất thông tin này, bạn sẽ không thể khôi phục tài khoản hoặc chữ ký của mình.
            </Typography>
            
            <Box sx={{ mt: 1, mb: 1 }}>
              <Typography variant="subtitle2">Private Key (Hex):</Typography>
              <TextField 
                value={generatedEthPrivateKey} 
                multiline 
                fullWidth 
                InputProps={{ 
                  readOnly: true, 
                  endAdornment: (
                    <InputAdornment position="end">
                      <Tooltip title="Sao chép Private Key">
                        <IconButton onClick={() => handleCopyToClipboard(generatedEthPrivateKey, 'Private Key')} edge="end">
                          <ContentCopyIcon />
                        </IconButton>
                      </Tooltip>
                    </InputAdornment>
                  )
                }}
                sx={{ mt: 0.5, fontFamily: 'monospace' }}
              />
            </Box>

            {generatedEthMnemonic && (
              <Box sx={{ mt: 1, mb: 2 }}>
                <Typography variant="subtitle2">Mnemonic Phrase (12 từ khôi phục):</Typography>
                <TextField 
                  value={generatedEthMnemonic} 
                  multiline 
                  fullWidth 
                  InputProps={{ 
                    readOnly: true,
                    endAdornment: (
                      <InputAdornment position="end">
                        <Tooltip title="Sao chép Mnemonic Phrase">
                          <IconButton onClick={() => handleCopyToClipboard(generatedEthMnemonic, 'Mnemonic Phrase')} edge="end">
                            <ContentCopyIcon />
                          </IconButton>
                        </Tooltip>
                      </InputAdornment>
                    )
                  }}
                  sx={{ mt: 0.5, fontFamily: 'monospace' }}
                />
              </Box>
            )}
            <FormControlLabel 
              control={<Checkbox checked={confirmedBackup} onChange={(e) => setConfirmedBackup(e.target.checked)} />}
              label="Tôi đã sao lưu Private Key và Mnemonic Phrase an toàn."
              sx={{ mb: 2 }}
            />
            <Typography variant="subtitle2">Public Key (sẽ được gửi để đăng ký):</Typography>
            <TextField 
                value={generatedEthPublicKey} 
                multiline 
                fullWidth 
                InputProps={{ readOnly: true }} 
                sx={{ mt: 0.5, fontFamily: 'monospace' }}
              />
          </Alert>
        )}

        <form onSubmit={handleSubmit}>
          <Typography variant="h6" sx={{ mt: keysGenerated ? 2 : 0, mb: 1}}>2. Nhập Thông Tin Tài Khoản</Typography>
          <TextField label="Họ tên" value={fullName} onChange={e => setFullName(e.target.value)} fullWidth required margin="normal" InputProps={{ startAdornment: <InputAdornment position="start"><PersonIcon /></InputAdornment> }} />
          <TextField label="Email" type="email" value={email} onChange={e => setEmail(e.target.value)} fullWidth required margin="normal" InputProps={{ startAdornment: <InputAdornment position="start"><EmailIcon /></InputAdornment> }} />
          <TextField label="Username" value={username} onChange={e => setUsername(e.target.value)} fullWidth required margin="normal" InputProps={{ startAdornment: <InputAdornment position="start"><PersonIcon /></InputAdornment> }} />
          <TextField 
            label="Mật khẩu" 
            type={showPassword ? 'text' : 'password'} 
            value={password} 
            onChange={e => setPassword(e.target.value)} 
            fullWidth 
            required 
            margin="normal" 
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
          <Button type="submit" variant="contained" color="primary" fullWidth sx={{ mt: 3 }} disabled={!keysGenerated || !confirmedBackup}>
            Đăng ký
          </Button>
        </form>
        {error && <Alert severity="error" sx={{ mt: 2 }}>{error}</Alert>}
        {success && !error && <Alert severity="success" sx={{ mt: 2 }}>{success}</Alert>} 
        <Typography align="center" sx={{ mt: 2 }}>
          Đã có tài khoản?{' '}
          <Button color="secondary" onClick={()=>navigate('/login')}>Đăng nhập</Button>
        </Typography>
      </Paper>
    </Container>
  );
}

export default Register;
