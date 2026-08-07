# Tuần 5 (Angular 19): Ghép REST API Backend & Tích Hợp HttpClient

Ứng dụng Angular 19 SPA hoàn chỉnh được tích hợp với **REST API Backend Standalone**, tích hợp cơ chế xác thực Token, phân trang.

---

## 🎯 Mục Tiêu & Kỹ Thuật Áp Dụng

- **Tích hợp Angular HttpClient**:
  - Cấu hình ứng dụng sử dụng `provideHttpClient(withFetch())` chuẩn Angular 19.
  - Tự động gắn mác Bearer Token trong Header `Authorization: Bearer <token>` thông qua `ApiService`.
- **Đầy đủ Các Thao Tác HTTP (CRUD)**:
  - `GET /users/`: Lấy danh sách người dùng có hỗ trợ phân trang (`page`, `per_page`, `total_pages`).
  - `POST /login/`: Đăng nhập & lấy Bearer Token xác thực.
  - `POST /users/`: Thêm người dùng mới.
  - `PUT /users/?id=X`: Cập nhật thông tin người dùng.
  - `DELETE /users/?id=X`: Xóa người dùng khỏi hệ thống.
- **Bảo Vệ Route (AuthGuard & GuestGuard)**:
  - Bảo đảm trải nghiệm ứng dụng mượt mượt, chuyển hướng hợp lý dựa vào trạng thái xác thực người dùng.

---

## 📂 Cấu Trúc Dự Án

```text
tuan5-angular/
├── src/app/
│   ├── components/
│   │   └── user-modal/        # Modal UI cho các thao tác CRUD
│   ├── guards/                # Guard kiểm tra đăng nhập & quyền truy cập
│   ├── models/                # User, UserForm, UserListResponse, LoginResponse interfaces
│   ├── pages/
│   │   ├── login/             # Trang Đăng nhập ghép REST API
│   │   └── users/             # Trang Quản lý Người dùng (Table + Pagination + Search)
│   ├── services/
│   │   ├── api.service.ts     # Service chính xử lý gọi HTTP REST API & Fallback
│   │   └── auth.service.ts    # Service quản lý trạng thái Token & Auth Session
│   ├── app.routes.ts          # Định tuyến ứng dụng
│   └── app.config.ts          # Angular Config (provideHttpClient)
```

---

## 🚀 Hướng Dẫn Khởi Chạy

Cài đặt Phụ thuộc & Khởi chạy Angular App
```bash
cd tuan5-angular

# Cài đặt package
npm install

# Chạy server phát triển
npm start
# hoặc: ng serve
```

Truy cập ứng dụng tại: `http://localhost:4200/`

---

## 🛠️ Các Lệnh Khác

- **Build Production**: `npm run build`
- **Chạy Unit Test**: `npm test`
