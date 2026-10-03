import {
  dateWeekday,
  datesInMonth,
  getVietnamToday,
  parseDateOnly,
} from "@/lib/date";
import type { Absence, MonthlySettings } from "@/types";
export const number = (n: number) =>
  new Intl.NumberFormat("vi-VN", { maximumFractionDigits: 2 }).format(n);
export { datesInMonth, shiftMonth, monthLabel } from "@/lib/date";
export function dayWeight(date: string): number {
  const day = dateWeekday(date);
  return day === 0 ? 0 : day === 6 ? 0.5 : 1;
}
export function standardWorkdays(month: string): number {
  return datesInMonth(month).reduce((sum, date) => sum + dayWeight(date), 0);
}
export function employeeTotals(
  employeeId: string,
  absences: Absence[],
  settings: MonthlySettings,
) {
  const records = absences
    .filter(
      (a) => a.employeeId === employeeId && a.date.startsWith(settings.month),
    )
    .sort((a, b) => a.date.localeCompare(b.date));
  const paid = records.filter((a) => a.type === "paid_leave");
  const unpaid = records.filter((a) => a.type === "unpaid_leave");
  let allowance = settings.paidLeaveAllowance;
  const deducted = records.reduce((total, a) => {
    const weight = dayWeight(a.date);
    if (a.type === "unpaid_leave") return total + weight;
    const covered = Math.min(allowance, weight);
    allowance -= covered;
    return total + weight - covered;
  }, 0);
  return {
    records,
    totalAbsences: records.length,
    paid: paid.length,
    unpaid: unpaid.length,
    deducted,
    actual: Math.max(0, settings.standardWorkdays - deducted),
  };
}

/** Reuse monthly leave deductions, limited to elapsed Vietnam business dates. */
export function calculateAccruedWorkdaysToDate(
  employeeId: string,
  absences: Absence[],
  settings: MonthlySettings,
  today = getVietnamToday(),
): number {
  parseDateOnly(today);
  const dates = datesInMonth(settings.month);
  const currentMonth = today.slice(0, 7);
  if (settings.month > currentMonth) return 0;
  if (settings.month < currentMonth) {
    return employeeTotals(employeeId, absences, settings).actual;
  }
  const elapsedWorkdays = dates
    .filter((date) => date <= today)
    .reduce((sum, date) => sum + dayWeight(date), 0);
  return employeeTotals(
    employeeId,
    absences.filter((absence) => absence.date <= today),
    { ...settings, standardWorkdays: elapsedWorkdays },
  ).actual;
}

/** Shared displayed/exported totals: monthly absence counts, actual work accrued to date. */
export function employeeTotalsToDate(
  employeeId: string,
  absences: Absence[],
  settings: MonthlySettings,
  today = getVietnamToday(),
) {
  return {
    ...employeeTotals(employeeId, absences, settings),
    actual: calculateAccruedWorkdaysToDate(
      employeeId,
      absences,
      settings,
      today,
    ),
  };
}
