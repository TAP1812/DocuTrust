import React, { useEffect } from 'react';
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
  Fingerprint as FingerprintIcon,
  Download as DownloadIcon,
  Draw as SignIcon,
  VerifiedUser as VerifyIcon,
} from '@mui/icons-material';
import { useDocuments } from '../hooks/useDocuments';

const DocumentDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { currentDocument: document, loading, error, fetchDocumentById } = useDocuments();

  console.log('[DocumentDetail] Component rendered. Loading:', loading, 'Error:', error, 'Document from hook:', document);

  // Construct PDF URL to point to the new backend API endpoint
  let pdfUrl = null;
  let downloadUrl = null; // Separate URL for download if needed, but can be same as pdfUrl

  if (document && document._id) {
    const backendApiBaseUrl = 'http://localhost:3001/api'; // Your API base URL
    pdfUrl = `${backendApiBaseUrl}/documents/${document._id}/file-content`;
    downloadUrl = pdfUrl; // For downloading, the browser will handle it via Content-Disposition or download attribute
    console.log('[DocumentDetail] Constructed PDF API URL (for viewing/downloading):', pdfUrl);
  }

  useEffect(() => {
    console.log('[DocumentDetail] useEffect triggered. ID:', id);
    if (id) {
      fetchDocumentById(id);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]); // Temporarily removed fetchDocumentById from deps for testing

  if (loading) {
    console.log('[DocumentDetail] Displaying loading state');
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '80vh' }}>
        <CircularProgress />
      </Box>
    );
  }

  if (error) {
    console.log('[DocumentDetail] Displaying error state:', error);
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
    console.log('[DocumentDetail] Displaying no document state (or initial loading before first fetch completes)');
    return (
      <Container maxWidth="md" sx={{ py: 4, textAlign: 'center' }}>
        <Typography variant="h6">Không tìm thấy thông tin tài liệu hoặc đang tải...</Typography>
        <Button component={RouterLink} to="/documents" variant="outlined" sx={{ mt: 2 }}>
          Quay lại Danh sách
        </Button>
      </Container>
    );
  }

  console.log('[DocumentDetail] Rendering document details with document object:', document);

  const getStatusChip = (status) => {
    switch (status) {
      case 'verified':
        return { icon: <CheckCircleOutlineIcon />, label: 'Đã xác thực', color: 'success' };
      case 'pending':
        return { icon: <AccessTimeIcon />, label: 'Đang chờ xử lý', color: 'warning' };
      case 'draft':
        return { icon: <DescriptionIcon />, label: 'Bản nháp', color: 'default' };
      default:
        return { icon: <DescriptionIcon />, label: String(status), color: 'default' }; // Ensure status is string
    }
  };
  const statusChip = getStatusChip(document.status);

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
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 3, flexDirection: { xs: 'column', md: 'row' } }}>
          <Box sx={{ mb: { xs: 2, md: 0 } }}>
            <Typography variant="h4" component="h1" gutterBottom sx={{ fontWeight: 600 }}>
              {document.title || 'N/A'} {/* Added fallback */}
            </Typography>
            <Chip
              icon={statusChip.icon}
              label={`Trạng thái: ${statusChip.label}`}
              color={statusChip.color}
              size="small"
            />
          </Box>
          <Box sx={{ display: 'flex', gap: 1, flexDirection: { xs: 'column', sm: 'row' } }}>
            {document.status === 'pending' && (
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
            <Button variant="outlined" startIcon={<DownloadIcon />} href={downloadUrl || '#'} download={document.fileName || true}>
              Tải xuống
            </Button>
          </Box>
        </Box>

        {/* Section to display PDF via API endpoint */}
        {pdfUrl && (
          <Box sx={{ my: 4, p: 2, border: '1px solid #ddd', borderRadius: 1, backgroundColor: '#f9f9f9' }}>
            <Typography variant="h6" gutterBottom>Nội dung Tài liệu</Typography>
            <iframe 
              src={pdfUrl} 
              width="100%" 
              height="600px" 
              title={document.title || 'Document Viewer'}
              style={{ border: '1px solid #ccc' }}
            >
              Trình duyệt của bạn không hỗ trợ xem PDF trực tiếp. Bạn có thể <a href={downloadUrl || '#'} download={document.fileName || true}>tải về tại đây</a>.
            </iframe>
          </Box>
        )}

        <Typography variant="body1" color="text.secondary" sx={{ mb: 3 }}>
          {document.content || 'Không có mô tả.'} {/* Added fallback */}
        </Typography>

        <Grid container spacing={3}>
          <Grid item xs={12} md={6}>
            <Typography variant="h6" gutterBottom>Thông tin chung</Typography>
            <List dense>
              <ListItem>
                <ListItemIcon><PersonIcon /></ListItemIcon>
                <ListItemText primary="Người tạo (ID)" secondary={document.creatorId || 'Không rõ'} />
              </ListItem>
              <ListItem>
                <ListItemIcon><AccessTimeIcon /></ListItemIcon>
                <ListItemText primary="Ngày tạo" secondary={document.createdAt ? new Date(document.createdAt).toLocaleString() : 'N/A'} /> {/* Added fallback */}
              </ListItem>
              <ListItem>
                <ListItemIcon><AccessTimeIcon /></ListItemIcon>
                <ListItemText primary="Cập nhật lần cuối" secondary={document.updatedAt ? new Date(document.updatedAt).toLocaleString() : 'N/A'} /> {/* Added fallback */}
              </ListItem>
            </List>
          </Grid>

          <Grid item xs={12} md={6}>
            <Typography variant="h6" gutterBottom>Người ký</Typography>
            {document.signers && document.signers.length > 0 ? (
              <List dense>
                {document.signers.map((signer, index) => (
                  <ListItem key={index}>
                    <ListItemIcon>
                      <PersonIcon />
                    </ListItemIcon>
                    <ListItemText
                      primary={`User ID: ${signer.userId || 'Không rõ'}`}
                      secondary={`Vai trò: ${signer.role || 'N/A'}`}
                    />
                  </ListItem>
                ))}
              </List>
            ) : (
              <Typography variant="body2" color="text.secondary">Không có người ký nào được chỉ định.</Typography>
            )}
          </Grid>
        </Grid>
      </Paper>
    </Container>
  );
};

export default DocumentDetail;
