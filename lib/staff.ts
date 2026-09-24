import "server-only";
import { createClient } from "@/lib/db";
import {
  isReturnStatus,
  isStaffStatus,
  type ReturnStatus,
  type StaffStatus,
} from "@/lib/staff-status";

export type Staff = {
  id: number;
  name: string;
  status: StaffStatus | null;
  statusMinutes: number | null;
  statusUntil: string | null;
  returnStatus: ReturnStatus | null;
  currentNote: string;
  previousNote: string;
  pingCount: number;
  updatedAt: string;
};

type StaffDb = {
  id: number;
  name: string;
  status: string | null;
  status_minutes: number | null;
  status_until: string | null;
  return_status: string | null;
  current_note: string;
  previous_note: string;
  ping_count: number;
  updated_at: string;
};

function assertOk(error: { message: string } | null) {
  if (error) {
    throw error;
  }
}

function toStaff(row: StaffDb): Staff {
  return {
    id: Number(row.id),
    name: row.name,
    status: row.status && isStaffStatus(row.status) ? row.status : null,
    statusMinutes:
      row.status_minutes === null ? null : Number(row.status_minutes),
    statusUntil: row.status_until,
    returnStatus:
      row.return_status && isReturnStatus(row.return_status)
        ? row.return_status
        : null,
    currentNote: row.current_note,
    previousNote: row.previous_note,
    pingCount: Number(row.ping_count),
    updatedAt: row.updated_at,
  };
}

const staffColumns =
  "id, name, status, status_minutes, status_until, return_status, current_note, previous_note, ping_count, updated_at";

export async function listStaff(): Promise<Staff[]> {
  await expireDueStatuses();
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("staff")
    .select(staffColumns)
    .order("name");

  assertOk(error);
  return (data ?? []).map((row) => toStaff(row as StaffDb));
}

export async function clearOperationalData() {
  const supabase = await createClient();
  const cleared = await supabase
    .from("staff")
    .update({
      status: null,
      status_minutes: null,
      status_until: null,
      return_status: null,
      ping_count: 0,
      current_note: "",
      previous_note: "",
    })
    .gte("id", 1);
  assertOk(cleared.error);

  const deleted = await supabase.from("status_log").delete().gte("id", 1);
  assertOk(deleted.error);
}

export async function insertStaff(name: string) {
  const supabase = await createClient();
  const { error } = await supabase.from("staff").insert({ name });
  assertOk(error);
}

export async function expireDueStatuses() {
  const supabase = await createClient();
  const reset = await supabase.rpc("apply_daily_reset");
  assertOk(reset.error);

  const due = await supabase
    .from("staff")
    .select("id, name, status, return_status")
    .in("status", ["toilet", "solat", "afk"])
    .lte("status_until", new Date().toISOString())
    .not("status_until", "is", null);
  assertOk(due.error);

  for (const row of due.data ?? []) {
    const returnStatus =
      row.return_status === "do_not_disturb" ? "do_not_disturb" : "focus";
    const updated = await supabase
      .from("staff")
      .update({
        status: returnStatus,
        status_minutes: null,
        status_until: null,
        return_status: null,
        updated_at: new Date().toISOString(),
      })
      .eq("id", row.id);
    assertOk(updated.error);

    const logged = await supabase.from("status_log").insert({
      staff_id: row.id,
      staff_name: row.name,
      status: returnStatus,
      event: "expired",
      from_status: row.status,
      return_status: returnStatus,
    });
    assertOk(logged.error);
  }
}

export async function updateStaffStatus(
  id: number,
  status: StaffStatus,
  statusMinutes: number | null,
  returnStatus: ReturnStatus | null,
) {
  const supabase = await createClient();
  const previous = await supabase
    .from("staff")
    .select("id, name, status, status_until")
    .eq("id", id)
    .single();
  assertOk(previous.error);

  const fromStatus = previous.data?.status ?? null;
  const until = previous.data?.status_until
    ? new Date(previous.data.status_until)
    : null;
  const endedEarly =
    (fromStatus === "toilet" || fromStatus === "solat" || fromStatus === "afk") &&
    (status === "focus" || status === "do_not_disturb") &&
    until !== null &&
    until.getTime() > Date.now();

  const updated = await supabase
    .from("staff")
    .update({
      status,
      status_minutes: statusMinutes,
      status_until:
        statusMinutes === null
          ? null
          : new Date(Date.now() + statusMinutes * 60_000).toISOString(),
      return_status: returnStatus,
      updated_at: new Date().toISOString(),
    })
    .eq("id", id)
    .select("id, name, status, status_minutes, return_status")
    .single();
  assertOk(updated.error);

  const logged = await supabase.from("status_log").insert({
    staff_id: id,
    staff_name: updated.data.name,
    status: updated.data.status,
    status_minutes: updated.data.status_minutes,
    event: endedEarly ? "ended" : "set",
    from_status: endedEarly ? fromStatus : null,
    return_status: updated.data.return_status,
  });
  assertOk(logged.error);
}

export async function incrementPing(id: number) {
  const supabase = await createClient();
  const current = await supabase
    .from("staff")
    .select("ping_count")
    .eq("id", id)
    .single();
  assertOk(current.error);

  const updated = await supabase
    .from("staff")
    .update({ ping_count: Number(current.data.ping_count) + 1 })
    .eq("id", id);
  assertOk(updated.error);
}

export async function updateCurrentNote(id: number, note: string) {
  const supabase = await createClient();
  const current = await supabase
    .from("staff")
    .select("current_note")
    .eq("id", id)
    .single();
  assertOk(current.error);

  if (current.data.current_note === note) {
    return;
  }

  const updated = await supabase
    .from("staff")
    .update({
      previous_note: current.data.current_note,
      current_note: note,
      updated_at: new Date().toISOString(),
    })
    .eq("id", id);
  assertOk(updated.error);
}

export function isUniqueViolation(error: unknown) {
  return (
    typeof error === "object" &&
    error !== null &&
    "code" in error &&
    error.code === "23505"
  );
}
