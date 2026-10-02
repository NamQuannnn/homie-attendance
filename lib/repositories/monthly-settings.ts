import type { MonthlySettings } from "@/types";
import { createClient } from "@/lib/supabase/client";
import { settingsFromRow } from "./mappers";
import { readAll, throwIfError } from "./shared";
export async function getMonthlySettings(month: string) {
  const { data, error } = await createClient()
    .from("monthly_settings")
    .select("*")
    .eq("month", month)
    .maybeSingle();
  throwIfError(error);
  return data ? settingsFromRow(data) : null;
}
export async function getAllMonthlySettings() {
  const client = createClient();
  return (
    await readAll((from, to) =>
      client
        .from("monthly_settings")
        .select("*")
        .order("month")
        .range(from, to),
    )
  ).map(settingsFromRow);
}
export async function upsertMonthlySettings(value: MonthlySettings) {
  const { data, error } = await createClient()
    .from("monthly_settings")
    .upsert(
      {
        month: value.month,
        standard_workdays: value.standardWorkdays,
        paid_leave_allowance: value.paidLeaveAllowance,
      },
      { onConflict: "month" },
    )
    .select()
    .single();
  throwIfError(error);
  return settingsFromRow(data!);
}
