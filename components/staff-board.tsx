"use client";

import { useEffect, useRef, useState } from "react";
import { pingStaff, setCurrentNote, setStaffStatus } from "@/app/actions";
import { StatusCountdown } from "@/components/status-countdown";
import { SubmitButton } from "@/components/submit-button";
import {
  MAX_STATUS_MINUTES,
  RETURN_STATUSES,
  STAFF_STATUSES,
  STAFF_STATUS_EMOJI,
  STAFF_STATUS_LABELS,
  STATUS_MINUTE_PRESETS,
  isTimedStatus,
  staffStatusText,
  type ReturnStatus,
  type StaffStatus,
} from "@/lib/staff-status";

type StaffView = {
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

const statusClass: Record<StaffStatus, string> = {
  focus:
    "bg-emerald-700 text-white dark:bg-emerald-500 dark:text-emerald-950",
  do_not_disturb: "bg-rose-700 text-white dark:bg-rose-500 dark:text-rose-950",
  toilet: "bg-amber-600 text-white dark:bg-amber-400 dark:text-amber-950",
  solat: "bg-sky-700 text-white dark:bg-sky-400 dark:text-sky-950",
  afk: "bg-stone-600 text-white dark:bg-stone-400 dark:text-stone-950",
};

const idleStatusClass =
  "border border-stone-300 text-stone-700 dark:border-stone-700 dark:text-stone-300";

export function StaffBoard({ staff }: { staff: StaffView[] }) {
  const [openId, setOpenId] = useState<number | null>(null);

  return (
    <>
      <StaffCards staff={staff} openId={openId} onOpen={setOpenId} />
      <StaffTable staff={staff} openId={openId} onOpen={setOpenId} />
    </>
  );
}

function statusButtonClass(status: StaffStatus, selected: boolean, compact: boolean) {
  const tone = selected ? statusClass[status] : idleStatusClass;
  return compact
    ? `inline-flex size-11 items-center justify-center rounded-full text-lg disabled:opacity-60 ${tone}`
    : `min-h-9 rounded-full px-2.5 py-1 text-xs font-medium disabled:opacity-60 ${tone}`;
}

function StatusButtons({
  person,
  compact = false,
}: {
  person: StaffView;
  compact?: boolean;
}) {
  const [picking, setPicking] = useState<StaffStatus | null>(null);
  const [custom, setCustom] = useState(false);
  const [returnTo, setReturnTo] = useState<ReturnStatus>("focus");

  useEffect(() => {
    setPicking(null);
    setCustom(false);
  }, [person.status, person.statusMinutes]);

  return (
    <div className="flex flex-col gap-2">
      <div
        className="flex flex-wrap gap-2"
        role="group"
        aria-label={`Status for ${person.name}`}
      >
        {STAFF_STATUSES.map((status) => {
          const selected = person.status === status;
          const label = staffStatusText(status);
          const className = statusButtonClass(status, selected, compact);

          if (isTimedStatus(status)) {
            return (
              <button
                key={status}
                type="button"
                aria-pressed={selected}
                aria-expanded={picking === status}
                aria-label={label}
                onClick={() => {
                  setPicking(status);
                  setCustom(false);
                }}
                className={className}
              >
                {compact ? STAFF_STATUS_EMOJI[status] : label}
              </button>
            );
          }

          return (
            <form key={status} action={setStaffStatus}>
              <input type="hidden" name="id" value={person.id} />
              <input type="hidden" name="status" value={status} />
              <SubmitButton
                idle={compact ? STAFF_STATUS_EMOJI[status] : label}
                label={label}
                pendingLabel="…"
                pressed={selected}
                className={className}
              />
            </form>
          );
        })}
      </div>
      {person.statusUntil ? (
        <div className="flex flex-wrap items-center gap-2">
          <StatusCountdown until={person.statusUntil} />
          <form action={setStaffStatus}>
            <input type="hidden" name="id" value={person.id} />
            <input
              type="hidden"
              name="status"
              value={person.returnStatus ?? "focus"}
            />
            <SubmitButton
              idle="End"
              pendingLabel="…"
              label={`End ${person.name}'s timer`}
              className="h-9 rounded-full border border-stone-300 px-3 text-xs font-medium disabled:opacity-60 dark:border-stone-700"
            />
          </form>
          <p className="text-xs text-stone-500">
            Returns to {STAFF_STATUS_LABELS[person.returnStatus ?? "focus"]}
          </p>
        </div>
      ) : null}
      {picking && isTimedStatus(picking) ? (
        <div className="flex flex-col gap-2">
          <p className="text-xs text-stone-500">
            {staffStatusText(picking)} time
          </p>
          <div className="flex flex-wrap gap-2" role="group" aria-label="Return status">
            {RETURN_STATUSES.map((status) => (
              <button
                key={status}
                type="button"
                aria-pressed={returnTo === status}
                onClick={() => setReturnTo(status)}
                className={`min-h-9 rounded-full px-3 text-xs font-medium ${
                  returnTo === status
                    ? statusClass[status]
                    : idleStatusClass
                }`}
              >
                {STAFF_STATUS_LABELS[status]}
              </button>
            ))}
          </div>
          <div className="flex flex-wrap gap-2">
            {STATUS_MINUTE_PRESETS.map((minutes) => (
              <form key={minutes} action={setStaffStatus}>
                <input type="hidden" name="id" value={person.id} />
                <input type="hidden" name="status" value={picking} />
                <input type="hidden" name="minutes" value={minutes} />
                <input type="hidden" name="returnStatus" value={returnTo} />
                <SubmitButton
                  idle={`${minutes}`}
                  label={`${minutes} minutes`}
                  pendingLabel="…"
                  className="min-h-11 min-w-11 rounded-full border border-stone-300 px-2 text-sm font-medium disabled:opacity-60 dark:border-stone-700"
                />
              </form>
            ))}
            <button
              type="button"
              onClick={() => setCustom(true)}
              className="min-h-11 rounded-full border border-stone-300 px-3 text-sm font-medium dark:border-stone-700"
            >
              Custom
            </button>
          </div>
          {custom ? (
            <form action={setStaffStatus} className="flex gap-2">
              <input type="hidden" name="id" value={person.id} />
              <input type="hidden" name="status" value={picking} />
              <input type="hidden" name="returnStatus" value={returnTo} />
              <input
                name="minutes"
                type="number"
                min={1}
                max={MAX_STATUS_MINUTES}
                required
                inputMode="numeric"
                placeholder="Minutes"
                aria-label={`Custom minutes for ${person.name}`}
                className="h-11 w-28 rounded-lg border border-stone-300 bg-white px-3 text-base dark:border-stone-700 dark:bg-stone-950"
              />
              <SubmitButton
                idle="Set"
                pendingLabel="…"
                className="h-11 rounded-lg bg-stone-900 px-4 text-sm font-medium text-stone-50 disabled:opacity-60 dark:bg-stone-100 dark:text-stone-900"
              />
            </form>
          ) : null}
        </div>
      ) : null}
    </div>
  );
}

function PingButton({
  person,
  compact = false,
}: {
  person: StaffView;
  compact?: boolean;
}) {
  const count = person.pingCount;

  return (
    <form action={pingStaff} className="shrink-0">
      <input type="hidden" name="id" value={person.id} />
      <SubmitButton
        idle={count > 0 ? `🔔 Ping ${count}` : "🔔 Ping"}
        label={`Ping ${person.name}. ${count} stacked.`}
        pendingLabel="…"
        className={
          compact
            ? "min-h-11 rounded-full border border-amber-700 px-3 text-sm font-medium text-amber-800 disabled:opacity-60 dark:border-amber-400 dark:text-amber-300"
            : "min-h-9 rounded-full border border-amber-700 px-2.5 py-1 text-xs font-medium text-amber-800 disabled:opacity-60 dark:border-amber-400 dark:text-amber-300"
        }
      />
    </form>
  );
}

function AnimatedNote({
  open,
  person,
  onClose,
  className = "",
}: {
  open: boolean;
  person: StaffView;
  onClose: () => void;
  className?: string;
}) {
  const [mounted, setMounted] = useState(open);
  const [visible, setVisible] = useState(open);

  useEffect(() => {
    if (open) {
      setMounted(true);
      const frame = requestAnimationFrame(() => setVisible(true));
      return () => cancelAnimationFrame(frame);
    }

    setVisible(false);
    const timer = window.setTimeout(() => setMounted(false), 240);
    return () => window.clearTimeout(timer);
  }, [open]);

  if (!mounted) {
    return null;
  }

  return (
    <div
      className={`note-reveal ${className}`}
      data-open={visible ? "true" : "false"}
    >
      <div className="note-reveal-inner">
        <NoteEditor person={person} onClose={onClose} />
      </div>
    </div>
  );
}

function NoteEditor({
  person,
  onClose,
}: {
  person: StaffView;
  onClose: () => void;
}) {
  const noteLimit = 128;
  const [note, setNote] = useState("");
  const charactersLeft = noteLimit - note.length;
  const runningLow = charactersLeft < 20;

  return (
    <form action={setCurrentNote} className="flex flex-col gap-2">
      <input type="hidden" name="id" value={person.id} />
      <input
        name="note"
        value={note}
        maxLength={noteLimit}
        placeholder="New current note"
        aria-label={`Current note for ${person.name}`}
        onChange={(event) => setNote(event.target.value)}
        className="h-11 min-w-0 rounded-lg border border-stone-300 bg-white px-3 text-base lg:h-9 lg:px-2 lg:text-sm dark:border-stone-700 dark:bg-stone-950"
      />
      <p
        aria-live="polite"
        className={`text-right text-xs ${
          runningLow
            ? "animate-pulse font-medium text-rose-600 motion-reduce:animate-none dark:text-rose-300"
            : "text-stone-500"
        }`}
      >
        {charactersLeft} left
      </p>
      <div className="flex gap-2">
        <SubmitButton
          idle="Save"
          pendingLabel="Saving…"
          className="h-11 rounded-lg bg-stone-900 px-4 text-sm font-medium text-stone-50 disabled:opacity-60 lg:h-9 dark:bg-stone-100 dark:text-stone-900"
        />
        <button
          type="button"
          onClick={onClose}
          className="h-11 rounded-lg border border-stone-300 px-4 text-sm font-medium lg:h-9 dark:border-stone-700"
        >
          Close
        </button>
      </div>
    </form>
  );
}

function NotePreview({
  text,
  empty,
  title,
  muted = false,
  prefix,
}: {
  text: string;
  empty: string;
  title: string;
  muted?: boolean;
  prefix?: string;
}) {
  const textRef = useRef<HTMLParagraphElement>(null);
  const dialogRef = useRef<HTMLDialogElement>(null);
  const [overflows, setOverflows] = useState(false);

  useEffect(() => {
    const element = textRef.current;
    if (!element || !text) {
      setOverflows(false);
      return;
    }

    const measure = () => {
      setOverflows(element.scrollHeight > element.clientHeight + 1);
    };

    measure();
    const observer = new ResizeObserver(measure);
    observer.observe(element);
    return () => observer.disconnect();
  }, [text]);

  const tone = muted ? "text-stone-500" : "";

  return (
    <div className={tone}>
      <p
        ref={textRef}
        className="max-h-10 overflow-hidden wrap-break-word whitespace-pre-wrap text-sm"
      >
        {prefix ? `${prefix} ` : null}
        {text || <span className="text-stone-400">{empty}</span>}
      </p>
      {overflows ? (
        <button
          type="button"
          onClick={() => dialogRef.current?.showModal()}
          className="mt-1 text-sm font-medium text-stone-900 underline underline-offset-2 dark:text-stone-100"
        >
          View more
        </button>
      ) : null}
      <dialog
        ref={dialogRef}
        aria-label={title}
        className="w-[min(32rem,calc(100%-2rem))] rounded-2xl border border-stone-200 bg-white p-0 text-stone-900 open:fixed open:inset-0 open:m-auto dark:border-stone-700 dark:bg-stone-900 dark:text-stone-100"
        onClick={(event) => {
          if (event.target === dialogRef.current) {
            dialogRef.current?.close();
          }
        }}
      >
        <div className="flex items-center justify-between gap-3 border-b border-stone-200 px-4 py-3 dark:border-stone-700">
          <h2 className="font-semibold">{title}</h2>
          <button
            type="button"
            onClick={() => dialogRef.current?.close()}
            className="rounded-full border border-stone-300 px-3 py-1 text-sm dark:border-stone-600"
          >
            Close
          </button>
        </div>
        <p className="max-h-[70vh] overflow-y-auto px-4 py-4 wrap-break-word whitespace-pre-wrap text-sm">
          {text}
        </p>
      </dialog>
    </div>
  );
}

function LastUpdate({
  at,
  withLabel = true,
}: {
  at: string;
  withLabel?: boolean;
}) {
  const date = new Date(at);
  const label = new Intl.DateTimeFormat(undefined, {
    month: "short",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit",
  }).format(date);

  return (
    <time
      dateTime={date.toISOString()}
      suppressHydrationWarning
      className="block text-xs font-normal text-stone-500"
    >
      {withLabel ? `Updated ${label}` : label}
    </time>
  );
}

function StaffName({
  person,
  open,
  onOpen,
}: {
  person: StaffView;
  open: boolean;
  onOpen: (id: number) => void;
}) {
  return (
    <button
      type="button"
      onClick={() => onOpen(person.id)}
      aria-expanded={open}
      className="text-left font-semibold wrap-break-word underline-offset-2 hover:underline"
    >
      {person.name}
    </button>
  );
}

function StaffCards({
  staff,
  openId,
  onOpen,
}: {
  staff: StaffView[];
  openId: number | null;
  onOpen: (id: number | null) => void;
}) {
  if (staff.length === 0) {
    return (
      <p className="rounded-2xl border border-stone-200 px-4 py-8 text-sm text-stone-500 lg:hidden dark:border-stone-800 dark:text-stone-400">
        No staff yet. Add a name on the Add staff page.
      </p>
    );
  }

  return (
    <ul className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:hidden">
      {staff.map((person) => {
        const open = openId === person.id;
        return (
          <li
            key={person.id}
            className="flex flex-col gap-3 rounded-2xl border border-stone-200 p-3 dark:border-stone-800"
          >
            <div className="flex items-start justify-between gap-3">
              <div className="flex min-w-0 flex-col gap-1">
                <StaffName person={person} open={open} onOpen={onOpen} />
                <LastUpdate at={person.updatedAt} />
              </div>
              <PingButton person={person} compact />
            </div>
            <StatusButtons person={person} compact />
            <NotePreview
              text={person.currentNote}
              empty="No current note"
              title={`${person.name}'s current note`}
            />
            <AnimatedNote
              open={open}
              person={person}
              onClose={() => onOpen(null)}
            />
            <NotePreview
              text={person.previousNote}
              empty="none"
              title={`${person.name}'s previous note`}
              muted
              prefix="Previous:"
            />
          </li>
        );
      })}
    </ul>
  );
}

function StaffTable({
  staff,
  openId,
  onOpen,
}: {
  staff: StaffView[];
  openId: number | null;
  onOpen: (id: number | null) => void;
}) {
  return (
    <div className="hidden overflow-x-auto rounded-2xl border border-stone-200 lg:block dark:border-stone-800">
      <table className="w-full table-fixed border-collapse text-left text-sm">
        <caption className="sr-only">Staff status</caption>
        <thead className="bg-stone-100 text-stone-600 dark:bg-stone-900 dark:text-stone-400">
          <tr>
            <th className="w-[14%] px-4 py-3 font-medium">Name</th>
            <th className="w-[28%] px-4 py-3 font-medium">Status</th>
            <th className="w-[24%] px-4 py-3 font-medium">Current note</th>
            <th className="w-[18%] px-4 py-3 font-medium">Previous note</th>
            <th className="w-[16%] px-4 py-3 font-medium">Updated</th>
          </tr>
        </thead>
        <tbody>
          {staff.length === 0 ? (
            <tr>
              <td
                colSpan={5}
                className="px-4 py-8 text-stone-500 dark:text-stone-400"
              >
                No staff yet. Add a name on the Add staff page.
              </td>
            </tr>
          ) : (
            staff.map((person) => {
              const open = openId === person.id;
              return (
                <tr
                  key={person.id}
                  className="border-t border-stone-200 align-top dark:border-stone-800"
                >
                  <td className="px-4 py-4">
                    <StaffName person={person} open={open} onOpen={onOpen} />
                  </td>
                  <td className="px-4 py-4">
                    <div className="flex flex-wrap items-center gap-2">
                      <StatusButtons person={person} />
                      <PingButton person={person} />
                    </div>
                  </td>
                  <td className="max-w-0 px-4 py-4">
                    <NotePreview
                      text={person.currentNote}
                      empty="No current note"
                      title={`${person.name}'s current note`}
                    />
                    <AnimatedNote
                      open={open}
                      person={person}
                      onClose={() => onOpen(null)}
                      className="mt-2"
                    />
                  </td>
                  <td className="max-w-0 px-4 py-4 text-stone-600 dark:text-stone-400">
                    <NotePreview
                      text={person.previousNote}
                      empty="No previous note"
                      title={`${person.name}'s previous note`}
                      muted
                    />
                  </td>
                  <td className="px-4 py-4">
                    <LastUpdate at={person.updatedAt} withLabel={false} />
                  </td>
                </tr>
              );
            })
          )}
        </tbody>
      </table>
    </div>
  );
}
