import type { AppData } from "@/types";
import { getVietnamMonthKey } from "@/lib/date";
export function createMockData(): AppData {
  const month = getVietnamMonthKey();
  return {
    employees: [
      "Nguyễn Minh Anh",
      "Trần Hoàng Nam",
      "Lê Thảo Vy",
      "Phạm Đức Huy",
      "Hoàng Ngọc Linh",
      "Ngô Tuấn Kiệt",
      "Đặng Mai Phương",
    ].map((name, i) => ({ id: `employee-${i + 1}`, name, active: true })),
    absences: [
      {
        id: "absence-1",
        employeeId: "employee-2",
        date: `${month}-02`,
        type: "paid_leave",
        note: "Việc gia đình",
      },
      {
        id: "absence-2",
        employeeId: "employee-2",
        date: `${month}-08`,
        type: "paid_leave",
      },
      {
        id: "absence-3",
        employeeId: "employee-5",
        date: `${month}-02`,
        type: "unpaid_leave",
        note: "Nghỉ cá nhân",
      },
      {
        id: "absence-4",
        employeeId: "employee-3",
        date: `${month}-15`,
        type: "paid_leave",
      },
    ],
    settings: [],
  };
}
