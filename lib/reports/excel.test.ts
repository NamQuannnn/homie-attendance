import { test } from "node:test";
import assert from "node:assert/strict";
import { buildAttendanceWorkbook, attendanceFilename } from "./excel";
import { employeeTotals } from "@/lib/attendance/calculations";
import type { AppData } from "@/types";
const data: AppData = {
  employees: [
    { id: "a", name: "Nguyễn A", active: true },
    { id: "b", name: "Đã ngừng", active: false },
  ],
  absences: [
    {
      id: "2",
      employeeId: "a",
      date: "2026-10-04",
      type: "unpaid_leave",
      note: "Chủ nhật",
    },
    {
      id: "1",
      employeeId: "a",
      date: "2026-10-03",
      type: "paid_leave",
      note: "Thứ bảy",
    },
    {
      id: "3",
      employeeId: "a",
      date: "2026-10-05",
      type: "paid_leave",
      note: "=SUM(A1)",
    },
    { id: "4", employeeId: "b", date: "2026-10-02", type: "unpaid_leave" },
    { id: "5", employeeId: "a", date: "2026-09-01", type: "unpaid_leave" },
  ],
  settings: [],
};
const settings = {
  month: "2026-10",
  standardWorkdays: 24.5,
  paidLeaveAllowance: 1,
};
test("export shares attendance calculations, excludes inactive and other months, sorts dates", () => {
  const workbook = buildAttendanceWorkbook(data, settings);
  assert.equal(workbook.length, 2);
  assert.equal(workbook[0].sheet, "Bao cao thang");
  assert.equal(workbook[1].sheet, "Chi tiet nghi");
  assert.equal(workbook[0].data.length, 2);
  assert.equal(workbook[1].data.length, 4);
  const row = workbook[0].data[1];
  assert.equal(
    (row[3] as { value: number }).value,
    employeeTotals("a", data.absences, settings).actual,
  );
  assert.equal((row[4] as { value: number }).value, 3);
  assert.deepEqual(
    workbook[1].data.slice(1).map((row) => (row[4] as { value: number }).value),
    [0.5, 0, 1],
  );
  assert.equal(workbook[0].stickyRowsCount, 1);
  assert.equal(
    (workbook[0].data[0][0] as { fontWeight: string }).fontWeight,
    "bold",
  );
  assert.equal(
    attendanceFilename(settings.month),
    "Homie_Attendance_2026-10.xlsx",
  );
  // User-entered strings remain text cells, never Excel formulas.
  assert.equal((workbook[1].data[3][5] as { type: unknown }).type, String);
});
test("empty workbook retains both sheet headers and month validation", () => {
  const workbook = buildAttendanceWorkbook(
    { employees: [], absences: [], settings: [] },
    settings,
  );
  assert.equal(workbook[0].data.length, 1);
  assert.equal(workbook[1].data.length, 1);
  assert.throws(() => attendanceFilename("2026-13"));
});
