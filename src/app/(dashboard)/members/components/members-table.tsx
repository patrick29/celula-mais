"use client";

import { persons } from "@/lib/db/schema";
import { User, Phone } from "lucide-react";
import Link from "next/link";
import { useState } from "react";
import { deleteMember } from "@/actions/members";
import { useRouter } from "next/navigation";
import { toast } from "@/lib/toast";

type Member = typeof persons.$inferSelect & {
  churchLifeEvents?: any[];
};

export function MembersTable({ members }: { members: Member[] }) {
  const router = useRouter();
  const [deletingId, setDeletingId] = useState<string | null>(null);

  async function handleDelete(id: string, name: string) {
    if (
      !confirm(
        `Tem certeza que deseja remover o membro "${name}"? Esta ação não pode ser desfeita.`
      )
    )
      return;

    setDeletingId(id);
    try {
      const result = await deleteMember(id);

      if (result.error) {
        toast.error(result.error);
        return;
      }

      toast.success("Membro removido");
      router.refresh();
    } catch {
      toast.error(
        "Não foi possível concluir esta ação. Tente novamente em instantes."
      );
    } finally {
      setDeletingId(null);
    }
  }

  if (members.length === 0) {
    return (
      <div className="text-center p-12 bg-card rounded-xl border border-border flex flex-col items-center justify-center">
        <div className="w-14 h-14 rounded-full bg-[#e5ecdf] flex items-center justify-center mb-4">
          <User className="w-7 h-7 text-[#2d4a2b]" strokeWidth={1.75} />
        </div>
        <h3 className="font-serif text-lg text-foreground">
          Ninguém por aqui ainda
        </h3>
        <p className="text-sm text-muted-foreground mt-1 max-w-sm">
          Acolha o primeiro membro da sua rede para começar a cuidar de cada
          vida.
        </p>
      </div>
    );
  }

  return (
    <div className="bg-card rounded-xl border border-border overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full text-sm text-left">
          <thead className="bg-muted/60 border-b border-border text-muted-foreground">
            <tr>
              <th className="px-6 py-3 font-medium text-[11px] uppercase tracking-[0.1em]">
                Nome
              </th>
              <th className="px-6 py-3 font-medium text-[11px] uppercase tracking-[0.1em]">
                Contato
              </th>
              <th className="px-6 py-3 font-medium text-[11px] uppercase tracking-[0.1em]">
                Status
              </th>
              <th className="px-6 py-3 font-medium text-[11px] uppercase tracking-[0.1em] text-right">
                Ações
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {members.map((member) => (
              <tr
                key={member.id}
                className="hover:bg-muted/40 transition-colors"
              >
                <td className="px-6 py-4">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-[#e5ecdf] flex items-center justify-center flex-shrink-0 text-[#2d4a2b] border border-[#ebe3cf]">
                      <User className="w-5 h-5" strokeWidth={1.75} />
                    </div>
                    <div>
                      <div className="font-medium text-foreground">
                        {member.fullName}
                      </div>
                      {member.gender && (
                        <div className="text-xs text-muted-foreground">
                          {member.gender === "MALE"
                            ? "Masculino"
                            : member.gender === "FEMALE"
                            ? "Feminino"
                            : "Outro"}
                        </div>
                      )}
                    </div>
                  </div>
                </td>
                <td className="px-6 py-4">
                  <div className="space-y-1">
                    {member.phone && (
                      <div className="flex items-center gap-2 text-foreground">
                        <Phone
                          className="w-3.5 h-3.5 text-muted-foreground"
                          strokeWidth={1.75}
                        />
                        <span className="text-xs">{member.phone}</span>
                      </div>
                    )}
                  </div>
                </td>

                <td className="px-6 py-4">
                  <div className="flex flex-col gap-1">
                    {Array.isArray(member.churchLifeEvents) &&
                    member.churchLifeEvents.some(
                      (e: any) => e.type === "BATISMO"
                    ) ? (
                      <span className="text-xs inline-flex items-center gap-1.5 text-[#2d4a2b]">
                        <span className="w-1.5 h-1.5 rounded-full bg-[#3f7d4e]" />
                        Batizado
                      </span>
                    ) : (
                      <span className="text-xs inline-flex items-center gap-1.5 text-muted-foreground">
                        <span className="w-1.5 h-1.5 rounded-full bg-muted-foreground/40" />
                        Não batizado
                      </span>
                    )}
                    {Array.isArray(member.churchLifeEvents) &&
                      member.churchLifeEvents.some(
                        (e: any) => e.type === "MEMBRO"
                      ) && (
                        <span className="text-xs inline-flex items-center gap-1.5 text-[#6b2d3f]">
                          <span className="w-1.5 h-1.5 rounded-full bg-[#6b2d3f]" />
                          Membro ativo
                        </span>
                      )}
                  </div>
                </td>
                <td className="px-6 py-4 text-right">
                  <div className="flex items-center justify-end gap-4">
                    <Link
                      href={`/members/${member.id}/edit`}
                      className="text-[#2d4a2b] hover:text-[#6b2d3f] text-sm font-medium transition-colors"
                    >
                      Editar
                    </Link>
                    <button
                      onClick={() => handleDelete(member.id, member.fullName)}
                      disabled={deletingId === member.id}
                      className="text-destructive hover:text-destructive/80 text-sm font-medium disabled:opacity-50 transition-colors"
                    >
                      {deletingId === member.id ? "Removendo…" : "Remover"}
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
