"use client";
import { useEffect, useState } from "react";
import {
  CalendarDays,
  ChevronLeft,
  ChevronRight,
  LayoutGrid,
  Plus,
  Search,
  Settings2,
  Users,
  ChartNoAxesCombined,
  Pencil,
  Trash2,
  Check,
  ArrowLeft,
} from "lucide-react";
import {
  getVietnamToday,
  getVietnamMonthKey,
  formatVietnamDate,
} from "@/lib/date";
import type { Absence, Employee, MonthlySettings } from "@/types";
import {
  employeeTotals,
  monthLabel,
  number,
  shiftMonth,
  standardWorkdays,
} from "@/lib/attendance/calculations";
import { useAttendanceData } from "@/lib/repositories/use-attendance-data";
import {
  createEmployee,
  updateEmployee,
  deleteEmployee,
  setEmployeeActive,
} from "@/lib/repositories/employees";
import {
  createAbsence,
  updateAbsence,
  deleteAbsence as removeAbsence,
} from "@/lib/repositories/absences";
import { upsertMonthlySettings } from "@/lib/repositories/monthly-settings";
import { AppHeader } from "./layout/app-header";
import { Sheet } from "./layout/sheet";
import { EmployeeRow } from "./employees/employee-row";
import { AbsenceForm } from "./attendance/absence-form";
import { Calendar } from "./attendance/calendar";
import { ExportButton } from "./reports/export-button";
import { EmptyState } from "./layout/empty-state";
import { LoadingState, ReportSkeleton } from "./layout/loading-state";
import { EmployeeActions } from "./employees/employee-actions";
import { ReportCard } from "./reports/report-card";
type Tab = "home" | "attendance" | "employees" | "reports";
type Modal =
  | { kind: "absence"; record?: Absence }
  | { kind: "employee"; employee?: Employee }
  | { kind: "settings" }
  | null;
