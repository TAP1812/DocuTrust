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
import LockOutlinedIcon from '@mui/icons-material/LockOutlined';
import AccountCircleIcon from '@mui/icons-material/AccountCircle';
import VpnKeyOutlinedIcon from '@mui/icons-material/VpnKeyOutlined';
import Fingerprint from '@mui/icons-material/Fingerprint';

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
      setTimeout(() => setSuccess(''), 3000);
    }).catch(err => {
      console.error('Không thể sao chép:', err);
      setError('Không thể sao chép vào clipboard.');
      setTimeout(() => setError(''), 3000);
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
    <Container 
      maxWidth="md"
      sx={{ 
        display: 'flex', 
        flexDirection: 'column', 
        alignItems: 'center', 
        justifyContent: 'center', 
        minHeight: '90vh',
        py: 2
      }}
    >
      <Paper 
        elevation={6}
        sx={{ 
          p: { xs: 2, sm: 3, md: 4 },
          mt: 4, 
          mb: 4,
          width: '100%', 
          maxWidth: '700px'
        }}
      >
        <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', mb: 3 }}>
          <LockOutlinedIcon sx={{ fontSize: 40, mb: 1, color: 'primary.main' }} />
          <Typography component="h1" variant="h4" align="center" gutterBottom sx={{ fontWeight: 'bold' }}>
            Đăng ký Tài Khoản Mới
          </Typography>
        </Box>
        
        {error && <Alert severity="error" sx={{ mb: 2, width: '100%' }}>{error}</Alert>}
        {success && <Alert severity="success" sx={{ mb: 2, width: '100%' }}>{success}</Alert>}

        <Grid container spacing={3}>
          <Grid item xs={12}>
            <Box sx={{ textAlign: 'center', p: 2, border: '1px dashed grey', borderRadius: 1, mb: 3 }}>
              <Typography variant="h6" sx={{ mb: 2, fontWeight: 500 }}>
                Bước 1: Tạo Cặp Khóa Bảo Mật
              </Typography>
              <Button 
                variant="contained" 
                startIcon={<VpnKeyOutlinedIcon />} 
                onClick={handleGenerateEthKeys} 
                size="large"
                sx={{ textTransform: 'none', fontWeight: 'bold' }}
              >
                Tạo Cặp Khóa Ethereum (Secp256k1)
              </Button>
            </Box>
          </Grid>

          {keysGenerated && (
            <Grid item xs={12}>
              <Alert severity="warning" sx={{ mb: 3, p: 2 }}>
                <Typography variant="h6" gutterBottom sx={{ fontWeight: 'bold' }}>
                  ⚠️ Thông Tin Khóa Quan Trọng!
                </Typography>
                <Typography variant="body2" sx={{ mb: 2}}>
                  Vui lòng sao lưu <b>Private Key</b> và <b>Mnemonic Phrase</b> dưới đây một cách an toàn.
                  Nếu mất thông tin này, bạn sẽ không thể khôi phục tài khoản hoặc chữ ký của mình.
                </Typography>
                
                <Grid container spacing={2}>
                  <Grid item xs={12}>
                    <Typography variant="subtitle2" sx={{ fontWeight: 'bold' }}>Private Key (Hex):</Typography>
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
                      sx={{ mt: 0.5, fontFamily: 'monospace', bgcolor: 'grey.100' }}
                    />
                  </Grid>

                  {generatedEthMnemonic && (
                    <Grid item xs={12}>
                      <Typography variant="subtitle2" sx={{ fontWeight: 'bold' }}>Mnemonic Phrase (12 từ khôi phục):</Typography>
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
                        sx={{ mt: 0.5, fontFamily: 'monospace', bgcolor: 'grey.100' }}
                      />
                    </Grid>
                  )}
                  <Grid item xs={12}>
                    <Typography variant="subtitle2" sx={{ fontWeight: 'bold' }}>Public Key (sẽ được gửi để đăng ký):</Typography>
                    <TextField 
                        value={generatedEthPublicKey} 
                        multiline 
                        fullWidth 
                        InputProps={{ readOnly: true, startAdornment: <InputAdornment position="start"><Fingerprint /></InputAdornment> }} 
                        sx={{ mt: 0.5, fontFamily: 'monospace', bgcolor: 'grey.100' }}
                    />
                  </Grid>
                  <Grid item xs={12}>
                    <FormControlLabel 
                      control={<Checkbox checked={confirmedBackup} onChange={(e) => setConfirmedBackup(e.target.checked)} color="primary" />}
                      label="Tôi đã sao lưu Private Key và Mnemonic Phrase an toàn."
                      sx={{ mt: 1, mb: 1 }}
                    />
                  </Grid>
                </Grid>
              </Alert>
            </Grid>
          )}

          <Grid item xs={12}>
            <Box component="form" onSubmit={handleSubmit} sx={{ mt: keysGenerated ? 0 : 2 }}>
              <Typography variant="h6" sx={{ mb: 2, fontWeight: 500, borderTop: '1px dashed grey', pt: 3, mt: keysGenerated ? 3 : 0 }}>
                Bước 2: Nhập Thông Tin Tài Khoản
              </Typography>
              <Grid container spacing={2}>
                <Grid item xs={12} sm={6}>
                  <TextField 
                    label="Họ tên" 
                    value={fullName} 
                    onChange={e => setFullName(e.target.value)} 
                    fullWidth 
                    required 
                    InputProps={{ startAdornment: <InputAdornment position="start"><AccountCircleIcon /></InputAdornment> }} 
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <TextField 
                    label="Email" 
                    type="email" 
                    value={email} 
                    onChange={e => setEmail(e.target.value)} 
                    fullWidth 
                    required 
                    InputProps={{ startAdornment: <InputAdornment position="start"><EmailIcon /></InputAdornment> }} 
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <TextField 
                    label="Username" 
                    value={username} 
                    onChange={e => setUsername(e.target.value)} 
                    fullWidth 
                    required 
                    InputProps={{ startAdornment: <InputAdornment position="start"><PersonIcon /></InputAdornment> }} 
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <TextField 
                    label="Mật khẩu" 
                    type={showPassword ? 'text' : 'password'} 
                    value={password} 
                    onChange={e => setPassword(e.target.value)} 
                    fullWidth 
                    required 
                    InputProps={{
                      startAdornment: <InputAdornment position="start"><KeyIcon /></InputAdornment>,
                      endAdornment: (
                        <InputAdornment position="end">
                          <IconButton onClick={()=>setShowPassword(s=>!s)} edge="end" aria-label={showPassword ? "Ẩn mật khẩu" : "Hiện mật khẩu"}>
                            {showPassword ? <VisibilityOff /> : <Visibility />}
                          </IconButton>
                        </InputAdornment>
                      )
                    }} 
                  />
                </Grid>
              </Grid>
              <Button 
                type="submit" 
                fullWidth 
                variant="contained" 
                color="primary" 
                size="large"
                sx={{ mt: 3, mb: 2, textTransform: 'none', fontWeight: 'bold', py: 1.5 }}
                disabled={!keysGenerated || !confirmedBackup}
              >
                Đăng ký
              </Button>
            </Box>
          </Grid>
          <Grid item xs={12} sx={{ textAlign: 'center', mt: 2 }}>
            <Typography variant="body1">
              Đã có tài khoản?{' '}
              <Button 
                variant="text" 
                color="secondary" 
                onClick={()=>navigate('/login')} 
                sx={{ textTransform: 'none', fontWeight: 'bold' }}
              >
                Đăng nhập ngay
              </Button>
            </Typography>
          </Grid>
        </Grid>
      </Paper>
    </Container>
  );
}

export default Register;
