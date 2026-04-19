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

export function Header({
  user,
  churchName,
  churchCity,
}: {
  user: HeaderUser;
  churchName: string;
  churchCity: string | null;
}) {
  return (
    <div className="flex h-16 items-center border-b border-border bg-background px-4 md:px-6 gap-x-4">
      <Sheet>
        <SheetTrigger asChild>
          <button
            className="p-2 rounded-md md:hidden text-muted-foreground hover:bg-muted transition-colors"
            aria-label="Abrir menu"
          >
            <Menu className="h-5 w-5" strokeWidth={1.75} />
          </button>
        </SheetTrigger>
        <SheetContent side="left" className="p-0 w-[248px]">
          <SheetHeader className="sr-only">
            <SheetTitle>Menu de Navegação</SheetTitle>
          </SheetHeader>
          <Sidebar
            role={user.role}
            churchName={churchName}
            churchCity={churchCity}
          />
        </SheetContent>
      </Sheet>

      <div className="flex flex-1 items-center gap-x-4">
        <SearchCommand />
      </div>
      <div className="flex items-center gap-x-3">
        <button
          className="relative rounded-full p-2 text-muted-foreground hover:bg-muted hover:text-foreground transition-colors"
          aria-label="Notificações"
        >
          <Bell className="h-5 w-5" strokeWidth={1.75} />
          <span className="absolute right-1.5 top-1.5 h-2 w-2 rounded-full bg-[#d4a43c] ring-2 ring-background"></span>
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
