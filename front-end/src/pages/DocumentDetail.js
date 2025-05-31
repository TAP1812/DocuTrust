import React, { useEffect, useState } from 'react';
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
  Modal,
  TextField,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
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
import * as ethers from 'ethers';

const DocumentDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { currentDocument: document, loading, error, fetchDocumentById } = useDocuments();

  // States for client-side signing
  const [showSignModal, setShowSignModal] = useState(false);
  const [privateKeyHex, setPrivateKeyHex] = useState('');
  const [feedbackMessage, setFeedbackMessage] = useState('');
  const [isSigningLoading, setIsSigningLoading] = useState(false);
  const [currentUser, setCurrentUser] = useState(null);

  useEffect(() => {
    try {
      const userString = localStorage.getItem('user');
      if (userString) {
        const userData = JSON.parse(userString);
        // Assuming user object has an 'id' or '_id' field
        setCurrentUser({ id: userData.id || userData._id }); 
      }
    } catch (e) {
      console.error("Failed to parse user from localStorage", e);
      setCurrentUser(null);
    }
  }, []);

  console.log('[DocumentDetail] Component rendered. Loading:', loading, 'Error:', error, 'Document from hook:', document);
  console.log('[DocumentDetail] Current User:', currentUser);

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
  console.log('[DocumentDetail] Signatures on document:', document.signatures);

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

  // Determine if current user can sign
  let canSign = false;
  let alreadySigned = false;
  if (currentUser && document && document.signers) {
    const userIdStr = currentUser.id?.toString(); // Ensure it's a string for comparison if needed

    // Check if already signed
    if (document.signatures && Array.isArray(document.signatures)) {
        alreadySigned = document.signatures.some(sig => sig.userId && sig.userId.toString() === userIdStr);
    }
    console.log(`[DocumentDetail] User ${userIdStr} already signed: ${alreadySigned}`);

    // Check if creator
    const isCreator = document.creatorId?.toString() === userIdStr;
    console.log(`[DocumentDetail] User ${userIdStr} is creator: ${isCreator}`);

    // Check if designated signer
    const isDesignatedSigner = document.signers.some(
      s => s.userId?.toString() === userIdStr && s.role === 'signer'
    );
    console.log(`[DocumentDetail] User ${userIdStr} is designated signer: ${isDesignatedSigner}`);

    if (document.status === 'pending' && !alreadySigned && (isCreator || isDesignatedSigner)) {
      canSign = true;
    }
    console.log(`[DocumentDetail] User ${userIdStr} can sign: ${canSign} (status: ${document.status}, alreadySigned: ${alreadySigned}, isCreator: ${isCreator}, isDesignatedSigner: ${isDesignatedSigner})`);
  }

  const handleSignAndSubmit = async () => {
    if (!privateKeyHex) {
      setFeedbackMessage('Vui lòng nhập Private Key (Hex) của bạn.');
      return;
    }
    if (!ethers.isHexString(privateKeyHex) || privateKeyHex.length !== 66) {
      setFeedbackMessage('Private Key (Hex) không hợp lệ. Phải là một chuỗi hex 0x... 66 ký tự.');
      return;
    }
    if (!currentUser || !currentUser.id) {
      setFeedbackMessage('Không thể xác định người dùng. Vui lòng thử tải lại trang.');
      return;
    }

    setIsSigningLoading(true);
    setFeedbackMessage('Đang xử lý chữ ký...');

    try {
      // 1. Fetch document content
      setFeedbackMessage('Đang lấy nội dung tài liệu để hash...');
      const fileContentResponse = await fetch(`http://localhost:3001/api/documents/${id}/file-content`, {
        method: 'GET',
        credentials: 'include',
      });

      if (!fileContentResponse.ok) {
        let errorMsg = 'Không thể lấy nội dung tài liệu để ký.';
        try { const errorData = await fileContentResponse.json(); errorMsg = errorData.message || errorMsg; } catch (e) { /* ignore */ }
        throw new Error(errorMsg);
      }
      
      const fileContentText = await fileContentResponse.text();
      if (typeof fileContentText !== 'string') {
        throw new Error('Nội dung tài liệu nhận được không phải là chuỗi.');
      }

      // 2. Calculate Keccak256 Hash
      const contentBytes = ethers.toUtf8Bytes(fileContentText);
      const documentHashToSign = ethers.keccak256(contentBytes);
      setFeedbackMessage(`Đã tính hash tài liệu: ${documentHashToSign}. Đang tạo chữ ký...`);

      // 3. Create Signature
      const wallet = new ethers.Wallet(privateKeyHex);
      const signature = await wallet.signMessage(ethers.getBytes(documentHashToSign)); // ethers.getBytes for v6
      setFeedbackMessage('Chữ ký đã được tạo. Đang gửi lên server...');

      // 4. Submit Signature
      const submitResponse = await fetch(`http://localhost:3001/api/documents/${id}/sign`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          userId: currentUser.id,
          signature: signature,
        }),
        credentials: 'include',
      });

      const submitData = await submitResponse.json();
      if (!submitResponse.ok) {
        throw new Error(submitData.message || 'Lỗi từ server khi lưu chữ ký.');
      }

      setFeedbackMessage(`Ký thành công! ${submitData.message || 'Chữ ký đã được lưu.'}`);
      await fetchDocumentById(id); // Refresh document details
      setTimeout(() => { // Give user time to read success message
        setShowSignModal(false);
      }, 2000);

    } catch (error) {
      console.error('Lỗi trong quá trình ký và gửi:', error);
      setFeedbackMessage(`Lỗi: ${error.message}`);
    } finally {
      setIsSigningLoading(false);
    }
  };

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
            {canSign && (
              <Button
                variant="contained"
                startIcon={<SignIcon />}
                onClick={() => {
                  setFeedbackMessage(''); // Clear previous messages
                  setPrivateKeyHex(''); // Clear previous key
                  setShowSignModal(true);
                }}
                disabled={isSigningLoading}
              >
                {isSigningLoading ? 'Đang xử lý...' : 'Ký Tài Liệu (Client-side)'}
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

      <Dialog open={showSignModal} onClose={() => setShowSignModal(false)} aria-labelledby="sign-document-dialog-title">
        <DialogTitle id="sign-document-dialog-title">Ký Tài Liệu</DialogTitle>
        <DialogContent>
          <DialogContentText sx={{mb: 2}}>
            Để ký tài liệu này, vui lòng nhập Private Key (Hex) của bạn. 
            Private Key sẽ chỉ được sử dụng trên trình duyệt của bạn để tạo chữ ký và không được gửi đi đâu.
          </DialogContentText>
          <TextField
            autoFocus
            margin="dense"
            id="privateKeyHex"
            label="Private Key (Hex)"
            type="password"
            fullWidth
            variant="standard"
            value={privateKeyHex}
            onChange={(e) => setPrivateKeyHex(e.target.value)}
            disabled={isSigningLoading}
            helperText="Ví dụ: 0xabc123... (66 ký tự)"
          />
          {feedbackMessage && (
            <Typography 
              color={feedbackMessage.startsWith('Lỗi') ? "error" : "success.main"} 
              sx={{mt: 2, fontSize: '0.9rem'}}
            >
              {feedbackMessage}
            </Typography>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setShowSignModal(false)} disabled={isSigningLoading}>Hủy</Button>
          <Button onClick={handleSignAndSubmit} disabled={isSigningLoading} variant="contained">
            {isSigningLoading ? 'Đang xử lý...' : 'Tạo và Gửi Chữ Ký'}
          </Button>
        </DialogActions>
      </Dialog>

    </Container>
  );
};

export default DocumentDetail;
