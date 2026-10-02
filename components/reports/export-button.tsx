"use client";
import { useRef, useState } from "react";
import { Download, LoaderCircle } from "lucide-react";
import type { AppData, MonthlySettings } from "@/types";
import {
  attendanceFilename,
  buildAttendanceWorkbook,
} from "@/lib/reports/excel";
export function ExportButton({
  data,
  settings,
  disabled,
  onMessage,
}: {
  data: AppData;
  settings: MonthlySettings;
  disabled: boolean;
  onMessage: (message: string) => void;
}) {
  const [exporting, setExporting] = useState(false);
  const busy = useRef(false);
  async function exportFile() {
    if (busy.current || disabled) return;
    busy.current = true;
    setExporting(true);
    try {
      const { default: writeExcelFile } =
        await import("write-excel-file/browser");
      const blob = await writeExcelFile(
        buildAttendanceWorkbook(data, settings),
        { fontFamily: "Calibri", fontSize: 11 },
      ).toBlob();
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = attendanceFilename(settings.month);
      link.style.display = "none";
      document.body.appendChild(link);
      link.click();
      link.remove();
      // Safari may read the Blob after navigation/download starts. Never revoke immediately.
      window.setTimeout(() => URL.revokeObjectURL(url), 60000);
      onMessage(
        "Đã tạo file Excel. Trên iPhone, kiểm tra mục Tải về hoặc lưu file từ bản xem trước.",
      );
    } catch {
      onMessage("Không thể tạo file Excel. Vui lòng thử lại.");
    } finally {
      busy.current = false;
      setExporting(false);
    }
  }
  return (
    <button
      className="button secondary compact"
      disabled={disabled || exporting}
      onClick={() => void exportFile()}
      aria-busy={exporting}
    >
      {exporting ? <LoaderCircle size={17} /> : <Download size={17} />}{" "}
      {exporting ? "Đang xuất…" : "Xuất Excel"}
    </button>
  );
}
