import type { Metadata } from "next";
import { ClearDataForm } from "@/app/settings/clear-data-form";
import { LunchForm } from "@/app/settings/lunch-form";
import { getLunchSchedule } from "@/lib/lunch";

export const metadata: Metadata = {
  title: "Settings",
};

export default async function SettingsPage() {
  const lunch = await getLunchSchedule();

  return (
    <main className="mx-auto flex w-full max-w-md flex-col gap-8 px-4 py-6 sm:px-6 sm:py-8">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight sm:text-3xl">
          Settings
        </h1>
        <p className="mt-1 text-sm text-stone-600 dark:text-stone-400">
          Lunch Break uses Malaysia time. It only appears between the saved
          start and end.
        </p>
      </div>
      <LunchForm start={lunch.start} end={lunch.end} />
      <div className="flex flex-col gap-4 border-t border-stone-200 pt-8 dark:border-stone-800">
        <p className="text-sm text-stone-600 dark:text-stone-400">
          Clear statuses, notes, ping counts, and the status log. Staff names
          stay.
        </p>
        <ClearDataForm />
      </div>
    </main>
  );
}
