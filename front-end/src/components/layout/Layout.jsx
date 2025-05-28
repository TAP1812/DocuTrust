import React from 'react';
import { Box, Container, CssBaseline } from '@mui/material';
import Header from './Header';
import { styled } from '@mui/material/styles';

const MainContent = styled('main')(({ theme }) => ({
  flexGrow: 1,
  padding: theme.spacing(3),
  marginTop: '64px', // Height of the header
  minHeight: 'calc(100vh - 64px)',
  background: '#f5f5f5',
}));

const Layout = ({ children }) => {
  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
      <CssBaseline />
      <Header />
      <MainContent>
        <Container maxWidth="lg">
          {children}
        </Container>
      </MainContent>
    </Box>
  );
};

export default Layout; 