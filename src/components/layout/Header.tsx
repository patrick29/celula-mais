import { Bell, Menu } from "lucide-react";
import { SearchCommand } from "./search-command";
import {
  Sheet,
  SheetContent,
  SheetTrigger,
  SheetTitle,
  SheetHeader,
} from "@/components/ui/sheet";
import { Sidebar } from "./Sidebar";
import { UserMenu } from "./user-menu";
import type { UserRole } from "@/lib/auth-context";

type HeaderUser = {
  fullName: string;
  email: string;
  role: UserRole;
};

export function Header({ user }: { user: HeaderUser }) {
  return (
    <div className="flex h-16 items-center border-b bg-white px-4 md:px-6 shadow-sm gap-x-4">
      <Sheet>
        <SheetTrigger asChild>
          <button className="p-2 hover:bg-slate-100 rounded-md md:hidden text-slate-500 transition-colors">
            <Menu className="h-5 w-5" />
          </button>
        </SheetTrigger>
        <SheetContent side="left" className="p-0 w-72">
          <SheetHeader className="sr-only">
            <SheetTitle>Menu de Navegação</SheetTitle>
          </SheetHeader>
          <Sidebar role={user.role} />
        </SheetContent>
      </Sheet>

      <div className="flex flex-1 items-center gap-x-4">
        <SearchCommand />
      </div>
      <div className="flex items-center gap-x-4">
        <button className="relative rounded-full p-2 text-slate-500 hover:bg-slate-100 hover:text-slate-900 transition-all">
          <Bell className="h-5 w-5" />
          <span className="absolute right-1.5 top-1.5 h-2 w-2 rounded-full bg-red-500 ring-2 ring-white"></span>
        </button>
        <UserMenu
          fullName={user.fullName}
          email={user.email}
          role={user.role}
        />
      </div>
    </div>
  );
}
