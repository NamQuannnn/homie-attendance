"use client";
import { useState } from "react";
import { Trash2, UserRoundX, UserRoundCheck } from "lucide-react";
import type { Employee } from "@/types";
import { Sheet } from "@/components/layout/sheet";
export function EmployeeActions({
  employee,
  hasHistory,
  saving,
  onDelete,
  onToggle,
}: {
  employee: Employee;
  hasHistory: boolean;
  saving: boolean;
  onDelete: () => Promise<string>;
  onToggle: () => Promise<string>;
}) {
  const [confirm, setConfirm] = useState(false);
  const [error, setError] = useState("");
  const protectedHistory = hasHistory || error.includes("dữ liệu chấm công");
  return (
    <>
      <div className="employee-actions">
        <button
          className="button secondary full"
          disabled={saving}
          onClick={async () => {
            setError(await onToggle());
          }}
        >
          {employee.active ? (
            <UserRoundX size={17} />
          ) : (
            <UserRoundCheck size={17} />
          )}{" "}
          {employee.active ? "Ngừng hoạt động" : "Kích hoạt lại"}
        </button>
        <button
          className="button danger quiet full"
          disabled={saving}
          onClick={() => {
            setError("");
            setConfirm(true);
          }}
        >
          <Trash2 size={17} /> Xóa nhân viên
        </button>
        {error && !confirm && (
          <p className="error" role="alert">
            {error}
          </p>
        )}
      </div>
      {confirm && (
        <Sheet
          title={
            protectedHistory ? "Giữ lịch sử nhân viên" : "Xóa nhân viên này?"
          }
          onClose={() => {
            if (!saving) setConfirm(false);
          }}
        >
          <p className="form-help">
            <strong>{employee.name}</strong>
            <br />
            {protectedHistory
              ? "Nhân viên đã có dữ liệu chấm công. Bạn có thể ngừng hoạt động để giữ lịch sử."
              : "Hành động này không thể hoàn tác."}
          </p>
          {error && (
            <p role="alert" className="error">
              {error}
            </p>
          )}
          <div className="confirm-actions">
            <button
              className="button secondary"
              disabled={saving}
              onClick={() => setConfirm(false)}
            >
              Hủy
            </button>
            {protectedHistory ? (
              <button
                className="button primary"
                disabled={saving || !employee.active}
                onClick={async () => {
                  const result = await onToggle();
                  setError(result);
                  if (!result) setConfirm(false);
                }}
              >
                {saving ? "Đang lưu…" : "Ngừng hoạt động"}
              </button>
            ) : (
              <button
                className="button primary"
                disabled={saving}
                onClick={async () => {
                  const result = await onDelete();
                  setError(result);
                  if (!result) setConfirm(false);
                }}
              >
                {saving ? "Đang xóa…" : "Xóa nhân viên"}
              </button>
            )}
          </div>
        </Sheet>
      )}
    </>
  );
}
