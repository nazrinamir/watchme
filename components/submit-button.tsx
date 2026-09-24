"use client";

import { useFormStatus } from "react-dom";

type SubmitButtonProps = {
  idle: string;
  pendingLabel: string;
  className?: string;
  pressed?: boolean;
  label?: string;
};

export function SubmitButton({
  idle,
  pendingLabel,
  className,
  pressed,
  label,
}: SubmitButtonProps) {
  const { pending } = useFormStatus();

  return (
    <button
      type="submit"
      className={className}
      disabled={pending}
      aria-pressed={pressed}
      aria-label={label}
    >
      {pending ? pendingLabel : idle}
    </button>
  );
}
