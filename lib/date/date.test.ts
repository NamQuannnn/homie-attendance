import { test } from "node:test";
import assert from "node:assert/strict";
import {
  getVietnamToday,
  getVietnamMonthKey,
  parseDateOnly,
  formatVietnamDate,
  datesInMonth,
  shiftMonth,
  dateWeekday,
} from "./index";
test("Vietnam day and month change at 17:00 UTC regardless of machine timezone", () => {
  for (const timezone of [
    "UTC",
    "America/Los_Angeles",
    "Pacific/Kiritimati",
    "Asia/Ho_Chi_Minh",
  ]) {
    const original = process.env.TZ;
    process.env.TZ = timezone;
    try {
      assert.equal(
        getVietnamToday(new Date("2026-09-30T16:59:59Z")),
        "2026-09-30",
      );
      assert.equal(
        getVietnamToday(new Date("2026-09-30T17:00:00Z")),
        "2026-10-01",
      );
      assert.equal(
        getVietnamMonthKey(new Date("2026-09-30T17:00:00Z")),
        "2026-10",
      );
      assert.equal(dateWeekday("2026-10-03"), 6);
      assert.equal(formatVietnamDate("2026-10-03"), "03/10/2026");
      assert.equal(shiftMonth("2026-12", 1), "2027-01");
    } finally {
      if (original === undefined) delete process.env.TZ;
      else process.env.TZ = original;
    }
  }
});
test("date-only validation and leap years never normalize invalid dates", () => {
  assert.equal(
    parseDateOnly("2024-02-29").toISOString(),
    "2024-02-29T00:00:00.000Z",
  );
  assert.equal(datesInMonth("2024-02").length, 29);
  assert.equal(datesInMonth("2026-02").length, 28);
  for (const date of [
    "2026-02-29",
    "2026-13-01",
    "2026-04-31",
    "2026-1-1",
    "garbage",
  ])
    assert.throws(() => parseDateOnly(date));
  assert.throws(() => datesInMonth("2026-13"));
  assert.equal(shiftMonth("2026-01", -1), "2025-12");
});
