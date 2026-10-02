import type { Employee, Absence, MonthlySettings } from "@/types";
import { employeeTotals, number } from "@/lib/attendance/calculations";
export function ReportCard({
  employee,
  absences,
  settings,
}: {
  employee: Employee;
  absences: Absence[];
  settings: MonthlySettings;
}) {
  const t = employeeTotals(employee.id, absences, settings);
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
