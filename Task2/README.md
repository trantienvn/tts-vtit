# 🚀 Lộ Trình Đào Tạo Angular & RxJS — 3 Tuần (15 Ngày)

## 📌 Tổng Quan Lộ Trình

| Tuần | Trọng tâm | Kết quả cuối tuần |
| :--- | :--- | :--- |
| **Tuần 1** | **Angular nền tảng + NgZorro + RxJS cơ bản** | Có project, layout hoàn chỉnh, CRUD UI sinh viên, hiểu Observable/Subject. |
| **Tuần 2** | **RxJS Operator + Xử lý dữ liệu nâng cao** | Hiểu rõ operators (map, filter, switchMap, debounceTime...) & áp dụng vào Search/Filter/API. |
| **Tuần 3** | **API + Error Handling + Hoàn thiện Dự án** | Kết nối Backend API, xử lý lỗi tập trung, hoàn thiện ứng dụng & Demo toàn bộ Checklist. |

---

## 📅 TUẦN 1 — Nền Tảng Angular + NgZorro + RxJS Cơ Bản

---

### 🔹 Ngày 1 — Khởi Tạo Project & Cấu Trúc Nền Tảng

#### 🎯 Nội dung thực hiện
- Tạo Angular Project mới sử dụng Angular CLI với **Standalone Components** và cấu hình **SCSS**.
- Thiết lập Angular Routing & Xây dựng cấu trúc thư mục tiêu chuẩn (`core`, `shared`, `features`).
- Tích hợp thư viện UI **NG-ZORRO (ng-zorro-antd)**.
- Khởi tạo Repository Git và dựng Layout khung ứng dụng cơ bản.

#### 📁 Cấu trúc thư mục kiến trúc
```text
src/app/
├── core/                   # Chứa Singleton Services, Interceptors, Guards, Core Models
│   └── index.ts
├── shared/                 # Chứa Reusable Components, Directives, Pipes
│   └── index.ts
├── features/               # Các mô-đun tính năng chính của ứng dụng
│   ├── dashboard/          # Màn hình Dashboard & Analytics
│   ├── students/           # Màn hình Quản lý Sinh viên
│   └── rxjs-demo/          # Màn hình Demo & Playground RxJS
├── app.component.ts        # Root Component
├── app.component.html      # Main Layout Template
├── app.component.scss      # Main Layout Stylesheet
├── app.routes.ts           # Cấu hình Routing ứng dụng
└── app.config.ts           # Application Config & Providers
```

#### 🛠️ Kiến thức áp dụng
- **Angular Core**: Angular CLI, Standalone Component, Template Binding, Dependency Injection, Service.
- **NG-ZORRO Modules**: `NzLayoutModule`, `NzSiderModule`, `NzHeaderModule`, `NzContentModule`, `NzMenuModule`, `NzBreadCrumbModule`.

### 🔹 Ngày 2 — NgZorro Layout + Navigation hoàn chỉnh

#### 🎯 Nội dung thực hiện
Xây dựng giao diện Layout tổng thể theo sơ đồ khung wireframe tiêu chuẩn với 3 màn hình tính năng (**Dashboard**, **Students**, **RxJS Demo**).

#### 📐 Sơ đồ Bố cục Layout (Wireframe)
```text
┌────────────────────────────────────────────────────────┐
│ Header (Thanh tiêu đề Top-bar toàn màn hình)           │
├───────────────┬────────────────────────────────────────┤
│               │ Breadcrumb (Thanh đường dẫn vị trí)    │
│    Sidebar    ├────────────────────────────────────────┤
│  (Menu điều   │                                        │
│    hướng)     │                Content                 │
│               │       (Khu vực hiển thị tính năng)     │
│ - Dashboard   │                                        │
│ - Students    │                                        │
│ - RxJS Demo   │                                        │
│               │                                        │
└───────────────┴────────────────────────────────────────┘
```

#### 🛠️ Các Module & Directive áp dụng
- **NgZorro UI**: `NzLayoutModule`, `NzMenuModule`, `NzBreadCrumbModule`, `NzIconModule`, `NzButtonModule`, `NzDropdownModule`.
- **Angular Router**: `RouterLink`, `RouterOutlet`, Route configuration, Active Route Matching (`nzMatchRouter`).

#### 💡 Mã nguồn Layout tiêu biểu (`app.component.html`)
```html
<nz-layout class="app-layout">
  <!-- Header -->
  <nz-header class="app-header">
    <div class="brand-title">Task2</div>
  </nz-header>

  <nz-layout class="main-body-layout">
    <!-- Sidebar Navigation -->
    <nz-sider nzWidth="220px" class="app-sider" nzTheme="light">
      <ul nz-menu nzMode="inline">
        <li nz-menu-item nzMatchRouter><a routerLink="/dashboard"><span nz-icon nzType="dashboard"></span>Dashboard</a></li>
        <li nz-menu-item nzMatchRouter><a routerLink="/students"><span nz-icon nzType="team"></span>Students</a></li>
        <li nz-menu-item nzMatchRouter><a routerLink="/rxjs-demo"><span nz-icon nzType="thunderbolt"></span>RxJS Demo</a></li>
      </ul>
    </nz-sider>

    <!-- Right Column (Breadcrumb + Content) -->
    <nz-layout class="right-column-layout">
      <div class="breadcrumb-bar">
        <nz-breadcrumb>
          <nz-breadcrumb-item>Home</nz-breadcrumb-item>
          <nz-breadcrumb-item>{{ currentRouteName }}</nz-breadcrumb-item>
        </nz-breadcrumb>
      </div>

      <nz-content class="app-content-container">
        <router-outlet></router-outlet>
      </nz-content>
    </nz-layout>
  </nz-layout>
</nz-layout>
```

