# Homie webapp

App chấm công nội bộ mobile-first, Next.js App Router, TypeScript strict, Tailwind CSS, Lucide.

## Chạy local

```sh
npm install
npm run dev
```

Mở http://localhost:3000. Kiểm tra: `npm run lint`, `npm test`, `npm run build`.

## Quy tắc

Không báo nghỉ = đi làm. Thứ Hai–Sáu 1 công, Thứ Bảy 0,5, Chủ Nhật 0. Công chuẩn theo lịch có thể override. Nghỉ phép được bù tối đa số công phép tháng (mặc định 1); nghỉ không phép luôn trừ theo trọng số ngày. Phép không cộng dồn qua tháng. Số ngày nghỉ là số record; công bị trừ theo lịch. Công hiển thị là tổng dự kiến cả tháng, bao gồm ngày tương lai. Nhân viên inactive giữ lịch sử và xem được chi tiết nhưng không có trong tổng quan/báo cáo. Chưa hỗ trợ ngày bắt đầu/ngừng hoạt động giữa tháng.

## Dữ liệu và backend

Supabase là nguồn dữ liệu duy nhất, không còn đọc/ghi dữ liệu chấm công vào localStorage. Repository async nằm trong `lib/repositories/`, client typed ở `lib/supabase/client.ts`. Chạy migration và seed tùy chọn theo [SUPABASE_SETUP.md](SUPABASE_SETUP.md) trước khi dùng app. Không tự seed hoặc fallback sang mock khi mất kết nối.

Policy development mở quyền anon chỉ dùng với dữ liệu thử nghiệm; cần thay bằng Supabase Auth policies trước production. Nhân viên có lịch sử ngày nghỉ chỉ nên ngừng hoạt động, foreign key chặn xóa để giữ lịch sử.

## Branding / PWA

Logo SVG công ty nguyên bản nằm ở `public/homie-logo.svg`; header dùng chung ở `components/layout/app-header.tsx`. CSS căn vùng artwork và bỏ khoảng trắng thừa của canvas, không sửa SVG hay crop artwork. Màu nhấn và font ở đầu `app/globals.css`. Giao diện sáng, glass nhẹ ở thanh tab và backdrop. Có metadata iPhone và manifest; đã có icon/logo mark đỏ và apple-touch-icon cho Home Screen. Chưa có service worker/offline PWA. Xuất Excel hoạt động hoàn toàn trên trình duyệt, không cần API backend.

## Ngày nghiệp vụ và Excel

Ngày hiện tại và tháng mặc định luôn theo `Asia/Ho_Chi_Minh`, kể cả server hoặc thiết bị ở múi giờ khác. `lib/date/index.ts` gom helper lấy ngày/tháng Việt Nam, parse date-only an toàn, ngày trong tuần, lịch tháng và format `DD/MM/YYYY`. Các ngày nghỉ vẫn là `YYYY-MM-DD`; tính lịch bằng UTC để giữ nguyên ngày đã chọn. Seed SQL cũng dùng giờ Việt Nam. Không thay schema hay quy tắc công.

Nút Xuất Excel dùng `write-excel-file` (lazy-load khi bấm) tạo `Homie_Attendance_YYYY-MM.xlsx`, hai sheet `Bao cao thang` và `Chi tiet nghi`, cùng snapshot đang hiển thị và cùng hàm `employeeTotals`/`dayWeight`. Cả hai sheet chỉ gồm nhân viên active và ngày nghỉ trong tháng. Header bold, freeze hàng đầu, chiều rộng cột giới hạn hợp lý, công dạng số, ngày là Excel date serial. Ghi chú của người dùng là text, không chạy thành công thức Excel.

Download dùng Blob URL và link download, giải phóng URL sau 60 giây để Safari đủ thời gian đọc file. Đã kiểm tra tải trên Chrome và WebKit với viewport iPhone; chưa kiểm tra trên iPhone vật lý. Tùy phiên bản iOS, Safari có thể mở xem trước: dùng Chia sẻ → Lưu vào Tệp, hoặc kiểm tra mục Tải về. Không dùng service worker hoặc endpoint export riêng.

Quản lý nhân viên có filter Đang hoạt động / Đã ngừng / Tất cả và action Ngừng hoạt động/Kích hoạt lại. Xóa luôn cần bottom sheet xác nhận. Nếu đã có lịch sử ở bất kỳ tháng nào, đề nghị ngừng hoạt động; không gửi yêu cầu xóa cứng. Foreign key vẫn bảo vệ cả trường hợp lịch sử được thêm từ thiết bị khác sau khi app tải dữ liệu. Không xóa absences khi xóa nhân viên.

Giao diện giữ bố cục đỏ/trắng, token chung tại `app/globals.css`, safe area trên/dưới, tab bar 72px cộng safe area, bottom sheet theo visual viewport để giảm chồng bàn phím, segmented loại nghỉ, skeleton và empty state nhẹ. Không có dark mode hay logo công ty tự tạo.

Kiểm tra: `npm run typecheck`, `npm run lint`, `npm test`, `npm run build`.

## App icons

Tên Home Screen: **Homie Attendance**. Metadata icon và Apple web app cấu hình tại `app/layout.tsx`, manifest tại `public/manifest.webmanifest`. Các asset: `homie-icon.svg`, `icon-192.png`, `icon-512.png`, `apple-touch-icon.png` (180px), `favicon.ico` (16/32/48px). Icon lấy nguyên path `st1` (logo mark đỏ, gồm các hạt bay) và gradient gốc từ `homie-logo.svg`, đặt giữa canvas trắng vuông có khoảng thở. Không thêm chữ/slogan, không vẽ lại mark, không bo góc trong asset. Logo ngang ở header giữ nguyên.

Đã bỏ route favicon trống để `/favicon.ico` phục vụ asset thật. Trên Safari iPhone dùng Chia sẻ → Thêm vào Màn hình chính; nếu đã cài app trước khi đổi icon, xóa shortcut cũ rồi thêm lại để tránh icon cache. Chưa có service worker/offline; chế độ standalone và Apple Home Screen không thay đổi nguồn dữ liệu Supabase.
