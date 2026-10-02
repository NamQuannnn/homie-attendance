import type { Employee } from "@/types";
import { createClient } from "@/lib/supabase/client";
import { employeeFromRow } from "./mappers";
import { readAll, throwIfError } from "./shared";
export async function getEmployees() {
  const client = createClient();
  return (
    await readAll((from, to) =>
      client
        .from("employees")
        .select("*")
        .order("created_at")
        .order("id")
        .range(from, to),
    )
  ).map(employeeFromRow);
}
export async function createEmployee(employee: Employee) {
  const { data, error } = await createClient()
    .from("employees")
    .insert(employee)
    .select()
    .single();
  throwIfError(error);
  return employeeFromRow(data!);
}
export async function updateEmployee(employee: Employee) {
  const { data, error } = await createClient()
    .from("employees")
    .update({ name: employee.name, active: employee.active })
    .eq("id", employee.id)
    .select()
    .single();
  throwIfError(error);
  return employeeFromRow(data!);
}
export async function setEmployeeActive(id: string, active: boolean) {
  const { data, error } = await createClient()
    .from("employees")
    .update({ active })
    .eq("id", id)
    .select()
    .single();
  throwIfError(error);
  return employeeFromRow(data!);
}
// Foreign key RESTRICT protects absence history. Inactivate employees who have records.
export async function deleteEmployee(id: string) {
  const { error } = await createClient()
    .from("employees")
    .delete()
    .eq("id", id)
    .select("id")
    .single();
  throwIfError(error);
}
