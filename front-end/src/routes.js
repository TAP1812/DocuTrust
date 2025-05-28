import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import Login from './pages/Login.js';
import Register from './pages/Register.js';
import DocumentList from './pages/DocumentList.jsx';
import CreateDocument from './pages/CreateDocument.js';
import SignDocument from './pages/SignDocument.js';
import VerifyDocument from './pages/VerifyDocument.js';
import Dashboard from './pages/Dashboard.jsx';
import Profile from './pages/Profile.js';
import DocumentDetail from './pages/DocumentDetail.js';

const AppRoutes = () => {
  return (
    <Routes>
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />
      <Route path="/documents" element={<DocumentList />} />
      <Route path="/documents/:id" element={<DocumentDetail />} />
      <Route path="/documents/create" element={<CreateDocument />} />
      
      {/* Routes that require a document ID */}
      <Route path="/documents/:id/sign" element={<SignDocument />} />
      <Route path="/documents/:id/verify" element={<VerifyDocument />} />

      {/* General routes for signing and verifying have been REMOVED */}

      <Route path="/dashboard" element={<Dashboard />} />
      <Route path="/profile" element={<Profile />} />
      <Route path="*" element={<Navigate to="/login" />} /> {/* Or to a NotFound page */}
    </Routes>
  );
};

export default AppRoutes; 