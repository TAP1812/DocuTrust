import React from 'react';
import {
  Box,
  Drawer,
  List,
  ListItem,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Typography,
  Divider,
  Button,
  Stack,
} from '@mui/material';
import {
  Home as HomeIcon,
  Description as DocumentIcon,
  Send as SendIcon,
  Inbox as InboxIcon,
  Settings as SettingsIcon,
  Add as AddIcon,
} from '@mui/icons-material';

const DRAWER_WIDTH = 280;

const menuItems = [
  { text: 'Home', icon: <HomeIcon />, active: true },
  { text: 'Documents', icon: <DocumentIcon /> },
  { text: 'Inbox', icon: <InboxIcon />, badge: 3 },
  { text: 'Sent', icon: <SendIcon /> },
  { text: 'Settings', icon: <SettingsIcon /> },
];

const Sidebar = () => {
  return (
    <Drawer
      variant="permanent"
      sx={{
        width: DRAWER_WIDTH,
        flexShrink: 0,
        '& .MuiDrawer-paper': {
          width: DRAWER_WIDTH,
          boxSizing: 'border-box',
          borderRight: '1px solid',
          borderColor: 'grey.200',
          bgcolor: '#FFFFFF',
        },
      }}
    >
      <Box sx={{ p: 3 }}>
        <Typography
          variant="h5"
          sx={{ fontWeight: 600, color: 'primary.main', mb: 3 }}
        >
          DocuTrust
        </Typography>
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          fullWidth
          sx={{
            py: 1,
            px: 3,
            bgcolor: 'primary.main',
            '&:hover': {
              bgcolor: 'primary.dark',
            },
          }}
        >
          New Document
        </Button>
      </Box>
      <Divider />
      <Box sx={{ py: 2 }}>
        <List>
          {menuItems.map((item) => (
            <ListItem key={item.text} disablePadding>
              <ListItemButton
                sx={{
                  py: 1.5,
                  px: 3,
                  ...(item.active && {
                    bgcolor: 'primary.lighter',
                    '&:hover': {
                      bgcolor: 'primary.lighter',
                    },
                  }),
                }}
              >
                <ListItemIcon
                  sx={{
                    color: item.active ? 'primary.main' : 'grey.600',
                    minWidth: 40,
                  }}
                >
                  {item.icon}
                </ListItemIcon>
                <ListItemText
                  primary={
                    <Stack direction="row" alignItems="center" spacing={1}>
                      <Typography
                        variant="body1"
                        color={item.active ? 'primary.main' : 'grey.800'}
                        sx={{ fontWeight: item.active ? 600 : 400 }}
                      >
                        {item.text}
                      </Typography>
                      {item.badge && (
                        <Box
                          sx={{
                            bgcolor: 'error.main',
                            color: 'white',
                            borderRadius: '10px',
                            px: 1,
                            py: 0.25,
                            fontSize: '0.75rem',
                            fontWeight: 600,
                          }}
                        >
                          {item.badge}
                        </Box>
                      )}
                    </Stack>
                  }
                />
              </ListItemButton>
            </ListItem>
          ))}
        </List>
      </Box>
    </Drawer>
  );
};

export default Sidebar; 