"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import type { ReactNode } from "react";

const links: { href: string; label: string; icon: ReactNode }[] = [
  {
    href: "/",
    label: "Home",
    icon: (
      <svg viewBox="0 0 24 24" aria-hidden="true" className="size-5">
        <path
          fill="currentColor"
          d="M12 3.2 3 11h2v9h5v-6h4v6h5v-9h2L12 3.2Z"
        />
      </svg>
    ),
  },
  {
    href: "/log",
    label: "Log",
    icon: (
      <svg viewBox="0 0 24 24" aria-hidden="true" className="size-5">
        <path
          fill="currentColor"
          d="M6 3h9l5 5v13a1 1 0 0 1-1 1H6a1 1 0 0 1-1-1V4a1 1 0 0 1 1-1Zm8 1.5V9h4.5L14 4.5ZM8 12h8v1.5H8V12Zm0 3.5h8V17H8v-1.5Z"
        />
      </svg>
    ),
  },
  {
    href: "/add/staff",
    label: "Add staff",
    icon: (
      <svg viewBox="0 0 24 24" aria-hidden="true" className="size-5">
        <path
          fill="currentColor"
          d="M9 12a4 4 0 1 0-4-4 4 4 0 0 0 4 4Zm0 2c-3.3 0-6 1.8-6 4v1h8.2a6 6 0 0 1-.2-1.5A5.5 5.5 0 0 1 15 12.1 9.7 9.7 0 0 0 9 14Zm9-1v-3h-2v3h-3v2h3v3h2v-3h3v-2h-3Z"
        />
      </svg>
    ),
  },
  {
    href: "/settings",
    label: "Settings",
    icon: (
      <svg viewBox="0 0 24 24" aria-hidden="true" className="size-5">
        <path
          fill="currentColor"
          d="M19.4 13a7.7 7.7 0 0 0 .1-1 7.7 7.7 0 0 0-.1-1l2-1.6-2-3.4-2.4 1a7.4 7.4 0 0 0-1.7-1L15 2h-4l-.3 2.9a7.4 7.4 0 0 0-1.7 1l-2.4-1-2 3.4L4.6 11a7.7 7.7 0 0 0 0 2l-2 1.6 2 3.4 2.4-1a7.4 7.4 0 0 0 1.7 1L11 22h4l.3-2.9a7.4 7.4 0 0 0 1.7-1l2.4 1 2-3.4-2-1.7ZM13 15.5A3.5 3.5 0 1 1 16.5 12 3.5 3.5 0 0 1 13 15.5Z"
        />
      </svg>
    ),
  },
];

export function SiteNav() {
  const pathname = usePathname();

  return (
    <nav className="flex items-center gap-1">
      {links.map((link) => {
        const active =
          link.href === "/"
            ? pathname === "/"
            : pathname.startsWith(link.href);

        return (
          <Link
            key={link.href}
            href={link.href}
            aria-label={link.label}
            title={link.label}
            aria-current={active ? "page" : undefined}
            className={`inline-flex size-10 items-center justify-center gap-2 rounded-full lg:h-10 lg:w-auto lg:px-3 ${
              active
                ? "bg-stone-900 text-stone-50 dark:bg-stone-100 dark:text-stone-900"
                : "text-stone-600 hover:bg-stone-200/70 dark:text-stone-300 dark:hover:bg-stone-800"
            }`}
          >
            {link.icon}
            <span className="hidden text-sm font-medium lg:inline">
              {link.label}
            </span>
          </Link>
        );
      })}
    </nav>
  );
}
