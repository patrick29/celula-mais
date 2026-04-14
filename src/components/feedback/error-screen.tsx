"use client";

import Link from "next/link";
import type { LucideIcon } from "lucide-react";
import { Button } from "@/components/ui/button";

type ErrorScreenAction = {
  label: string;
  icon?: LucideIcon;
  onClick?: () => void;
  href?: string;
};

interface ErrorScreenProps {
  icon: LucideIcon;
  iconColorClassName?: string;
  title: string;
  description: string;
  primaryAction: ErrorScreenAction;
  secondaryAction?: ErrorScreenAction;
  digest?: string;
  devErrorMessage?: string;
  variant?: "inline" | "fullscreen";
}

function renderAction(action: ErrorScreenAction, isPrimary: boolean) {
  const Icon = action.icon;
  const variant = isPrimary ? "default" : "outline";
  const content = (
    <>
      {Icon ? <Icon className="mr-2 h-4 w-4" /> : null}
      {action.label}
    </>
  );

  if (action.href) {
    return (
      <Button asChild variant={variant} key={action.label}>
        <Link href={action.href}>{content}</Link>
      </Button>
    );
  }

  return (
    <Button
      variant={variant}
      onClick={action.onClick}
      key={action.label}
      type="button"
    >
      {content}
    </Button>
  );
}

export function ErrorScreen({
  icon: Icon,
  iconColorClassName = "text-amber-500",
  title,
  description,
  primaryAction,
  secondaryAction,
  digest,
  devErrorMessage,
  variant = "inline",
}: ErrorScreenProps) {
  const outerClassName =
    variant === "fullscreen"
      ? "flex min-h-screen items-center justify-center px-6 bg-gradient-to-br from-slate-50 to-white"
      : "flex min-h-[60vh] items-center justify-center px-6";

  return (
    <div className={outerClassName}>
      <div className="w-full max-w-md rounded-2xl border border-white/40 bg-white/60 p-8 backdrop-blur-xl shadow-sm text-center">
        <div className="flex justify-center mb-5">
          <Icon className={`h-12 w-12 ${iconColorClassName}`} aria-hidden />
        </div>
        <h1 className="text-2xl font-semibold text-slate-800 mb-3">{title}</h1>
        <p className="text-sm text-slate-600 leading-relaxed mb-6">
          {description}
        </p>
        <div className="flex flex-col-reverse sm:flex-row sm:justify-center gap-3">
          {secondaryAction ? renderAction(secondaryAction, false) : null}
          {renderAction(primaryAction, true)}
        </div>
        {digest ? (
          <p className="mt-6 text-xs text-slate-400">Código do erro: {digest}</p>
        ) : null}
        {process.env.NODE_ENV !== "production" && devErrorMessage ? (
          <details className="mt-6 text-left text-xs text-slate-500">
            <summary className="cursor-pointer">Detalhes técnicos (dev)</summary>
            <pre className="mt-2 whitespace-pre-wrap break-words rounded-lg bg-slate-100 p-3 text-[11px] text-slate-700">
              {devErrorMessage}
            </pre>
          </details>
        ) : null}
      </div>
    </div>
  );
}
