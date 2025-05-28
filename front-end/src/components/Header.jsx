import React from 'react';
import {
  AppBar,
  Box,
  IconButton,
  InputBase,
  Stack,
  Toolbar,
  Avatar,
  Badge,
  Tooltip,
} from '@mui/material';
import {
  Search as SearchIcon,
  Notifications as NotificationsIcon,
  Help as HelpIcon,
} from '@mui/icons-material';

const Header = () => {
  return (
    <AppBar
      position="fixed"
      sx={{
        boxShadow: 'none',
        borderBottom: '1px solid',
        borderColor: 'grey.200',
        bgcolor: '#FFFFFF',
        zIndex: (theme) => theme.zIndex.drawer + 1,
      }}
    >
      <Toolbar sx={{ height: 64 }}>
        <Box
          sx={{
            bgcolor: 'grey.100',
            borderRadius: 2,
            display: 'flex',
            alignItems: 'center',
            width: 400,
            px: 2,
            py: 0.5,
          }}
        >
          <SearchIcon sx={{ color: 'grey.500', mr: 1 }} />
          <InputBase
            placeholder="Search documents..."
            sx={{
              flex: 1,
              '& input': {
                py: 1,
                fontSize: '0.875rem',
                color: 'grey.900',
                '&::placeholder': {
                  color: 'grey.500',
                  opacity: 1,
                },
              },
            }}
          />
        </Box>

        <Box sx={{ flexGrow: 1 }} />

        <Stack direction="row" spacing={2} alignItems="center">
          <Tooltip title="Help Center">
            <IconButton
              sx={{
                bgcolor: 'grey.100',
                '&:hover': { bgcolor: 'grey.200' },
              }}
            >
              <HelpIcon />
            </IconButton>
          </Tooltip>

          <Tooltip title="Notifications">
            <IconButton
              sx={{
                bgcolor: 'grey.100',
                '&:hover': { bgcolor: 'grey.200' },
              }}
            >
              <Badge badgeContent={4} color="error">
                <NotificationsIcon />
              </Badge>
            </IconButton>
          </Tooltip>

          <Tooltip title="Account settings">
            <IconButton sx={{ p: 0 }}>
              <Avatar
                sx={{
                  width: 40,
                  height: 40,
                  bgcolor: 'primary.main',
                }}
              >
                JD
              </Avatar>
            </IconButton>
          </Tooltip>
        </Stack>
      </Toolbar>
    </AppBar>
  );
};

export default Header; 