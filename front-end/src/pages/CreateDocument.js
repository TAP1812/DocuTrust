import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';

function CreateDocument() {
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [signers, setSigners] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const user = JSON.parse(localStorage.getItem('user'));
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(''); setSuccess('');
    try {
      const res = await fetch('http://localhost:3001/api/documents', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title,
          content,
          creatorId: user.id,
          signers: signers.split(',').map(s => s.trim()).filter(Boolean)
        })
      });
      const data = await res.json();
      if (res.ok) {
        setSuccess('Tạo tài liệu thành công!');
        setTimeout(()=>navigate('/documents'), 1000);
      } else {
        setError(data.message || 'Tạo thất bại');
      }
    } catch {
      setError('Network error');
    }
  };

  if (!user) return null;

  return (
    <div className="container">
      <h2>Tạo tài liệu mới</h2>
      <form onSubmit={handleSubmit}>
        <input type="text" placeholder="Tiêu đề" value={title} onChange={e => setTitle(e.target.value)} required />
        <textarea placeholder="Nội dung" value={content} onChange={e => setContent(e.target.value)} required rows={4}/>
        <input type="text" placeholder="Danh sách userId người ký (phân tách dấu phẩy)" value={signers} onChange={e => setSigners(e.target.value)} required />
        <button type="submit">Tạo tài liệu</button>
      </form>
      {error && <div style={{color:'red'}}>{error}</div>}
      {success && <div style={{color:'green'}}>{success}</div>}
      <button onClick={()=>navigate('/documents')}>Quay lại</button>
    </div>
  );
}

export default CreateDocument;