---

### 🔹 Ngày 3 — NgZorro Form + Data Display

#### 🎯 Nội dung thực hiện
- Thiết kế màn hình **Student List** (Hiển thị dữ liệu danh sách) và **Student Form** (Biểu mẫu nhập liệu sinh viên).
- Sử dụng **Reactive Forms** trong Angular để quản lý trạng thái form và validate dữ liệu đầu vào.

#### 🛠️ Thành phần NgZorro & Angular Reactive Forms
- **Data Display Components**: `nz-card`, `nz-table`, `nz-tag`, `nz-badge`, `nz-alert`, `nz-statistic`, `nz-progress`, `nz-empty`.
- **Form Controls**: `nz-input`, `nz-select`, `nz-radio`, `nz-checkbox`, `nz-switch`, `nz-input-number`, `nz-date-picker`.
- **Reactive Forms API**: `FormGroup`, `FormControl`, `FormBuilder`, `Validators`.

#### 📋 Cấu trúc thông tin Sinh viên (Student Model)
| Trường dữ liệu | Kiểu dữ liệu | Kiểm tra hợp lệ (Validators) |
| :--- | :--- | :--- |
| **Họ tên** | `string` | Required, MinLength(3) |
| **Email** | `string` | Required, Email format |
| **Giới tính** | `'Nam' \| 'Nữ' \| 'Khác'` | Required |
| **Lớp học** | `string` | Required |
| **Ngày sinh** | `Date` | Required |
| **Trạng thái** | `'Active' \| 'Graduated' \| 'Suspended'` | Required |
---

### 🔹 Ngày 4 — NgZorro Service + Feedback UI

#### 🎯 Nội dung thực hiện
- Tạo `StudentService` để đóng gói toàn bộ logic xử lý dữ liệu CRUD (Ban đầu thao tác trên dữ liệu Mock State).
- Tích hợp các bộ dịch vụ phản hồi người dùng (Feedback Services) từ NG-ZORRO.

#### 🛠️ Các Feedback Services & Components
- **`NzModalService`**: Hiển thị hộp thoại Modal xác nhận hoặc chứa Form thêm/sửa.
- **`NzDrawerService`**: Hiển thị bảng trượt Drawer chứa thông tin chi tiết.
- **`NzMessageService`**: Hiển thị thông báo nhanh (Toast message: success, error, warning).
- **`NzNotificationService`**: Hiển thị thông báo góc màn hình với thông tin đầy đủ.
- **`NzPopconfirm`**: Hộp thoại Pop-up xác nhận trực tiếp tại nút bấm (ví dụ: Xóa).
- **`NzSpin`**: Biểu tượng Loading chờ xử lý dữ liệu bất đồng bộ.

#### 🔄 Luồng xử lý nghiệp vụ thực tế

##### 1. Luồng Xóa sinh viên:
```text
[ Click Nút Delete ]
        │
        ▼
   <nz-popconfirm> (Hiển thị hộp thoại xác nhận xóa)
        │
        ▼
   [ Xác nhận Xóa ] ──► Gọi StudentService.deleteStudent(id)
        │
        ▼
   NzMessageService.success('Xóa sinh viên thành công!')
```

##### 2. Luồng Thêm/Sửa sinh viên:
```text
[ Submit Form ] ──► Bật trạng thái Loading (NzSpin / Button Loading)
        │
        ▼
   Gọi StudentService.addStudent(data)
        │
        ▼
   NzNotificationService.success('Thành công', 'Thêm sinh viên mới thành công!')
```

---

### 🔹 Ngày 5 — RxJS Cơ Bản & Luồng Dữ Liệu Bất Đồng Bộ

#### 🎯 Nội dung thực hiện
Nắm vững lý thuyết nền tảng về Lập trình phản ứng (Reactive Programming) với RxJS và vận hành các thành phần lõi.

#### 📚 Khái niệm cốt lõi (Core Concepts)

```text
       Observable (Nguồn phát dữ liệu)
            │
            ▼
      .subscribe() (Đăng ký lắng nghe)
            │
            ▼
        Observer (Đối tượng tiếp nhận)
  ┌──────────┬──────────┬───────────┐
  │  next()  │ error()  │complete() │
  └──────────┴──────────┴───────────┘
```

1. **`Observable`**: Stream phát ra chuỗi giá trị theo thời gian (0, 1 hoặc nhiều giá trị).
2. **`Observer`**: Tập hợp 3 hàm callback (`next`, `error`, `complete`) dùng để xử lý dữ liệu phát ra từ Observable.
3. **`Subscription`**: Đối tượng đại diện cho việc thực thi Observable, có hàm `.unsubscribe()` dùng để hủy đăng ký, giải phóng bộ nhớ.
4. **`pipe()`**: Phương thức cho phép kết nối nhiều chuỗi hàm xử lý dữ liệu (Operators).

#### 💻 Ví dụ Mã nguồn Cơ bản

```typescript
import { Observable } from 'rxjs';

// 1. Khởi tạo Observable
const customObservable$ = new Observable<number>(observer => {
  observer.next(1);
  observer.next(2);
  observer.next(3);
  observer.complete();
});

// 2. Đăng ký nhận dữ liệu với Observer
const subscription = customObservable$.subscribe({
  next: (value) => console.log('Giá trị phát ra:', value),
  error: (err) => console.error('Lỗi xảy ra:', err),
  complete: () => console.log('Đã hoàn thành luồng dữ liệu!')
});

// 3. Hủy đăng ký khi Component bị tiêu hủy
subscription.unsubscribe();
```

---
