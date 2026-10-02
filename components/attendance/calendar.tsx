import { dateWeekday, getVietnamToday } from "@/lib/date";
import { dayWeight, datesInMonth } from "@/lib/attendance/calculations";
import type { Absence } from "@/types";
export function Calendar({
  month,
  selected,
  onSelect,
  absences,
}: {
  month: string;
  selected: string;
  onSelect: (date: string) => void;
  absences: Absence[];
}) {
  const dates = datesInMonth(month);
  const offset = (dateWeekday(dates[0]) + 6) % 7;
  return (
    <div className="card calendar">
      <div className="calendar-grid weekday">
        {["T2", "T3", "T4", "T5", "T6", "T7", "CN"].map((d) => (
          <span key={d}>{d}</span>
        ))}
      </div>
      <div className="calendar-grid">
        {Array.from({ length: offset }, (_, i) => (
          <span key={`empty-${i}`} />
        ))}
        {dates.map((date) => (
          <button
            key={date}
            aria-label={`${date}${absences.some((a) => a.date === date) ? ", có người nghỉ" : ""}`}
            aria-pressed={date === selected}
            onClick={() => onSelect(date)}
            className={`day ${dayWeight(date) === 0 ? "sunday" : ""} ${selected === date ? "selected" : ""} ${date === getVietnamToday() ? "today" : ""}`}
          >
            <span>{Number(date.slice(-2))}</span>
            {dayWeight(date) === 0.5 && <small>½</small>}
            {absences.some((a) => a.date === date) && <i />}
          </button>
        ))}
      </div>
      <div className="calendar-legend">
        <span>
          <i /> Có người nghỉ
        </span>
        <span>T7 · 0,5 công</span>
        <span>CN · 0 công</span>
      </div>
    </div>
  );
}
