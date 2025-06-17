# 📄 DocuTrust

<div align="center">
  <img src="./docutrust.jpg" alt="DocuTrust Logo" width="200"/>
  <p><em>Giải pháp quản lý, ký và xác thực tài liệu số an toàn</em></p>
</div>

## 📌 Giới thiệu

DocuTrust là một nền tảng quản lý tài liệu số hiện đại, tập trung vào tính bảo mật và xác thực thông qua việc sử dụng cặp khóa công khai-bí mật và chữ ký điện tử. Dự án cho phép người dùng:
- ✨ Quản lý tài liệu một cách an toàn và hiệu quả.
- 🔑 Tạo và quản lý cặp khóa (Private Key, Public Key, Mnemonic Phrase) cho mục đích định danh và ký tài liệu.
- ✍️ Ký điện tử lên tài liệu, đảm bảo tính toàn vẹn và chống chối bỏ.
- 🔗 Xác minh tính hợp lệ của chữ ký trên tài liệu.
- 🤝 Chia sẻ tài liệu một cách an toàn (tính năng có thể mở rộng).
- 📱 Truy cập và quản lý tài liệu mọi lúc, mọi nơi thông qua giao diện web trực quan.

## ✨ Tính năng chính

- **Quản lý người dùng**: Đăng ký, đăng nhập.
- **Quản lý khóa**:
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

## 🏛️ Core Architecture

DocuTrust xoay quanh việc đảm bảo tính toàn vẹn và xác thực của tài liệu số thông qua chữ ký điện tử dựa trên mật mã khóa công khai. Dưới đây là ý tưởng cốt lõi:

### Luồng ký và xác thực tài liệu cốt lõi

Quy trình này sử dụng các tiêu chuẩn mật mã mạnh mẽ, cụ thể là thuật toán băm **SHA-256** (hoặc một thuật toán an toàn tương đương trong họ SHA-2) và thuật toán ký **ECDSA (Elliptic Curve Digital Signature Algorithm)** trên đường cong secp256k1.

1.  **Tạo Hash Tài liệu (Phía Client/Server)**:
    *   Khi một tài liệu cần được ký, nội dung của tài liệu đó (thường là dưới dạng bytes) sẽ được đưa qua thuật toán băm **SHA-256**. Thao tác này tạo ra một chuỗi hash (ví dụ: một chuỗi 32-byte) duy nhất đại diện cho tài liệu.
    *   Trong `ethers.js`, bạn có thể sử dụng `ethers.utils.sha256()` hoặc `ethers.utils.keccak256()` (thường được ưu tiên trong ngữ cảnh blockchain cho một số mục đích nhất định, nhưng SHA-256 là một lựa chọn mạnh mẽ và phổ biến cho việc băm nội dung file).
    *   Việc này đảm bảo rằng dù tài liệu có lớn đến đâu, chữ ký cũng chỉ cần thực hiện trên một chuỗi hash có kích thước cố định.

2.  **Ký Hash bằng Private Key (Phía Client, sử dụng `ethers.js`)**:
    *   Người dùng (chủ sở hữu tài liệu hoặc người được ủy quyền ký) sẽ sử dụng **Private Key** của mình để ký lên chuỗi hash đã tạo ở bước 1. Thao tác này được thực hiện hoàn toàn ở phía client để đảm bảo Private Key không bao giờ bị lộ.
    *   Thư viện `ethers.js` cung cấp phương thức `signer.signMessage()` hoặc `signer.signDigest()` (nếu bạn đã có digest/hash) để thực hiện việc ký. Ví dụ: `const signature = await wallet.signMessage(ethers.utils.arrayify(documentHash));` (nếu `documentHash` là hex string, `arrayify` chuyển nó thành `Uint8Array` mà `signMessage` thường mong đợi cho message tùy ý, hoặc trực tiếp ký digest).
    *   Quá trình ký này sử dụng thuật toán **ECDSA** để tạo ra một **Chữ ký số (Digital Signature)**. Chữ ký này là bằng chứng mật mã rằng người sở hữu Private Key tương ứng đã chấp thuận nội dung tài liệu (đại diện bởi hash).

