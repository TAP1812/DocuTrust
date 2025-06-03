# 📄 DocuTrust

<div align="center">
  <img src="./docutrust.jpg" alt="DocuTrust Logo" width="200"/>
  <p><em>Giải pháp quản lý, ký và xác thực tài liệu số an toàn</em></p>
</div>

## 📌 Giới thiệu

DocuTrust là một nền tảng quản lý tài liệu số hiện đại, tập trung vào tính bảo mật và xác thực thông qua việc sử dụng cặp khóa công khai-bí mật theo chuẩn Ethereum và chữ ký điện tử. Dự án cho phép người dùng:
- ✨ Quản lý tài liệu một cách an toàn và hiệu quả.
- 🔑 Tạo và quản lý cặp khóa Ethereum (Private Key, Public Key, Mnemonic Phrase) cho mục đích định danh và ký tài liệu.
- ✍️ Ký điện tử lên tài liệu, đảm bảo tính toàn vẹn và chống chối bỏ.
- 🔗 Xác minh tính hợp lệ của chữ ký trên tài liệu.
- 🤝 Chia sẻ tài liệu một cách an toàn (tính năng có thể mở rộng).
- 📱 Truy cập và quản lý tài liệu mọi lúc, mọi nơi thông qua giao diện web trực quan.

## ✨ Tính năng chính

- **Quản lý người dùng**: Đăng ký, đăng nhập.
- **Quản lý khóa Ethereum**:
    - Tạo cặp khóa mới (Private Key, Public Key, Mnemonic Phrase) ngay trên trình duyệt.
    - Nhắc nhở người dùng sao lưu khóa an toàn.
    - Public Key được lưu trữ để liên kết với tài khoản người dùng.
- **Quản lý tài liệu**:
    - Tạo/Tải lên tài liệu mới (hỗ trợ PDF, DOC, DOCX).
    - Liệt kê danh sách tài liệu với các trạng thái: "Chờ ký" (`pending`), "Đã ký" (`signed`).
    - Lọc tài liệu theo trạng thái.
    - Xem chi tiết thông tin tài liệu.
    - Xóa tài liệu.
- **Ký tài liệu**:
    - Người dùng ký tài liệu bằng Private Key của họ.
    - Lưu trữ chữ ký kèm theo thông tin người ký.
    - Cập nhật trạng thái tài liệu sau khi ký.
- **Xác minh chữ ký**: API backend cho phép xác minh tính hợp lệ của các chữ ký trên tài liệu dựa trên nội dung tài liệu và public key của người ký.
- **Dashboard**:
    - Hiển thị thông tin chào mừng người dùng.
    - Thống kê nhanh về số lượng tài liệu (đã tạo, chờ ký, đã ký).
    - Các thao tác nhanh (Tải lên, xem danh sách tài liệu theo trạng thái).

## 🚀 Công nghệ sử dụng

### Backend
- **Node.js**: Nền tảng JavaScript runtime.
- **Express.js**: Web application framework cho Node.js.
- **MongoDB**: Cơ sở dữ liệu NoSQL.
- **Mongoose**: ODM library cho MongoDB và Node.js.
- **JSON Web Tokens (JWT)**: Cho xác thực người dùng.
- **ethers.js**: Thư viện để tương tác với các chức năng liên quan đến Ethereum (ví dụ: tạo ví, thao tác với địa chỉ/khóa, xác minh chữ ký).
- **Multer**: Middleware cho việc xử lý file upload.
- **bcryptjs**: Thư viện để mã hóa mật khẩu.

### Frontend
- **React.js**: Thư viện JavaScript để xây dựng giao diện người dùng.
- **Material-UI (MUI)**: Bộ thư viện component UI cho React.
- **React Router DOM**: Cho việc định tuyến (routing) trong ứng dụng React.
- **Axios**: HTTP client để thực hiện các yêu cầu API.
- **ethers.js**: Thư viện để tạo cặp khóa Ethereum và ký message/hash ở phía client.
- **date-fns**: Thư viện tiện ích cho việc định dạng ngày giờ.

## 📁 Cấu trúc dự án (Tổng quan)

```
DocuTrust/
├── backend/              # Mã nguồn phía server
│   ├── models/           # Định nghĩa Mongoose Schemas (User.js, Document.js)
│   ├── routes/           # Định nghĩa API routes (auth.js, documents.js, dashboard.js)
│   ├── uploads/          # Thư mục (tự động tạo) để lưu trữ file tải lên (nếu có)
│   ├── .env.example      # File ví dụ cho biến môi trường
│   └── server.js         # File khởi tạo server chính
│
├── frontend/             # Mã nguồn phía client
│   ├── public/           # Các file tĩnh (index.html, favicon, manifest)
│   ├── src/              # Mã nguồn chính của React app
│   │   ├── assets/       # Hình ảnh, fonts,...
│   │   ├── components/   # Các UI components tái sử dụng
│   │   ├── hooks/        # Custom React hooks (ví dụ: useDocuments.js)
│   │   ├── pages/        # Các page components chính (Register, Login, Dashboard, DocumentList, ...)
│   │   ├── services/     # (Có thể có) Các module xử lý gọi API
│   │   ├── App.js        # Component gốc của ứng dụng
│   │   ├── index.js      # Điểm vào của ứng dụng React
│   │   └── theme.js      # (Có thể có) Cấu hình theme cho Material-UI
│   └── package.json
│
├── docs/                 # Tài liệu, hình ảnh cho README (nếu có, ví dụ ./docutrust.jpg có thể nằm ở gốc hoặc đây)
└── README.md             # File README này
```

