# Task 2 — RxJS và NgZorro trong Angular

Bản thực hành được tách từ dự án tuần 3, làm minh chứng cho tìm kiếm có debounce, lọc dữ liệu và giao diện NgZorro.

## Chạy dự án

```bash
npm install
npm start
```

Mở `http://localhost:4200/`.

## Minh chứng trong mã nguồn

- `src/app/app.ts`: `BehaviorSubject`, `combineLatest`, `debounceTime`, `distinctUntilChanged`, `switchMap`, `map`, `catchError`, `takeUntilDestroyed`.
- `src/app/app.html`: bảng, input, select, tag, card, alert và button của NgZorro.
- Dữ liệu mẫu được lưu cục bộ; không có thông tin khách hàng thật.

## Build

```bash
npm run build
```
