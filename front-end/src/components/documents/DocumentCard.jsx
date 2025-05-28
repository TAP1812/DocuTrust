import React from 'react';
import {
  Card,
  CardContent,
  Typography,
  IconButton,
  Menu,
  MenuItem,
  Stack,
  Chip,
  Box,
} from '@mui/material';
import {
  MoreVert as MoreVertIcon,
  Share as ShareIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Description as DocumentIcon,
} from '@mui/icons-material';
import { format } from 'date-fns';

const DocumentCard = ({ document, onShare, onEdit, onDelete }) => {
  const [anchorEl, setAnchorEl] = React.useState(null);

  const handleMenuOpen = (event) => {
    setAnchorEl(event.currentTarget);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'pending':
        return {
          bg: 'rgba(255, 152, 0, 0.1)',
          color: '#f57c00'
        };
      case 'signed':
        return {
          bg: 'rgba(76, 175, 80, 0.1)',
          color: '#43a047'
        };
      default:
        return {
          bg: 'rgba(33, 150, 243, 0.1)',
          color: '#1976d2'
        };
    }
  };

  return (
    <Card
      sx={{
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
        transition: 'transform 0.2s ease-in-out, box-shadow 0.2s ease-in-out',
        '&:hover': {
          transform: 'translateY(-4px)',
          boxShadow: 3,
        },
      }}
    >
      <CardContent sx={{ flexGrow: 1 }}>
        <Stack spacing={2}>
          {/* Header */}
          <Stack direction="row" justifyContent="space-between" alignItems="flex-start">
            <Stack direction="row" spacing={1} alignItems="center">
              <DocumentIcon sx={{ color: '#2196F3' }} />
              <Typography variant="h6" noWrap sx={{ maxWidth: 180 }}>
                {document.title}
              </Typography>
            </Stack>
            <IconButton size="small" onClick={handleMenuOpen}>
              <MoreVertIcon />
            </IconButton>
          </Stack>

          {/* Status and Date */}
          <Stack spacing={1}>
            <Chip
              label={document.status}
              size="small"
              sx={{
                bgcolor: getStatusColor(document.status).bg,
                color: getStatusColor(document.status).color,
                width: 'fit-content',
              }}
            />
            <Typography variant="caption" color="text.secondary">
              {format(new Date(document.createdAt), 'dd/MM/yyyy HH:mm')}
            </Typography>
          </Stack>

          {/* Description */}
          <Typography
            variant="body2"
            color="text.secondary"
            sx={{
              overflow: 'hidden',
              textOverflow: 'ellipsis',
              display: '-webkit-box',
              WebkitLineClamp: 2,
              WebkitBoxOrient: 'vertical',
            }}
          >
            {document.content || 'Không có mô tả'}
          </Typography>
        </Stack>
      </CardContent>

      {/* Actions Menu */}
      <Menu
        anchorEl={anchorEl}
        open={Boolean(anchorEl)}
        onClose={handleMenuClose}
        anchorOrigin={{
          vertical: 'bottom',
          horizontal: 'right',
        }}
        transformOrigin={{
          vertical: 'top',
          horizontal: 'right',
        }}
      >
        <MenuItem
          onClick={() => {
            handleMenuClose();
            onShare(document);
          }}
        >
          <ShareIcon fontSize="small" sx={{ mr: 1 }} />
          Chia sẻ
        </MenuItem>
        <MenuItem
          onClick={() => {
            handleMenuClose();
            onEdit(document);
          }}
        >
          <EditIcon fontSize="small" sx={{ mr: 1 }} />
          Chỉnh sửa
        </MenuItem>
        <MenuItem
          onClick={() => {
            handleMenuClose();
            onDelete(document);
          }}
          sx={{ color: 'error.main' }}
        >
          <DeleteIcon fontSize="small" sx={{ mr: 1 }} />
          Xóa
        </MenuItem>
      </Menu>
    </Card>
  );
};

export default DocumentCard; 