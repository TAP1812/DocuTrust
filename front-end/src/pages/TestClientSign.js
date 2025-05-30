import React, { useState, useCallback, useEffect } from 'react';
import * as ethers from 'ethers';

function TestClientSign() {
  const [documentId, setDocumentId] = useState('');
  const [documentHash, setDocumentHash] = useState('');
  const [privateKeyHex, setPrivateKeyHex] = useState('');
  const [signature, setSignature] = useState('');
  const [publicKey, setPublicKey] = useState('');
  const [feedback, setFeedback] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    const fetchAndHashContent = async () => {
      if (!documentId) {
        setDocumentHash('');
        setFeedback('');
        return;
      }
      setIsLoading(true);
      setFeedback(`Đang lấy và hash nội dung cho tài liệu ID: ${documentId}...`);
      try {
        const response = await fetch(`http://localhost:3001/api/documents/${documentId}/file-content`, {
            method: 'GET',
            credentials: 'include'
        });
        if (!response.ok) {
          let errorMsg = 'Không thể lấy nội dung tài liệu.';
          try { const errorData = await response.json(); errorMsg = errorData.message || errorMsg; } catch (e) { /* ignore */ }
          throw new Error(errorMsg);
        }
        let fileContent;
        const contentType = response.headers.get("content-type");
        if (contentType && contentType.indexOf("application/json") !== -1) {
            const data = await response.json();
            if (typeof data.content !== 'string') throw new Error('Nội dung tài liệu không hợp lệ từ API.');
            fileContent = data.content;
        } else {
            fileContent = await response.text();
        }
        if (typeof fileContent !== 'string') throw new Error('Không nhận được nội dung tài liệu dạng chuỗi.');
        const contentBytes = ethers.toUtf8Bytes(fileContent);
        const calculatedHash = ethers.keccak256(contentBytes);
        setDocumentHash(calculatedHash);
        setFeedback(`Lấy và hash nội dung thành công. Hash: ${calculatedHash}`);
      } catch (error) {
        console.error('Lỗi khi lấy hoặc hash nội dung tài liệu:', error);
        setFeedback(`Lỗi: ${error.message}`);
        setDocumentHash('');
      } finally {
        setIsLoading(false);
      }
    };
    fetchAndHashContent();
  }, [documentId]);

  const handleSign = async () => {
    if (!privateKeyHex || !documentHash) {
      setFeedback('Vui lòng nhập Private Key (Hex) và đảm bảo Document Hash đã được tính toán.');
      return;
    }
    if (!ethers.isHexString(documentHash) || documentHash.length !== 66) {
        setFeedback('Document Hash không hợp lệ. Phải là một chuỗi hex 0x... 66 ký tự.');
        return;
    }
    if (!ethers.isHexString(privateKeyHex) || privateKeyHex.length !== 66) {
        setFeedback('Private Key (Hex) không hợp lệ. Phải là một chuỗi hex 0x... 66 ký tự.');
        return;
    }

    setIsLoading(true);
    setFeedback('Đang ký bằng Private Key Hex...');
    try {
      const wallet = new ethers.Wallet(privateKeyHex);
      const messageBytes = ethers.getBytes(documentHash);
      const sig = await wallet.signMessage(messageBytes);
      
      setSignature(sig);
      setPublicKey(wallet.publicKey);
      setFeedback('Ký thành công bằng Private Key Hex! Chữ ký và Public Key đã được tạo.');
    } catch (error) {
      console.error('Lỗi khi ký bằng Private Key Hex:', error);
      setFeedback(`Lỗi khi ký: ${error.message}. Hãy chắc chắn Private Key (Hex) hợp lệ.`);
      setSignature('');
      setPublicKey('');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div style={{ padding: '20px', fontFamily: 'Arial, sans-serif', maxWidth: '600px', margin: 'auto' }}>
      <h2>Kiểm tra Ký Tài Liệu Phía Client (Với Private Key Hex)</h2>

      <div style={{ marginBottom: '15px' }}>
        <label htmlFor="docId" style={{ display: 'block', marginBottom: '5px' }}>Document ID:</label>
        <input type="text" id="docId" value={documentId} onChange={(e) => setDocumentId(e.target.value)} placeholder="Nhập ID tài liệu (ví dụ: 60c72b...)" style={{ width: '100%', padding: '8px', boxSizing: 'border-box' }}/>
      </div>
      <div style={{ marginBottom: '15px' }}>
        <label htmlFor="docHash" style={{ display: 'block', marginBottom: '5px' }}>Document Hash (tự động tính từ nội dung):</label>
        <input type="text" id="docHash" value={documentHash} readOnly placeholder="Hash sẽ được tính toán tự động" style={{ width: '100%', padding: '8px', boxSizing: 'border-box', backgroundColor: '#e9ecef' }}/>
      </div>

      <div style={{ marginBottom: '15px' }}>
        <label htmlFor="privKeyHex" style={{ display: 'block', marginBottom: '5px' }}>Private Key (Hex):</label>
        <input
          type="password"
          id="privKeyHex"
          value={privateKeyHex}
          onChange={(e) => setPrivateKeyHex(e.target.value)}
          placeholder="Dán Private Key (Hex) của bạn vào đây (ví dụ: 0x...64 ký tự hex)"
          style={{ width: '100%', padding: '8px', boxSizing: 'border-box', fontFamily: 'monospace' }}
        />
      </div>

      <button onClick={handleSign} disabled={isLoading || !privateKeyHex || !documentHash} style={{ padding: '10px 20px', marginRight: '10px', backgroundColor: '#007bff', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer' }}>
        {isLoading ? 'Đang xử lý...' : '1. Ký Tài Liệu (Với Key Hex)'}
      </button>

      {signature && publicKey && (
        <div style={{ marginTop: '20px', padding: '10px', border: '1px solid #eee', borderRadius: '4px', backgroundColor: '#f9f9f9' }}>
          <h4>Thông tin chữ ký (Client-side):</h4>
          <p style={{ wordBreak: 'break-all' }}><strong>Public Key:</strong> {publicKey}</p>
          <p style={{ wordBreak: 'break-all' }}><strong>Signature:</strong> {signature}</p>
        </div>
      )}

      {feedback && (
        <p style={{ marginTop: '20px', padding: '10px', backgroundColor: feedback.startsWith('Lỗi') ? '#ffdddd' : '#ddffdd', border: `1px solid ${feedback.startsWith('Lỗi') ? '#ff0000' : '#00aa00'}` }}>
          {feedback}
        </p>
      )}
    </div>
  );
}

export default TestClientSign; 