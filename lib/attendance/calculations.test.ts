import type { Absence } from "@/types";
import { getVietnamToday } from "@/lib/date";
import { test } from "node:test";
import assert from "node:assert/strict";
import {
  dayWeight,
  standardWorkdays,
  employeeTotals,
  calculateAccruedWorkdaysToDate,
} from "./calculations";
test("calendar weights and actual monthly calendar", () => {
  assert.equal(dayWeight("2026-10-02"), 1);
  assert.equal(dayWeight("2026-10-03"), 0.5);
  assert.equal(dayWeight("2026-10-04"), 0);
  assert.equal(standardWorkdays("2026-10"), 24.5);
  assert.equal(standardWorkdays("2026-02"), 22);
});
test("one paid allowance, unpaid is deducted, Sunday is free", () => {
  const settings = {
    month: "2026-10",
    standardWorkdays: 24,
    paidLeaveAllowance: 1,
  };
  const a = [
    {
      id: "1",
      employeeId: "e",
      date: "2026-10-01",
      type: "paid_leave" as const,
    },
    {
      id: "2",
      employeeId: "e",
      date: "2026-10-02",
      type: "paid_leave" as const,
    },
    {
      id: "3",
      employeeId: "e",
      date: "2026-10-04",
      type: "unpaid_leave" as const,
    },
  ];
  assert.equal(employeeTotals("e", a, settings).actual, 23);
  assert.equal(employeeTotals("other", a, settings).actual, 24);
});
test("Saturday consumes half allowance and month boundaries are isolated", () => {
  const s = { month: "2026-10", standardWorkdays: 24.5, paidLeaveAllowance: 1 };
  const a = [
    {
      id: "1",
      employeeId: "e",
      date: "2026-10-03",
      type: "paid_leave" as const,
    },
    {
      id: "2",
      employeeId: "e",
      date: "2026-10-05",
      type: "paid_leave" as const,
    },
    {
      id: "3",
      employeeId: "e",
      date: "2026-09-01",
      type: "unpaid_leave" as const,
    },
  ];
  assert.equal(employeeTotals("e", a, s).actual, 24);
  assert.equal(
    employeeTotals("e", a, { ...s, paidLeaveAllowance: 0 }).actual,
    23,
  );
});

test("current month accrues only through today, including Saturday and Sunday", () => {
  const settings = {
    month: "2026-10",
    standardWorkdays: 24.5,
    paidLeaveAllowance: 1,
  };
  assert.equal(
    calculateAccruedWorkdaysToDate("e", [], settings, "2026-10-02"),
    2,
  );
  assert.equal(
    calculateAccruedWorkdaysToDate("e", [], settings, "2026-10-03"),
    2.5,
  );
  assert.equal(
    calculateAccruedWorkdaysToDate("e", [], settings, "2026-10-04"),
    2.5,
  );
  assert.equal(employeeTotals("e", [], settings).actual, 24.5);
});

test("elapsed absences reuse paid allowance while future absences are ignored", () => {
  const settings = {
    month: "2026-10",
    standardWorkdays: 24.5,
    paidLeaveAllowance: 1,
  };
  const absences: Absence[] = [
    { id: "1", employeeId: "e", date: "2026-10-01", type: "paid_leave" },
    { id: "2", employeeId: "e", date: "2026-10-02", type: "paid_leave" },
    { id: "3", employeeId: "e", date: "2026-10-05", type: "unpaid_leave" },
    { id: "4", employeeId: "other", date: "2026-10-03", type: "unpaid_leave" },
  ];
  assert.equal(
    calculateAccruedWorkdaysToDate("e", absences, settings, "2026-10-03"),
    1.5,
  );
  assert.equal(employeeTotals("e", absences, settings).actual, 22.5);
  const weekend: Absence[] = [
    { id: "5", employeeId: "e", date: "2026-10-03", type: "unpaid_leave" },
    { id: "6", employeeId: "e", date: "2026-10-04", type: "unpaid_leave" },
  ];
  assert.equal(
    calculateAccruedWorkdaysToDate("e", weekend, settings, "2026-10-04"),
    2,
  );
});

test("past month equals monthly actual and preserves overridden standard", () => {
  const settings = {
    month: "2026-09",
    standardWorkdays: 24,
    paidLeaveAllowance: 1,
  };
  const absences: Absence[] = [
    { id: "1", employeeId: "e", date: "2026-09-01", type: "unpaid_leave" },
  ];
  assert.equal(
    calculateAccruedWorkdaysToDate("e", absences, settings, "2026-10-03"),
    23,
  );
  assert.equal(
    calculateAccruedWorkdaysToDate("e", absences, settings, "2026-10-03"),
    employeeTotals("e", absences, settings).actual,
  );
});

test("future month accrues zero even with absence records", () => {
  const settings = {
    month: "2026-11",
    standardWorkdays: 23.5,
    paidLeaveAllowance: 1,
  };
  const absences: Absence[] = [
    { id: "1", employeeId: "e", date: "2026-11-02", type: "unpaid_leave" },
  ];
  assert.equal(
    calculateAccruedWorkdaysToDate("e", absences, settings, "2026-10-03"),
    0,
  );
});

test("Vietnam midnight determines the first accrued day regardless of local timezone", () => {
  const settings = {
    month: "2026-10",
    standardWorkdays: 24.5,
    paidLeaveAllowance: 1,
  };
  assert.equal(
    calculateAccruedWorkdaysToDate(
      "e",
      [],
      settings,
      getVietnamToday(new Date("2026-09-30T16:59:59Z")),
    ),
    0,
  );
  assert.equal(
    calculateAccruedWorkdaysToDate(
      "e",
      [],
      settings,
      getVietnamToday(new Date("2026-09-30T17:00:00Z")),
    ),
    1,
  );
});
