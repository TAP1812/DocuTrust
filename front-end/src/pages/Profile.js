import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Box,
  Typography,
  Paper,
  Button,
  TextField,
  Container,
  Grid,
  Avatar,
  Divider,
  Alert,
  IconButton,
  Fade,
} from '@mui/material';
import {
  Person as PersonIcon,
  ArrowBack as ArrowBackIcon,
  Save as SaveIcon,
  Badge as BadgeIcon,
  Email as EmailIcon,
  Key as KeyIcon,
} from '@mui/icons-material';
import { styled } from '@mui/material/styles';

const HeaderSection = styled(Box)(({ theme }) => ({
  marginBottom: theme.spacing(4),
  display: 'flex',
  alignItems: 'center',
  gap: theme.spacing(2),
}));

const StyledPaper = styled(Paper)(({ theme }) => ({
  padding: theme.spacing(4),
  borderRadius: theme.spacing(2),
  boxShadow: '0 4px 20px rgba(0, 0, 0, 0.08)',
  transition: theme.transitions.create(['box-shadow']),
  '&:hover': {
    boxShadow: '0 4px 24px rgba(0, 0, 0, 0.12)',
  },
}));

const ProfileAvatar = styled(Avatar)(({ theme }) => ({
  width: theme.spacing(20),
  height: theme.spacing(20),
  backgroundColor: theme.palette.primary.main,
  marginBottom: theme.spacing(3),
  boxShadow: '0 4px 14px rgba(0, 0, 0, 0.12)',
  fontSize: theme.spacing(10),
}));

const InfoContainer = styled(Box)(({ theme }) => ({
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
  padding: theme.spacing(4),
  borderRadius: theme.spacing(2),
  backgroundColor: 'rgba(255, 255, 255, 0.8)',
  width: '100%',
}));

const StyledTextField = styled(TextField)(({ theme }) => ({
  '& .MuiOutlinedInput-root': {
    borderRadius: theme.spacing(2),
    backgroundColor: theme.palette.background.paper,
    transition: theme.transitions.create(['box-shadow']),
    '&:hover': {
      backgroundColor: '#fff',
    },
    '&.Mui-focused': {
      backgroundColor: '#fff',
      boxShadow: '0 0 0 2px rgba(25, 118, 210, 0.2)',
    },
  },
}));

const StyledButton = styled(Button)(({ theme }) => ({
  borderRadius: theme.spacing(2),
  padding: theme.spacing(1.2, 3),
  boxShadow: 'none',
  '&:hover': {
    boxShadow: '0 4px 12px rgba(0, 0, 0, 0.15)',
  },
}));

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
    setSuccess('');
    setError('');
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
    <Container maxWidth="lg">
      <Box sx={{ py: 4 }}>
        <HeaderSection>
          <IconButton
            onClick={() => navigate('/dashboard')}
            sx={{ 
              backgroundColor: 'rgba(0, 0, 0, 0.04)',
              '&:hover': {
                backgroundColor: 'rgba(0, 0, 0, 0.08)',
              }
            }}
          >
            <ArrowBackIcon />
          </IconButton>
          <Typography
            variant="h4"
            component="h1"
            sx={{
              fontWeight: 600,
              color: 'text.primary',
            }}
          >
            Thông tin cá nhân
          </Typography>
        </HeaderSection>

        <Fade in={true}>
          <StyledPaper>
            <Grid container spacing={6}>
              {/* Left Column - Avatar and Basic Info */}
              <Grid item xs={12} md={4}>
                <InfoContainer>
                  <ProfileAvatar>
                    <PersonIcon sx={{ fontSize: 'inherit' }} />
                  </ProfileAvatar>
                  <Typography 
                    variant="h5" 
                    gutterBottom 
                    sx={{ 
                      fontWeight: 600,
                      textAlign: 'center',
                      mb: 1
                    }}
                  >
                    {fullName || 'Your Name'}
                  </Typography>
                  <Typography 
                    variant="body1" 
                    color="text.secondary" 
                    gutterBottom
                    sx={{
                      textAlign: 'center',
                      display: 'flex',
                      alignItems: 'center',
                      gap: 1
                    }}
                  >
                    <EmailIcon sx={{ fontSize: 20 }} />
                    {email}
                  </Typography>
                  {/* <Typography 
                    variant="body2" 
                    color="text.secondary"
                    sx={{
                      mt: 2,
                      textAlign: 'center',
                      display: 'flex',
                      alignItems: 'center',
                      gap: 1
                    }}
                  >
                    <BadgeIcon sx={{ fontSize: 18 }} />
                    {username}
                  </Typography> */}
                </InfoContainer>
              </Grid>

              {/* Right Column - Form */}
              <Grid item xs={12} md={8}>
                <form onSubmit={handleUpdate}>
                  <Grid container spacing={3}>
                    <Grid item xs={12}>
                      <StyledTextField
                        label="Họ tên"
                        value={fullName}
                        onChange={e => setFullName(e.target.value)}
                        fullWidth
                        variant="outlined"
                        InputProps={{
                          startAdornment: <PersonIcon sx={{ mr: 1, color: 'text.secondary' }} />,
                        }}
                      />
                    </Grid>
                    <Grid item xs={12}>
                      <StyledTextField
                        label="Username"
                        value={username}
                        onChange={e => setUsername(e.target.value)}
                        fullWidth
                        variant="outlined"
                        InputProps={{
                          startAdornment: <BadgeIcon sx={{ mr: 1, color: 'text.secondary' }} />,
                        }}
                      />
                    </Grid>
                    <Grid item xs={12}>
                      <StyledTextField
                        label="Email"
                        value={email}
                        onChange={e => setEmail(e.target.value)}
                        fullWidth
                        variant="outlined"
                        InputProps={{
                          startAdornment: <EmailIcon sx={{ mr: 1, color: 'text.secondary' }} />,
                        }}
                      />
                    </Grid>

                    <Grid item xs={12}>
                      <Box sx={{ mb: 2, display: 'flex', alignItems: 'center', gap: 1 }}>
                        <KeyIcon sx={{ color: 'text.secondary' }} />
                        <Typography variant="subtitle1" sx={{ fontWeight: 600 }}>
                          Public Key
                        </Typography>
                      </Box>
                      <Paper
                        variant="outlined"
                        sx={{
                          p: 2.5,
                          background: 'rgba(0, 0, 0, 0.02)',
                          borderRadius: 2,
                          fontFamily: 'monospace',
                          fontSize: '0.875rem',
                          wordBreak: 'break-all',
                          border: '1px solid rgba(0, 0, 0, 0.1)',
                        }}
                      >
                        {user.publicKey || 'Chưa cập nhật'}
                      </Paper>
                    </Grid>
                    
                    {(success || error) && (
                      <Grid item xs={12}>
                        <Fade in={true}>
                          {success && <Alert severity="success" sx={{ borderRadius: 2 }}>{success}</Alert>}
                          {error && <Alert severity="error" sx={{ borderRadius: 2 }}>{error}</Alert>}
                        </Fade>
                      </Grid>
                    )}

                    <Grid item xs={12}>
                      <Box sx={{ display: 'flex', gap: 2, mt: 2 }}>
                        <StyledButton
                          type="submit"
                          variant="contained"
                          startIcon={<SaveIcon />}
                          fullWidth
                        >
                          Cập nhật thông tin
                        </StyledButton>
                      </Box>
                    </Grid>
                  </Grid>
                </form>
              </Grid>
            </Grid>
          </StyledPaper>
        </Fade>
      </Box>
    </Container>
  );
}

export default Profile;
