"use client";

import { Check, X } from "lucide-react";
import { cn } from "@/lib/utils";

type PasswordRequirementsProps = {
  value: string;
};

export const PASSWORD_MIN_LENGTH = 8;

export function validatePassword(value: string) {
  return {
    hasMinLength: value.length >= PASSWORD_MIN_LENGTH,
    hasLetter: /[a-zA-Z]/.test(value),
    hasNumber: /[0-9]/.test(value),
  };
}

export function isValidPassword(value: string) {
  const checks = validatePassword(value);
  return checks.hasMinLength && checks.hasLetter && checks.hasNumber;
}

export function PasswordRequirements({ value }: PasswordRequirementsProps) {
  const checks = validatePassword(value);
  const items = [
    { label: "Pelo menos 8 caracteres", ok: checks.hasMinLength },
    { label: "Pelo menos 1 letra", ok: checks.hasLetter },
    { label: "Pelo menos 1 número", ok: checks.hasNumber },
  ];
  return (
    <ul className="mt-2 space-y-1 text-xs">
      {items.map((item) => (
        <li
          key={item.label}
          className={cn(
            "flex items-center gap-1.5 transition-colors",
            item.ok ? "text-[#2d4a2b]" : "text-muted-foreground"
          )}
        >
          {item.ok ? (
            <Check className="h-3.5 w-3.5" strokeWidth={1.75} />
          ) : (
            <X className="h-3.5 w-3.5" strokeWidth={1.75} />
          )}
          {item.label}
        </li>
      ))}
    </ul>
  );
}
