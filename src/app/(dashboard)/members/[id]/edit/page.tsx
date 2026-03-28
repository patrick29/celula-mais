import { MemberForm } from "../../components/member-form";
import { getMemberById, getPersonsForSelect } from "@/actions/members";
import { ArrowLeft } from "lucide-react";
import Link from "next/link";
import { notFound } from "next/navigation";

export default async function EditMemberPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const [{ data: member, error }, { data: allPersons }] = await Promise.all([
    getMemberById(id),
    getPersonsForSelect(id), // exclui o próprio membro da lista
  ]);

  if (error || !member) {
    notFound();
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900">Editar Membro</h1>
          <p className="text-sm text-slate-500 mt-1">
            Atualize os dados de {member.fullName} abaixo.
          </p>
        </div>
        <Link
          href="/members"
          className="inline-flex items-center justify-center rounded-md text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-slate-950 disabled:pointer-events-none disabled:opacity-50 border border-slate-200 bg-white shadow-sm hover:bg-slate-100 hover:text-slate-900 h-9 px-4 py-2 gap-2"
        >
          <ArrowLeft className="w-4 h-4" />
          Voltar
        </Link>
      </div>

      <div className="bg-white rounded-lg border border-slate-200 shadow-sm p-6 overflow-hidden">
        <MemberForm member={member as any} allPersons={allPersons ?? []} />
      </div>
    </div>
  );
}
