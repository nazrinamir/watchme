"use client";

import { useEffect, useState } from "react";

export function useNow() {
  const [now, setNow] = useState(() => Date.now());

  useEffect(() => {
    const timer = window.setInterval(() => setNow(Date.now()), 30_000);
    return () => window.clearInterval(timer);
  }, []);

  return now;
}

export function formatTimeAgo(at: string, now: number) {
  const diffSeconds = Math.round((new Date(at).getTime() - now) / 1000);
  const formatter = new Intl.RelativeTimeFormat(undefined, { numeric: "always" });
  const abs = Math.abs(diffSeconds);

  if (abs < 60) {
    return formatter.format(diffSeconds, "second");
  }

  if (abs < 3600) {
    return formatter.format(Math.round(diffSeconds / 60), "minute");
  }

  if (abs < 86400) {
    return formatter.format(Math.round(diffSeconds / 3600), "hour");
  }

  return formatter.format(Math.round(diffSeconds / 86400), "day");
}

export function LocalTime({ at }: { at: string }) {
  const now = useNow();
  const date = new Date(at);
  const label = new Intl.DateTimeFormat(undefined, {
    month: "short",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit",
  }).format(date);

  return (
    <time dateTime={date.toISOString()} suppressHydrationWarning>
      {label}
      <span className="text-stone-400"> · {formatTimeAgo(at, now)}</span>
    </time>
  );
}