const tabs = [
  { id: "home" as const, label: "Tổng quan", icon: LayoutGrid },
  { id: "attendance" as const, label: "Chấm công", icon: CalendarDays },
  { id: "employees" as const, label: "Nhân viên", icon: Users },
  { id: "reports" as const, label: "Báo cáo", icon: ChartNoAxesCombined },
];
export function HomieApp() {
  const { data, ready, error, saving, loading, refresh, mutate } =
    useAttendanceData();
  const [message, setMessage] = useState("");
  const [tab, setTab] = useState<Tab>("home");
  const [month, setMonth] = useState(getVietnamMonthKey());
  const [selected, setSelected] = useState(getVietnamToday());
  const [filter, setFilter] = useState("all");
  const [employeeFilter, setEmployeeFilter] = useState("active");
  const [search, setSearch] = useState("");
  const [detail, setDetail] = useState<string | null>(null);
  const [modal, setModal] = useState<Modal>(null);
  useEffect(() => {
    if (!message) return;
    const timer = setTimeout(() => setMessage(""), 5000);
    return () => clearTimeout(timer);
  }, [message]);
  const settings: MonthlySettings = data.settings.find(
    (s) => s.month === month,
  ) ?? {
    month,
    standardWorkdays: standardWorkdays(month),
    paidLeaveAllowance: 1,
  };
  const active = data.employees.filter((e) => e.active);
  const records = data.absences.filter((a) => a.date.startsWith(month));
  const totals = active.map((e) =>
    employeeTotals(e.id, data.absences, settings),
  );
  const today = getVietnamToday();
  const isOff = (id: string) =>
    data.absences.some((a) => a.employeeId === id && a.date === today);
  const filteredEmployees = data.employees.filter(
    (e) =>
      (employeeFilter === "all" ||
        (employeeFilter === "active" ? e.active : !e.active)) &&
      e.name.toLocaleLowerCase("vi").includes(search.toLocaleLowerCase("vi")),
  );
  const person = data.employees.find((e) => e.id === detail);
  const personTotals = person
    ? employeeTotals(person.id, data.absences, settings)
    : null;
  function changeMonth(offset: number) {
    const next = shiftMonth(month, offset);
    setMonth(next);
    setSelected(`${next}-01`);
  }
  async function deleteAbsence(id: string) {
    const result = await mutate(
      () => removeAbsence(id),
      (previous) => ({
        ...previous,
        absences: previous.absences.filter((a) => a.id !== id),
      }),
    );
    if (!result) setMessage("Đã xóa ngày nghỉ trên Supabase");
  }
  function absenceRows(items: Absence[]) {
    return items.length ? (
      <div className="card">
        {items.map((a) => (
          <div className="absence-row" key={a.id}>
            <span className="avatar small">
              {data.employees
                .find((e) => e.id === a.employeeId)
                ?.name.split(" ")
                .at(-1)?.[0] ?? "?"}
            </span>
            <div className="row-text">
              <strong>
                {data.employees.find((e) => e.id === a.employeeId)?.name ??
                  "Nhân viên đã xóa"}
              </strong>
              <span>
                {a.type === "paid_leave" ? "Nghỉ phép" : "Nghỉ không phép"} ·{" "}
                {formatVietnamDate(a.date, false)}
                {a.note && ` · ${a.note}`}
              </span>
            </div>
            <button
              className="icon-button"
              aria-label="Sửa ngày nghỉ"
              disabled={saving}
              onClick={() => setModal({ kind: "absence", record: a })}
            >
              <Pencil size={16} />
            </button>
            <button
              className="icon-button danger"
              aria-label="Xóa ngày nghỉ"
              disabled={saving}
              onClick={() => deleteAbsence(a.id)}
            >
              <Trash2 size={16} />
            </button>
          </div>
        ))}
      </div>
    ) : (
      <div className="empty card">
        <Check size={25} />
        <strong>Chưa có ghi nhận nghỉ</strong>
        <p>Không báo nghỉ = đi làm.</p>
      </div>
    );
  }
  if (!ready && !error) return <LoadingState />;
  if (!ready)
    return (
      <main className="app loading">
        {error ? (
          <>
            <p role="alert">{error}</p>
            <button
              className="button primary full"
              disabled={loading}
              onClick={() => void refresh()}
            >
              {loading ? "Đang tải…" : "Thử lại"}
            </button>
          </>
        ) : (
          <LoadingState />
        )}
      </main>
    );
  return (
    <div className="app">
      <AppHeader
        title={tabs.find((t) => t.id === tab)?.label ?? "Tổng quan"}
        action={
          <button
            aria-label="Cài đặt tháng"
            className="icon-button settings-button"
            onClick={() => setModal({ kind: "settings" })}
          >
            <Settings2 size={20} />
          </button>
        }
      />
      <main>
        {error && (
          <div className="info" role="alert">
            {error}{" "}
            <button
              className="button secondary compact"
              disabled={loading || saving}
              onClick={() => void refresh()}
            >
              Thử lại
            </button>
          </div>
        )}
        <div className="month-selector">
          <button
            className="icon-button"
            aria-label="Tháng trước"
            onClick={() => changeMonth(-1)}
          >
            <ChevronLeft size={20} />
          </button>
          <label>
            <CalendarDays size={17} />
            <span>{monthLabel(month)}</span>
            <input
              aria-label="Chọn tháng"
              type="month"
              value={month}
              onChange={(e) => {
                if (e.target.value) {
                  setMonth(e.target.value);
                  setSelected(`${e.target.value}-01`);
                }
              }}
            />
          </label>
          <button
            className="icon-button"
            aria-label="Tháng sau"
            onClick={() => changeMonth(1)}
          >
            <ChevronRight size={20} />
          </button>
        </div>
        {tab === "home" && (
          <>
            <div className="hero card">
              <div>
                <span>Ngày công thực tế</span>
                <strong>
                  {number(totals.reduce((s, t) => s + t.actual, 0))}
                  <small> công</small>
                </strong>
                <p>Tổng công của {active.length} nhân viên trong tháng</p>
              </div>
              <span className="hero-icon">
                <CalendarDays size={30} />
              </span>
            </div>
            <div className="summary-grid">
              <div className="card metric">
                <span>Nhân viên</span>
                <strong>
                  {active.length}
                  <small> người</small>
                </strong>
              </div>
              <div className="card metric">
                <span>Công chuẩn</span>
                <strong>
                  {number(settings.standardWorkdays)}
                  <small> công</small>
                </strong>
              </div>
              <div className="card metric">
                <span>Ngày nghỉ</span>
                <strong>
                  {
                    records.filter((a) =>
                      active.some((e) => e.id === a.employeeId),
                    ).length
                  }
                  <small> ngày</small>
                </strong>
              </div>
            </div>
            <div className="section-heading">
              <h2>Nhân viên hôm nay</h2>
              <span>{formatVietnamDate(today, false)}</span>
            </div>
            <div className="segmented">
              {[
                { id: "all", label: "Tất cả" },
                { id: "working", label: "Đi làm" },
                { id: "off", label: "Nghỉ" },
              ].map((f) => (
                <button
                  key={f.id}
                  className={filter === f.id ? "active" : ""}
                  onClick={() => setFilter(f.id)}
                >
                  {f.label}
                </button>
              ))}
            </div>
            <div className="card employee-list">
              {active
                .filter(
                  (e) =>
                    filter === "all" ||
                    (filter === "off" ? isOff(e.id) : !isOff(e.id)),
                )
                .map((e) => (
                  <EmployeeRow
                    key={e.id}
                    employee={e}
                    subtitle={isOff(e.id) ? "● Nghỉ hôm nay" : "Đi làm"}
                    value={`${number(employeeTotals(e.id, data.absences, settings).actual)} công`}
                    onClick={() => {
                      window.scrollTo(0, 0);
                      setDetail(e.id);
                      setTab("employees");
                    }}
                  />
                ))}
              {active.filter(
                (e) =>
                  filter === "all" ||
                  (filter === "off" ? isOff(e.id) : !isOff(e.id)),
              ).length === 0 && (
                <EmptyState
                  kind="employees"
                  title={
                    active.length
                      ? "Không có nhân viên trong nhóm này"
                      : "Chưa có nhân viên hoạt động"
                  }
                  description="Thêm hoặc kích hoạt nhân viên trong mục Nhân viên."
                />
              )}
            </div>
            <p className="footnote">
              Chỉ ghi nhận ngày nghỉ. Các ngày còn lại tự tính công.
            </p>
          </>
        )}
        {tab === "attendance" && (
          <>
            <Calendar
              month={month}
              selected={selected}
              onSelect={setSelected}
              absences={data.absences}
            />
            <div className="section-heading">
              <div>
                <h2>
                  Ngày {Number(selected.slice(-2))}/
                  {Number(selected.slice(5, 7))}
                </h2>
                <p>
                  {data.absences.filter((a) => a.date === selected).length} nhân
                  viên nghỉ
                </p>
              </div>
              <button
                className="button primary compact"
                onClick={() => setModal({ kind: "absence" })}
              >
                <Plus size={17} /> Thêm người nghỉ
              </button>
            </div>
            {absenceRows(data.absences.filter((a) => a.date === selected))}
            <div className="info">
              Mỗi tháng có {number(settings.paidLeaveAllowance)} công phép hưởng
              lương. Nghỉ không phép được trừ theo lịch.
            </div>
          </>
        )}
        {tab === "employees" &&
          (person && personTotals ? (
            <>
              <button
                className="back"
                onClick={() => {
                  window.scrollTo(0, 0);
                  setDetail(null);
                }}
              >
                <ArrowLeft size={18} /> Danh sách nhân viên
              </button>
              <div className="card profile">
                <span className="avatar">
                  {person.name.split(" ").at(-1)?.[0]}
                </span>
                <h2>{person.name}</h2>
                <span className="status">
                  {person.active ? "Đang hoạt động" : "Ngừng hoạt động"}
                </span>
                <button
                  className="button secondary"
                  onClick={() =>
                    setModal({ kind: "employee", employee: person })
                  }
                >
                  <Pencil size={16} /> Sửa thông tin
                </button>
              </div>
              <div className="summary-grid two">
                <div className="card metric">
                  <span>Công chuẩn</span>
                  <strong>{number(settings.standardWorkdays)}</strong>
                </div>
                <div className="card metric">
                  <span>Công thực tế</span>
                  <strong>{number(personTotals.actual)}</strong>
                </div>
                <div className="card metric">
                  <span>Nghỉ phép</span>
                  <strong>{personTotals.paid}</strong>
                </div>
                <div className="card metric">
                  <span>Không phép</span>
                  <strong>{personTotals.unpaid}</strong>
                </div>
              </div>
              <div className="section-heading">
                <h2>Ngày nghỉ trong tháng</h2>
              </div>
              {absenceRows(personTotals.records)}
              <EmployeeActions
                employee={person}
                hasHistory={data.absences.some(
                  (a) => a.employeeId === person.id,
                )}
                saving={saving}
                onToggle={async () => {
                  const result = await mutate(
                    () => setEmployeeActive(person.id, !person.active),
                    (previous, saved) => ({
                      ...previous,
                      employees: previous.employees.map((e) =>
                        e.id === saved.id ? saved : e,
                      ),
                    }),
                  );
                  if (!result)
                    setMessage(
                      person.active
                        ? "Đã ngừng hoạt động nhân viên"
                        : "Đã kích hoạt nhân viên",
                    );
                  return result;
                }}
                onDelete={async () => {
                  const result = await mutate(
                    () => deleteEmployee(person.id),
                    (previous) => ({
                      ...previous,
                      employees: previous.employees.filter(
                        (e) => e.id !== person.id,
                      ),
                    }),
                  );
                  if (!result) {
                    setDetail(null);
                    setMessage("Đã xóa nhân viên");
                  }
                  return result;
                }}
              />
            </>
          ) : (
            <>
              <div className="search">
                <Search size={19} />
                <input
                  placeholder="Tìm tên nhân viên"
                  aria-label="Tìm nhân viên"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                />
              </div>
              <div className="section-heading">
                <h2>{filteredEmployees.length} nhân viên</h2>
                <button
                  className="button primary compact"
                  onClick={() => setModal({ kind: "employee" })}
                >
                  <Plus size={17} /> Thêm nhân viên
                </button>
              </div>
              <div
                className="segmented employee-filter"
                aria-label="Trạng thái nhân viên"
              >
                {[
                  { id: "active", label: "Đang hoạt động" },
                  { id: "inactive", label: "Đã ngừng" },
                  { id: "all", label: "Tất cả" },
                ].map((f) => (
                  <button
                    key={f.id}
                    aria-pressed={employeeFilter === f.id}
                    className={employeeFilter === f.id ? "active" : ""}
                    onClick={() => setEmployeeFilter(f.id)}
                  >
                    {f.label}
                  </button>
                ))}
              </div>
              <div className="card">
                {filteredEmployees.map((e) => {
                  const t = employeeTotals(e.id, data.absences, settings);
                  return (
                    <EmployeeRow
                      key={e.id}
                      employee={e}
                      subtitle={`${e.active ? "Đang hoạt động" : "Ngừng hoạt động"} · ${t.totalAbsences} ngày nghỉ`}
                      value={`${number(t.actual)} công`}
                      onClick={() => setDetail(e.id)}
                    />
                  );
                })}
                {!filteredEmployees.length && (
                  <EmptyState
                    kind="employees"
                    title={
                      data.employees.length
                        ? "Không có nhân viên phù hợp"
                        : "Chưa có nhân viên"
                    }
                    description={
                      data.employees.length
                        ? "Thử đổi bộ lọc hoặc tên tìm kiếm."
                        : "Bấm Thêm nhân viên để bắt đầu."
                    }
                  />
                )}
              </div>
            </>
          ))}
        {tab === "reports" && (
          <>
            <div className="summary-grid two">
              <div className="card metric">
                <span>Nhân viên</span>
                <strong>{active.length}</strong>
              </div>
              <div className="card metric">
                <span>Tổng ngày công</span>
                <strong>
                  {number(totals.reduce((s, t) => s + t.actual, 0))}
                </strong>
              </div>
              <div className="card metric">
                <span>Nghỉ phép</span>
                <strong>{totals.reduce((s, t) => s + t.paid, 0)}</strong>
              </div>
              <div className="card metric">
                <span>Không phép</span>
                <strong>{totals.reduce((s, t) => s + t.unpaid, 0)}</strong>
              </div>
            </div>
            <div className="section-heading">
              <h2>Chi tiết từng nhân viên</h2>
              <ExportButton
                data={data}
                settings={settings}
                disabled={saving || loading}
                onMessage={setMessage}
              />
            </div>
            <p className="footnote">Báo cáo gồm nhân viên đang hoạt động.</p>
            {!active.length && !loading && (
              <EmptyState
                kind="employees"
                title="Chưa có nhân viên trong báo cáo"
                description="Thêm hoặc kích hoạt nhân viên để xem báo cáo tháng."
              />
            )}
            {!!active.length && !totals.some((t) => t.totalAbsences > 0) && (
              <p className="info">Tháng này chưa có ngày nghỉ được ghi nhận.</p>
            )}
            {loading && !active.length && <ReportSkeleton />}
            <div className="report-list" aria-busy={loading}>
              {active.map((e) => (
                <ReportCard
                  key={e.id}
                  employee={e}
                  absences={data.absences}
                  settings={settings}
                />
              ))}
            </div>
          </>
        )}
      </main>
      <nav className="bottom-nav" aria-label="Điều hướng chính">
        {tabs.map((t) => (
          <button
            key={t.id}
            aria-current={tab === t.id ? "page" : undefined}
            className={tab === t.id ? "active" : ""}
            onClick={() => {
              window.scrollTo(0, 0);
              setTab(t.id);
              setDetail(null);
            }}
          >
            <t.icon size={22} />
            <span>{t.label}</span>
          </button>
        ))}
      </nav>
      {message && (
        <div role="status" className="toast">
          {message}
        </div>
      )}
      {modal && (
        <Sheet
          title={
            modal.kind === "settings"
              ? "Cài đặt tháng"
              : modal.kind === "employee"
                ? modal.employee
                  ? "Thông tin nhân viên"
                  : "Thêm nhân viên"
                : modal.record
                  ? "Sửa ngày nghỉ"
                  : "Thêm người nghỉ"
          }
          onClose={() => {
            if (!saving) setModal(null);
          }}
        >
          {error && (
            <p role="alert" className="error">
              {error}
            </p>
          )}
          {modal.kind === "absence" ? (
            <AbsenceForm
              employees={data.employees}
              date={selected}
              record={modal.record}
              saving={saving}
              onSave={async (record) => {
                if (
                  data.absences.some(
                    (a) =>
                      a.id !== record.id &&
                      a.employeeId === record.employeeId &&
                      a.date === record.date,
                  )
                )
                  return "Nhân viên đã có ghi nhận nghỉ vào ngày này.";
                const result = await mutate(
                  () =>
                    modal.record
                      ? updateAbsence(record)
                      : createAbsence(record),
                  (previous, saved) => ({
                    ...previous,
                    absences: [
                      ...previous.absences.filter((a) => a.id !== saved.id),
                      saved,
                    ],
                  }),
                );
                if (result) return result;
                setMessage("Đã lưu ngày nghỉ trên Supabase");
                setMonth(record.date.slice(0, 7));
                setSelected(record.date);
                setModal(null);
                return "";
              }}
            />
          ) : modal.kind === "settings" ? (
            <form
              onSubmit={async (e) => {
                e.preventDefault();
                const f = new FormData(e.currentTarget);
                if (saving) return;
                const value = {
                  month,
                  standardWorkdays: Number(f.get("standard")),
                  paidLeaveAllowance: Number(f.get("allowance")),
                };
                const result = await mutate(
                  () => upsertMonthlySettings(value),
                  (previous, saved) => ({
                    ...previous,
                    settings: [
                      ...previous.settings.filter(
                        (s) => s.month !== saved.month,
                      ),
                      saved,
                    ],
                  }),
                );
                if (result) return;
                setMessage("Đã lưu cài đặt trên Supabase");
                setModal(null);
              }}
            >
              <fieldset disabled={saving}>
                <p className="form-help">
                  {monthLabel(month)} · Theo lịch:{" "}
                  {number(standardWorkdays(month))} công
                </p>
                <label className="field">
                  Ngày công chuẩn
                  <input
                    name="standard"
                    type="number"
                    min="0"
                    max="31"
                    step="0.5"
                    required
                    defaultValue={settings.standardWorkdays}
                  />
                </label>
                <label className="field">
                  Số công phép hưởng lương
                  <input
                    name="allowance"
                    type="number"
                    min="0"
                    max="31"
                    step="0.5"
                    required
                    defaultValue={settings.paidLeaveAllowance}
                  />
                </label>
                <p className="form-help">
                  Có thể điều chỉnh công chuẩn cho ngày lễ hoặc lịch đặc biệt.
                  Phép dư không chuyển tháng.
                </p>
                <button className="button primary full" disabled={saving}>
                  {saving ? "Đang lưu…" : "Lưu cài đặt"}
                </button>
              </fieldset>
            </form>
          ) : (
            <form
              onSubmit={async (e) => {
                e.preventDefault();
                const f = new FormData(e.currentTarget);
                const name = String(f.get("name")).trim();
                if (!name) return;
                const employee = {
                  id: modal.employee?.id ?? crypto.randomUUID(),
                  name,
                  active: f.get("active") === "on",
                };
                if (saving) return;
                const result = await mutate(
                  () =>
                    modal.employee
                      ? updateEmployee(employee)
                      : createEmployee(employee),
                  (previous, saved) => ({
                    ...previous,
                    employees: modal.employee
                      ? previous.employees.map((v) =>
                          v.id === saved.id ? saved : v,
                        )
                      : [...previous.employees, saved],
                  }),
                );
                if (result) return;
                setMessage("Đã lưu nhân viên trên Supabase");
                setModal(null);
              }}
            >
              <fieldset disabled={saving}>
                <label className="field">
                  Họ và tên
                  <input
                    name="name"
                    required
                    maxLength={100}
                    defaultValue={modal.employee?.name}
                    placeholder="Nhập họ và tên"
                  />
                </label>
                <label className="checkbox">
                  <input
                    name="active"
                    type="checkbox"
                    defaultChecked={modal.employee?.active ?? true}
                  />{" "}
                  Đang hoạt động
                </label>
                <button className="button primary full" disabled={saving}>
                  {saving ? "Đang lưu…" : "Lưu nhân viên"}
                </button>
              </fieldset>
            </form>
          )}
        </Sheet>
      )}
    </div>
  );
}
