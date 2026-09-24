import type { Metadata } from "next";
import { refreshStaff } from "@/app/actions";
import { LocalTime } from "@/components/local-time";
import { SubmitButton } from "@/components/submit-button";
import {
  listStatusLogs,
  statusLogMessage,
  type StatusLog,
} from "@/lib/status-log";
import { STAFF_STATUS_EMOJI, isTimedStatus, type StaffStatus } from "@/lib/staff-status";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Log",
};

export default async function StatusLogPage() {
  let logs: StatusLog[] = [];
  let loadError: string | null = null;

  try {
    logs = await listStatusLogs();
  } catch (error) {
    console.error(error);
    loadError = "Could not load the status log.";
  }

  return (
    <main className="mx-auto flex w-full max-w-xl flex-col gap-6 px-4 py-6 sm:px-6 sm:py-8">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight sm:text-3xl">
            Status log
          </h1>
          <p className="mt-1 text-sm text-stone-600 dark:text-stone-400">
            Newest updates first.
          </p>
        </div>
        <form action={refreshStaff} className="sm:shrink-0">
          <SubmitButton
            idle="Refresh"
            pendingLabel="Refreshing…"
            className="h-11 w-full rounded-full border border-stone-300 px-4 text-sm font-medium disabled:opacity-60 sm:w-auto dark:border-stone-700"
          />
        </form>
      </div>

      {loadError ? (
        <p role="alert" className="text-sm text-rose-700 dark:text-rose-300">
          {loadError}
        </p>
      ) : null}

      {logs.length === 0 ? (
        <p className="rounded-2xl border border-stone-200 px-4 py-8 text-sm text-stone-500 dark:border-stone-800 dark:text-stone-400">
          No status changes yet.
        </p>
      ) : (
        <ul className="flex flex-col gap-3">
          {logs.map((entry) => (
            <li key={entry.id}>
              <LogMessage entry={entry} />
            </li>
          ))}
        </ul>
      )}
    </main>
  );
}

const statusWash: Record<StaffStatus, string> = {
  focus:
    "bg-[linear-gradient(to_top,rgb(4_120_87/0.45),transparent)] dark:bg-[linear-gradient(to_top,rgb(16_185_129/0.4),transparent)]",
  do_not_disturb:
    "bg-[linear-gradient(to_top,rgb(190_18_60/0.4),transparent)] dark:bg-[linear-gradient(to_top,rgb(244_63_94/0.4),transparent)]",
  toilet:
    "bg-[linear-gradient(to_top,rgb(217_119_6/0.45),transparent)] dark:bg-[linear-gradient(to_top,rgb(251_191_36/0.35),transparent)]",
  solat:
    "bg-[linear-gradient(to_top,rgb(3_105_161/0.4),transparent)] dark:bg-[linear-gradient(to_top,rgb(56_189_248/0.35),transparent)]",
  afk: "bg-[linear-gradient(to_top,rgb(87_83_78/0.4),transparent)] dark:bg-[linear-gradient(to_top,rgb(168_162_158/0.35),transparent)]",
};

function LogMessage({ entry }: { entry: StatusLog }) {
  const colorStatus =
    entry.event === "expired" || entry.event === "ended"
      ? (entry.fromStatus ?? entry.status)
      : entry.status;
  const timerStarted =
    entry.event === "set" &&
    isTimedStatus(entry.status) &&
    entry.statusMinutes !== null;
  const emoji = entry.event === "expired"
    ? "⏰"
    : timerStarted
      ? "⏳"
      : STAFF_STATUS_EMOJI[colorStatus];

  return (
    <article
      className={`flex gap-3 overflow-hidden rounded-2xl border border-stone-200 bg-white px-4 py-3 dark:border-stone-800 dark:bg-stone-900 ${statusWash[colorStatus]}`}
    >
      <span className="text-xl leading-6" aria-hidden>
        {emoji}
      </span>
      <div className="min-w-0 flex-1">
        <p className="text-sm leading-6">{statusLogMessage(entry)}</p>
        <p className="mt-1 text-xs text-stone-500">
          <LocalTime at={entry.createdAt} />
        </p>
      </div>
    </article>
  );
}
