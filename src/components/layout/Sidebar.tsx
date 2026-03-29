"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Users, UserIcon, Calendar, PieChart, LayoutDashboard, Settings } from "lucide-react";
import { cn } from "@/lib/utils";

export function Sidebar() {
  const pathname = usePathname();

  const routes = [
    {
      label: "Dashboard",
      icon: LayoutDashboard,
      href: "/",
    },
    {
      label: "Células",
      icon: Users,
      href: "/cells",
    },
    {
      label: "Membros",
      icon: UserIcon,
      href: "/members",
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
    <div className="flex h-full flex-col overflow-y-auto border-r bg-white pb-4 shadow-sm">
      <div className="flex h-16 items-center px-6 border-b">
        <h1 className="text-xl font-bold bg-gradient-to-r from-blue-600 to-cyan-500 bg-clip-text text-transparent">
          Célula Mais
        </h1>
      </div>
      <div className="flex flex-col w-full flex-1 mt-4">
        {routes.map((route) => {
          const isActive = pathname === route.href || (route.href !== "/" && pathname?.startsWith(route.href));
          
          return (
            <Link
              key={route.href}
              href={route.href}
              className={cn(
                "flex items-center gap-x-2 text-slate-500 text-sm font-medium px-6 py-4 hover:text-slate-900 hover:bg-slate-100/50 transition-all rounded-r-full mr-4 border-l-4 border-transparent",
                isActive && "text-blue-600 bg-blue-50/80 hover:bg-blue-100/50 border-blue-600"
              )}
            >
              <route.icon className={cn("h-5 w-5", isActive && "text-blue-600")} />
              {route.label}
            </Link>
          );
        })}
      </div>
      <div className="mt-auto px-6">
        <Link
          href="/settings"
          className={cn(
            "flex items-center gap-x-2 text-slate-500 hover:text-slate-900 text-sm font-medium py-4 transition-all border-l-4 border-transparent",
            pathname === "/settings" && "text-blue-600"
          )}
        >
          <Settings className={cn("h-5 w-5", pathname === "/settings" && "text-blue-600")} />
          Configurações
        </Link>
      </div>
    </div>
  );
}
