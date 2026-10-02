"use client";
import { parseDateOnly } from "@/lib/date";
import { useState } from "react";
import type { Absence, AbsenceType, Employee } from "@/types";
export function AbsenceForm({
  employees,
  date,
  record,
  onSave,
  saving,
}: {
  employees: Employee[];
  date: string;
  record?: Absence;
  onSave: (a: Absence) => Promise<string>;
  saving: boolean;
}) {
  const [leaveType, setLeaveType] = useState<AbsenceType>(
    record?.type ?? "paid_leave",
  );
  const [error, setError] = useState("");
  return (
    <form
      onSubmit={async (e) => {
        e.preventDefault();
        if (saving) return;
        const f = new FormData(e.currentTarget);
        try {
          parseDateOnly(String(f.get("date")));
        } catch {
          setError("Ngày nghỉ không hợp lệ. Vui lòng chọn lại.");
          return;
        }
        setError(
          await onSave({
            id: record?.id ?? crypto.randomUUID(),
            employeeId: String(f.get("employee")),
            date: String(f.get("date")),
            type:
              f.get("type") === "paid_leave" ? "paid_leave" : "unpaid_leave",
            note: String(f.get("note")).trim() || undefined,
          }),
        );
      }}
    >
      <fieldset disabled={saving}>
        <label className="field">
          Nhân viên
          <select
            name="employee"
            required
            defaultValue={record?.employeeId ?? ""}
          >
            <option value="" disabled>
              Chọn nhân viên
            </option>
            {employees
              .filter((e) => e.active || e.id === record?.employeeId)
              .map((e) => (
                <option value={e.id} key={e.id}>
                  {e.name}
                </option>
              ))}
          </select>
        </label>
        <label className="field">
          Ngày nghỉ
          <input
            name="date"
            type="date"
            max="9999-12-31"
            required
            defaultValue={record?.date ?? date}
          />
        </label>
        <div className="field">
          <span id="leave-type-label">Loại nghỉ</span>
          <input type="hidden" name="type" value={leaveType} />
          <div
            className="segmented leave-type"
            role="group"
            aria-labelledby="leave-type-label"
          >
            {[
              { id: "paid_leave" as const, label: "Nghỉ phép" },
              { id: "unpaid_leave" as const, label: "Nghỉ không phép" },
            ].map((option) => (
              <button
                type="button"
                key={option.id}
                aria-pressed={leaveType === option.id}
                className={leaveType === option.id ? "active" : ""}
                onClick={() => setLeaveType(option.id)}
              >
                {option.label}
              </button>
            ))}
          </div>
        </div>
        <label className="field">
          Ghi chú <span className="muted">· tùy chọn</span>
          <textarea
            name="note"
            rows={3}
            maxLength={500}
            defaultValue={record?.note}
            placeholder="Lý do nghỉ hoặc ghi chú thêm"
          />
        </label>
        {error && (
          <p role="alert" className="error">
            {error}
          </p>
        )}
        <button
          className="button primary full sheet-save"
          disabled={
            saving ||
            !employees.some((e) => e.active || e.id === record?.employeeId)
          }
        >
          {saving ? "Đang lưu…" : "Lưu ngày nghỉ"}
        </button>
      </fieldset>
    </form>
  );
}
