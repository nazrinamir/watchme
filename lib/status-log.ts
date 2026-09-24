import "server-only";
import { sql } from "@/lib/db";
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

  const rows = await sql<StatusLogRow[]>`
    select
      id,
      staff_name as "staffName",
      status,
      status_minutes as "statusMinutes",
      event,
      from_status as "fromStatus",
      return_status as "returnStatus",
      created_at as "createdAt"
    from status_log
    order by created_at desc, id desc
    limit 200
  `;

  return rows.flatMap((row) => {
    const entry = toStatusLog(row);
    return entry ? [entry] : [];
  });
}
