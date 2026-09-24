"use client";

import { useActionState } from "react";
import { addStaff, type AddStaffState } from "@/app/actions";
import { SubmitButton } from "@/components/submit-button";

export function AddStaffForm() {
  const [state, action] = useActionState<AddStaffState, FormData>(
    addStaff,
    null,
  );

  return (
    <form action={action} className="flex flex-col gap-4">
      <label className="flex flex-col gap-2 text-sm font-medium">
        Staff name
        <input
          name="name"
          required
          maxLength={80}
          autoComplete="off"
          placeholder="Name"
          className="h-11 rounded-xl border border-stone-300 bg-white px-3 text-base font-normal outline-none focus:border-amber-600 dark:border-stone-700 dark:bg-stone-950"
        />
      </label>
      {state?.error ? (
        <p role="alert" className="text-sm text-rose-700 dark:text-rose-300">
          {state.error}
        </p>
      ) : null}
      <SubmitButton
        idle="Add staff"
        pendingLabel="Adding…"
        className="h-11 rounded-full bg-stone-900 px-5 text-sm font-medium text-stone-50 disabled:opacity-60 dark:bg-amber-500 dark:text-stone-950"
      />
    </form>
  );
}
