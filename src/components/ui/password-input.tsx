"use client";

import * as React from "react";
import { Eye, EyeOff } from "lucide-react";

import { cn } from "@/lib/utils";
import { Input } from "@/components/ui/input";

type PasswordInputProps = Omit<React.ComponentProps<"input">, "type">;

export function PasswordInput({ className, ...props }: PasswordInputProps) {
  const [visible, setVisible] = React.useState(false);
  return (
    <div className="relative">
      <Input
        {...props}
        type={visible ? "text" : "password"}
        className={cn("pr-10", className)}
      />
      <button
        type="button"
        aria-label={visible ? "Ocultar senha" : "Mostrar senha"}
        onClick={() => setVisible((v) => !v)}
        className="absolute right-2 top-1/2 -translate-y-1/2 text-slate-400 transition-colors hover:text-slate-700"
        tabIndex={-1}
      >
        {visible ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
      </button>
    </div>
  );
}
