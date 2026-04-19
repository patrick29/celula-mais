import { cn } from "@/lib/utils";
import type { UserRole } from "@/lib/auth-context";

const ROLE_STYLES: Record<UserRole, { label: string; className: string }> = {
  ADMIN: {
    label: "Administrador",
    className: "bg-[#f3dee4] text-[#6b2d3f] ring-[#f3dee4]",
  },
  PASTOR: {
    label: "Pastor",
    className: "bg-[#e5ecdf] text-[#2d4a2b] ring-[#e5ecdf]",
  },
  SUPERVISOR: {
    label: "Supervisor",
    className: "bg-[#e5ecdf] text-[#3a5e36] ring-[#e5ecdf]",
  },
  LEADER: {
    label: "Líder",
    className: "bg-[#f6ead0] text-[#b88a28] ring-[#f6ead0]",
  },
  ASSISTANT: {
    label: "Assistente",
    className: "bg-[#f5f1e6] text-[#4a433d] ring-[#ebe3cf]",
  },
};

export function UserRoleBadge({ role }: { role: UserRole }) {
  const style = ROLE_STYLES[role];
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ring-1 ring-inset",
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
