"use client";

import { usePathname } from "next/navigation";
import { SiteNav } from "@/components/site-nav";

export function SiteHeader() {
  const pathname = usePathname();

  if (pathname === "/lunch") {
    return null;
  }

  return (
    <header className="border-b border-stone-200 dark:border-stone-800">
      <div className="mx-auto flex w-full max-w-6xl flex-wrap items-center justify-between gap-3 px-4 py-3 sm:px-6 lg:px-8">
        <p className="text-lg font-semibold tracking-tight">Watchme</p>
        <SiteNav />
      </div>
    </header>
  );
}
