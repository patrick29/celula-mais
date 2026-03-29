import { CellGroupForm } from "../../components/cell-group-form";
import { getCellGroupById, getLeadersForSelect } from "@/actions/cell-groups";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { redirect } from "next/navigation";

interface EditCellGroupPageProps {
  params: Promise<{ id: string }>;
}

export default async function EditCellGroupPage({ params }: EditCellGroupPageProps) {
  const { id } = await params;

  const [{ data: cellGroup, error }, { data: leaders }] = await Promise.all([
    getCellGroupById(id),
    getLeadersForSelect(),
  ]);

  if (error || !cellGroup) {
    redirect(`/cells?error=${encodeURIComponent(error || "Célula não encontrada")}`);
  }

  return (
    <div className="p-6 max-w-4xl mx-auto space-y-6">
      <div className="flex items-center gap-4">
        <Link
          href="/cells"
          className="p-2 hover:bg-slate-100 rounded-full text-slate-500 transition-colors"
          title="Voltar para a lista"
        >
          <ArrowLeft className="w-5 h-5" />
        </Link>
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900">Editar Célula</h1>
          <p className="text-sm text-slate-500 mt-1">
            Atualize os dados da célula <strong>{cellGroup.name}</strong>.
          </p>
        </div>
      </div>

      <CellGroupForm cellGroup={cellGroup} leaders={leaders || []} />
    </div>
  );
}
