import React, { useState, useEffect } from 'react';
import { useParams, Link as RouterLink, useNavigate } from 'react-router-dom';
import {
  Container,
  Typography,
  Paper,
  Button,
  Box,
  CircularProgress,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  Chip,
  Grid,
} from '@mui/material';
import {
  ArrowBack as ArrowBackIcon,
  Description as DescriptionIcon,
  Person as PersonIcon,
  AccessTime as AccessTimeIcon,
  CheckCircleOutline as CheckCircleOutlineIcon,
  Security as SecurityIcon,
  Fingerprint as FingerprintIcon,
  Download as DownloadIcon,
  Draw as SignIcon,
  VerifiedUser as VerifyIcon,
} from '@mui/icons-material';

// Dữ liệu mẫu - bạn sẽ thay thế bằng fetch API
const mockDocument = {
  _id: '123xyz',
  title: 'Hợp đồng Dịch vụ ABC',
  description: 'Mô tả chi tiết về hợp đồng dịch vụ giữa công ty A và công ty B.',
  status: 'pending_signature', // 'signed', 'rejected', 'draft'
  createdBy: 'user123 (Nguyễn Văn A)',
  createdAt: '2023-10-26T10:00:00Z',
  updatedAt: '2023-10-26T10:00:00Z',
  participants: [
    { userId: 'user123', email: 'nguyenvana@example.com', role: 'creator', hasSigned: true, signedAt: '2023-10-26T10:05:00Z' },
    { userId: 'user456', email: 'tranthib@example.com', role: 'signer', hasSigned: false, signedAt: null },
    { userId: 'user789', email: 'phamvanc@example.com', role: 'viewer', hasSigned: false, signedAt: null },
  ],
  fileUrl: '#', // Đường dẫn đến file tài liệu
  auditTrail: [
    { event: 'Tạo tài liệu', user: 'nguyenvana@example.com', timestamp: '2023-10-26T10:00:00Z' },
    { event: 'Mời ký: tranthib@example.com', user: 'nguyenvana@example.com', timestamp: '2023-10-26T10:02:00Z' },
    { event: 'Xem tài liệu', user: 'tranthib@example.com', timestamp: '2023-10-26T10:15:00Z' },
  ],
};

const DocumentDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [document, setDocument] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    console.log('DocumentDetail mounted for ID:', id);
    // Simulate API call
    const fetchDocumentDetail = async () => {
      setLoading(true);
      setError('');
      try {
        // ---- BẮT ĐẦU PHẦN GIẢ LẬP API ----
        await new Promise(resolve => setTimeout(resolve, 500));
        if (id === mockDocument._id) {
          setDocument(mockDocument);
        } else {
          console.warn(`Mock data ID (${mockDocument._id}) không khớp với ID yêu cầu (${id}). Sử dụng mock data mặc định.`);
          setDocument(mockDocument);
        }
        // ---- KẾT THÚC PHẦN GIẢ LẬP API ----
      } catch (e) {
        console.error('Error fetching document details:', e);
        setError(e.message || 'Đã xảy ra lỗi khi tải thông tin tài liệu.');
      }
      setLoading(false);
    };

    fetchDocumentDetail();
  }, [id]);

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '80vh' }}>
        <CircularProgress />
      </Box>
    );
  }

  if (error) {
    return (
      <Container maxWidth="md" sx={{ py: 4, textAlign: 'center' }}>
        <Typography color="error" variant="h6">{error}</Typography>
        <Button component={RouterLink} to="/documents" variant="outlined" sx={{ mt: 2 }}>
          Quay lại Danh sách
        </Button>
      </Container>
    );
  }

  if (!document) {
    return (
      <Container maxWidth="md" sx={{ py: 4, textAlign: 'center' }}>
        <Typography variant="h6">Không tìm thấy thông tin tài liệu.</Typography>
        <Button component={RouterLink} to="/documents" variant="outlined" sx={{ mt: 2 }}>
          Quay lại Danh sách
        </Button>
      </Container>
    );
  }

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      <Button 
        component={RouterLink} 
        to="/documents" 
        startIcon={<ArrowBackIcon />} 
        sx={{ mb: 3 }}
      >
        Danh sách Tài liệu
      </Button>

      <Paper elevation={3} sx={{ p: { xs: 2, md: 4 }, borderRadius: 2 }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 3 }}>
          <Box>
            <Typography variant="h4" component="h1" gutterBottom sx={{ fontWeight: 600 }}>
              {document.title}
            </Typography>
            <Chip 
              icon={document.status === 'signed' ? <CheckCircleOutlineIcon /> : document.status === 'pending_signature' ? <AccessTimeIcon /> : <DescriptionIcon />}
              label={`Trạng thái: ${document.status.replace('_', ' ')}`}
              color={document.status === 'signed' ? 'success' : document.status === 'pending_signature' ? 'warning' : 'default'}
              size="small"
            />
          </Box>
          <Box sx={{ display: 'flex', gap: 1, flexDirection: { xs: 'column', sm: 'row'} }}>
            {document.status === 'pending_signature' && (
                <Button 
                    variant="contained" 
                    startIcon={<SignIcon />} 
                    onClick={() => navigate(`/documents/${document._id}/sign`)}
                >
                    Ký Tài Liệu
                </Button>
            )}
            <Button 
                variant="outlined" 
                startIcon={<VerifyIcon />} 
                onClick={() => navigate(`/documents/${document._id}/verify`)}
            >
                Xác Thực
            </Button>
             <Button variant="outlined" startIcon={<DownloadIcon />} href={document.fileUrl} target="_blank">
              Tải xuống
            </Button>
          </Box>
        </Box>
        
        <Typography variant="body1" color="text.secondary" sx={{ mb: 3 }}>
          {document.description}
        </Typography>

        <Grid container spacing={3}>
          <Grid item xs={12} md={6}>
            <Typography variant="h6" gutterBottom>Thông tin chung</Typography>
            <List dense>
              <ListItem>
                <ListItemIcon><PersonIcon /></ListItemIcon>
                <ListItemText primary="Người tạo" secondary={document.createdBy} />
              </ListItem>
              <ListItem>
                <ListItemIcon><AccessTimeIcon /></ListItemIcon>
                <ListItemText primary="Ngày tạo" secondary={new Date(document.createdAt).toLocaleString()} />
              </ListItem>
              <ListItem>
                <ListItemIcon><AccessTimeIcon /></ListItemIcon>
                <ListItemText primary="Cập nhật lần cuối" secondary={new Date(document.updatedAt).toLocaleString()} />
              </ListItem>
            </List>
          </Grid>

          <Grid item xs={12} md={6}>
            <Typography variant="h6" gutterBottom>Người tham gia</Typography>
            <List dense>
              {document.participants.map((p, index) => (
                <ListItem key={index}>
                  <ListItemIcon>
                    {p.hasSigned ? <CheckCircleOutlineIcon color="success" /> : p.role === 'signer' ? <FingerprintIcon color="warning"/> : <PersonIcon />}
                  </ListItemIcon>
                  <ListItemText 
                    primary={`${p.email} (${p.role})`} 
                    secondary={p.hasSigned ? `Đã ký lúc: ${new Date(p.signedAt).toLocaleString()}` : (p.role === 'signer' ? 'Chưa ký' : 'Chỉ xem')}
                  />
                </ListItem>
              ))}
            </List>
          </Grid>

          <Grid item xs={12}>
            <Typography variant="h6" gutterBottom sx={{mt: 2}}>Lịch sử tài liệu (Audit Trail)</Typography>
            <List dense>
              {document.auditTrail.map((entry, index) => (
                <ListItem key={index}>
                  <ListItemIcon><SecurityIcon fontSize="small" /></ListItemIcon>
                  <ListItemText 
                    primary={entry.event} 
                    secondary={`Bởi: ${entry.user} - Lúc: ${new Date(entry.timestamp).toLocaleString()}`}
                  />
                </ListItem>
              ))}
            </List>
          </Grid>
        </Grid>

      </Paper>
    </Container>
  );
};

export default DocumentDetail; 