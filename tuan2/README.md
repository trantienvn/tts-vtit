# Tuần 2: Logic Xác Thực Form & Trang Quản Lý Người Dùng (Vanilla JavaScript)

Thực hành lập trình logic tương tác người dùng bằng **Vanilla JavaScript (ES6+)** cho ứng dụng VSS Chat Platform.

---

## 🎯 Mục Tiêu & Tính Năng Nổi Bật

- **Xác thực dữ liệu (Form Validation)**: 
  - Kiểm tra định dạng Email và độ dài Mật khẩu tức thì khi nhập dữ liệu (Real-time).
  - Hiển thị thông báo lỗi rõ ràng bên dưới từng trường nhập liệu.
- **Tính năng Ẩn/Hiện Mật khẩu**: 
  - Nút Toggle chuyển đổi hiển thị mật khẩu với icon Eye mượt mà.
- **Giới hạn Đăng nhập sai (Security Lockout)**:
  - Tự động **khóa tạm thời Form trong 30 giây** khi người dùng nhập sai **5 lần liên tiếp**.
  - Hiển thị đếm ngược thời gian (Realtime Countdown) trước khi cho phép thử lại.
- **Trang Quản lý Người dùng (`users.html`)**:
  - Giao diện danh sách người dùng chuẩn mực, hiển thị bảng gồm: `STT`, `Avatar`, `Họ`, `Tên`, `Email` và nút Thao tác.

---

## 📂 Cấu Trúc Thư Mục

```text
tuan2/
├── login.html    # Trang Đăng nhập với đầy đủ logic JS xác thực & khóa form
├── users.html    # Trang Danh sách Người dùng (User Management Table)
└── style.css     # Style giao diện cho cả 2 trang
```

---

## 🚀 Hướng Dẫn Khởi Chạy

1. Mở file `login.html` bằng trình duyệt để trải nghiệm tính năng Đăng nhập, Validation và Security Lockout.
2. Mở file `users.html` để xem giao diện Danh sách Người dùng.
3. Hoặc khởi chạy bằng **Live Server** trên VS Code.
