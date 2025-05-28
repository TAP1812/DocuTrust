import React, { useState, useEffect } from 'react';
import {
  Box,
  Container,
  Grid,
  Typography,
  Card,
  CardContent,
  Button,
  Stack,
  Avatar,
  IconButton,
  Tooltip,
  Badge,
  Paper,
  Chip,
  LinearProgress,
  Divider,
} from '@mui/material';
import {
  Description as DescriptionIcon,
  NotificationsNone as NotificationIcon,
  Add as AddIcon,
  CloudUpload as UploadIcon,
  Send as SendIcon,
  Download as DownloadIcon,
  AccessTime as AccessTimeIcon,
  CheckCircle as CheckCircleIcon,
  PendingActions as PendingIcon,
  MoreVert as MoreVertIcon,
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { styled } from '@mui/material/styles';

// Styled Components
const StyledCard = styled(Card)(({ theme }) => ({
  height: '100%',
  position: 'relative',
  overflow: 'hidden',
  borderRadius: theme.shape.borderRadius * 2,
  transition: 'transform 0.3s ease-in-out, box-shadow 0.3s ease-in-out',
  '&:hover': {
    transform: 'translateY(-4px)',
    boxShadow: theme.shadows[8],
  },
}));

const GradientBox = styled(Box)(({ colors }) => ({
  background: `linear-gradient(135deg, ${colors[0]} 0%, ${colors[1]} 100%)`,
  borderRadius: '16px',
  padding: '24px',
  color: 'white',
  height: '100%',
  position: 'relative',
  overflow: 'hidden',
  '&::before': {
    content: '""',
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    background: 'linear-gradient(45deg, rgba(255,255,255,0.1) 0%, rgba(255,255,255,0) 100%)',
    zIndex: 1,
  },
}));

const QuickActionButton = styled(Button)(({ theme }) => ({
  backgroundColor: 'rgba(255, 255, 255, 0.1)',
  color: 'white',
  backdropFilter: 'blur(10px)',
  borderRadius: theme.shape.borderRadius * 2,
  padding: theme.spacing(2, 3),
  '&:hover': {
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
  },
}));

const DocumentCard = styled(Paper)(({ theme }) => ({
  padding: theme.spacing(2),
  borderRadius: theme.shape.borderRadius * 2,
  transition: 'transform 0.3s ease-in-out, box-shadow 0.3s ease-in-out',
  cursor: 'pointer',
  '&:hover': {
    transform: 'translateY(-4px)',
    boxShadow: theme.shadows[4],
  },
}));

const Dashboard = () => {
  const [data, setData] = useState({
    createdDocuments: [],
    needToSignDocuments: [],
    signedDocuments: []
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const navigate = useNavigate();
  const user = JSON.parse(localStorage.getItem('user'));

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        const response = await axios.get('http://localhost:3001/api/dashboard', { withCredentials: true });
        setData(response.data);
        setLoading(false);
      } catch (err) {
        setError('Không thể tải dữ liệu dashboard');
        setLoading(false);
      }
    };
    fetchDashboardData();
  }, []);

  const StatCard = ({ title, value, icon: Icon, colors }) => (
    <GradientBox colors={colors}>
      <Stack direction="row" justifyContent="space-between" alignItems="center">
        <Box>
          <Typography variant="h4" fontWeight="bold" sx={{ mb: 1 }}>
            {value}
          </Typography>
          <Typography variant="body1" sx={{ opacity: 0.9 }}>
            {title}
          </Typography>
        </Box>
        <Avatar sx={{ width: 56, height: 56, bgcolor: 'rgba(255,255,255,0.2)' }}>
          <Icon />
        </Avatar>
      </Stack>
    </GradientBox>
  );

  const DocumentList = ({ title, documents, icon: Icon, gradientColors }) => (
    <StyledCard>
      <CardContent>
        <Stack spacing={3}>
          <Stack direction="row" alignItems="center" spacing={2}>
            <Avatar sx={{ bgcolor: gradientColors[0] }}>
              <Icon />
            </Avatar>
            <Typography variant="h6" fontWeight="600">
              {title}
            </Typography>
          </Stack>
          <Stack spacing={2}>
            {documents.slice(0, 3).map((doc, index) => (
              <DocumentCard key={doc.id || index} onClick={() => navigate(`/documents/${doc.id}`)}>
                <Stack spacing={2}>
                  <Stack direction="row" justifyContent="space-between" alignItems="center">
                    <Stack direction="row" spacing={2} alignItems="center">
                      <Avatar sx={{ width: 40, height: 40, bgcolor: `${gradientColors[0]}20` }}>
                        <DescriptionIcon sx={{ color: gradientColors[0] }} />
                      </Avatar>
                      <Box>
                        <Typography variant="subtitle1" fontWeight="500">
                          {doc.title}
                        </Typography>
                        <Typography variant="caption" color="text.secondary">
                          {new Date(doc.createdAt).toLocaleDateString()}
                        </Typography>
                      </Box>
                    </Stack>
                    <Chip
                      label={doc.status}
                      size="small"
                      sx={{
                        bgcolor: doc.status === 'pending' ? 'warning.light' : 'success.light',
                        color: doc.status === 'pending' ? 'warning.dark' : 'success.dark',
                      }}
                    />
                  </Stack>
                </Stack>
              </DocumentCard>
            ))}
          </Stack>
        </Stack>
      </CardContent>
    </StyledCard>
  );

  if (loading) return (
    <Box sx={{ width: '100%', height: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <LinearProgress sx={{ width: '50%' }} />
    </Box>
  );

  if (error) return <Typography color="error">{error}</Typography>;

  return (
    <Container maxWidth="xl">
      <Box sx={{ py: 4 }}>
        {/* Header */}
        <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 4 }}>
          <Box>
            <Typography variant="h4" fontWeight="bold" sx={{
              background: 'linear-gradient(45deg, #2196F3, #00BCD4)',
              backgroundClip: 'text',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
            }}>
              Dashboard
            </Typography>
            <Typography variant="body1" color="text.secondary">
              Xin chào, {user?.fullName || user?.username}! 👋
            </Typography>
          </Box>
          <Stack direction="row" spacing={2}>
            <Tooltip title="Thông báo">
              <IconButton>
                <Badge badgeContent={4} color="error">
                  <NotificationIcon />
                </Badge>
              </IconButton>
            </Tooltip>
            <Button
              variant="contained"
              startIcon={<AddIcon />}
              onClick={() => navigate('/documents/create')}
              sx={{
                background: 'linear-gradient(45deg, #2196F3, #00BCD4)',
                boxShadow: '0 4px 20px 0 rgba(33, 150, 243, 0.3)',
              }}
            >
              Tạo tài liệu mới
            </Button>
          </Stack>
        </Stack>

        {/* Stats Section */}
        <Grid container spacing={3} sx={{ mb: 4 }}>
          <Grid item xs={12} md={4}>
            <StatCard
              title="Tài liệu đã tạo"
              value={data.createdDocuments.length}
              icon={DescriptionIcon}
              colors={['#2196F3', '#1976D2']}
            />
          </Grid>
          <Grid item xs={12} md={4}>
            <StatCard
              title="Chờ ký"
              value={data.needToSignDocuments.length}
              icon={PendingIcon}
              colors={['#FF9800', '#F57C00']}
            />
          </Grid>
          <Grid item xs={12} md={4}>
            <StatCard
              title="Đã ký"
              value={data.signedDocuments.length}
              icon={CheckCircleIcon}
              colors={['#4CAF50', '#388E3C']}
            />
          </Grid>
        </Grid>

        {/* Quick Actions */}
        <Box sx={{ 
          mb: 4, 
          p: 3, 
          borderRadius: 4,
          background: 'linear-gradient(135deg, #1a237e 0%, #0d47a1 100%)',
        }}>
          <Typography variant="h6" sx={{ color: 'white', mb: 3 }}>
            Thao tác nhanh
          </Typography>
          <Grid container spacing={2}>
            <Grid item xs={12} sm={6} md={3}>
              <QuickActionButton
                fullWidth
                startIcon={<UploadIcon />}
                onClick={() => navigate('/documents/upload')}
              >
                Tải lên tài liệu
              </QuickActionButton>
            </Grid>
            <Grid item xs={12} sm={6} md={3}>
              <QuickActionButton
                fullWidth
                startIcon={<SendIcon />}
                onClick={() => navigate('/documents/send')}
              >
                Gửi ký tài liệu
              </QuickActionButton>
            </Grid>
            <Grid item xs={12} sm={6} md={3}>
              <QuickActionButton
                fullWidth
                startIcon={<AccessTimeIcon />}
                onClick={() => navigate('/documents/pending')}
              >
                Tài liệu chờ ký
              </QuickActionButton>
            </Grid>
            <Grid item xs={12} sm={6} md={3}>
              <QuickActionButton
                fullWidth
                startIcon={<DownloadIcon />}
                onClick={() => navigate('/documents/download')}
              >
                Tải xuống
              </QuickActionButton>
            </Grid>
          </Grid>
        </Box>

        {/* Documents Lists */}
        <Grid container spacing={3}>
          <Grid item xs={12} md={4}>
            <DocumentList
              title="Tài liệu cần ký"
              documents={data.needToSignDocuments}
              icon={PendingIcon}
              gradientColors={['#FF9800', '#F57C00']}
            />
          </Grid>
          <Grid item xs={12} md={4}>
            <DocumentList
              title="Tài liệu đã tạo"
              documents={data.createdDocuments}
              icon={DescriptionIcon}
              gradientColors={['#2196F3', '#1976D2']}
            />
          </Grid>
          <Grid item xs={12} md={4}>
            <DocumentList
              title="Tài liệu đã ký"
              documents={data.signedDocuments}
              icon={CheckCircleIcon}
              gradientColors={['#4CAF50', '#388E3C']}
            />
          </Grid>
        </Grid>
      </Box>
    </Container>
  );
};

export default Dashboard; 