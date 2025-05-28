import React, { useState, useEffect } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  Autocomplete,
  Stack,
  Typography,
  Chip,
  CircularProgress,
} from '@mui/material';
import { useUsers } from '../../hooks/useUsers';

const ShareDialog = ({ open, onClose, document, onShare }) => {
  const [selectedUsers, setSelectedUsers] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const { users, loading, searchUsers } = useUsers();

  useEffect(() => {
    if (searchTerm) {
      const delayDebounceFn = setTimeout(() => {
        searchUsers(searchTerm);
      }, 500);

      return () => clearTimeout(delayDebounceFn);
    }
  }, [searchTerm, searchUsers]);

  const handleShare = () => {
    if (selectedUsers.length > 0) {
      onShare(document._id, selectedUsers.map(user => user.email));
      setSelectedUsers([]);
      onClose();
    }
  };

  const handleClose = () => {
    setSelectedUsers([]);
    onClose();
  };

  return (
    <Dialog open={open} onClose={handleClose} maxWidth="sm" fullWidth>
      <DialogTitle>Chia sẻ tài liệu</DialogTitle>
      <DialogContent>
        <Stack spacing={3}>
          <Typography variant="subtitle1" gutterBottom>
            {document?.title}
          </Typography>

          <Autocomplete
            multiple
            options={users}
            loading={loading}
            value={selectedUsers}
            onChange={(event, newValue) => setSelectedUsers(newValue)}
            getOptionLabel={(option) => option.email}
            renderInput={(params) => (
              <TextField
                {...params}
                label="Thêm người dùng"
                variant="outlined"
                onChange={(e) => setSearchTerm(e.target.value)}
                InputProps={{
                  ...params.InputProps,
                  endAdornment: (
                    <>
                      {loading ? <CircularProgress color="inherit" size={20} /> : null}
                      {params.InputProps.endAdornment}
                    </>
                  ),
                }}
              />
            )}
            renderTags={(value, getTagProps) =>
              value.map((option, index) => (
                <Chip
                  label={option.email}
                  {...getTagProps({ index })}
                  key={option.email}
                />
              ))
            }
            noOptionsText="Không tìm thấy người dùng"
            loadingText="Đang tìm kiếm..."
          />
        </Stack>
      </DialogContent>
      <DialogActions>
        <Button onClick={handleClose}>Hủy</Button>
        <Button
          onClick={handleShare}
          variant="contained"
          disabled={selectedUsers.length === 0}
        >
          Chia sẻ
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default ShareDialog; 