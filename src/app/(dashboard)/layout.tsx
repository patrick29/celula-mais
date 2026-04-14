import { redirect } from "next/navigation";
import { Sidebar } from "@/components/layout/Sidebar";
import { Header } from "@/components/layout/Header";
import { Toaster } from "@/components/ui/sonner";
import { getAuthUserContext } from "@/lib/auth-context";

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  let dbUser;
  try {
    ({ dbUser } = await getAuthUserContext());
  } catch {
    redirect("/login");
  }

  if (dbUser.mustChangePassword) {
    redirect("/login/redefinir-senha?first=true");
  }

  return (
    <div className="h-screen flex bg-slate-50 overflow-hidden">
      <div className="hidden md:flex w-64 flex-col fixed inset-y-0 z-50">
        <Sidebar role={dbUser.role} />
      </div>
      <main className="md:pl-64 flex-1 flex flex-col h-full w-full">
        <Header
          user={{
            fullName: dbUser.fullName,
            email: dbUser.email,
            role: dbUser.role,
          }}
        />
        <div className="flex-1 overflow-auto">
          {children}
        </div>
      </main>
      <Toaster />
    </div>
  );
}
