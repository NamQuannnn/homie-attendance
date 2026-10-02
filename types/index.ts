export type Employee = { id: string; name: string; active: boolean };
export type AbsenceType = "paid_leave" | "unpaid_leave";
export type Absence = {
  id: string;
  employeeId: string;
  date: string;
  type: AbsenceType;
  note?: string;
};
export type MonthlySettings = {
  month: string;
  standardWorkdays: number;
  paidLeaveAllowance: number;
};
export type AppData = {
  employees: Employee[];
  absences: Absence[];
  settings: MonthlySettings[];
};
