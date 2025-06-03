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
  Avatar,
  Tooltip,
} from '@mui/material';
import {
  MoreVert as MoreVertIcon,
  Share as ShareIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Description as DocumentIcon,
  AccessTime as AccessTimeIcon,
} from '@mui/icons-material';
import { format } from 'date-fns';
import { styled } from '@mui/material/styles';

const StyledCard = styled(Card)(({ theme }) => ({
  height: '100%',
  display: 'flex',
  flexDirection: 'column',
  transition: 'transform 0.2s ease-in-out, box-shadow 0.2s ease-in-out',
  borderRadius: theme.spacing(2),
  overflow: 'visible',
  '&:hover': {
    transform: 'translateY(-4px)',
    boxShadow: '0 8px 24px rgba(0, 0, 0, 0.15)',
  },
}));

const DocumentAvatar = styled(Avatar)(({ theme }) => ({
  backgroundColor: theme.palette.primary.main,
  width: 48,
  height: 48,
  boxShadow: '0 4px 12px rgba(0, 0, 0, 0.1)',
}));

const StatusChip = styled(Chip)(({ theme, statuscolor }) => ({
  borderRadius: theme.spacing(1),
  fontWeight: 500,
  backgroundColor: statuscolor.bg,
  color: statuscolor.color,
  '& .MuiChip-label': {
    padding: '0 12px',
  },
}));

const DocumentCard = ({ document, onShare, onEdit, onDelete }) => {
  const [anchorEl, setAnchorEl] = React.useState(null);

  const handleMenuOpen = (event) => {
    setAnchorEl(event.currentTarget);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
  };

  const getStatusDisplay = (status) => {
    switch (status) {
      case 'pending':
        return { 
          label: 'Chờ ký', 
          colorStyle: { bg: 'rgba(255, 152, 0, 0.1)', color: '#f57c00' } 
        };
      case 'signed':
      case 'completed':
        return { 
          label: 'Đã ký', 
          colorStyle: { bg: 'rgba(76, 175, 80, 0.1)', color: '#43a047' } 
        };
      default:
        return { 
          label: status,
          colorStyle: { bg: 'rgba(158, 158, 158, 0.1)', color: '#616161' }
        };
    }
  };

  const statusDisplay = getStatusDisplay(document.status);

  return (
    <StyledCard>
      <CardContent sx={{ p: 3 }}>
        <Stack spacing={2.5}>
          {/* Header */}
          <Stack direction="row" spacing={2} alignItems="flex-start">
            <DocumentAvatar>
              <DocumentIcon />
            </DocumentAvatar>
            <Box sx={{ flex: 1 }}>
              <Stack direction="row" justifyContent="space-between" alignItems="center">
                <Tooltip title={document.title} placement="top">
                  <Typography
                    variant="h6"
                    sx={{
                      fontWeight: 600,
                      fontSize: '1.1rem',
                      maxWidth: 200,
                      overflow: 'hidden',
                      textOverflow: 'ellipsis',
                      whiteSpace: 'nowrap'
                    }}
                  >
                    {document.title}
                  </Typography>
                </Tooltip>
                <IconButton
                  size="small"
                  onClick={handleMenuOpen}
                  sx={{
                    '&:hover': {
                      backgroundColor: 'rgba(0, 0, 0, 0.04)',
                    },
                  }}
                >
                  <MoreVertIcon />
                </IconButton>
              </Stack>

              <Stack direction="row" spacing={1} alignItems="center" sx={{ mt: 1 }}>
                <AccessTimeIcon sx={{ fontSize: '0.875rem', color: 'text.secondary' }} />
                <Typography variant="body2" color="text.secondary">
                  {format(new Date(document.createdAt), 'dd/MM/yyyy HH:mm')}
                </Typography>
              </Stack>
            </Box>
          </Stack>

          {/* Content */}
          <Typography
            variant="body2"
            color="text.secondary"
            sx={{
              overflow: 'hidden',
              textOverflow: 'ellipsis',
              display: '-webkit-box',
              WebkitLineClamp: 2,
              WebkitBoxOrient: 'vertical',
              minHeight: '40px',
            }}
          >
            {document.content || 'Không có mô tả'}
          </Typography>

          {/* Footer */}
          <Box sx={{ mt: 'auto' }}>
            <StatusChip
              label={statusDisplay.label}
              size="small"
              statuscolor={statusDisplay.colorStyle}
            />
          </Box>
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
        PaperProps={{
          elevation: 3,
          sx: {
            mt: 1,
            '& .MuiMenuItem-root': {
              py: 1,
            },
          },
        }}
      >
        <MenuItem
          onClick={() => {
            handleMenuClose();
            onShare(document);
          }}
        >
          <ShareIcon fontSize="small" sx={{ mr: 1.5 }} />
          Chia sẻ
        </MenuItem>
        <MenuItem
          onClick={() => {
            handleMenuClose();
            onEdit(document);
          }}
        >
          <EditIcon fontSize="small" sx={{ mr: 1.5 }} />
          Chỉnh sửa
        </MenuItem>
        <MenuItem
          onClick={() => {
            handleMenuClose();
            onDelete(document);
          }}
          sx={{ color: 'error.main' }}
        >
          <DeleteIcon fontSize="small" sx={{ mr: 1.5 }} />
          Xóa
        </MenuItem>
      </Menu>
    </StyledCard>
  );
};

export default DocumentCard; 