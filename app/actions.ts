"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import {
  isReturnStatus,
  isStaffStatus,
  isStatusMinutes,
  isTimedStatus,
} from "@/lib/staff-status";
import { isClock, saveLunchSchedule } from "@/lib/lunch";
import {
  clearOperationalData,
  expireDueStatuses,
  incrementPing,
  insertStaff,
  isUniqueViolation,
  updateCurrentNote,
  updateStaffStatus,
} from "@/lib/staff";

export type AddStaffState = { error: string } | null;

export type ClearDataState = { error: string } | { cleared: true } | null;

export type LunchHoursState = { error: string } | { saved: true } | null;

const CLEAR_DATA_PASSWORD = "pinksnake";

function staffId(formData: FormData) {
  const id = Number(formData.get("id"));
  if (!Number.isSafeInteger(id) || id <= 0) {
    return null;
  }
  return id;
}

export async function clearData(
  _state: ClearDataState,
  formData: FormData,
): Promise<ClearDataState> {
  const password = String(formData.get("password") ?? "");

  if (password !== CLEAR_DATA_PASSWORD) {
    return { error: "Wrong password." };
  }

  await clearOperationalData();
  revalidatePath("/");
  revalidatePath("/log");
  return { cleared: true };
}

export async function saveLunchHours(
  _state: LunchHoursState,
  formData: FormData,
): Promise<LunchHoursState> {
  const start = String(formData.get("start") ?? "").slice(0, 5);
  const end = String(formData.get("end") ?? "").slice(0, 5);

  if (!isClock(start) || !isClock(end)) {
    return { error: "Enter a start and end time." };
  }

  if (start === end) {
    return { error: "Start and end must be different." };
  }

  await saveLunchSchedule(start, end);
  revalidatePath("/settings");
  return { saved: true };
}

export async function refreshStaff() {
  await expireDueStatuses();
  revalidatePath("/");
  revalidatePath("/log");
}

export async function expireTimers() {
  await expireDueStatuses();
  revalidatePath("/");
  revalidatePath("/log");
}

export async function addStaff(
  _state: AddStaffState,
  formData: FormData,
): Promise<AddStaffState> {
  const name = String(formData.get("name") ?? "").trim();

  if (!name) {
    return { error: "Enter a staff name." };
  }

  if (name.length > 80) {
    return { error: "Name must be 80 characters or fewer." };
  }

  try {
    await insertStaff(name);
  } catch (error) {
    if (isUniqueViolation(error)) {
      return { error: "That staff name already exists." };
    }
    throw error;
  }

  revalidatePath("/");
  redirect("/");
}

export async function setStaffStatus(formData: FormData) {
  const id = staffId(formData);
  const status = String(formData.get("status") ?? "");

  if (id === null || !isStaffStatus(status)) {
    return;
  }

  const minutes = Number(formData.get("minutes"));
  const statusMinutes = isTimedStatus(status)
    ? isStatusMinutes(minutes)
      ? minutes
      : null
    : null;

  if (isTimedStatus(status) && statusMinutes === null) {
    return;
  }

  const returnRaw = String(formData.get("returnStatus") ?? "");
  const returnStatus = isTimedStatus(status)
    ? isReturnStatus(returnRaw)
      ? returnRaw
      : "focus"
    : null;

  await updateStaffStatus(id, status, statusMinutes, returnStatus);
  revalidatePath("/");
  revalidatePath("/log");
}

export async function pingStaff(formData: FormData) {
  const id = staffId(formData);
  if (id === null) {
    return;
  }

  await incrementPing(id);
  revalidatePath("/");
}

export async function setCurrentNote(formData: FormData) {
  const id = staffId(formData);
  const note = String(formData.get("note") ?? "").trim();

  if (id === null || note.length > 128) {
    return;
  }

  await updateCurrentNote(id, note);
  revalidatePath("/");
}
