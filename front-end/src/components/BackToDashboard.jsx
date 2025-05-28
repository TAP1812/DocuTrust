import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Box, IconButton, Typography } from '@mui/material';
import { ArrowBack as ArrowBackIcon } from '@mui/icons-material';

const BackToDashboard = ({ title }) => {
  const navigate = useNavigate();

  return (
    <Box 
      sx={{ 
        display: 'flex', 
        alignItems: 'center', 
        gap: 2, 
        mb: 4,
        py: 2
      }}
    >
      <IconButton
        onClick={() => navigate('/dashboard')}
        sx={{ 
          backgroundColor: 'rgba(0, 0, 0, 0.04)',
          transition: 'all 0.2s ease-in-out',
          '&:hover': {
            backgroundColor: 'rgba(0, 0, 0, 0.08)',
            transform: 'scale(1.05)'
          }
        }}
      >
        <ArrowBackIcon />
      </IconButton>
      {title && (
        <Typography
          variant="h4"
          component="h1"
          sx={{
            fontWeight: 600,
            color: 'text.primary',
          }}
        >
          {title}
        </Typography>
      )}
    </Box>
  );
};

export default BackToDashboard; 