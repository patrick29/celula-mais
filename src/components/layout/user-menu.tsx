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
          className="flex items-center gap-x-2 ml-2 border-l pl-4 hover:opacity-80 transition-opacity disabled:opacity-50"
        >
          <div className="flex flex-col text-right">
            <span className="text-sm font-semibold text-slate-900 leading-tight">
              {fullName}
            </span>
            <span className="text-xs text-slate-500 leading-tight">
              {roleLabel(role)}
            </span>
          </div>
          <div className="h-9 w-9 rounded-full bg-blue-100 flex items-center justify-center text-blue-700 font-bold border border-blue-200">
            {initials || <UserIcon className="h-4 w-4" />}
          </div>
        </button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="min-w-56">
        <DropdownMenuLabel>
          <div className="flex flex-col gap-0.5">
            <span className="text-sm font-semibold text-slate-900">
              {fullName}
            </span>
            <span className="text-xs text-slate-500 font-normal">{email}</span>
          </div>
        </DropdownMenuLabel>
        <DropdownMenuSeparator />
        <DropdownMenuItem
          onClick={handleSignOut}
          disabled={isPending}
          className="text-red-600 focus:text-red-700"
        >
          <LogOut className="h-4 w-4" />
          {isPending ? "Saindo…" : "Sair"}
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
