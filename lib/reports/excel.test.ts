import { test } from "node:test";
import assert from "node:assert/strict";
import { buildAttendanceWorkbook, attendanceFilename } from "./excel";
import { employeeTotalsToDate } from "@/lib/attendance/calculations";
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
  const workbook = buildAttendanceWorkbook(data, settings, "2026-10-03");
  assert.equal(workbook.length, 2);
  assert.equal(workbook[0].sheet, "Bao cao thang");
  assert.equal(workbook[1].sheet, "Chi tiet nghi");
  assert.equal(workbook[0].data.length, 2);
  assert.equal(workbook[1].data.length, 4);
  const row = workbook[0].data[1];
  assert.equal(
    (row[3] as { value: number }).value,
    employeeTotalsToDate("a", data.absences, settings, "2026-10-03").actual,
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

test("report/export actual totals agree across current, past and future months", () => {
  const snapshot: AppData = {
    ...data,
    employees: [...data.employees, { id: "c", name: "Nguyễn C", active: true }],
    absences: [
      ...data.absences,
      { id: "6", employeeId: "c", date: "2026-10-02", type: "unpaid_leave" },
    ],
  };
  for (const [today, expected] of [
    ["2026-10-03", 4],
    ["2026-11-01", 47.5],
    ["2026-09-30", 0],
  ] as const) {
    const workbook = buildAttendanceWorkbook(snapshot, settings, today);
    const actual = workbook[0].data
      .slice(1)
      .reduce((sum, row) => sum + (row[3] as { value: number }).value, 0);
    const report = snapshot.employees
      .filter((employee) => employee.active)
      .reduce(
        (sum, employee) =>
          sum +
          employeeTotalsToDate(employee.id, snapshot.absences, settings, today)
            .actual,
        0,
      );
    assert.equal(actual, report);
    assert.equal(report, expected);
    for (const row of workbook[0].data.slice(1)) {
      assert.equal((row[2] as { value: number }).value, 24.5);
    }
  }
});
