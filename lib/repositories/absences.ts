import type { Absence } from "@/types";
import { createClient } from "@/lib/supabase/client";
import { shiftMonth } from "@/lib/attendance/calculations";
import { absenceFromRow, absenceToRow } from "./mappers";
import { readAll, throwIfError } from "./shared";
export async function getAbsences() {
  const client = createClient();
  return (
    await readAll((from, to) =>
      client
        .from("absences")
        .select("*")
        .order("date")
        .order("id")
        .range(from, to),
    )
  ).map(absenceFromRow);
}
export async function getAbsencesByMonth(month: string) {
  if (!/^\d{4}-(0[1-9]|1[0-2])$/.test(month)) throw new Error("Invalid month");
  const client = createClient();
  return (
    await readAll((from, to) =>
      client
        .from("absences")
        .select("*")
        .gte("date", `${month}-01`)
        .lt("date", `${shiftMonth(month, 1)}-01`)
        .order("date")
        .order("id")
        .range(from, to),
    )
  ).map(absenceFromRow);
}
export async function getAbsencesByEmployee(id: string) {
  const client = createClient();
  return (
    await readAll((from, to) =>
      client
        .from("absences")
        .select("*")
        .eq("employee_id", id)
        .order("date")
        .order("id")
        .range(from, to),
    )
  ).map(absenceFromRow);
}
export async function createAbsence(value: Absence) {
  const { data, error } = await createClient()
    .from("absences")
    .insert(absenceToRow(value))
    .select()
    .single();
  throwIfError(error);
  return absenceFromRow(data!);
}
export async function updateAbsence(value: Absence) {
  const row = absenceToRow(value);
  const { data, error } = await createClient()
    .from("absences")
    .update({
      employee_id: row.employee_id,
      date: row.date,
      type: row.type,
      note: row.note,
    })
    .eq("id", value.id)
    .select()
    .single();
  throwIfError(error);
  return absenceFromRow(data!);
}
export async function deleteAbsence(id: string) {
  const { error } = await createClient()
    .from("absences")
    .delete()
    .eq("id", id)
    .select("id")
    .single();
  throwIfError(error);
}
