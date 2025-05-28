import React, { useState } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Box,
  Typography,
  Chip,
  CircularProgress,
} from '@mui/material';
import { styled } from '@mui/material/styles';
import { useUsers } from '../../hooks/useUsers';

const StyledChip = styled(Chip)(({ theme }) => ({
  margin: theme.spacing(0.5),
}));

const ShareDialog = ({ open, onClose, document }) => {
  const [selectedUser, setSelectedUser] = useState('');
  const [permission, setPermission] = useState('read');
  const { users, loading, error } = useUsers();
  const [sharedUsers, setSharedUsers] = useState(document?.sharedWith || []);

  const handleShare = () => {
    if (!selectedUser) return;

    const newShare = {
      user: selectedUser,
      permission: permission,
    };

    setSharedUsers([...sharedUsers, newShare]);
    setSelectedUser('');
  };

  const handleRemoveShare = (userId) => {
    setSharedUsers(sharedUsers.filter(share => share.user !== userId));
  };

  const handleSave = () => {
    // Call API to update document sharing
    onClose();
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle>Share Document</DialogTitle>
      <DialogContent>
        <Box sx={{ mb: 3 }}>
          <Typography variant="subtitle1" gutterBottom>
            {document?.title}
          </Typography>
        </Box>

        <Box sx={{ display: 'flex', gap: 2, mb: 3 }}>
          <FormControl fullWidth>
            <InputLabel>User</InputLabel>
            <Select
              value={selectedUser}
              onChange={(e) => setSelectedUser(e.target.value)}
              label="User"
            >
              {loading ? (
                <MenuItem disabled>
                  <CircularProgress size={20} />
                </MenuItem>
              ) : (
                users?.map((user) => (
                  <MenuItem key={user._id} value={user._id}>
                    {user.username}
                  </MenuItem>
                ))
              )}
            </Select>
          </FormControl>

          <FormControl sx={{ minWidth: 120 }}>
            <InputLabel>Permission</InputLabel>
            <Select
              value={permission}
              onChange={(e) => setPermission(e.target.value)}
              label="Permission"
            >
              <MenuItem value="read">Read</MenuItem>
              <MenuItem value="write">Write</MenuItem>
            </Select>
          </FormControl>

          <Button
            variant="contained"
            onClick={handleShare}
            disabled={!selectedUser}
          >
            Add
          </Button>
        </Box>

        <Box sx={{ mt: 2 }}>
          <Typography variant="subtitle2" gutterBottom>
            Shared with:
          </Typography>
          <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
            {sharedUsers.map((share) => {
              const user = users?.find(u => u._id === share.user);
              return (
                <StyledChip
                  key={share.user}
                  label={`${user?.username || 'Unknown'} (${share.permission})`}
                  onDelete={() => handleRemoveShare(share.user)}
                  color="primary"
                  variant="outlined"
                />
              );
            })}
          </Box>
        </Box>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>Cancel</Button>
        <Button onClick={handleSave} variant="contained" color="primary">
          Save
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default ShareDialog; 