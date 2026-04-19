import { CellGroupForm } from "../components/cell-group-form";
import { getLeadersForSelect } from "@/actions/cell-groups";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { redirect } from "next/navigation";

export default async function NewCellGroupPage() {
  const { data: leaders, error } = await getLeadersForSelect();

  if (error) {
    redirect(`/cells?error=${encodeURIComponent("Erro ao carregar opções de liderança.")}`);
  }

  return (
    <div className="p-6 max-w-4xl mx-auto space-y-6">
      <div className="flex items-center gap-4">
        <Link
          href="/cells"
          className="p-2 hover:bg-muted rounded-full text-muted-foreground transition-colors"
          title="Voltar para a lista"
        >
          <ArrowLeft className="w-5 h-5" />
        </Link>
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-foreground">Nova Célula</h1>
          <p className="text-sm text-muted-foreground mt-1">
            Preencha os dados abaixo para cadastrar uma nova célula.
          </p>
        </div>
      </div>

      <CellGroupForm leaders={leaders || []} />
    </div>
  );
}
