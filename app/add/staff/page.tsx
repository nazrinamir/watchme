import type { Metadata } from "next";
import { AddStaffForm } from "@/app/add/staff/add-staff-form";

export const metadata: Metadata = {
  title: "Add staff",
};

export default function AddStaffPage() {
  return (
    <main className="mx-auto flex w-full max-w-md flex-col gap-6 px-4 py-6 sm:px-6 sm:py-8 lg:px-8">
      <div>
        <h1 className="text-3xl font-semibold tracking-tight">Add staff</h1>
        <p className="mt-1 text-sm text-stone-600 dark:text-stone-400">
          Add a name. Status and notes are set from the home board.
        </p>
      </div>
      <AddStaffForm />
    </main>
  );
}
