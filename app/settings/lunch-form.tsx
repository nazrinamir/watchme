"use client";

import { useActionState } from "react";
import { saveLunchHours, type LunchHoursState } from "@/app/actions";
import { SubmitButton } from "@/components/submit-button";

export function LunchForm({ start, end }: { start: string; end: string }) {
  const [state, action] = useActionState<LunchHoursState, FormData>(
    saveLunchHours,
    null,
  );

  return (
    <form action={action} className="flex flex-col gap-4">
      <div className="grid grid-cols-2 gap-3">
        <label className="flex flex-col gap-2 text-sm font-medium">
          Starts
          <input
            name="start"
            type="time"
            required
            defaultValue={start}
            className="h-11 rounded-xl border border-stone-300 bg-white px-3 text-base font-normal dark:border-stone-700 dark:bg-stone-950"
          />
        </label>
        <label className="flex flex-col gap-2 text-sm font-medium">
          Ends
          <input
            name="end"
            type="time"
            required
            defaultValue={end}
            className="h-11 rounded-xl border border-stone-300 bg-white px-3 text-base font-normal dark:border-stone-700 dark:bg-stone-950"
          />
        </label>
      </div>
      {state && "error" in state ? (
        <p role="alert" className="text-sm text-rose-700 dark:text-rose-300">
          {state.error}
        </p>
      ) : null}
      {state && "saved" in state ? (
        <p className="text-sm text-emerald-700 dark:text-emerald-300">
          Lunch break time saved.
        </p>
      ) : null}
      <SubmitButton
        idle="Save lunch time"
        pendingLabel="Saving…"
        className="h-11 rounded-full border border-stone-300 px-5 text-sm font-medium disabled:opacity-60 dark:border-stone-700"
      />
    </form>
  );
}
