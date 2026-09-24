import type { Metadata } from "next";
import { ClearDataForm } from "@/app/settings/clear-data-form";

export const metadata: Metadata = {
  title: "Settings",
};

export default function SettingsPage() {
  return (
    <main className="mx-auto flex w-full max-w-md flex-col gap-6 px-4 py-6 sm:px-6 sm:py-8">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight sm:text-3xl">
          Settings
        </h1>
        <p className="mt-1 text-sm text-stone-600 dark:text-stone-400">
          Clear statuses, notes, ping counts, and the status log. Staff names
          stay.
        </p>
      </div>
      <ClearDataForm />
    </main>
  );
}
