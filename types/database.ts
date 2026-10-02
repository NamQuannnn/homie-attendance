import type { AbsenceType } from "./index";
type Timestamps = { created_at: string; updated_at: string };
export type EmployeeRow = Timestamps & {
  id: string;
  name: string;
  active: boolean;
};
export type AbsenceRow = Timestamps & {
  id: string;
  employee_id: string;
  date: string;
  type: AbsenceType;
  note: string | null;
};
export type MonthlySettingsRow = Timestamps & {
  id: string;
  month: string;
  standard_workdays: number;
  paid_leave_allowance: number;
};
type Table<Row, Insert> = {
  Row: Row;
  Insert: Insert;
  Update: Partial<Insert>;
  Relationships: [];
};
export type Database = {
  public: {
    Tables: {
      employees: Table<
        EmployeeRow,
        { id?: string; name: string; active?: boolean }
      >;
      absences: Table<
        AbsenceRow,
        {
          id?: string;
          employee_id: string;
          date: string;
          type: AbsenceType;
          note?: string | null;
        }
      >;
      monthly_settings: Table<
        MonthlySettingsRow,
        {
          id?: string;
          month: string;
          standard_workdays: number;
          paid_leave_allowance?: number;
        }
      >;
    };
    Views: { [_ in never]: never };
    Functions: { [_ in never]: never };
    Enums: { [_ in never]: never };
    CompositeTypes: { [_ in never]: never };
  };
};