## 🛠️ Cài đặt và Chạy dự án

### Yêu cầu hệ thống
- Node.js (v14 trở lên được khuyến nghị)
- npm (hoặc yarn)
- MongoDB instance đang chạy

### Backend

```bash
# Di chuyển vào thư mục backend
cd backend

# Cài đặt dependencies
npm install

# Tạo file .env từ mẫu và cấu hình các biến môi trường
# Ví dụ: PORT, MONGODB_URI, JWT_SECRET
cp .env.example .env 
# (Chỉnh sửa file .env với các giá trị thực tế)

# Chạy server ở môi trường development (thường có hot-reloading)
npm run dev 

# Hoặc chạy server (thường cho production)
npm start
```
Server backend mặc định sẽ chạy tại `http://localhost:3001` (hoặc cổng bạn cấu hình trong `.env`).

### Frontend

```bash
# Từ thư mục gốc, di chuyển vào thư mục frontend
cd frontend

# Cài đặt dependencies
npm install

# Chạy ứng dụng React (development server)
npm start
```
Ứng dụng frontend sẽ chạy tại `http://localhost:3000` và sẽ tự động mở trong trình duyệt.

## ⚙️ API Endpoints chính (Backend)

Dưới đây là một số API endpoint quan trọng được cung cấp bởi backend:

| Method | Endpoint                      | Mô tả                                                                 |
|--------|-------------------------------|-----------------------------------------------------------------------|
| POST   | `/api/register`               | Đăng ký người dùng mới (kèm public key).                              |
| POST   | `/api/login`                  | Đăng nhập người dùng.                                                 |
| GET    | `/api/dashboard`              | Lấy dữ liệu thống kê cho dashboard (số lượng tài liệu).               |
| POST   | `/api/documents`              | Tạo mới/upload tài liệu.                                              |
| GET    | `/api/documents`              | Lấy danh sách tài liệu (có thể lọc theo `userId` và `status`).        |
| GET    | `/api/documents/:id`          | Lấy chi tiết một tài liệu cụ thể.                                    |
| GET    | `/api/documents/:id/file-content` | Lấy nội dung file của một tài liệu.                                  |
| POST   | `/api/documents/:id/sign`     | Ký một tài liệu (gửi chữ ký từ client).                               |
| POST   | `/api/documents/:id/verify`   | Xác minh tất cả chữ ký trên một tài liệu.                             |
| POST   | `/api/documents/:id/share`    | (Dự kiến) Chia sẻ tài liệu cho người dùng khác.                        |
| DELETE | `/api/documents/:id`          | Xóa một tài liệu.                                                     |

*(Lưu ý: Một số API có thể yêu cầu JWT token trong header `Authorization` để xác thực)*

## 🌊 Luồng hoạt động cơ bản

1.  **Đăng ký**: Người dùng mới cung cấp thông tin (Họ tên, Email, Username, Mật khẩu). Hệ thống sẽ hướng dẫn tạo cặp khóa Ethereum (Private Key, Mnemonic, Public Key). Public Key sẽ được gửi lên server cùng thông tin đăng ký.
2.  **Đăng nhập**: Người dùng đăng nhập bằng Username và Mật khẩu.
3.  **Dashboard**: Sau khi đăng nhập, người dùng được chuyển đến Dashboard, nơi hiển thị tổng quan và các lối tắt.
4.  **Tạo/Tải lên tài liệu**: Người dùng có thể tạo tài liệu mới hoặc tải lên file có sẵn.
5.  **Xem danh sách & Chi tiết**: Xem danh sách các tài liệu, lọc theo trạng thái (chờ ký, đã ký), xem chi tiết từng tài liệu.
6.  **Ký tài liệu**: Người dùng sử dụng Private Key của mình để ký lên các tài liệu được chỉ định (chữ ký được tạo ở client và gửi lên server).
7.  **Xác minh (ngầm hoặc chủ động)**: Hệ thống (hoặc người dùng khác) có thể xác minh tính hợp lệ của các chữ ký trên tài liệu.

## 🧪 Testing (Ví dụ)

```bash
# Chạy unit tests cho backend (nếu có)
cd backend
npm test

# Chạy unit tests cho frontend (nếu có)
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

Dự án được phân phối dưới giấy phép MIT. Xem `LICENSE` (nếu có) để biết thêm thông tin.

## 📞 Liên hệ

- Website: [docutrust.com](https://docutrust.com) (Ví dụ)
- Email: support@docutrust.com (Ví dụ)
- GitHub: [github.com/your-username/docutrust](https://github.com/your-username/docutrust) (Thay thế bằng link dự án thực tế)

---
<div align="center">
  <p>Made with ❤️ by DocuTrust Team</p>
</div>