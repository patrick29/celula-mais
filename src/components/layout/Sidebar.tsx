"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Users, UserIcon, Calendar, PieChart, LayoutDashboard, Settings, Sparkles } from "lucide-react";
import { cn } from "@/lib/utils";
import type { UserRole } from "@/lib/auth-context";

export function Sidebar({ role }: { role?: UserRole }) {
  const pathname = usePathname();
  const canManageUsers = role === "ADMIN";
  const settingsHref = canManageUsers ? "/settings/usuarios" : "/settings";
  const isSettingsActive = pathname?.startsWith("/settings") ?? false;

  const routes = [
    {
      label: "Dashboard",
      icon: LayoutDashboard,
      href: "/",
    },
    {
      label: "Membros",
      icon: UserIcon,
      href: "/members",
    },
    {
      label: "Células",
      icon: Users,
      href: "/cells",
    },
    {
      label: "Reuniões",
      icon: Calendar,
      href: "/meetings",
    },
    {
      label: "Relatórios",
      icon: PieChart,
      href: "/reports",
    },
  ];

  return (
    <div className="flex h-full flex-col overflow-y-auto border-r bg-white/70 backdrop-blur-3xl pb-6 shadow-sm">
      <div className="flex h-20 items-center px-6 border-b border-slate-100">
        <Link href="/" className="flex items-center gap-2 group transition-all">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-blue-600 to-cyan-500 shadow-md group-hover:shadow-blue-500/30 group-hover:scale-105 transition-all">
            <Sparkles className="h-4 w-4 text-white" />
          </div>
          <h1 className="text-xl font-black tracking-tight text-slate-800">
            Célula<span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-cyan-500">+</span>
          </h1>
        </Link>
      </div>
      
      <div className="flex flex-col w-full flex-1 mt-6 px-3 space-y-1">
        <div className="px-3 mb-2">
          <p className="text-xs font-bold uppercase tracking-wider text-slate-400">Menu Principal</p>
        </div>
        {routes.map((route) => {
          const isActive = pathname === route.href || (route.href !== "/" && pathname?.startsWith(route.href));
          
          return (
            <Link
              key={route.href}
              href={route.href}
              className={cn(
                "group flex items-center gap-x-3 text-sm font-semibold px-3 py-3 rounded-xl transition-all duration-300 relative overflow-hidden",
                isActive 
                  ? "text-blue-700 bg-blue-50 shadow-sm shadow-blue-100/50" 
                  : "text-slate-500 hover:text-slate-900 hover:bg-slate-50"
              )}
            >
              {isActive && (
                <div className="absolute left-0 top-1/2 -translate-y-1/2 w-1.5 h-8 bg-gradient-to-b from-blue-500 to-cyan-500 rounded-r-full" />
              )}
              <route.icon className={cn(
                "h-5 w-5 transition-transform duration-300", 
                isActive ? "text-blue-600" : "group-hover:scale-110",
                isActive && "scale-110"
              )} />
              {route.label}
            </Link>
          );
        })}
      </div>
      
      <div className="mt-auto px-3">
        <div className="px-3 mb-2">
          <p className="text-xs font-bold uppercase tracking-wider text-slate-400">Sistema</p>
        </div>
        <Link
          href={settingsHref}
          className={cn(
            "group flex items-center gap-x-3 text-sm font-semibold px-3 py-3 rounded-xl transition-all duration-300 relative overflow-hidden",
            isSettingsActive
              ? "text-blue-700 bg-blue-50 shadow-sm shadow-blue-100/50"
              : "text-slate-500 hover:text-slate-900 hover:bg-slate-50"
          )}
        >
          {isSettingsActive && (
            <div className="absolute left-0 top-1/2 -translate-y-1/2 w-1.5 h-8 bg-gradient-to-b from-blue-500 to-cyan-500 rounded-r-full" />
          )}
          <Settings className={cn(
            "h-5 w-5 transition-transform duration-300",
            isSettingsActive ? "text-blue-600" : "group-hover:rotate-90"
          )} />
          Configurações
        </Link>
      </div>
    </div>
  );
}
