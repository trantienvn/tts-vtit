# Tuần 2 (Angular 19): Quản Lý Người Dùng & LocalStorage CRUD

Ứng dụng Single Page Application (SPA) xây dựng trên nền tảng **Angular 19** với kiến trúc **Standalone Components**, quản lý state với **Angular Signals**, và lưu trữ dữ liệu bằng **LocalStorage**.

---

## 🎯 Mục Tiêu & Tính Năng Nổi Bật

- **Kiến trúc Angular 19 Hiện đại**:
  - Sử dụng 100% **Standalone Components** kết hợp với **Reactive Forms** để quản lý form.
  - Sử dụng **Angular Signals** (`signal()`, `computed()`) cho quản lý trạng thái mượt mà, tối ưu performance.
- **Bảo vệ Route (Route Guards)**:
  - `AuthGuard`: Ngăn truy cập trang `/users` nếu chưa đăng nhập.
  - `GuestGuard`: Chuyển hướng người dùng đã đăng nhập khỏi trang `/login`.
- **Quản lý Người dùng (CRUD Modal)**:
  - Bảng danh sách người dùng đầy đủ các cột: `STT`, `Avatar`, `Họ`, `Tên`, `Email` và nút Thao tác.
  - Modal **Thêm mới**, **Chỉnh sửa**, **Xóa** người dùng hoạt động phản hồi nhanh chóng.
  - Tự động đồng bộ và lưu trữ dữ liệu bền vững qua `localStorage`.

---

## 📂 Cấu Trúc Dự Án

```text
tuan2-angular/
├── src/app/
│   ├── components/
│   │   └── user-modal/      # Modal Thêm/Sửa/Xóa Người dùng
│   ├── guards/              # AuthGuard & GuestGuard
│   ├── models/              # TypeScript Interfaces (User, Account)
│   ├── pages/
│   │   ├── login/           # Trang Đăng nhập (Reactive Form + Lockout logic)
│   │   └── users/           # Trang Quản lý Người dùng (Table + Pagination + Search)
│   ├── services/
│   │   ├── auth.service.ts  # Service quản lý Đăng nhập/Đăng xuất & Session
│   │   └── user.service.ts  # Service quản lý dữ liệu người dùng (LocalStorage CRUD)
│   ├── app.routes.ts        # Cấu hình Routing & Guards
│   └── app.config.ts        # Application Providers
```

---

## 🚀 Hướng Dẫn Khởi Chạy

### 1. Cài đặt Phụ thuộc (Dependencies)
```bash
cd tuan2-angular
npm install
```

### 2. Khởi động Dev Server
```bash
npm start
# hoặc: ng serve
```

Ứng dụng sẽ chạy tại địa chỉ: `http://localhost:4200/`

---

## 🛠️ Các Lệnh Khác

- **Build Production**: `npm run build`
- **Chạy Unit Test**: `npm test`
