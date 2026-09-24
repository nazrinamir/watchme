import "server-only";
import { sql } from "@/lib/db";
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

type StaffRow = {
  id: string | number;
  name: string;
  status: string | null;
  statusMinutes: number | null;
  statusUntil: string | Date | null;
  returnStatus: string | null;
  currentNote: string;
  previousNote: string;
  pingCount: number;
  updatedAt: string | Date;
};

function toStaff(row: StaffRow): Staff {
  const updatedAt =
    row.updatedAt instanceof Date
      ? row.updatedAt.toISOString()
      : new Date(row.updatedAt).toISOString();

  return {
    id: Number(row.id),
    name: row.name,
    status: row.status && isStaffStatus(row.status) ? row.status : null,
    statusMinutes:
      row.statusMinutes === null ? null : Number(row.statusMinutes),
    statusUntil:
      row.statusUntil === null
        ? null
        : row.statusUntil instanceof Date
          ? row.statusUntil.toISOString()
          : new Date(row.statusUntil).toISOString(),
    returnStatus:
      row.returnStatus && isReturnStatus(row.returnStatus)
        ? row.returnStatus
        : null,
    currentNote: row.currentNote,
    previousNote: row.previousNote,
    pingCount: Number(row.pingCount),
    updatedAt,
  };
}

export async function listStaff(): Promise<Staff[]> {
  await expireDueStatuses();

  const rows = await sql<StaffRow[]>`
    select
      id,
      name,
      status,
      status_minutes as "statusMinutes",
      status_until as "statusUntil",
      return_status as "returnStatus",
      current_note as "currentNote",
      previous_note as "previousNote",
      ping_count as "pingCount",
      updated_at as "updatedAt"
    from staff
    order by lower(name), id
  `;

  return rows.map(toStaff);
}

export async function clearOperationalData() {
  await sql`
    update staff
    set
      status = null,
      status_minutes = null,
      status_until = null,
      return_status = null,
      ping_count = 0,
      current_note = '',
      previous_note = ''
  `;
  await sql`delete from status_log`;
}

export async function insertStaff(name: string) {
  await sql`insert into staff (name) values (${name})`;
}

export async function expireDueStatuses() {
  await sql`select apply_daily_reset()`;

  await sql`
    with due as (
      select
        id,
        name,
        status as from_status,
        coalesce(return_status, 'focus') as return_status
      from staff
      where status in ('toilet', 'solat', 'afk')
        and status_until is not null
        and status_until <= now()
    ),
    updated as (
      update staff as person
      set
        status = due.return_status,
        status_minutes = null,
        status_until = null,
        return_status = null,
        updated_at = now()
      from due
      where person.id = due.id
      returning person.id, due.name, due.from_status, person.status
    )
    insert into status_log (
      staff_id,
      staff_name,
      status,
      event,
      from_status,
      return_status
    )
    select id, name, status, 'expired', from_status, status
    from updated
  `;
}

export async function updateStaffStatus(
  id: number,
  status: StaffStatus,
  statusMinutes: number | null,
  returnStatus: ReturnStatus | null,
) {
  await sql`
    with previous as (
      select id, status as from_status, status_until
      from staff
      where id = ${id}
    ),
    updated as (
      update staff
      set
        status = ${status},
        status_minutes = ${statusMinutes},
        status_until = case
          when ${statusMinutes}::integer is null then null
          else now() + make_interval(mins => ${statusMinutes}::integer)
        end,
        return_status = ${returnStatus},
        updated_at = now()
      where id = ${id}
      returning id, name, status, status_minutes, return_status
    )
    insert into status_log (
      staff_id,
      staff_name,
      status,
      status_minutes,
      event,
      from_status,
      return_status
    )
    select
      updated.id,
      updated.name,
      updated.status,
      updated.status_minutes,
      case
        when previous.from_status in ('toilet', 'solat', 'afk')
          and updated.status in ('focus', 'do_not_disturb')
          and previous.status_until is not null
          and previous.status_until > now()
        then 'ended'
        else 'set'
      end,
      case
        when previous.from_status in ('toilet', 'solat', 'afk')
          and updated.status in ('focus', 'do_not_disturb')
        then previous.from_status
        else null
      end,
      updated.return_status
    from updated
    join previous on previous.id = updated.id
  `;
}

export async function incrementPing(id: number) {
  await sql`
    update staff
    set ping_count = ping_count + 1
    where id = ${id}
  `;
}

export async function updateCurrentNote(id: number, note: string) {
  await sql`
    update staff
    set
      previous_note = current_note,
      current_note = ${note},
      updated_at = now()
    where id = ${id}
      and current_note is distinct from ${note}
  `;
}

export function isUniqueViolation(error: unknown) {
  return (
    typeof error === "object" &&
    error !== null &&
    "code" in error &&
    error.code === "23505"
  );
}
