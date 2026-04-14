import { cn } from "@/lib/utils";
import type { UserRole } from "@/lib/auth-context";

const ROLE_STYLES: Record<UserRole, { label: string; className: string }> = {
  ADMIN: {
    label: "Administrador",
    className: "bg-purple-100 text-purple-700 ring-purple-200",
  },
  PASTOR: {
    label: "Pastor",
    className: "bg-blue-100 text-blue-700 ring-blue-200",
  },
  SUPERVISOR: {
    label: "Supervisor",
    className: "bg-emerald-100 text-emerald-700 ring-emerald-200",
  },
  LEADER: {
    label: "Líder",
    className: "bg-amber-100 text-amber-700 ring-amber-200",
  },
  ASSISTANT: {
    label: "Assistente",
    className: "bg-slate-100 text-slate-700 ring-slate-200",
  },
};

export function UserRoleBadge({ role }: { role: UserRole }) {
  const style = ROLE_STYLES[role];
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full px-2 py-0.5 text-xs font-semibold ring-1 ring-inset",
        style.className
      )}
    >
      {style.label}
    </span>
  );
}

export function roleLabel(role: UserRole) {
  return ROLE_STYLES[role].label;
}
