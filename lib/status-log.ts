import "server-only";
import { createClient } from "@/lib/db";
import { expireDueStatuses } from "@/lib/staff";
import {
  STAFF_STATUS_LABELS,
  isStaffStatus,
  type StaffStatus,
} from "@/lib/staff-status";

export type StatusLogEvent = "set" | "ended" | "expired";

export type StatusLog = {
  id: number;
  staffName: string;
  status: StaffStatus;
  statusMinutes: number | null;
  event: StatusLogEvent;
  fromStatus: StaffStatus | null;
  returnStatus: StaffStatus | null;
  createdAt: string;
};

type StatusLogRow = {
  id: string | number;
  staffName: string;
  status: string;
  statusMinutes: number | null;
  event: string;
  fromStatus: string | null;
  returnStatus: string | null;
  createdAt: string | Date;
};

function toStatus(value: string | null): StaffStatus | null {
  return value && isStaffStatus(value) ? value : null;
}

function toStatusLog(row: StatusLogRow): StatusLog | null {
  const status = toStatus(row.status);
  if (!status) {
    return null;
  }

  const createdAt =
    row.createdAt instanceof Date
      ? row.createdAt.toISOString()
      : new Date(row.createdAt).toISOString();

  const event: StatusLogEvent =
    row.event === "ended" || row.event === "expired" ? row.event : "set";

  return {
    id: Number(row.id),
    staffName: row.staffName,
    status,
    statusMinutes:
      row.statusMinutes === null ? null : Number(row.statusMinutes),
    event,
    fromStatus: toStatus(row.fromStatus),
    returnStatus: toStatus(row.returnStatus),
    createdAt,
  };
}

export function statusLogMessage(entry: StatusLog) {
  const name = entry.staffName;

  if (entry.event === "expired" && entry.fromStatus) {
    const away = STAFF_STATUS_LABELS[entry.fromStatus];
    const back = STAFF_STATUS_LABELS[entry.status];
    return `${name}'s ${away} time is up. They did not end it, so their status is now ${back}.`;
  }

  if (entry.event === "ended" && entry.fromStatus) {
    const away = STAFF_STATUS_LABELS[entry.fromStatus];
    const back = STAFF_STATUS_LABELS[entry.status];
    return `${name} ended ${away} early. Their status is now ${back}.`;
  }

  const label = STAFF_STATUS_LABELS[entry.status];
  const minutes =
    entry.statusMinutes === null ? "" : ` for ${entry.statusMinutes} min`;
  const back = entry.returnStatus
    ? ` They will return to ${STAFF_STATUS_LABELS[entry.returnStatus]}.`
    : "";

  return `${name} set ${label}${minutes}.${back}`;
}

export async function listStatusLogs(): Promise<StatusLog[]> {
  await expireDueStatuses();
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("status_log")
    .select(
      "id, staff_name, status, status_minutes, event, from_status, return_status, created_at",
    )
    .order("created_at", { ascending: false })
    .limit(200);

  if (error) {
    throw error;
  }

  return (data ?? []).flatMap((row) => {
    const entry = toStatusLog({
      id: row.id,
      staffName: row.staff_name,
      status: row.status,
      statusMinutes: row.status_minutes,
      event: row.event,
      fromStatus: row.from_status,
      returnStatus: row.return_status,
      createdAt: row.created_at,
    });
    return entry ? [entry] : [];
  });
}
