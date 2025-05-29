import { useState, useCallback } from 'react';
import axios from 'axios';

// Create an axios instance with default config
const api = axios.create({
  baseURL: 'http://localhost:3001',
  withCredentials: true // This is important for sending cookies
});

export const useDocuments = () => {
  const [documents, setDocuments] = useState([]);
  const [currentDocument, setCurrentDocument] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  console.log('[useDocuments] Hook instance created. CurrentDocument state:', currentDocument); // Log currentDocument state

  const fetchDocuments = useCallback(async () => {
    setLoading(true);
    try {
      const user = JSON.parse(localStorage.getItem('user'));
      if (!user || !user.id) {
        setError('User not found. Please log in.');
        setLoading(false);
        return;
      }
      const response = await api.get(`/api/documents?userId=${user.id}`);
      setDocuments(response.data.documents || []);
      setError(null);
    } catch (err) {
      setError('Không thể tải danh sách tài liệu');
      console.error('Error fetching documents:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  const fetchDocumentById = useCallback(async (documentId) => {
    console.log('[useDocuments] fetchDocumentById called with ID:', documentId);
    setLoading(true);
    setCurrentDocument(null);
    try {
      const response = await api.get(`/api/documents/${documentId}`);
      console.log('[useDocuments] API response for getDocumentById:', response);
      console.log('[useDocuments] API response.data for getDocumentById:', response.data);
      if (response.data && response.data.document) {
        setCurrentDocument(response.data.document);
      } else {
        console.error('[useDocuments] API response.data.document is missing or invalid:', response.data);
        setError('Dữ liệu tài liệu trả về không hợp lệ.');
        setCurrentDocument(null);
      }
      setError(null);
    } catch (err) {
      console.error('[useDocuments] Error fetching document by ID:', err);
      setError(err.response?.data?.message || 'Không thể tải thông tin tài liệu');
      setCurrentDocument(null);
    } finally {
      setLoading(false);
    }
  }, []);

  const deleteDocument = useCallback(async (documentId) => {
    try {
      await api.delete(`/api/documents/${documentId}`);
      setDocuments(docs => docs.filter(doc => doc._id !== documentId));
      return true;
    } catch (err) {
      setError('Không thể xóa tài liệu');
      console.error('Error deleting document:', err);
      return false;
    }
  }, []);

  const shareDocument = useCallback(async (documentId, userEmails, permissions) => {
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
  }, []);

  return {
    documents,
    loading,
    error,
    fetchDocuments,
    deleteDocument,
    shareDocument,
    currentDocument,
    fetchDocumentById
  };
}; 