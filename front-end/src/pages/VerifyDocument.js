import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';

function VerifyDocument() {
  const { id } = useParams();
  const [doc, setDoc] = useState(null);
  const [verify, setVerify] = useState([]);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    fetch(`http://localhost:3001/api/documents/${id}`)
      .then(res => res.json())
      .then(data => setDoc(data.document));
  }, [id]);

  const handleVerify = async () => {
    setError('');
    try {
      const res = await fetch(`http://localhost:3001/api/documents/${id}/verify`, { method: 'POST' });
      const data = await res.json();
      if (res.ok) setVerify(data.verifyResults);
      else setError(data.message || 'Lỗi xác minh');
    } catch {
      setError('Network error');
    }
  };

  if (!doc) return <div>Đang tải...</div>;

  return (
    <div className="container">
      <h2>Xác minh tài liệu: {doc.title}</h2>
      <div><b>Nội dung:</b> {doc.content}</div>
      <div><b>Hash SHA-256:</b> {doc.hash}</div>
      <button onClick={handleVerify}>Xác minh chữ ký</button>
      {verify.length > 0 && (
        <ul>
          {verify.map(v => (
            <li key={v.userId}>
              User: {v.userId} - {v.valid ? 'Hợp lệ' : 'Không hợp lệ'} - Ký lúc: {v.signedAt}
            </li>
          ))}
        </ul>
      )}
      {error && <div style={{color:'red'}}>{error}</div>}
      <button onClick={()=>navigate('/documents')}>Quay lại</button>
    </div>
  );
}

export default VerifyDocument;
