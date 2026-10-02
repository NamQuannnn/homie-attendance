export const VIETNAM_TIMEZONE = "Asia/Ho_Chi_Minh";
/** Business dates are date-only strings; only instants are converted to Vietnam time. */
export function getVietnamToday(now = new Date()): string {
  const parts = new Intl.DateTimeFormat("en-CA", {
    timeZone: VIETNAM_TIMEZONE,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).formatToParts(now);
  const part = (type: string) => parts.find((p) => p.type === type)!.value;
  return `${part("year")}-${part("month")}-${part("day")}`;
}
export function getVietnamMonthKey(now = new Date()): string {
  return getVietnamToday(now).slice(0, 7);
}
export function parseDateOnly(value: string): Date {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(value)) throw new Error("Ngày không hợp lệ");
  const date = new Date(`${value}T00:00:00.000Z`);
  if (
    !Number.isFinite(date.getTime()) ||
    date.toISOString().slice(0, 10) !== value
  )
    throw new Error("Ngày không hợp lệ");
  return date;
}
export function dateWeekday(value: string): number {
  return parseDateOnly(value).getUTCDay();
}
export function formatVietnamDate(value: string, includeYear = true): string {
  parseDateOnly(value);
  const [year, month, day] = value.split("-");
  return includeYear ? `${day}/${month}/${year}` : `${day}/${month}`;
}
export function parseMonthKey(month: string): { year: number; month: number } {
  if (!/^\d{4}-(0[1-9]|1[0-2])$/.test(month))
    throw new Error("Tháng không hợp lệ");
  return { year: Number(month.slice(0, 4)), month: Number(month.slice(5)) };
}
export function datesInMonth(month: string): string[] {
  const { year, month: m } = parseMonthKey(month);
  const first = parseDateOnly(`${month}-01`);
  first.setUTCMonth(m);
  first.setUTCDate(0);
  // setUTCMonth uses a zero-based index: m points at the following month's first day.
  return Array.from(
    { length: first.getUTCDate() },
    (_, i) =>
      `${String(year).padStart(4, "0")}-${String(m).padStart(2, "0")}-${String(i + 1).padStart(2, "0")}`,
  );
}
export function shiftMonth(month: string, offset: number): string {
  parseMonthKey(month);
  const date = parseDateOnly(`${month}-01`);
  date.setUTCMonth(date.getUTCMonth() + offset);
  return date.toISOString().slice(0, 7);
}
export function monthLabel(month: string): string {
  const { year, month: m } = parseMonthKey(month);
  return `Tháng ${m}, ${year}`;
}
