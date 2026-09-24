import "server-only";
import { createClient } from "@/lib/db";

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
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("lunch_schedule")
    .select("start_time, end_time")
    .eq("id", 1)
    .maybeSingle();

  if (error) {
    throw error;
  }

  if (!data) {
    return { start: "13:00", end: "14:00" };
  }

  return { start: toClock(data.start_time), end: toClock(data.end_time) };
}

export async function isLunchBreakNow() {
  const schedule = await getLunchSchedule();
  return isWithinLunch(malaysiaClock(), schedule.start, schedule.end);
}

export async function saveLunchSchedule(start: string, end: string) {
  const supabase = await createClient();
  const { error } = await supabase.from("lunch_schedule").upsert({
    id: 1,
    start_time: start,
    end_time: end,
  });

  if (error) {
    throw error;
  }
}
