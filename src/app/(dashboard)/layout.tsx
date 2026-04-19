import { redirect } from "next/navigation";
import { eq } from "drizzle-orm";
import { Sidebar } from "@/components/layout/Sidebar";
import { Header } from "@/components/layout/Header";
import { Toaster } from "@/components/ui/sonner";
import { getAuthUserContext } from "@/lib/auth-context";
import { db } from "@/lib/db";
import { churches } from "@/lib/db/schema";

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

  const [church] = await db
    .select({ name: churches.name, city: churches.city })
    .from(churches)
    .where(eq(churches.id, dbUser.churchId))
    .limit(1);

  return (
    <div className="h-screen flex bg-background overflow-hidden">
      <div className="hidden md:flex w-[248px] flex-col fixed inset-y-0 z-50">
        <Sidebar
          role={dbUser.role}
          churchName={church?.name ?? "Célula Mais"}
          churchCity={church?.city ?? null}
        />
      </div>
      <main className="md:pl-[248px] flex-1 flex flex-col h-full w-full">
        <Header
          user={{
            fullName: dbUser.fullName,
            email: dbUser.email,
            role: dbUser.role,
          }}
          churchName={church?.name ?? "Célula Mais"}
          churchCity={church?.city ?? null}
        />
        <div className="flex-1 overflow-auto">
          {children}
        </div>
      </main>
      <Toaster />
    </div>
  );
}
