"use client";

export function LocalTime({ at }: { at: string }) {
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
    </time>
  );
}
