import React, { useState, useEffect } from 'react';
import {
  Grid,
  Typography,
  Box,
  Button,
  TextField,
  InputAdornment,
  CircularProgress,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Container,
  Paper,
  Fade,
} from '@mui/material';
import {
  Add as AddIcon,
  Search as SearchIcon,
  Description as DescriptionIcon,
} from '@mui/icons-material';
import { useNavigate, Link as RouterLink, useLocation } from 'react-router-dom';
import DocumentCard from '../components/documents/DocumentCard';
import ShareDialog from '../components/documents/ShareDialog';
import { useDocuments } from '../hooks/useDocuments';
import { styled } from '@mui/material/styles';

const HeaderSection = styled(Box)(({ theme }) => ({
  marginBottom: theme.spacing(4),
  display: 'flex',
  justifyContent: 'space-between',
  alignItems: 'center',
  [theme.breakpoints.down('sm')]: {
    flexDirection: 'column',
    gap: theme.spacing(2),
  },
}));

const SearchSection = styled(Box)(({ theme }) => ({
  display: 'flex',
  gap: theme.spacing(2),
  [theme.breakpoints.down('sm')]: {
    width: '100%',
  },
}));

const StyledTextField = styled(TextField)(({ theme }) => ({
  width: '300px',
  [theme.breakpoints.down('sm')]: {
    width: '100%',
  },
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
  padding: theme.spacing(1, 3),
  boxShadow: 'none',
  '&:hover': {
    boxShadow: '0 4px 12px rgba(0, 0, 0, 0.15)',
  },
}));

const EmptyState = styled(Paper)(({ theme }) => ({
  padding: theme.spacing(6),
  textAlign: 'center',
  borderRadius: theme.spacing(2),
  backgroundColor: 'rgba(0, 0, 0, 0.02)',
}));

const DocumentList = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { documents, loading, error, fetchDocuments, deleteDocument } = useDocuments();
  const [searchTerm, setSearchTerm] = useState('');
  const [shareDialogOpen, setShareDialogOpen] = useState(false);
  const [selectedDocument, setSelectedDocument] = useState(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);

  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const status = params.get('status');
    fetchDocuments(status);
  }, [location.search, fetchDocuments]);

  const filteredDocuments = documents.filter(doc =>
    doc.title.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleShare = (document) => {
    setSelectedDocument(document);
    setShareDialogOpen(true);
  };

  const handleDeleteClick = (document) => {
    setSelectedDocument(document);
    setDeleteDialogOpen(true);
  };

  const handleDeleteConfirm = async () => {
    await deleteDocument(selectedDocument._id);
    setDeleteDialogOpen(false);
    setSelectedDocument(null);
  };

  if (error) {
    return (
      <Container maxWidth="lg">
        <Box sx={{ textAlign: 'center', mt: 4 }}>
          <Typography color="error">{error}</Typography>
        </Box>
      </Container>
    );
  }

  return (
    <Container maxWidth="lg">
      <Box sx={{ py: 4 }}>
        <HeaderSection>
          <Typography
            variant="h4"
            component="h1"
            sx={{
              fontWeight: 600,
              color: 'text.primary',
            }}
          >
            My Documents
          </Typography>
          <SearchSection>
            <StyledTextField
              placeholder="Search documents..."
              variant="outlined"
              size="medium"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <SearchIcon sx={{ color: 'text.secondary' }} />
                  </InputAdornment>
                ),
              }}
            />
            <StyledButton
              variant="contained"
              color="primary"
              startIcon={<AddIcon />}
              onClick={() => navigate('/documents/create')}
            >
              New Document
            </StyledButton>
          </SearchSection>
        </HeaderSection>

        {loading ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', mt: 8 }}>
            <CircularProgress />
          </Box>
        ) : filteredDocuments.length > 0 ? (
          <Fade in={true}>
            <Grid container spacing={3}>
              {filteredDocuments.map((document) => (
                <Grid item xs={12} sm={6} md={4} key={document._id}>
                  <Box 
                    component={RouterLink} 
                    to={`/documents/${document._id}`} 
                    sx={{ textDecoration: 'none', display: 'block' }}
                  >
                    <DocumentCard
                      document={document}
                    />
                  </Box>
                </Grid>
              ))}
            </Grid>
          </Fade>
        ) : (
          <EmptyState>
            <DescriptionIcon sx={{ fontSize: 48, color: 'text.secondary', mb: 2 }} />
            <Typography variant="h6" gutterBottom>
              No Documents Found
            </Typography>
            <Typography color="text.secondary">
              {searchTerm
                ? "We couldn't find any documents matching your search"
                : "You haven't created any documents yet"}
            </Typography>
          </EmptyState>
        )}
      </Box>

      <ShareDialog
        open={shareDialogOpen}
        onClose={() => setShareDialogOpen(false)}
        document={selectedDocument}
      />

      <Dialog
        open={deleteDialogOpen}
        onClose={() => setDeleteDialogOpen(false)}
        PaperProps={{
          sx: {
            borderRadius: 2,
            width: '100%',
            maxWidth: 400,
          },
        }}
      >
        <DialogTitle>Delete Document</DialogTitle>
        <DialogContent>
          <Typography>
            Are you sure you want to delete "{selectedDocument?.title}"? This action cannot be undone.
          </Typography>
        </DialogContent>
        <DialogActions sx={{ p: 2.5 }}>
          <Button onClick={() => setDeleteDialogOpen(false)}>
            Cancel
          </Button>
          <Button
            onClick={handleDeleteConfirm}
            color="error"
            variant="contained"
            sx={{ boxShadow: 'none' }}
          >
            Delete
          </Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
};

export default DocumentList; 