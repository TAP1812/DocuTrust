import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';

function CreateDocument() {
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [signerList, setSignerList] = useState([{ email: '', role: 'signer' }]);
  const [file, setFile] = useState(null);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const user = JSON.parse(localStorage.getItem('user'));
  const navigate = useNavigate();

  const handleSignerChange = (idx, field, value) => {
    const updated = [...signerList];
    updated[idx][field] = value;
    setSignerList(updated);
  };

  const addSigner = () => setSignerList([...signerList, { email: '', role: 'signer' }]);
  const removeSigner = idx => setSignerList(signerList.filter((_, i) => i !== idx));
  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(''); setSuccess('');
    try {
      const formData = new FormData();      // Log để debug
      console.log('Creating document with:', { title, content, creatorId: user.id, signers: signerList });
      
      formData.append('title', title);
      formData.append('content', content);
      formData.append('creatorId', user.id);
      formData.append('signers', JSON.stringify(signerList.filter(s => s.email)));
      if (file) formData.append('file', file);
      const res = await fetch('http://localhost:3001/api/documents', {
        method: 'POST',
        body: formData,
        credentials: 'include'
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
      <form onSubmit={handleSubmit} encType="multipart/form-data">
        <input type="text" placeholder="Tiêu đề" value={title} onChange={e => setTitle(e.target.value)} required />
        <textarea placeholder="Nội dung" value={content} onChange={e => setContent(e.target.value)} required rows={4}/>
        <div>
          <b>Danh sách người ký:</b>
          {signerList.map((signer, idx) => (
            <div key={idx} style={{display:'flex',gap:8,marginBottom:4}}>
              <input type="email" placeholder="Email" value={signer.email} onChange={e=>handleSignerChange(idx,'email',e.target.value)} required />
              <select value={signer.role} onChange={e=>handleSignerChange(idx,'role',e.target.value)}>
                <option value="signer">Người ký</option>
                <option value="viewer">Người xem</option>
              </select>
              {signerList.length > 1 && <button type="button" onClick={()=>removeSigner(idx)}>-</button>}
              {idx === signerList.length-1 && <button type="button" onClick={addSigner}>+</button>}
            </div>
          ))}
        </div>
        <input type="file" accept=".pdf,.doc,.docx,.txt" onChange={e => setFile(e.target.files[0])} />
        <button type="submit">Tạo tài liệu</button>
      </form>
      {error && <div style={{color:'red'}}>{error}</div>}
      {success && <div style={{color:'green'}}>{success}</div>}
      <button onClick={()=>navigate('/documents')}>Quay lại</button>
    </div>
  );
}

export default CreateDocument;
