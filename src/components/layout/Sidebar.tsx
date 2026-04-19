"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Users,
  UserIcon,
  Calendar,
  PieChart,
  LayoutDashboard,
  Settings,
  Grape,
} from "lucide-react";
import { cn } from "@/lib/utils";
import type { UserRole } from "@/lib/auth-context";

export function Sidebar({
  role,
  churchName,
  churchCity,
}: {
  role?: UserRole;
  churchName: string;
  churchCity: string | null;
}) {
  const pathname = usePathname();
  const canManageUsers = role === "ADMIN";
  const settingsHref = canManageUsers ? "/settings/usuarios" : "/settings";
  const isSettingsActive = pathname?.startsWith("/settings") ?? false;

  const routes = [
    { label: "Visão geral", icon: LayoutDashboard, href: "/" },
    { label: "Células", icon: Users, href: "/cells" },
    { label: "Membros", icon: UserIcon, href: "/members" },
    { label: "Encontros", icon: Calendar, href: "/meetings" },
    { label: "Relatórios", icon: PieChart, href: "/reports" },
  ];

  return (
    <div className="flex h-full flex-col overflow-y-auto bg-[#26421f] text-[#f5f1e6]/80 pb-6">
      <div className="flex h-20 items-center px-5 border-b border-[#1f3a1f]">
        <Link href="/" className="flex items-center gap-3 group">
          <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-[#d4a43c] text-[#1f3a1f] font-serif font-semibold shadow-sm group-hover:scale-105 transition-transform">
            <Grape className="h-5 w-5" strokeWidth={1.75} />
          </div>
          <div className="flex flex-col leading-tight min-w-0">
            <span className="text-sm font-semibold text-[#fbfaf6] tracking-tight truncate">
              {churchName}
            </span>
            <span className="text-[11px] text-[#f5f1e6]/60 truncate">
              {churchCity ?? "Gestão pastoral"}
            </span>
          </div>
        </Link>
      </div>

      <div className="flex flex-col w-full flex-1 mt-6 px-3 space-y-1">
        <div className="px-3 mb-2">
          <p className="text-[11px] font-medium uppercase tracking-[0.12em] text-[#f5f1e6]/45">
            Principal
          </p>
        </div>
        {routes.map((route) => {
          const isActive =
            pathname === route.href ||
            (route.href !== "/" && pathname?.startsWith(route.href));

          return (
            <Link
              key={route.href}
              href={route.href}
              className={cn(
                "group relative flex items-center gap-x-3 text-sm font-medium px-3 py-2.5 rounded-lg transition-colors",
                isActive
                  ? "bg-[#2d4a2b] text-[#fbfaf6]"
                  : "text-[#f5f1e6]/70 hover:bg-[#2d4a2b]/60 hover:text-[#fbfaf6]"
              )}
            >
              {isActive && (
                <span className="absolute left-0 top-2 bottom-2 w-[3px] rounded-r bg-[#d4a43c]" />
              )}
              <route.icon
                className={cn(
                  "h-[18px] w-[18px] shrink-0",
                  isActive ? "text-[#d4a43c]" : "text-[#f5f1e6]/60"
                )}
                strokeWidth={1.75}
              />
              {route.label}
            </Link>
          );
        })}
      </div>

      <div className="mt-6 px-3">
        <div className="px-3 mb-2">
          <p className="text-[11px] font-medium uppercase tracking-[0.12em] text-[#f5f1e6]/45">
            Administração
          </p>
        </div>
        <Link
          href={settingsHref}
          className={cn(
            "group relative flex items-center gap-x-3 text-sm font-medium px-3 py-2.5 rounded-lg transition-colors",
            isSettingsActive
              ? "bg-[#2d4a2b] text-[#fbfaf6]"
              : "text-[#f5f1e6]/70 hover:bg-[#2d4a2b]/60 hover:text-[#fbfaf6]"
          )}
        >
          {isSettingsActive && (
            <span className="absolute left-0 top-2 bottom-2 w-[3px] rounded-r bg-[#d4a43c]" />
          )}
          <Settings
            className={cn(
              "h-[18px] w-[18px] shrink-0",
              isSettingsActive ? "text-[#d4a43c]" : "text-[#f5f1e6]/60"
            )}
            strokeWidth={1.75}
          />
          Configurações
        </Link>
      </div>
    </div>
  );
}
