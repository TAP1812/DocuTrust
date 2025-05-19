import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';

function SignDocument() {
  const { id } = useParams();
  const [doc, setDoc] = useState(null);
  const [signature, setSignature] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const user = JSON.parse(localStorage.getItem('user'));
  const navigate = useNavigate();

  useEffect(() => {
    fetch(`http://localhost:3001/api/documents/${id}`)
      .then(res => res.json())
      .then(data => setDoc(data.document));
  }, [id]);

  const handleSign = async (e) => {
    e.preventDefault();
    setError(''); setSuccess('');
    if (!user) return setError('Bạn cần đăng nhập');
    if (!signature) return setError('Vui lòng nhập chữ ký số');
    try {
      const res = await fetch(`http://localhost:3001/api/documents/${id}/sign`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId: user.id, signature, publicKey: user.publicKey })
      });
      const data = await res.json();
      if (res.ok) {
        setSuccess('Ký thành công!');
        setTimeout(()=>navigate('/documents'), 1000);
      } else {
        setError(data.message || 'Ký thất bại');
      }
    } catch {
      setError('Network error');
    }
  };

  if (!doc) return <div>Đang tải...</div>;

  return (
    <div className="container">
      <h2>Ký tài liệu: {doc.title}</h2>
      <div><b>Nội dung:</b> {doc.content}</div>
      <div><b>Hash SHA-256:</b> {doc.hash}</div>
      <form onSubmit={handleSign}>
        <textarea placeholder="Chữ ký số (Base64 hoặc PEM)" value={signature} onChange={e => setSignature(e.target.value)} required rows={3}/>
        <button type="submit">Ký tài liệu</button>
      </form>
      {error && <div style={{color:'red'}}>{error}</div>}
      {success && <div style={{color:'green'}}>{success}</div>}
      <button onClick={()=>navigate('/documents')}>Quay lại</button>
    </div>
  );
}

export default SignDocument;
