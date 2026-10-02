import { CalendarDays, Users } from "lucide-react";
export function EmptyState({
  title,
  description,
  kind = "attendance",
}: {
  title: string;
  description: string;
  kind?: "attendance" | "employees";
}) {
  const Icon = kind === "employees" ? Users : CalendarDays;
  return (
    <div className="empty card">
      <Icon size={25} aria-hidden="true" />
      <strong>{title}</strong>
      <p>{description}</p>
    </div>
  );
}
