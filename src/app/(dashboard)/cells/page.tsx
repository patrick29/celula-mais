import Link from "next/link";
import { getCellGroups } from "@/actions/cell-groups";
import { CellGroupsTable } from "./components/cell-groups-table";
import { Plus } from "lucide-react";

export default async function CellGroupsPage() {
  const { data: cellGroups, error } = await getCellGroups();

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900">Células</h1>
          <p className="text-sm text-slate-500 mt-1">
            Gerencie as células da igreja, líderes e locais de reunião.
          </p>
        </div>
        <Link
          href="/cells/new"
          className="inline-flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md font-medium text-sm transition-colors"
        >
          <Plus className="w-4 h-4" />
          Nova Célula
        </Link>
      </div>

      {error ? (
        <div className="p-4 bg-red-50 text-red-600 rounded-md">
          Ocorreu um erro ao carregar as células: {error}
        </div>
      ) : (
        <CellGroupsTable cellGroups={cellGroups || []} />
      )}
    </div>
  );
}
