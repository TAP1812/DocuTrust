import React from 'react';
import {
  Card,
  CardContent,
  CardActions,
  Typography,
  IconButton,
  Chip,
  Box,
  Menu,
  MenuItem,
} from '@mui/material';
import {
  MoreVert as MoreVertIcon,
  Description as DescriptionIcon,
  Share as ShareIcon,
} from '@mui/icons-material';
import { styled } from '@mui/material/styles';
import { format } from 'date-fns';

const StyledCard = styled(Card)(({ theme }) => ({
  height: '100%',
  display: 'flex',
  flexDirection: 'column',
  transition: 'transform 0.2s ease-in-out',
  '&:hover': {
    transform: 'translateY(-4px)',
    boxShadow: theme.shadows[4],
  },
}));

const DocumentIcon = styled(Box)(({ theme }) => ({
  width: '100%',
  height: '140px',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  backgroundColor: theme.palette.grey[100],
  borderBottom: `1px solid ${theme.palette.grey[200]}`,
}));

const StatusChip = styled(Chip)(({ status, theme }) => {
  const colors = {
    draft: theme.palette.info.main,
    pending: theme.palette.warning.main,
    verified: theme.palette.success.main,
  };

  return {
    backgroundColor: colors[status],
    color: '#fff',
  };
});

const DocumentCard = ({ document, onShare, onEdit, onDelete }) => {
  const [anchorEl, setAnchorEl] = React.useState(null);

  const handleMenuOpen = (event) => {
    setAnchorEl(event.currentTarget);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
  };

  const handleAction = (action) => {
    handleMenuClose();
    switch (action) {
      case 'edit':
        onEdit(document);
        break;
      case 'share':
        onShare(document);
        break;
      case 'delete':
        onDelete(document._id);
        break;
      default:
        break;
    }
  };

  return (
    <StyledCard>
      <DocumentIcon>
        <DescriptionIcon sx={{ fontSize: 60, color: 'primary.main' }} />
      </DocumentIcon>
      
      <CardContent sx={{ flexGrow: 1 }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 2 }}>
          <Typography variant="h6" component="div" noWrap>
            {document.title}
          </Typography>
          <IconButton size="small" onClick={handleMenuOpen}>
            <MoreVertIcon />
          </IconButton>
        </Box>

        <Typography variant="body2" color="text.secondary" gutterBottom>
          Last updated: {format(new Date(document.updatedAt), 'MMM dd, yyyy')}
        </Typography>

        <Box sx={{ display: 'flex', gap: 1, mt: 2 }}>
          <StatusChip
            label={document.status}
            status={document.status}
            size="small"
          />
          {document.sharedWith?.length > 0 && (
            <Chip
              icon={<ShareIcon />}
              label={`Shared with ${document.sharedWith.length}`}
              size="small"
              variant="outlined"
            />
          )}
        </Box>
      </CardContent>

      <Menu
        anchorEl={anchorEl}
        open={Boolean(anchorEl)}
        onClose={handleMenuClose}
      >
        <MenuItem onClick={() => handleAction('edit')}>Edit</MenuItem>
        <MenuItem onClick={() => handleAction('share')}>Share</MenuItem>
        <MenuItem onClick={() => handleAction('delete')} sx={{ color: 'error.main' }}>
          Delete
        </MenuItem>
      </Menu>
    </StyledCard>
  );
};

export default DocumentCard; 