import { ChevronRight } from "lucide-react";
import type { Employee } from "@/types";
export function EmployeeRow({
  employee,
  subtitle,
  value,
  onClick,
}: {
  employee: Employee;
  subtitle: string;
  value: string;
  onClick: () => void;
}) {
  return (
    <button className="employee-row" onClick={onClick}>
      <span className="avatar">
        {employee.name
          .split(" ")
          .slice(-2)
          .map((n) => n[0])
          .join("")}
      </span>
      <span className="row-text">
        <strong>{employee.name}</strong>
        <span>{subtitle}</span>
      </span>
      <span className="row-value">{value}</span>
      <ChevronRight size={16} className="muted" />
    </button>
  );
}
