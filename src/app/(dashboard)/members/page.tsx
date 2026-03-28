import Link from "next/link";
import { getMembers } from "@/actions/members";
import { MembersTable } from "./components/members-table";
import { Plus } from "lucide-react";

export default async function MembersPage() {
  const { data: members, error } = await getMembers();

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900">Membros</h1>
          <p className="text-sm text-slate-500 mt-1">
            Gerencie o cadastro de membros, líderes e visitantes.
          </p>
        </div>
        <Link 
          href="/members/new"
          className="inline-flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md font-medium text-sm transition-colors"
        >
          <Plus className="w-4 h-4" />
          Novo Membro
        </Link>
      </div>

      {error ? (
        <div className="p-4 bg-red-50 text-red-600 rounded-md">
          Ocorreu um erro ao carregar os membros: {error}
        </div>
      ) : (
        <MembersTable members={members || []} />
      )}
    </div>
  );
}
