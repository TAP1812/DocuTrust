import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';

function DocumentList() {
  const [documents, setDocuments] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
    const user = JSON.parse(localStorage.getItem('user'));
    if (!user) {
      navigate('/login');
      return;
    }
    fetch(`http://localhost:3001/api/documents?userId=${user.id}`)
      .then(res => res.json())
      .then(data => setDocuments(data.documents || []));
  }, [navigate]);

  return (
    <div className="container">
      <h2>Danh sách tài liệu</h2>
      <button onClick={()=>navigate('/documents/create')}>Tạo tài liệu mới</button>
      <ul>
        {documents.map(doc => (
          <li key={doc.id}>
            <b>{doc.title}</b> - Trạng thái: {doc.status}
            <button onClick={()=>navigate(`/documents/${doc.id}/sign`)}>Ký</button>
            <button onClick={()=>navigate(`/documents/${doc.id}/verify`)}>Xác minh</button>
          </li>
        ))}
      </ul>
      <button onClick={()=>{localStorage.removeItem('user');navigate('/login')}}>Đăng xuất</button>
    </div>
  );
}

export default DocumentList;
