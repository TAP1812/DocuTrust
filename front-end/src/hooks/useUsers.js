import { useState } from 'react';
import axios from 'axios';

export const useUsers = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const searchUsers = async (searchTerm) => {
    if (!searchTerm) {
      setUsers([]);
      return;
    }

    setLoading(true);
    try {
      const response = await axios.get(`http://localhost:3001/api/users/search?q=${searchTerm}`, {
        credentials: 'include'
      });
      setUsers(response.data.users || []);
      setError(null);
    } catch (err) {
      setError('Không thể tìm kiếm người dùng');
      console.error('Error searching users:', err);
    } finally {
      setLoading(false);
    }
  };

  const getCurrentUser = async () => {
    try {
      const response = await axios.get('http://localhost:3001/api/users/me', {
        credentials: 'include'
      });
      return response.data.user;
    } catch (err) {
      setError('Không thể lấy thông tin người dùng');
      console.error('Error getting current user:', err);
      return null;
    }
  };

  return {
    users,
    loading,
    error,
    searchUsers,
    getCurrentUser
  };
}; 