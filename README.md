# 📄 DocuTrust

<div align="center">
  <img src="docs/images/logo.png" alt="DocuTrust Logo" width="200"/>
  <p><em>Giải pháp quản lý và xác thực tài liệu số thông minh</em></p>
</div>

## 📌 Giới thiệu

DocuTrust là một nền tảng quản lý và xác thực tài liệu số hiện đại, giúp doanh nghiệp và cá nhân:
- ✨ Quản lý tài liệu một cách hiệu quả
- 🔒 Bảo mật và xác thực tài liệu
- 📱 Truy cập mọi lúc, mọi nơi
- 🤝 Chia sẻ và cộng tác dễ dàng

## 🚀 Công nghệ sử dụng

### Backend
- Node.js
- Express.js
- MongoDB
- JWT Authentication

### Frontend
- React.js
- Material-UI
- Redux
- Axios

## 📁 Cấu trúc dự án

```
DocuTrust/
├── backend/         # Mã nguồn phía server
│   ├── src/        # Source code
│   ├── tests/      # Unit tests
│   └── config/     # Cấu hình
│
├── frontend/        # Mã nguồn phía client
│   ├── src/        # Source code
│   ├── public/     # Static files
│   └── tests/      # Unit tests
│
└── docs/           # Tài liệu
```

## 🛠️ Cài đặt và Chạy dự án

### Yêu cầu hệ thống
- Node.js (v14 trở lên)
- npm hoặc yarn
- MongoDB

### Backend

```bash
# Di chuyển vào thư mục backend
cd backend

# Cài đặt dependencies
npm install

# Tạo file .env từ mẫu
cp .env.example .env

# Chạy ở môi trường development
npm run dev

# Chạy ở môi trường production
npm start
```

### Frontend

```bash
# Di chuyển vào thư mục frontend
cd frontend

# Cài đặt dependencies
npm install

# Chạy ứng dụng
npm start
```

Ứng dụng sẽ chạy tại `http://localhost:3000`

## 📝 API Documentation

API documentation có thể được truy cập tại:
- Development: `http://localhost:5000/api-docs`
- Production: `https://api.docutrust.com/api-docs`

## 🧪 Testing

```bash
# Chạy unit tests cho backend
cd backend
npm test

# Chạy unit tests cho frontend
cd frontend
npm test
```

## 🤝 Đóng góp

Chúng tôi luôn chào đón mọi đóng góp! Hãy làm theo các bước sau:
1. Fork dự án
2. Tạo branch mới (`git checkout -b feature/AmazingFeature`)
3. Commit thay đổi (`git commit -m 'Add some AmazingFeature'`)
4. Push lên branch (`git push origin feature/AmazingFeature`)
5. Tạo Pull Request

## 📄 License

Dự án được phân phối dưới giấy phép MIT. Xem `LICENSE` để biết thêm thông tin.

## 📞 Liên hệ

- Website: [docutrust.com](https://docutrust.com)
- Email: support@docutrust.com
- GitHub: [github.com/docutrust](https://github.com/docutrust)

---
<div align="center">
  <p>Made with ❤️ by DocuTrust Team</p>
</div>