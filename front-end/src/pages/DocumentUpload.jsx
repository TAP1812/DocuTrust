import React, { useState } from 'react';
import {
  Box,
  Paper,
  Typography,
  TextField,
  Button,
  CircularProgress,
  Alert,
  IconButton,
} from '@mui/material';
import { styled } from '@mui/material/styles';
import { CloudUpload as CloudUploadIcon, Close as CloseIcon } from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import { useDocuments } from '../hooks/useDocuments';

const UploadContainer = styled(Paper)(({ theme }) => ({
  padding: theme.spacing(3),
  maxWidth: 600,
  margin: '0 auto',
}));

const DropZone = styled(Box)(({ theme, isDragActive, hasFile }) => ({
  border: `2px dashed ${isDragActive ? theme.palette.primary.main : theme.palette.grey[300]}`,
  borderRadius: theme.shape.borderRadius,
  padding: theme.spacing(4),
  textAlign: 'center',
  backgroundColor: isDragActive ? theme.palette.primary.light + '20' : theme.palette.grey[50],
  cursor: 'pointer',
  transition: 'all 0.3s ease',
  marginBottom: theme.spacing(3),
  position: 'relative',
  '&:hover': {
    borderColor: theme.palette.primary.main,
    backgroundColor: theme.palette.primary.light + '10',
  },
  ...(hasFile && {
    borderColor: theme.palette.success.main,
    backgroundColor: theme.palette.success.light + '10',
  }),
}));

const FilePreview = styled(Box)(({ theme }) => ({
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'space-between',
  padding: theme.spacing(1, 2),
  backgroundColor: theme.palette.grey[100],
  borderRadius: theme.shape.borderRadius,
  marginTop: theme.spacing(2),
}));

const DocumentUpload = () => {
  const navigate = useNavigate();
  const { uploadDocument, loading, error } = useDocuments();
  const [file, setFile] = useState(null);
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [isDragActive, setIsDragActive] = useState(false);

  const handleDrag = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setIsDragActive(true);
    } else {
      setIsDragActive(false);
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragActive(false);

    const droppedFile = e.dataTransfer.files[0];
    if (droppedFile && isValidFileType(droppedFile)) {
      setFile(droppedFile);
    }
  };

  const handleFileSelect = (e) => {
    const selectedFile = e.target.files[0];
    if (selectedFile && isValidFileType(selectedFile)) {
      setFile(selectedFile);
    }
  };

  const isValidFileType = (file) => {
    const allowedTypes = ['.pdf', '.doc', '.docx', '.txt'];
    const fileExtension = '.' + file.name.split('.').pop().toLowerCase();
    return allowedTypes.includes(fileExtension);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!file || !title) return;

    const formData = new FormData();
    formData.append('file', file);
    formData.append('title', title);
    formData.append('content', content);
    formData.append('fileType', file.type);

    try {
      await uploadDocument(formData);
      navigate('/documents');
    } catch (err) {
      console.error('Upload failed:', err);
    }
  };

  return (
    <UploadContainer elevation={3}>
      <Typography variant="h5" gutterBottom>
        Upload New Document
      </Typography>

      <form onSubmit={handleSubmit}>
        <TextField
          fullWidth
          label="Document Title"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          required
          margin="normal"
        />

        <TextField
          fullWidth
          label="Description"
          value={content}
          onChange={(e) => setContent(e.target.value)}
          multiline
          rows={4}
          margin="normal"
        />

        <input
          type="file"
          id="file-upload"
          style={{ display: 'none' }}
          onChange={handleFileSelect}
          accept=".pdf,.doc,.docx,.txt"
        />

        <DropZone
          onDragEnter={handleDrag}
          onDragLeave={handleDrag}
          onDragOver={handleDrag}
          onDrop={handleDrop}
          isDragActive={isDragActive}
          hasFile={!!file}
          onClick={() => document.getElementById('file-upload').click()}
        >
          <CloudUploadIcon sx={{ fontSize: 48, color: 'primary.main', mb: 2 }} />
          <Typography variant="h6" gutterBottom>
            {isDragActive ? 'Drop the file here' : 'Drag & drop file here'}
          </Typography>
          <Typography variant="body2" color="textSecondary">
            or click to select
          </Typography>
          {file && (
            <FilePreview>
              <Typography noWrap>{file.name}</Typography>
              <IconButton size="small" onClick={(e) => {
                e.stopPropagation();
                setFile(null);
              }}>
                <CloseIcon />
              </IconButton>
            </FilePreview>
          )}
        </DropZone>

        {error && (
          <Alert severity="error" sx={{ mb: 2 }}>
            {error}
          </Alert>
        )}

        <Box sx={{ display: 'flex', gap: 2, mt: 3 }}>
          <Button
            variant="outlined"
            onClick={() => navigate('/documents')}
            disabled={loading}
          >
            Cancel
          </Button>
          <Button
            type="submit"
            variant="contained"
            disabled={!file || !title || loading}
            startIcon={loading ? <CircularProgress size={20} /> : null}
          >
            Upload Document
          </Button>
        </Box>
      </form>
    </UploadContainer>
  );
};

export default DocumentUpload; 