3.  **Lưu trữ Tài liệu, Hash, Chữ ký và Public Key (Phía Server)**:
    *   Tài liệu gốc (hoặc một tham chiếu đến nó), chuỗi hash của tài liệu (đã tính ở bước 1), chữ ký số (thu được ở bước 2), và Public Key của người ký (hoặc địa chỉ, có thể suy ra từ Public Key) sẽ được gửi lên server và lưu trữ.
    *   Public Key được liên kết với tài khoản người dùng và được sử dụng trong quá trình xác minh.

4.  **Xác minh Chữ ký (Phía Client/Server, sử dụng `ethers.js`)**:
    *   Để xác minh tính hợp lệ của một tài liệu đã ký, quy trình sau được thực hiện:
        *   **Lấy tài liệu gốc, chữ ký số đã lưu, và Public Key (hoặc địa chỉ) của người ký.**
        *   **Tính toán lại hash của tài liệu gốc** bằng cùng một thuật toán băm (ví dụ: **SHA-256**) đã sử dụng ở bước 1.
        *   **Sử dụng Public Key (hoặc địa chỉ) của người ký để xác minh chữ ký.** Thư viện `ethers.js` cung cấp hàm `ethers.utils.verifyMessage()` hoặc `ethers.utils.recoverAddress()` (nếu bạn muốn lấy lại địa chỉ đã ký từ hash và chữ ký) để thực hiện việc này. Ví dụ: `const recoveredAddress = ethers.utils.verifyMessage(ethers.utils.arrayify(documentHash), signature);`
        *   So sánh địa chỉ thu được từ việc xác minh chữ ký (`recoveredAddress`) với địa chỉ của người ký đã biết.
    *   Nếu địa chỉ này khớp nhau, điều đó có nghĩa là:
        *   **Tính toàn vẹn**: Tài liệu không bị thay đổi kể từ khi nó được ký (vì hash khớp).
        *   **Tính xác thực**: Chữ ký thực sự được tạo bởi người sở hữu Private Key tương ứng với Public Key/địa chỉ đã được sử dụng để xác minh.
        *   **Chống chối bỏ**: Người ký không thể phủ nhận rằng họ đã ký tài liệu.

Ý tưởng này tận dụng sức mạnh của mật mã bất đối xứng (public-key cryptography) và các thư viện như `ethers.js` để tạo ra một hệ thống đáng tin cậy cho việc quản lý và xác thực tài liệu điện tử.

## 🚀 Công nghệ sử dụng

### Backend
- **Node.js**: Nền tảng JavaScript runtime.
- **Express.js**: Web application framework cho Node.js.
- **MongoDB**: Cơ sở dữ liệu NoSQL.
- **Mongoose**: ODM library cho MongoDB và Node.js.
- **JSON Web Tokens (JWT)**: Cho xác thực người dùng.
- **ethers.js**: Thư viện để tương tác với các chức năng liên quan đến mật mã (ví dụ: tạo ví, thao tác với địa chỉ/khóa, xác minh chữ ký).
- **Multer**: Middleware cho việc xử lý file upload.
- **bcryptjs**: Thư viện để mã hóa mật khẩu.

### Frontend
- **React.js**: Thư viện JavaScript để xây dựng giao diện người dùng.
- **Material-UI (MUI)**: Bộ thư viện component UI cho React.
- **React Router DOM**: Cho việc định tuyến (routing) trong ứng dụng React.
- **Axios**: HTTP client để thực hiện các yêu cầu API.
- **ethers.js**: Thư viện để tạo cặp khóa và ký message/hash ở phía client.
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

