import { useState } from 'react';
import axios from 'axios';

// Create an axios instance with default config
const api = axios.create({
  baseURL: 'http://localhost:3001',
  withCredentials: true // This is important for sending cookies
});

export const useDocuments = () => {
  const [documents, setDocuments] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const fetchDocuments = async () => {
    setLoading(true);
    try {
      const user = JSON.parse(localStorage.getItem('user'));
      const response = await api.get(`/api/documents?userId=${user.id}`);
      setDocuments(response.data.documents || []);
      setError(null);
    } catch (err) {
      setError('Không thể tải danh sách tài liệu');
      console.error('Error fetching documents:', err);
    } finally {
      setLoading(false);
    }
  };

  const deleteDocument = async (documentId) => {
    try {
      await api.delete(`/api/documents/${documentId}`);
      setDocuments(documents.filter(doc => doc._id !== documentId));
      return true;
    } catch (err) {
      setError('Không thể xóa tài liệu');
      console.error('Error deleting document:', err);
      return false;
    }
  };

  const shareDocument = async (documentId, userEmails, permissions) => {
    try {
      await api.post(`/api/documents/${documentId}/share`, {
        users: userEmails.map(email => ({
          email,
          permissions
        }))
      });
      return true;
    } catch (err) {
      setError('Không thể chia sẻ tài liệu');
      console.error('Error sharing document:', err);
      return false;
    }
  };

  return {
    documents,
    loading,
    error,
    fetchDocuments,
    deleteDocument,
    shareDocument
  };
}; 