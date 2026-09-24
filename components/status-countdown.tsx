"use client";

import { useEffect, useState, useTransition } from "react";
import { expireTimers } from "@/app/actions";

export function StatusCountdown({ until }: { until: string }) {
  const [now, setNow] = useState(() => Date.now());
  const [, startTransition] = useTransition();
  const end = new Date(until).getTime();
  const remaining = end - now;

  useEffect(() => {
    const timer = window.setInterval(() => setNow(Date.now()), 1000);
    return () => window.clearInterval(timer);
  }, []);

  useEffect(() => {
    if (remaining > 0) {
      return;
    }

    startTransition(() => {
      void expireTimers();
    });
    const retry = window.setInterval(() => {
      startTransition(() => {
        void expireTimers();
      });
    }, 3000);

    return () => window.clearInterval(retry);
  }, [remaining > 0]);

  const totalSeconds = Math.max(0, Math.ceil(remaining / 1000));
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;

  return (
    <p className="font-mono text-sm tabular-nums">
      {minutes}:{seconds.toString().padStart(2, "0")}
    </p>
  );
}
