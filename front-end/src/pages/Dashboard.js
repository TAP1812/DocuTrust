import React, { useEffect, useState } from 'react';
import axios from 'axios';

const Dashboard = () => {
  const [data, setData] = useState({
    createdDocuments: [],
    needToSignDocuments: [],
    signedDocuments: []
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    // Lấy userId từ localStorage hoặc context (giả sử đã lưu khi login)
    const user = JSON.parse(localStorage.getItem('user'));
    if (!user || !user.id) {
      setError('Bạn chưa đăng nhập.');
      setLoading(false);
      return;
    }
    axios.get(`/api/dashboard?userId=${user.id}`)
      .then(res => {
        setData(res.data);
        setLoading(false);
      })
      .catch(() => {
        setError('Không thể tải dữ liệu dashboard.');
        setLoading(false);
      });
  }, []);

  if (loading) return <div>Đang tải dashboard...</div>;
  if (error) return <div style={{color:'red'}}>{error}</div>;

  return (
    <div style={{padding: 24}}>
      <h2>Dashboard</h2>
      <section>
        <h3>Tài liệu đã tạo</h3>
        <ul>
          {data.createdDocuments.length === 0 && <li>Không có tài liệu nào.</li>}
          {data.createdDocuments.map(doc => (
            <li key={doc.id}>{doc.title} (Trạng thái: {doc.status})</li>
          ))}
        </ul>
      </section>
      <section>
        <h3>Tài liệu cần ký</h3>
        <ul>
          {data.needToSignDocuments.length === 0 && <li>Không có tài liệu nào.</li>}
          {data.needToSignDocuments.map(doc => (
            <li key={doc.id}>{doc.title} (Người tạo: {doc.creatorId})</li>
          ))}
        </ul>
      </section>
      <section>
        <h3>Tài liệu đã ký</h3>
        <ul>
          {data.signedDocuments.length === 0 && <li>Không có tài liệu nào.</li>}
          {data.signedDocuments.map(doc => (
            <li key={doc.id}>{doc.title} (Trạng thái: {doc.status})</li>
          ))}
        </ul>
      </section>
    </div>
  );
};

export default Dashboard;
