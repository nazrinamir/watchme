export const STAFF_STATUSES = [
  "focus",
  "do_not_disturb",
  "toilet",
  "solat",
  "afk",
] as const;

export type StaffStatus = (typeof STAFF_STATUSES)[number];

export const STAFF_STATUS_LABELS: Record<StaffStatus, string> = {
  focus: "Focus",
  do_not_disturb: "Do not disturb",
  toilet: "Toilet",
  solat: "Solat",
  afk: "AFK",
};

export const STAFF_STATUS_EMOJI: Record<StaffStatus, string> = {
  focus: "🎯",
  do_not_disturb: "🔕",
  toilet: "🚽",
  solat: "🕌",
  afk: "🚶",
};

export function staffStatusText(status: StaffStatus) {
  return `${STAFF_STATUS_EMOJI[status]} ${STAFF_STATUS_LABELS[status]}`;
}

export const TIMED_STATUSES = ["toilet", "solat", "afk"] as const;

export const STATUS_MINUTE_PRESETS = [5, 10, 15, 20, 25, 30] as const;

export const MAX_STATUS_MINUTES = 240;

export function isTimedStatus(
  status: StaffStatus,
): status is (typeof TIMED_STATUSES)[number] {
  return TIMED_STATUSES.some((timed) => timed === status);
}

export function isStatusMinutes(value: number) {
  return Number.isInteger(value) && value >= 1 && value <= MAX_STATUS_MINUTES;
}

export const RETURN_STATUSES = ["focus", "do_not_disturb"] as const;

export type ReturnStatus = (typeof RETURN_STATUSES)[number];

export function isReturnStatus(value: string): value is ReturnStatus {
  return RETURN_STATUSES.some((status) => status === value);
}

export function isStaffStatus(value: string): value is StaffStatus {
  return STAFF_STATUSES.some((status) => status === value);
}
