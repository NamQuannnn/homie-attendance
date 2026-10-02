import type { Employee, Absence, MonthlySettings } from "@/types";
import type {
  EmployeeRow,
  AbsenceRow,
  MonthlySettingsRow,
} from "@/types/database";
export const employeeFromRow = (row: EmployeeRow): Employee => ({
  id: row.id,
  name: row.name,
  active: row.active,
});
export const absenceFromRow = (row: AbsenceRow): Absence => ({
  id: row.id,
  employeeId: row.employee_id,
  date: row.date,
  type: row.type,
  note: row.note ?? undefined,
});
export const settingsFromRow = (row: MonthlySettingsRow): MonthlySettings => ({
  month: row.month,
  standardWorkdays: Number(row.standard_workdays),
  paidLeaveAllowance: Number(row.paid_leave_allowance),
});
export const absenceToRow = (value: Absence) => ({
  id: value.id,
  employee_id: value.employeeId,
  date: value.date,
  type: value.type,
  note: value.note ?? null,
});
