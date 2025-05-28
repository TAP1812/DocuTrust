import React, { useState } from 'react';
import {
  Container,
  Box,
  Typography,
  Button,
  IconButton,
  TextField,
  InputAdornment,
  Card,
  CardContent,
  Stack,
} from '@mui/material';
import {
  Search as SearchIcon,
  Add as AddIcon,
  Description as DocumentIcon,
  MoreVert as MoreVertIcon,
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';

const Documents = () => {
  const navigate = useNavigate();
  const [documents] = useState([
    {
      id: 1,
      title: 'Hợp đồng VCS',
      description: 'Vietnamese Cyber Slave',
      createdAt: '28/05/2025 23:18',
      status: 'pending'
    }
  ]);
  const [searchTerm, setSearchTerm] = useState('');

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      {/* Header */}
      <Box sx={{ 
        display: 'flex', 
        justifyContent: 'space-between', 
        alignItems: 'center',
        mb: 4
      }}>
        <Typography variant="h4" sx={{ fontWeight: 600 }}>
          My Documents
        </Typography>
        <Box sx={{ display: 'flex', gap: 2, alignItems: 'center' }}>
          <TextField
            placeholder="Search documents..."
            size="small"
            sx={{
              width: 300,
              '& .MuiOutlinedInput-root': {
                borderRadius: 28,
                backgroundColor: 'white',
              }
            }}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <SearchIcon color="action" />
                </InputAdornment>
              ),
            }}
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
          <Button
            variant="contained"
            startIcon={<AddIcon />}
            sx={{
              borderRadius: 28,
              textTransform: 'none',
              px: 3,
            }}
          >
            New Document
          </Button>
        </Box>
      </Box>

      {/* Documents List */}
      <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 3 }}>
        {documents.map((doc) => (
          <Card 
            key={doc.id}
            sx={{ 
              width: 280,
              cursor: 'pointer',
              boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
              '&:hover': {
                boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
              }
            }}
          >
            <CardContent>
              <Stack spacing={2}>
                <Box sx={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between' }}>
                  <Box sx={{ display: 'flex', gap: 1, alignItems: 'center' }}>
                    <DocumentIcon sx={{ color: 'primary.main' }} />
                    <Typography variant="subtitle1" sx={{ fontWeight: 500 }}>
                      {doc.title}
                    </Typography>
                  </Box>
                  <IconButton size="small">
                    <MoreVertIcon />
                  </IconButton>
                </Box>
                <Box>
                  <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mb: 1 }}>
                    {doc.createdAt}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    {doc.description}
                  </Typography>
                </Box>
                <Typography 
                  variant="caption" 
                  sx={{ 
                    color: doc.status === 'pending' ? 'warning.main' : 'success.main',
                    textTransform: 'lowercase'
                  }}
                >
                  {doc.status}
                </Typography>
              </Stack>
            </CardContent>
          </Card>
        ))}
      </Box>
    </Container>
  );
};

export default Documents; 