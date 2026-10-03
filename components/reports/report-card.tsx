import type { Employee, Absence, MonthlySettings } from "@/types";
import { employeeTotalsToDate, number } from "@/lib/attendance/calculations";
export function ReportCard({
  employee,
  absences,
  settings,
  today,
}: {
  employee: Employee;
  absences: Absence[];
  settings: MonthlySettings;
  today: string;
}) {
  const t = employeeTotalsToDate(employee.id, absences, settings, today);
  return (
    <div className="card report-card">
      <div className="report-top">
        <strong>{employee.name}</strong>
        <b>
          {number(t.actual)} <small>công</small>
        </b>
      </div>
      <div className="report-metrics">
        <span>
          Chuẩn<strong>{number(settings.standardWorkdays)}</strong>
        </span>
        <span>
          Nghỉ phép<strong>{t.paid}</strong>
        </span>
        <span>
          Không phép<strong>{t.unpaid}</strong>
        </span>
      </div>
    </div>
  );
}
