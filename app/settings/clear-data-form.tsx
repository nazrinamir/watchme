"use client";

import { useActionState } from "react";
import { clearData, type ClearDataState } from "@/app/actions";
import { SubmitButton } from "@/components/submit-button";

export function ClearDataForm() {
  const [state, action] = useActionState<ClearDataState, FormData>(
    clearData,
    null,
  );

  return (
    <form action={action} className="flex flex-col gap-4">
      <label className="flex flex-col gap-2 text-sm font-medium">
        Password
        <input
          name="password"
          type="password"
          required
          autoComplete="off"
          className="h-11 rounded-xl border border-stone-300 bg-white px-3 text-base font-normal outline-none focus:border-amber-600 dark:border-stone-700 dark:bg-stone-950"
        />
      </label>
      {state && "error" in state ? (
        <p role="alert" className="text-sm text-rose-700 dark:text-rose-300">
          {state.error}
        </p>
      ) : null}
      {state && "cleared" in state ? (
        <p className="text-sm text-emerald-700 dark:text-emerald-300">
          Statuses, notes, pings, and the log are cleared.
        </p>
      ) : null}
      <SubmitButton
        idle="Clear data"
        pendingLabel="Clearing…"
        className="h-11 rounded-full bg-stone-900 px-5 text-sm font-medium text-stone-50 disabled:opacity-60 dark:bg-amber-500 dark:text-stone-950"
      />
    </form>
  );
}
