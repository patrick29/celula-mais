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
    <div className="p-6 max-w-4xl mx-auto space-y-6">
      <div className="flex items-center gap-4">
        <Link
          href="/members"
          className="p-2 hover:bg-muted rounded-full text-muted-foreground transition-colors"
          title="Voltar para a lista"
        >
          <ArrowLeft className="w-5 h-5" />
        </Link>
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-foreground">Editar Membro</h1>
          <p className="text-sm text-muted-foreground mt-1">
            Atualize os dados de {member.fullName} abaixo.
          </p>
        </div>
      </div>

      <MemberForm member={member as any} allPersons={allPersons ?? []} />
    </div>
  );
}
