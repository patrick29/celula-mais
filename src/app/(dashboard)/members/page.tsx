import Link from "next/link";
import { getMembers } from "@/actions/members";
import { MembersTable } from "./components/members-table";
import { Plus, AlertCircle } from "lucide-react";

export default async function MembersPage() {
  const { data: members, error } = await getMembers();

  return (
    <div className="p-6 md:p-10 max-w-7xl mx-auto space-y-8">
      <div className="flex items-start md:items-end justify-between gap-4 flex-col md:flex-row">
        <div className="space-y-1">
          <h1 className="font-serif text-3xl md:text-[32px] leading-tight text-foreground">
            Membros
          </h1>
          <p className="text-sm text-muted-foreground max-w-xl">
            Cada vida que faz parte da rede — membros, líderes e visitantes
            acolhidos.
          </p>
        </div>
        <Link
          href="/members/new"
          className="inline-flex items-center gap-2 bg-primary hover:bg-[#3a5e36] text-primary-foreground px-4 py-2 rounded-md font-medium text-sm transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background"
        >
          <Plus className="w-4 h-4" strokeWidth={1.75} />
          Novo membro
        </Link>
      </div>

      {error ? (
        <div className="p-4 bg-destructive/10 border border-destructive/30 text-destructive rounded-md flex items-center gap-3">
          <AlertCircle className="w-5 h-5 flex-shrink-0" strokeWidth={1.75} />
          <p className="text-sm font-medium">
            Não conseguimos carregar os membros: {error}
          </p>
        </div>
      ) : (
        <MembersTable members={members || []} />
      )}
    </div>
  );
}
