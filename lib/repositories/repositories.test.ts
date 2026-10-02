import { PostgrestError } from "@supabase/supabase-js";
import { test } from "node:test";
import assert from "node:assert/strict";
import {
  absenceFromRow,
  absenceToRow,
  employeeFromRow,
  settingsFromRow,
} from "./mappers";
import { readAll } from "./shared";
const timestamps = {
  created_at: "2026-10-03T00:00:00Z",
  updated_at: "2026-10-03T00:00:00Z",
};
test("database mapping preserves inactive staff and nullable notes", () => {
  assert.deepEqual(
    employeeFromRow({ id: "e", name: "Tên", active: false, ...timestamps }),
    { id: "e", name: "Tên", active: false },
  );
  const absence = absenceFromRow({
    id: "a",
    employee_id: "e",
    date: "2026-10-02",
    type: "paid_leave",
    note: null,
    ...timestamps,
  });
  assert.equal(absence.employeeId, "e");
  assert.equal(absence.note, undefined);
  assert.equal(absenceToRow(absence).note, null);
  assert.deepEqual(
    settingsFromRow({
      id: "s",
      month: "2026-10",
      standard_workdays: 24.5,
      paid_leave_allowance: 1,
      ...timestamps,
    }),
    { month: "2026-10", standardWorkdays: 24.5, paidLeaveAllowance: 1 },
  );
});
test("history above Supabase page limit loads without truncation", async () => {
  const source = Array.from({ length: 1205 }, (_, i) => i);
  let calls = 0;
  const rows = await readAll<number>(async (from, to) => {
    calls++;
    return { data: source.slice(from, to + 1), error: null };
  });
  assert.deepEqual(rows, source);
  assert.equal(calls, 3);
});
test("partial page failures reject the entire snapshot", async () => {
  const error = new PostgrestError({
    code: "42501",
    message: "denied",
    details: "",
    hint: "",
  });
  await assert.rejects(
    () =>
      readAll<number>(async (from) =>
        from === 0
          ? { data: Array<number>(500).fill(1), error: null }
          : { data: null, error },
      ),
    (value) => value === error,
  );
});
