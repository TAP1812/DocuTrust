import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Login from './pages/Login';
import Register from './pages/Register';
import DocumentList from './pages/DocumentList';
import CreateDocument from './pages/CreateDocument';
import SignDocument from './pages/SignDocument';
import VerifyDocument from './pages/VerifyDocument';

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/documents" element={<DocumentList />} />
        <Route path="/documents/create" element={<CreateDocument />} />
        <Route path="/documents/:id/sign" element={<SignDocument />} />
        <Route path="/documents/:id/verify" element={<VerifyDocument />} />
        <Route path="*" element={<Navigate to="/login" />} />
      </Routes>
    </Router>
  );
}

export default App;
