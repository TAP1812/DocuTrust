import React, { useState, useEffect, useCallback } from 'react';
import {
  Box,
  Container,
  Typography,
  Button,
  Paper,
  Stack,
  Grid,
  IconButton,
  Tooltip,
  LinearProgress,
  Card,
  CardContent,
  Chip,
  Menu,
  MenuItem,
  Avatar,
  Divider,
  useTheme,
} from '@mui/material';
import {
  Add as AddIcon,
  Description as DocumentIcon,
  AccessTime as PendingIcon,
  CheckCircle as SignedIcon,
  Upload as UploadIcon,
  Person as ProfileIcon,
  Logout as LogoutIcon,
  Settings as SettingsIcon,
  Notifications as NotificationIcon,
  VerifiedUser,
  Draw,
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';

const Dashboard = () => {
  const theme = useTheme();
  const [data, setData] = useState({
    createdDocuments: [],
    needToSignDocuments: [],
    signedDocuments: []
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [anchorEl, setAnchorEl] = useState(null);
  const [notificationAnchor, setNotificationAnchor] = useState(null);
  const navigate = useNavigate();
  const user = JSON.parse(localStorage.getItem('user'));

  const handleProfileMenuOpen = (event) => {
    setAnchorEl(event.currentTarget);
  };

  const handleProfileMenuClose = () => {
    setAnchorEl(null);
  };

  const handleNotificationOpen = (event) => {
    setNotificationAnchor(event.currentTarget);
  };

  const handleNotificationClose = () => {
    setNotificationAnchor(null);
  };

  const handleLogout = () => {
    localStorage.removeItem('user');
    navigate('/login');
  };

  useEffect(() => {
    const fetchDashboardData = async () => {
      setLoading(true);
      try {
        const response = await fetch('http://localhost:3001/api/dashboard', {
          credentials: 'include'
        });
        if (response.ok) {
          const result = await response.json();
          setData(result);
        } else {
          setError('Không thể tải dữ liệu dashboard từ server.');
        }
      } catch (err) {
        setError('Lỗi mạng hoặc không thể kết nối tới server.');
        console.error('Fetch dashboard data error:', err);
      }
      setLoading(false);
    };
    fetchDashboardData();
  }, []);

  // Updated Quick Actions array - removed Sign and Verify
  const quickActions = [
    { 
      icon: <UploadIcon />, 
      text: 'Tải lên tài liệu', 
      onClick: () => { 
        console.log('Clicked: Tải lên tài liệu - Navigating to /documents/upload');
        navigate('/documents/create');
      }
    },
    { 
      icon: <PendingIcon />, 
      text: 'Tài liệu chờ ký', 
      onClick: () => { 
        console.log('Clicked: Tài liệu chờ ký - Navigating to /documents?status=pending');
        navigate('/documents?status=pending');
      }
    },
    { 
      icon: <SignedIcon />, 
      text: 'Tài liệu đã ký', 
      onClick: () => { 
        console.log('Clicked: Tài liệu đã ký - Navigating to /documents?status=signed');
        navigate('/documents?status=signed');
      }
    },
    { 
      icon: <DocumentIcon />, 
      text: 'Tất cả tài liệu', 
      onClick: () => { 
        console.log('Clicked: Tất cả tài liệu - Navigating to /documents');
        navigate('/documents');
      }
    }
    // Removed Verify and Sign actions from here
  ];

  if (loading) {
    return (
      <Box sx={{ width: '100%', mt: 4, display: 'flex', justifyContent: 'center' }}>
        <LinearProgress 
          sx={{ 
            width: '60%', 
            bgcolor: `${theme.palette.primary.main}15`,
            '& .MuiLinearProgress-bar': {
              bgcolor: theme.palette.primary.main,
            }
          }} 
        />
      </Box>
    );
  }

  if (error) {
    return (
      <Box sx={{ p: 3, textAlign: 'center' }}>
        <Typography color="error">{error}</Typography>
      </Box>
    );
  }

  return (
    <Container maxWidth="lg">
      <Box sx={{ 
        py: 6,
        minHeight: '100vh',
        background: `linear-gradient(135deg, ${theme.palette.primary.main}08 0%, ${theme.palette.secondary.main}08 100%)`,
      }}>
        {/* Header Section with Profile Menu */}
        <Stack 
          direction="row" 
          justifyContent="space-between" 
          alignItems="center" 
          sx={{ mb: 6 }}
        >
          <Typography 
            variant="h4" 
            sx={{
              fontWeight: 700,
              background: `linear-gradient(45deg, ${theme.palette.primary.main}, ${theme.palette.secondary.main})`,
              backgroundClip: 'text',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
            }}
          >
            DocuTrust
          </Typography>
          <Stack direction="row" spacing={2} alignItems="center">
            <Tooltip title="Thông báo">
              <IconButton onClick={handleNotificationOpen}>
                <NotificationIcon sx={{ color: theme.palette.primary.main }} />
              </IconButton>
            </Tooltip>
            <Button
              startIcon={<ProfileIcon />}
              onClick={handleProfileMenuOpen}
              sx={{
                color: theme.palette.primary.main,
                '&:hover': {
                  bgcolor: `${theme.palette.primary.main}08`,
                },
              }}
            >
              {user?.fullName || user?.username}
            </Button>
          </Stack>

          {/* Profile Menu */}
          <Menu
            anchorEl={anchorEl}
            open={Boolean(anchorEl)}
            onClose={handleProfileMenuClose}
            PaperProps={{
              sx: {
                mt: 1,
                minWidth: 200,
                boxShadow: theme.shadows[3],
              }
            }}
          >
            <MenuItem onClick={() => { console.log('Clicked: Profile Menu - Thông tin cá nhân'); handleProfileMenuClose(); navigate('/profile'); }}>
              <ProfileIcon sx={{ mr: 1, fontSize: 20 }} />
              Thông tin cá nhân
            </MenuItem>
            <MenuItem onClick={() => { console.log('Clicked: Profile Menu - Cài đặt'); handleProfileMenuClose(); navigate('/settings'); }}>
              <SettingsIcon sx={{ mr: 1, fontSize: 20 }} />
              Cài đặt
            </MenuItem>
            <Divider />
            <MenuItem onClick={() => { console.log('Clicked: Profile Menu - Đăng xuất'); handleLogout(); }} sx={{ color: 'error.main' }}>
              <LogoutIcon sx={{ mr: 1, fontSize: 20 }} />
              Đăng xuất
            </MenuItem>
          </Menu>

          {/* Notifications Menu */}
          <Menu
            anchorEl={notificationAnchor}
            open={Boolean(notificationAnchor)}
            onClose={handleNotificationClose}
            PaperProps={{
              sx: {
                mt: 1,
                minWidth: 320,
                maxHeight: 400,
                boxShadow: theme.shadows[3],
              }
            }}
          >
            <MenuItem onClick={() => console.log('Clicked: Notification Item 1') }>
              <Stack spacing={1}>
                <Typography variant="subtitle2">Tài liệu mới cần ký</Typography>
                <Typography variant="caption" color="text.secondary">
                  2 phút trước
                </Typography>
              </Stack>
            </MenuItem>
            <Divider />
            <MenuItem onClick={() => console.log('Clicked: Notification Item 2') }>
              <Stack spacing={1}>
                <Typography variant="subtitle2">Đã ký tài liệu thành công</Typography>
                <Typography variant="caption" color="text.secondary">
                  1 giờ trước
                </Typography>
              </Stack>
            </MenuItem>
          </Menu>
        </Stack>

        {/* Welcome Section */}
        <Box sx={{ mb: 6, textAlign: 'center' }}>
          <Typography variant="h6" color="text.secondary" sx={{ mb: 4 }}>
            Chào mừng trở lại, {user?.fullName || user?.username}!
          </Typography>
          <Button
            variant="contained"
            size="large"
            startIcon={<AddIcon />}
            onClick={() => { 
              console.log('Clicked: Tạo tài liệu mới - Navigating to /documents/create');
              navigate('/documents/create');
            }}
            sx={{
              px: 4,
              py: 1.5,
              borderRadius: 2,
              background: `linear-gradient(45deg, ${theme.palette.primary.main}, ${theme.palette.secondary.main})`,
              boxShadow: `0 4px 20px 0 ${theme.palette.primary.main}4D`,
              '&:hover': {
                background: `linear-gradient(45deg, ${theme.palette.primary.dark}, ${theme.palette.secondary.dark})`,
              },
            }}
          >
            Tạo tài liệu mới
          </Button>
        </Box>

        {/* Quick Stats */}
        <Grid container spacing={3} sx={{ mb: 6 }}>
          <Grid item xs={12} md={4}>
            <Paper
              elevation={0}
              sx={{
                p: 3,
                textAlign: 'center',
                borderRadius: 4,
                bgcolor: 'rgba(33, 150, 243, 0.05)',
                border: '1px solid rgba(33, 150, 243, 0.2)',
                transition: 'transform 0.2s ease-in-out',
                cursor: 'pointer',
                '&:hover': {
                  transform: 'translateY(-4px)',
                  boxShadow: '0 4px 20px 0 rgba(33, 150, 243, 0.1)',
                },
              }}
              onClick={() => { 
                console.log('Clicked: Quick Stat - Tài liệu đã tạo - Navigating to /documents');
                navigate('/documents');
              }}
            >
              <Typography variant="h4" sx={{ mb: 1, color: theme.palette.primary.main, fontWeight: 'bold' }}>
                {data.createdDocuments.length}
              </Typography>
              <Typography color="text.secondary">Tài liệu đã tạo</Typography>
            </Paper>
          </Grid>
          <Grid item xs={12} md={4}>
            <Paper
              elevation={0}
              sx={{
                p: 3,
                textAlign: 'center',
                borderRadius: 4,
                bgcolor: 'rgba(255, 152, 0, 0.05)',
                border: '1px solid rgba(255, 152, 0, 0.2)',
                transition: 'transform 0.2s ease-in-out',
                cursor: 'pointer',
                '&:hover': {
                  transform: 'translateY(-4px)',
                  boxShadow: '0 4px 20px 0 rgba(255, 152, 0, 0.1)',
                },
              }}
              onClick={() => { 
                console.log('Clicked: Quick Stat - Chờ ký - Navigating to /documents?status=pending');
                navigate('/documents?status=pending');
              }}
            >
              <Typography variant="h4" sx={{ mb: 1, color: theme.palette.warning.main, fontWeight: 'bold' }}>
                {data.needToSignDocuments.length}
              </Typography>
              <Typography color="text.secondary">Chờ ký</Typography>
            </Paper>
          </Grid>
          <Grid item xs={12} md={4}>
            <Paper
              elevation={0}
              sx={{
                p: 3,
                textAlign: 'center',
                borderRadius: 4,
                bgcolor: 'rgba(76, 175, 80, 0.05)',
                border: '1px solid rgba(76, 175, 80, 0.2)',
                transition: 'transform 0.2s ease-in-out',
                cursor: 'pointer',
                '&:hover': {
                  transform: 'translateY(-4px)',
                  boxShadow: '0 4px 20px 0 rgba(76, 175, 80, 0.1)',
                },
              }}
              onClick={() => { 
                console.log('Clicked: Quick Stat - Đã ký - Navigating to /documents?status=signed');
                navigate('/documents?status=signed');
              }}
            >
              <Typography variant="h4" sx={{ mb: 1, color: theme.palette.success.main, fontWeight: 'bold' }}>
                {data.signedDocuments.length}
              </Typography>
              <Typography color="text.secondary">Đã ký</Typography>
            </Paper>
          </Grid>
        </Grid>

        {/* Quick Actions */}
        <Box>
          <Typography variant="h5" sx={{ 
            mb: 3, 
            fontWeight: 600,
            color: theme.palette.primary.dark,
          }}>
            Thao tác nhanh
          </Typography>
          <Grid container spacing={2}>
            {quickActions.map((action, index) => (
              <Grid item xs={12} sm={6} md={3} key={index}>
                <Button
                  fullWidth
                  variant="outlined"
                  startIcon={action.icon}
                  onClick={action.onClick}
                  sx={{
                    py: 2,
                    borderRadius: 2,
                    borderColor: action.color ? action.color : theme.palette.primary.light,
                    color: action.color ? action.color : theme.palette.primary.main,
                    bgcolor: 'rgba(255, 255, 255, 0.8)',
                    transition: 'all 0.2s ease-in-out',
                    '&:hover': {
                      borderColor: action.color ? action.color : theme.palette.primary.main,
                      bgcolor: action.color ? `${action.color}1A` : `${theme.palette.primary.main}1A`,
                      transform: 'translateY(-2px)',
                    },
                  }}
                >
                  {action.text}
                </Button>
              </Grid>
            ))}
          </Grid>
        </Box>
      </Box>
    </Container>
  );
};

export default Dashboard; 