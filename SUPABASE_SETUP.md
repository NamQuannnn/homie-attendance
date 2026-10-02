# Kết nối Supabase

## 1. Chạy migration

Mở project Supabase → **SQL Editor → New query**. Dán toàn bộ nội dung `supabase/migrations/202610030001_attendance.sql`, bấm **Run**. Chạy migration một lần trên database chưa có các bảng này; không chạy lại trên schema đã tồn tại. Migration có transaction, constraint chống trùng nhân viên/ngày nghỉ và trigger tự cập nhật `updated_at`.

Table Editor phải có ba bảng trong schema `public`: `employees`, `absences`, `monthly_settings`. Kiểm tra RLS bật và mỗi bảng có policy `development_*_all`.

**Policy development hiện cho phép anon/authenticated đọc, thêm, sửa, xóa toàn bộ dữ liệu. Bất kỳ ai có thông tin project public cũng có thể truy cập. Chỉ dùng dữ liệu thử nghiệm. Trước khi đưa dữ liệu nhân viên thật hoặc triển khai production, xóa cả ba policy development và thay bằng policy Supabase Auth giới hạn quản lý được cấp quyền. Không dùng service role key ở frontend.**

## 2. Seed tùy chọn

Tạo query mới, dán `supabase/seed.sql` rồi **Run** một lần. Có 7 nhân viên và 4 ngày nghỉ mẫu theo tháng hiện tại tại Asia/Ho_Chi_Minh. UUID cố định và `ON CONFLICT DO NOTHING` giúp chạy lại không ghi đè dữ liệu đã sửa. Không seed tự động khi app tải. `monthly_settings` để trống; app tự tính công chuẩn theo lịch và phép mặc định 1, chỉ upsert khi lưu cài đặt.

Mock cũ ở `lib/mock-data/index.ts` chỉ để tham khảo development, app không import hoặc fallback sang mock.

## 3. Chạy app

`.env.local` cần `NEXT_PUBLIC_SUPABASE_URL` và `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY`. Không commit file này; không hard-code credential trong source. Sau khi thay env, khởi động lại:

```sh
npm install
npm run dev
```

Mở http://localhost:3000. Nếu thiếu bảng hoặc mất kết nối, app báo lỗi và có nút Thử lại; không thay bằng dữ liệu giả. Database trống sẽ hiển thị danh sách trống.

## 4. Xác nhận đồng bộ

- Thêm nhân viên/ngày nghỉ trong app; kiểm tra row tương ứng trong Table Editor.
- Mở app trên trình duyệt/thiết bị thứ hai trỏ cùng Supabase project. Tải trang hoặc quay lại cửa sổ để lấy dữ liệu mới; khi trang đang hiển thị app kiểm tra lại mỗi 30 giây. Đây là đồng bộ bằng tải lại dữ liệu, chưa dùng Supabase Realtime.
- Trong DevTools → Application, xóa key localStorage `homie-attendance-v1` cũ rồi tải lại. Dữ liệu vẫn đọc từ Supabase. App không đọc/ghi key này, không tự chuyển dữ liệu local cũ lên cloud.
- Trong Network sẽ thấy request `/rest/v1/employees`, `/rest/v1/absences`, `/rest/v1/monthly_settings`.
- Thử thêm hai ngày nghỉ cùng nhân viên/ngày: UI báo trùng và constraint database `unique(employee_id,date)` vẫn bảo vệ khi hai thiết bị cùng ghi.
- Nhân viên có ngày nghỉ không thể xóa do foreign key RESTRICT. Dùng “Ngừng hoạt động” để giữ lịch sử; nhân viên chưa có ngày nghỉ vẫn xóa được. Báo cáo giữ logic cũ, chỉ tổng hợp nhân viên active.

## 5. Cấu trúc và kiểm tra

Client trình duyệt typed ở `lib/supabase/client.ts`, dùng cookie session theo `@supabase/ssr`, chuẩn bị cho Auth. Chưa cần server client vì dữ liệu hiện tải trong Client Component; khi thêm server auth hãy bổ sung server client và refresh session theo hướng dẫn chính thức: https://supabase.com/docs/guides/auth/server-side/creating-a-client.

`lib/repositories/` giữ CRUD, mapper snake_case → domain model và state async. `lib/storage.ts` chỉ tổng hợp đọc Supabase. UI cập nhật sau khi database xác nhận ghi thành công; khóa submit trong lúc lưu. Mỗi lần chỉ ghi đúng bản ghi thay đổi, không ghi đè toàn bộ snapshot hoặc xóa lịch sử các tháng khác. Truy vấn danh sách phân trang để không mất dữ liệu khi vượt giới hạn mặc định của API. Không có offline business cache. Lỗi development chỉ log mã/loại, không log credential.

Business types ở `types/index.ts`, database types thủ công theo migration ở `types/database.ts`. Tính công giữ nguyên trong `lib/attendance/calculations.ts`.

```sh
npm run typecheck
npm run lint
npm test
npm run build
```
