import { MemberForm } from "../components/member-form";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { getPersonsForSelect } from "@/actions/members";

export default async function NewMemberPage() {
  const { data: allPersons } = await getPersonsForSelect();

  return (
    <div className="p-6 max-w-4xl mx-auto space-y-6">
      <div className="flex items-center gap-4">
        <Link
          href="/members"
          className="p-2 hover:bg-slate-100 rounded-full text-slate-500 transition-colors"
          title="Voltar para a lista"
        >
          <ArrowLeft className="w-5 h-5" />
        </Link>
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900">Novo Membro</h1>
          <p className="text-sm text-slate-500 mt-1">
            Preencha os dados abaixo para cadastrar uma nova pessoa na igreja.
          </p>
        </div>
      </div>

      <MemberForm allPersons={allPersons ?? []} />
    </div>
  );
}
