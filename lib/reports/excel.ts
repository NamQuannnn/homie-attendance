import type { Cell, Sheet } from "write-excel-file/browser";
import type { AppData, MonthlySettings } from "@/types";
import { dayWeight, employeeTotals } from "@/lib/attendance/calculations";
import { formatVietnamDate, parseDateOnly, parseMonthKey } from "@/lib/date";
const text = (value: string): Cell => ({
  value,
  type: String,
  wrap: true,
  alignVertical: "top",
});
const numeric = (value: number): Cell => ({
  value,
  type: Number,
  format: "0.##",
  alignVertical: "top",
});
const header = (labels: string[]) =>
  labels.map((value) => ({
    value,
    type: String,
    fontWeight: "bold" as const,
    backgroundColor: "#F2F2F4",
    height: 30,
    wrap: true,
    alignVertical: "center" as const,
  }));
export function buildAttendanceWorkbook(
  data: AppData,
  settings: MonthlySettings,
): Sheet<Blob>[] {
  parseMonthKey(settings.month);
  const employees = data.employees.filter((e) => e.active);
  const rows = employees.map((employee, index) => {
    const total = employeeTotals(employee.id, data.absences, settings);
    const notes = total.records
      .filter((a) => a.note)
      .map((a) => `${formatVietnamDate(a.date, false)}: ${a.note}`)
      .join("\n");
    return [
      numeric(index + 1),
      text(employee.name),
      numeric(settings.standardWorkdays),
      numeric(total.actual),
      numeric(total.totalAbsences),
      numeric(total.paid),
      numeric(total.unpaid),
      text(notes),
    ];
  });
  const names = new Map(employees.map((e) => [e.id, e.name]));
  const absences = data.absences
    .filter(
      (a) => a.date.startsWith(`${settings.month}-`) && names.has(a.employeeId),
    )
    .sort(
      (a, b) =>
        a.date.localeCompare(b.date) ||
        (names.get(a.employeeId) ?? "").localeCompare(
          names.get(b.employeeId) ?? "",
          "vi",
        ) ||
        a.id.localeCompare(b.id),
    );
  const detail = absences.map((absence, index) => [
    numeric(index + 1),
    text(names.get(absence.employeeId)!),
    // Excel stores dates as serial numbers, independent of browser/server timezones.
    {
      value: parseDateOnly(absence.date).getTime() / 86400000 + 25569,
      type: Number,
      format: "dd/mm/yyyy",
    },
    text(absence.type === "paid_leave" ? "Nghỉ phép" : "Nghỉ không phép"),
    numeric(dayWeight(absence.date)),
    text(absence.note ?? ""),
  ]);
  const columns = (content: Cell[][]) =>
    content[0].map((_, i) => ({
      width: Math.min(
        i === content[0].length - 1 ? 55 : 38,
        content.reduce(
          (width, row) =>
            Math.max(
              width,
              String((row[i] as { value?: unknown })?.value ?? "")
                .split("\n")
                .reduce((max, line) => Math.max(max, line.length), 0) + 2,
            ),
          i === 1 ? 25 : 12,
        ),
      ),
    }));
  const summary = [
    header([
      "STT",
      "Tên nhân viên",
      "Công chuẩn",
      "Công thực tế",
      "Tổng ngày nghỉ",
      "Nghỉ phép",
      "Nghỉ không phép",
      "Ghi chú",
    ]),
    ...rows,
  ];
  const details = [
    header([
      "STT",
      "Tên nhân viên",
      "Ngày nghỉ",
      "Loại nghỉ",
      "Công của ngày",
      "Ghi chú",
    ]),
    ...detail,
  ];
  return [
    {
      sheet: "Bao cao thang",
      data: summary,
      columns: columns(summary),
      stickyRowsCount: 1,
    },
    {
      sheet: "Chi tiet nghi",
      data: details,
      columns: columns(details),
      stickyRowsCount: 1,
    },
  ];
}
export function attendanceFilename(month: string): string {
  parseMonthKey(month);
  return `Homie_Attendance_${month}.xlsx`;
}
