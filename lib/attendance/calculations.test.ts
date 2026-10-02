import { test } from "node:test";
import assert from "node:assert/strict";
import { dayWeight, standardWorkdays, employeeTotals } from "./calculations";
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
