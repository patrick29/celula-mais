"use client";

import { useTransition } from "react";
import { LogOut, User as UserIcon } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";
import { signOut } from "@/actions/auth";
import { roleLabel } from "@/components/users/user-role-badge";
import type { UserRole } from "@/lib/auth-context";

export function UserMenu({
  fullName,
  email,
  role,
}: {
  fullName: string;
  email: string;
  role: UserRole;
}) {
  const [isPending, startTransition] = useTransition();

  const initials = fullName
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((p) => p[0])
    .join("")
    .toUpperCase();

  const handleSignOut = () => {
    startTransition(async () => {
      await signOut();
    });
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <button
          type="button"
          disabled={isPending}
          className="flex items-center gap-x-3 ml-2 border-l border-border pl-4 hover:opacity-80 transition-opacity disabled:opacity-50"
        >
          <div className="hidden md:flex flex-col text-right">
            <span className="text-sm font-medium text-foreground leading-tight">
              {fullName}
            </span>
            <span className="text-xs text-muted-foreground leading-tight">
              {roleLabel(role)}
            </span>
          </div>
          <div className="h-9 w-9 rounded-full bg-[#e5ecdf] flex items-center justify-center text-[#2d4a2b] font-medium text-sm border border-[#ebe3cf]">
            {initials || <UserIcon className="h-4 w-4" strokeWidth={1.75} />}
          </div>
        </button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="min-w-56">
        <DropdownMenuLabel>
          <div className="flex flex-col gap-0.5">
            <span className="text-sm font-medium text-foreground">
              {fullName}
            </span>
            <span className="text-xs text-muted-foreground font-normal">{email}</span>
          </div>
        </DropdownMenuLabel>
        <DropdownMenuSeparator />
        <DropdownMenuItem
          onClick={handleSignOut}
          disabled={isPending}
          className="text-destructive focus:text-destructive"
        >
          <LogOut className="h-4 w-4" />
          {isPending ? "Saindo…" : "Sair"}
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
