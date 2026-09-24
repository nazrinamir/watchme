import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Lunch Break",
};

export default function LunchPage() {
  return (
    <main className="flex min-h-svh items-center justify-center px-6">
      <h1 className="lunch-break text-center text-6xl font-semibold tracking-tight sm:text-8xl">
        Lunch Break
      </h1>
    </main>
  );
}
