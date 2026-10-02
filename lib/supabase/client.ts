import { createBrowserClient } from "@supabase/ssr";
import type { Database } from "@/types/database";
export function createClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY;
  if (!url || !key)
    throw new Error(
      "Thiếu cấu hình Supabase. Kiểm tra .env.local và khởi động lại app.",
    );
  return createBrowserClient<Database>(url, key);
}
