import { refreshStaff } from "@/app/actions";
import { StaffBoard } from "@/components/staff-board";
import { SubmitButton } from "@/components/submit-button";
import { listStaff, type Staff } from "@/lib/staff";

export const dynamic = "force-dynamic";

export default async function HomePage() {
  let staff: Staff[] = [];
  let loadError: string | null = null;

  try {
    staff = await listStaff();
  } catch (error) {
    console.error(error);
    loadError = "Could not load staff from the database.";
  }

  return (
    <main className="mx-auto flex w-full max-w-6xl flex-col gap-6 px-4 py-6 sm:px-6 sm:py-8 lg:px-8">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight sm:text-3xl">
            Staff
          </h1>
          <p className="mt-1 max-w-xl text-sm text-stone-600 dark:text-stone-400">
            Click a name to write a note. Saving moves the current note into
            previous.
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

      <StaffBoard staff={staff} />
    </main>
  );
}
