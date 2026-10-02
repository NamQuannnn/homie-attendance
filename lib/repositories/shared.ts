import type { PostgrestError } from "@supabase/supabase-js";
export function throwIfError(error: PostgrestError | null) {
  if (error) throw error;
}
// Supabase returns at most 1,000 rows by default. Page through history rather than silently truncating it.
export async function readAll<T>(
  fetchPage: (
    from: number,
    to: number,
  ) => PromiseLike<{ data: T[] | null; error: PostgrestError | null }>,
): Promise<T[]> {
  const rows: T[] = [];
  const size = 500;
  for (let from = 0; ; from += size) {
    const result = await fetchPage(from, from + size - 1);
    throwIfError(result.error);
    const page = result.data ?? [];
    rows.push(...page);
    if (page.length < size) return rows;
  }
}
export function errorMessage(error: unknown): string {
  const code =
    error && typeof error === "object" && "code" in error
      ? String(error.code)
      : "";
  if (process.env.NODE_ENV === "development")
    console.warn("[Homie/Supabase]", {
      code: code || "connection",
      category: error instanceof Error ? error.name : "database",
    });
  if (code === "23505")
    return "Nhân viên đã có ghi nhận nghỉ vào ngày này. Hãy tải lại dữ liệu.";
  if (code === "23503" || code === "23001")
    return "Không thể xóa nhân viên này vì đã có dữ liệu chấm công. Bạn có thể chuyển nhân viên sang trạng thái ngừng hoạt động.";
  if (code === "PGRST116")
    return "Bản ghi đã thay đổi hoặc bị xóa trên thiết bị khác. Hãy tải lại dữ liệu.";
  if (code === "42P01" || code === "PGRST205")
    return "Database chưa có đủ bảng. Hãy chạy migration trong Supabase SQL Editor rồi thử lại.";
  if (code === "42501")
    return "Chưa có quyền truy cập dữ liệu. Kiểm tra policy Supabase.";
  return "Không thể kết nối hoặc lưu dữ liệu Supabase. Kiểm tra mạng và thử lại.";
}