1.  **Đăng ký**: Người dùng mới cung cấp thông tin (Họ tên, Email, Username, Mật khẩu). Hệ thống sẽ hướng dẫn tạo cặp khóa (Private Key, Mnemonic, Public Key). Public Key sẽ được gửi lên server cùng thông tin đăng ký.
2.  **Đăng nhập**: Người dùng đăng nhập bằng Username và Mật khẩu.
3.  **Dashboard**: Sau khi đăng nhập, người dùng được chuyển đến Dashboard, nơi hiển thị tổng quan và các lối tắt.
4.  **Tạo/Tải lên tài liệu**: Người dùng có thể tạo tài liệu mới hoặc tải lên file có sẵn.
5.  **Xem danh sách & Chi tiết**: Xem danh sách các tài liệu, lọc theo trạng thái (chờ ký, đã ký), xem chi tiết từng tài liệu.
6.  **Ký tài liệu**: Người dùng sử dụng Private Key của mình để ký lên các tài liệu được chỉ định (chữ ký được tạo ở client và gửi lên server).
7.  **Xác minh (ngầm hoặc chủ động)**: Hệ thống (hoặc người dùng khác) có thể xác minh tính hợp lệ của các chữ ký trên tài liệu.

## 📝 Use Cases / Ứng dụng thực tế

DocuTrust có thể được ứng dụng trong nhiều lĩnh vực và tình huống khác nhau, nơi mà tính toàn vẹn, xác thực và chống chối bỏ của tài liệu là quan trọng:

*   **Hợp đồng điện tử (Legal Contracts)**:
    *   Ký kết và quản lý hợp đồng lao động, hợp đồng dịch vụ, thỏa thuận mua bán.
    *   Xác thực các thỏa thuận bảo mật thông tin (NDA).
    *   Lưu trữ an toàn các văn bản pháp lý quan trọng với bằng chứng ký không thể thay đổi.
*   **Tài liệu tài chính (Financial Documents)**:
    *   Phê duyệt và ký hóa đơn, đơn đặt hàng.
    *   Xác nhận báo cáo tài chính, kế hoạch ngân sách.
    *   Quản lý các thỏa thuận vay vốn, đầu tư.
*   **Quy trình nội bộ doanh nghiệp (Internal Business Processes)**:
    *   Số hóa và ký các đề xuất dự án, báo cáo công việc.
    *   Quản lý tài liệu nhân sự: đơn xin nghỉ phép, đánh giá hiệu suất, biên bản cuộc họp.
    *   Phê duyệt các yêu cầu thay đổi, tài liệu chất lượng.
*   **Sở hữu trí tuệ và Sáng tạo (Intellectual Property & Creative Works)**:
    *   Xác thực thời điểm tạo và quyền tác giả cho các bản thảo, tài liệu nghiên cứu.
    *   Bảo vệ các thiết kế, mã nguồn, hoặc tác phẩm nghệ thuật số.
*   **Hồ sơ y tế và Chấp thuận (Healthcare Records & Consents)**:
    *   *Lưu ý: Cần tuân thủ các quy định bảo mật dữ liệu y tế nghiêm ngặt như HIPAA hoặc các quy định tương đương của địa phương.*
    *   Bệnh nhân ký điện tử các biểu mẫu chấp thuận điều trị, ủy quyền.
    *   Quản lý an toàn các hồ sơ y tế cần chữ ký xác thực.
*   **Giáo dục và Chứng chỉ (Education & Certifications)**:
    *   Cấp và xác minh các chứng chỉ hoàn thành khóa học, bằng cấp dưới dạng kỹ thuật số.
    *   Giảng viên và sinh viên ký vào các biểu mẫu, đồ án.
*   **Chuỗi cung ứng và Logistics (Supply Chain & Logistics)**:
    *   Ký và xác thực các vận đơn, tài liệu giao nhận hàng hóa.
    *   Đảm bảo tính minh bạch và truy xuất nguồn gốc của tài liệu trong chuỗi cung ứng.

Nền tảng DocuTrust giúp giảm thiểu rủi ro giả mạo, tăng cường hiệu quả và đơn giản hóa quy trình làm việc với tài liệu số trong các trường hợp này.

---
