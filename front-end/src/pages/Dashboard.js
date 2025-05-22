import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { Box, Typography, Grid, Card, CardContent, List, ListItem, ListItemText, Divider, Alert, CircularProgress, AppBar, Toolbar, IconButton, Avatar, Menu, MenuItem, Button } from '@mui/material';
import MenuIcon from '@mui/icons-material/Menu';
import LogoutIcon from '@mui/icons-material/Logout';
import DescriptionIcon from '@mui/icons-material/Description';
import AddCircleOutlineIcon from '@mui/icons-material/AddCircleOutline';
import { useNavigate } from 'react-router-dom';

const Dashboard = () => {
  const [data, setData] = useState({
    createdDocuments: [],
    needToSignDocuments: [],
    signedDocuments: []
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [anchorEl, setAnchorEl] = useState(null);
  const navigate = useNavigate();
  const user = JSON.parse(localStorage.getItem('user'));

  useEffect(() => {
    axios.get('http://localhost:3001/api/dashboard', { withCredentials: true })
      .then(res => {
        setData(res.data);
        setLoading(false);
      })
      .catch(() => {
        setError('Không thể tải dữ liệu dashboard.');
        setLoading(false);
      });
  }, []);

  const handleMenu = (event) => {
    setAnchorEl(event.currentTarget);
  };
  const handleClose = () => {
    setAnchorEl(null);
  };
  const handleLogout = () => {
    localStorage.removeItem('user');
    navigate('/login');
  };

  if (loading) return <Box display="flex" justifyContent="center" alignItems="center" minHeight="60vh"><CircularProgress /></Box>;
  if (error) return <Alert severity="error">{error}</Alert>;

  return (
    <Box sx={{ background: 'linear-gradient(135deg, #f8fafc 0%, #e3f0ff 100%)', minHeight: '100vh', fontFamily: 'Segoe UI, Roboto, Arial, sans-serif' }}>
      <AppBar position="static" color="inherit" elevation={2} sx={{ mb: 4 }}>
        <Toolbar>
          <IconButton edge="start" color="primary" aria-label="menu" sx={{ mr: 2 }} onClick={handleMenu}>
            <MenuIcon />
          </IconButton>
          <Typography variant="h5" sx={{ flexGrow: 1, fontWeight: 700, color: '#1976d2', letterSpacing: 1 }}>
            Docu<span style={{ color: '#d81b60' }}>Trust</span>
          </Typography>
          {user && (
            <>
              <Button color="primary" startIcon={<DescriptionIcon />} sx={{ mr: 1 }} onClick={()=>navigate('/documents')}>Tài liệu</Button>
              <Button color="primary" startIcon={<AddCircleOutlineIcon />} sx={{ mr: 2 }} onClick={()=>navigate('/documents/create')}>Tạo mới</Button>
              <Avatar sx={{ bgcolor: '#1976d2', width: 36, height: 36, cursor: 'pointer' }} onClick={handleMenu}>
                {user.fullName ? user.fullName[0].toUpperCase() : user.username[0].toUpperCase()}
              </Avatar>
              <Menu anchorEl={anchorEl} open={Boolean(anchorEl)} onClose={handleClose}>
                <MenuItem disabled>{user.fullName || user.username}</MenuItem>
                <MenuItem onClick={handleLogout}><LogoutIcon fontSize="small" sx={{ mr: 1 }} />Đăng xuất</MenuItem>
              </Menu>
            </>
          )}
        </Toolbar>
      </AppBar>
      <Typography variant="h3" align="center" gutterBottom sx={{ fontWeight: 800, letterSpacing: 2, color: '#1a237e', mb: 4 }}>
        <span style={{ color: '#1976d2' }}>Docu</span><span style={{ color: '#d81b60' }}>Trust</span> <span style={{ color: '#1a237e' }}>Dashboard</span>
      </Typography>
      <Grid container spacing={4}>
        <Grid item xs={12} md={4}>
          <Card elevation={8} sx={{ minHeight: 340, borderRadius: 4, background: 'linear-gradient(120deg, #e3f2fd 60%, #fff 100%)', boxShadow: '0 8px 32px 0 rgba(25, 118, 210, 0.08)' }}>
            <CardContent>
              <Typography variant="h5" color="primary" gutterBottom fontWeight={700}>
                <span role="img" aria-label="created">📄</span> Tài liệu đã tạo
              </Typography>
              <Divider sx={{ mb: 2 }} />
              <List>
                {data.createdDocuments.length === 0 && <ListItem><ListItemText primary="Không có tài liệu nào." /></ListItem>}
                {data.createdDocuments.map(doc => (
                  <ListItem key={doc.id} sx={{ borderLeft: '4px solid #1976d2', mb: 1, background: '#f5faff', borderRadius: 2 }}>
                    <ListItemText
                      primary={<b>{doc.title}</b>}
                      secondary={<>
                        Trạng thái: <b style={{ color: doc.status === 'completed' ? '#43a047' : '#1976d2' }}>{doc.status}</b><br/>
                        Ngày tạo: {new Date(doc.createdAt).toLocaleString()}
                      </>}
                    />
                  </ListItem>
                ))}
              </List>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} md={4}>
          <Card elevation={8} sx={{ minHeight: 340, borderRadius: 4, background: 'linear-gradient(120deg, #fffde7 60%, #fff 100%)', boxShadow: '0 8px 32px 0 rgba(255, 193, 7, 0.08)' }}>
            <CardContent>
              <Typography variant="h5" sx={{ color: '#ff9800' }} gutterBottom fontWeight={700}>
                <span role="img" aria-label="sign">✍️</span> Tài liệu cần ký
              </Typography>
              <Divider sx={{ mb: 2 }} />
              <List>
                {data.needToSignDocuments.length === 0 && <ListItem><ListItemText primary="Không có tài liệu nào." /></ListItem>}
                {data.needToSignDocuments.map(doc => (
                  <ListItem key={doc.id} sx={{ borderLeft: '4px solid #ff9800', mb: 1, background: '#fffbe7', borderRadius: 2 }}>
                    <ListItemText
                      primary={<b>{doc.title}</b>}
                      secondary={<>
                        Người tạo: <span style={{ color: '#1976d2' }}>{doc.creatorId}</span><br/>
                        Trạng thái: <b style={{ color: doc.status === 'completed' ? '#43a047' : '#ff9800' }}>{doc.status}</b>
                      </>}
                    />
                  </ListItem>
                ))}
              </List>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} md={4}>
          <Card elevation={8} sx={{ minHeight: 340, borderRadius: 4, background: 'linear-gradient(120deg, #e8f5e9 60%, #fff 100%)', boxShadow: '0 8px 32px 0 rgba(76, 175, 80, 0.08)' }}>
            <CardContent>
              <Typography variant="h5" sx={{ color: '#43a047' }} gutterBottom fontWeight={700}>
                <span role="img" aria-label="signed">✅</span> Tài liệu đã ký
              </Typography>
              <Divider sx={{ mb: 2 }} />
              <List>
                {data.signedDocuments.length === 0 && <ListItem><ListItemText primary="Không có tài liệu nào." /></ListItem>}
                {data.signedDocuments.map(doc => (
                  <ListItem key={doc.id} sx={{ borderLeft: '4px solid #43a047', mb: 1, background: '#f6fff8', borderRadius: 2 }}>
                    <ListItemText
                      primary={<b>{doc.title}</b>}
                      secondary={<>
                        Trạng thái: <b style={{ color: doc.status === 'completed' ? '#43a047' : '#43a047' }}>{doc.status}</b>
                      </>}
                    />
                  </ListItem>
                ))}
              </List>
            </CardContent>
          </Card>
        </Grid>
      </Grid>
      <Box mt={6} textAlign="center">
        <Typography variant="body2" color="text.secondary">
          © {new Date().getFullYear()} DocuTrust. All rights reserved.
        </Typography>
      </Box>
    </Box>
  );
};

export default Dashboard;
