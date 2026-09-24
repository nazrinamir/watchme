import "server-only";
import { sql } from "@/lib/db";

export type LunchSchedule = {
  start: string;
  end: string;
};

function toClock(value: string | Date) {
  if (value instanceof Date) {
    const hours = value.getUTCHours().toString().padStart(2, "0");
    const minutes = value.getUTCMinutes().toString().padStart(2, "0");
    return `${hours}:${minutes}`;
  }

  return value.slice(0, 5);
}

function minutesSinceMidnight(clock: string) {
  const [hours, minutes] = clock.split(":").map(Number);
  return hours * 60 + minutes;
}

export function isClock(value: string) {
  return /^([01]\d|2[0-3]):[0-5]\d$/.test(value);
}

export function isWithinLunch(nowClock: string, start: string, end: string) {
  const now = minutesSinceMidnight(nowClock);
  const from = minutesSinceMidnight(start);
  const to = minutesSinceMidnight(end);

  if (from === to) {
    return false;
  }

  if (from < to) {
    return now >= from && now < to;
  }

  return now >= from || now < to;
}

function malaysiaClock(date = new Date()) {
  const parts = new Intl.DateTimeFormat("en-GB", {
    timeZone: "Asia/Kuala_Lumpur",
    hour: "2-digit",
    minute: "2-digit",
    hourCycle: "h23",
  }).formatToParts(date);

  const hour = parts.find((part) => part.type === "hour")?.value ?? "00";
  const minute = parts.find((part) => part.type === "minute")?.value ?? "00";
  return `${hour}:${minute}`;
}

export async function getLunchSchedule(): Promise<LunchSchedule> {
  const rows = await sql<{ startTime: string | Date; endTime: string | Date }[]>`
    select start_time as "startTime", end_time as "endTime"
    from lunch_schedule
    where id = 1
  `;

  const row = rows[0];
  if (!row) {
    return { start: "13:00", end: "14:00" };
  }

  return { start: toClock(row.startTime), end: toClock(row.endTime) };
}

export async function isLunchBreakNow() {
  const schedule = await getLunchSchedule();
  return isWithinLunch(malaysiaClock(), schedule.start, schedule.end);
}

export async function saveLunchSchedule(start: string, end: string) {
  await sql`
    insert into lunch_schedule (id, start_time, end_time)
    values (1, ${start}::time, ${end}::time)
    on conflict (id) do update
    set start_time = excluded.start_time, end_time = excluded.end_time
  `;
}
