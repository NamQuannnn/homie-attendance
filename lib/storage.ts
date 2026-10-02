import type { AppData } from "@/types";
import { getEmployees } from "@/lib/repositories/employees";
import { getAbsences } from "@/lib/repositories/absences";
import { getAllMonthlySettings } from "@/lib/repositories/monthly-settings";
// Supabase is the only source of business data. Never hydrate or persist attendance in localStorage.
export const repository = {
  async load(): Promise<AppData> {
    const [employees, absences, settings] = await Promise.all([
      getEmployees(),
      getAbsences(),
      getAllMonthlySettings(),
    ]);
    return { employees, absences, settings };
  },
};
