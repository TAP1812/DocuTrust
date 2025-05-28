import React, { useState } from 'react';
import {
  Box,
  Container,
  Typography,
  TextField,
  Button,
  IconButton,
  Paper,
  Stack,
  Grid,
  Avatar,
  Chip,
  Alert,
  LinearProgress,
  Tooltip,
  Fade,
  useTheme,
} from '@mui/material';
import {
  CloudUpload as UploadIcon,
  Add as AddIcon,
  Remove as RemoveIcon,
  ArrowBack as ArrowBackIcon,
  Email as EmailIcon,
  Description as DescriptionIcon,
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import { styled } from '@mui/material/styles';

// Styled Components
const UploadBox = styled(Box)(({ theme, isDragActive }) => ({
  border: `2px dashed ${isDragActive ? theme.palette.primary.main : theme.palette.grey[300]}`,
  borderRadius: theme.shape.borderRadius,
  padding: theme.spacing(4),
  textAlign: 'center',
  backgroundColor: isDragActive ? `${theme.palette.primary.main}10` : theme.palette.grey[50],
  cursor: 'pointer',
  transition: 'all 0.3s ease',
  '&:hover': {
    borderColor: theme.palette.primary.main,
    backgroundColor: `${theme.palette.primary.main}10`,
  },
}));

const HiddenInput = styled('input')({
  display: 'none',
});

function CreateDocument() {
  const theme = useTheme();
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [signerList, setSignerList] = useState([{ email: '', role: 'signer' }]);
  const [file, setFile] = useState(null);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);
  const [isDragActive, setIsDragActive] = useState(false);
  const user = JSON.parse(localStorage.getItem('user'));
  const navigate = useNavigate();

  const handleSignerChange = (idx, field, value) => {
    const updated = [...signerList];
    updated[idx][field] = value;
    setSignerList(updated);
  };

  const addSigner = () => {
    setSignerList([...signerList, { email: '', role: 'signer' }]);
  };

  const removeSigner = (idx) => {
    setSignerList(signerList.filter((_, i) => i !== idx));
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    setIsDragActive(true);
  };

  const handleDragLeave = (e) => {
    e.preventDefault();
    setIsDragActive(false);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setIsDragActive(false);
    const droppedFile = e.dataTransfer.files[0];
    if (droppedFile) {
      setFile(droppedFile);
    }
  };

  const handleFileChange = (e) => {
    if (e.target.files[0]) {
      setFile(e.target.files[0]);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setLoading(true);

    try {
      const formData = new FormData();
      formData.append('title', title);
      formData.append('content', content);
      formData.append('creatorId', user.id);
      formData.append('signers', JSON.stringify(signerList.filter(s => s.email)));
      if (file) formData.append('file', file);

      const res = await fetch('http://localhost:3001/api/documents', {
        method: 'POST',
        body: formData,
        credentials: 'include'
      });

      const data = await res.json();
      if (res.ok) {
        setSuccess('Tạo tài liệu thành công!');
        setTimeout(() => navigate('/documents'), 1000);
      } else {
        setError(data.message || 'Tạo thất bại');
      }
    } catch (err) {
      setError('Lỗi kết nối');
    } finally {
      setLoading(false);
    }
  };

  if (!user) return null;

  return (
    <Container maxWidth="md">
      <Box sx={{ py: 4 }}>
        {/* Header */}
        <Stack direction="row" alignItems="center" spacing={2} sx={{ mb: 4 }}>
          <IconButton onClick={() => navigate('/documents')} sx={{ p: 1 }}>
            <ArrowBackIcon />
          </IconButton>
          <Typography variant="h4" fontWeight="bold" sx={{
            background: 'linear-gradient(45deg, #2196F3, #00BCD4)',
            backgroundClip: 'text',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
          }}>
            Tạo tài liệu mới
          </Typography>
        </Stack>

        {/* Main Form */}
        <Paper
          elevation={3}
          sx={{ 
            p: 3, 
            borderRadius: 2,
            transform: 'translateY(0)',
            transition: 'transform 0.3s ease-in-out',
            '&:hover': {
              transform: 'translateY(-4px)',
            }
          }}
          component="form"
          onSubmit={handleSubmit}
        >
          <Grid container spacing={3}>
            {/* Title & Content */}
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Tiêu đề tài liệu"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                required
                variant="outlined"
                sx={{ mb: 2 }}
              />
              <TextField
                fullWidth
                label="Nội dung"
                value={content}
                onChange={(e) => setContent(e.target.value)}
                required
                multiline
                rows={4}
                variant="outlined"
              />
            </Grid>

            {/* File Upload */}
            <Grid item xs={12}>
              <UploadBox
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
                onDrop={handleDrop}
                isDragActive={isDragActive}
              >
                <input
                  type="file"
                  accept=".pdf,.doc,.docx,.txt"
                  onChange={handleFileChange}
                  style={{ display: 'none' }}
                  id="file-upload"
                />
                <label htmlFor="file-upload">
                  <Stack spacing={2} alignItems="center">
                    <Avatar
                      sx={{
                        width: 60,
                        height: 60,
                        bgcolor: 'primary.light',
                        mb: 2
                      }}
                    >
                      <UploadIcon sx={{ fontSize: 30 }} />
                    </Avatar>
                    <Typography variant="h6" color="textSecondary">
                      {file ? file.name : 'Kéo thả file hoặc click để tải lên'}
                    </Typography>
                    <Typography variant="body2" color="textSecondary">
                      Hỗ trợ: PDF, DOC, DOCX, TXT
                    </Typography>
                    {file && (
                      <Chip
                        label={file.name}
                        onDelete={() => setFile(null)}
                        color="primary"
                        variant="outlined"
                      />
                    )}
                  </Stack>
                </label>
              </UploadBox>
            </Grid>

            {/* Signers List */}
            <Grid item xs={12}>
              <Typography variant="h6" sx={{ mb: 2 }}>
                Danh sách người ký
              </Typography>
              <Stack spacing={2}>
                {signerList.map((signer, idx) => (
                  <Fade in={true} key={idx}>
                    <Paper elevation={1} sx={{ p: 2 }}>
                      <Grid container spacing={2} alignItems="center">
                        <Grid item xs={12} sm={5}>
                          <TextField
                            fullWidth
                            label="Email"
                            type="email"
                            value={signer.email}
                            onChange={(e) => handleSignerChange(idx, 'email', e.target.value)}
                            required
                            InputProps={{
                              startAdornment: (
                                <EmailIcon sx={{ mr: 1, color: 'text.secondary' }} />
                              ),
                            }}
                          />
                        </Grid>
                        <Grid item xs={12} sm={5}>
                          <TextField
                            fullWidth
                            select
                            label="Vai trò"
                            value={signer.role}
                            onChange={(e) => handleSignerChange(idx, 'role', e.target.value)}
                            SelectProps={{
                              native: true,
                            }}
                          >
                            <option value="signer">Người ký</option>
                            <option value="viewer">Người xem</option>
                          </TextField>
                        </Grid>
                        <Grid item xs={12} sm={2}>
                          <Stack direction="row" spacing={1} justifyContent="flex-end">
                            {signerList.length > 1 && (
                              <Tooltip title="Xóa người ký">
                                <IconButton
                                  onClick={() => removeSigner(idx)}
                                  color="error"
                                  size="small"
                                >
                                  <RemoveIcon />
                                </IconButton>
                              </Tooltip>
                            )}
                            {idx === signerList.length - 1 && (
                              <Tooltip title="Thêm người ký">
                                <IconButton
                                  onClick={addSigner}
                                  color="primary"
                                  size="small"
                                >
                                  <AddIcon />
                                </IconButton>
                              </Tooltip>
                            )}
                          </Stack>
                        </Grid>
                      </Grid>
                    </Paper>
                  </Fade>
                ))}
              </Stack>
            </Grid>

            {/* Submit Button */}
            <Grid item xs={12}>
              {loading && <LinearProgress sx={{ mb: 2 }} />}
              {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}
              {success && <Alert severity="success" sx={{ mb: 2 }}>{success}</Alert>}
              <Button
                type="submit"
                variant="contained"
                size="large"
                fullWidth
                disabled={loading}
                sx={{
                  mt: 2,
                  height: 48,
                  background: 'linear-gradient(45deg, #2196F3, #00BCD4)',
                  '&:hover': {
                    background: 'linear-gradient(45deg, #1976D2, #0097A7)',
                  },
                }}
              >
                {loading ? 'Đang tạo...' : 'Tạo tài liệu'}
              </Button>
            </Grid>
          </Grid>
        </Paper>
      </Box>
    </Container>
  );
}

export default CreateDocument;
