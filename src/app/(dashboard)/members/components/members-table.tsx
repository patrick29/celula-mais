"use client";

import { persons } from "@/lib/db/schema";
import { User, Phone } from "lucide-react";
import Link from "next/link";
import { useState } from "react";
import { deleteMember } from "@/actions/members";
import { useRouter } from "next/navigation";

type Member = typeof persons.$inferSelect & {
  churchLifeEvents?: any[];
};

export function MembersTable({ members }: { members: Member[] }) {
  const router = useRouter();
  const [deletingId, setDeletingId] = useState<string | null>(null);

  async function handleDelete(id: string, name: string) {
    if (!confirm(`Tem certeza que deseja excluir o membro "${name}"? Esta ação não pode ser desfeita.`)) return;

    try {
      setDeletingId(id);
      const result = await deleteMember(id);
      
      if (result.error) {
        alert("Erro ao excluir membro: " + result.error);
      } else {
        router.refresh();
      }
    } catch (error) {
      alert("Erro inesperado ao excluir membro.");
    } finally {
      setDeletingId(null);
    }
  }

  if (members.length === 0) {
    return (
      <div className="text-center p-12 bg-white rounded-lg border border-slate-200 shadow-sm flex flex-col items-center justify-center">
        <User className="w-12 h-12 text-slate-300 mb-4" />
        <h3 className="text-lg font-medium text-slate-900">Nenhum membro encontrado</h3>
        <p className="text-sm text-slate-500 mt-1 max-w-sm">
          Você ainda não tem membros cadastrados nesta igreja. Clique no botão "Novo Membro" para começar.
        </p>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg border border-slate-200 shadow-sm overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full text-sm text-left">
          <thead className="bg-slate-50 border-b border-slate-200 text-slate-600">
            <tr>
              <th className="px-6 py-4 font-medium">Nome</th>
              <th className="px-6 py-4 font-medium">Contato</th>
              <th className="px-6 py-4 font-medium">Status</th>
              <th className="px-6 py-4 font-medium text-right">Ações</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-200">
            {members.map((member) => (
              <tr key={member.id} className="hover:bg-slate-50/50 transition-colors">
                <td className="px-6 py-4">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-slate-100 flex items-center justify-center flex-shrink-0 text-slate-500">
                      <User className="w-5 h-5" />
                    </div>
                    <div>
                      <div className="font-medium text-slate-900">{member.fullName}</div>
                      {member.gender && (
                        <div className="text-xs text-slate-500">
                          {member.gender === "MALE" ? "Masculino" : member.gender === "FEMALE" ? "Feminino" : "Outro"}
                        </div>
                      )}
                    </div>
                  </div>
                </td>
                <td className="px-6 py-4">
                  <div className="space-y-1">
                    {member.phone && (
                      <div className="flex items-center gap-2 text-slate-600">
                        <Phone className="w-3.5 h-3.5 text-slate-400" />
                        <span className="text-xs">{member.phone}</span>
                      </div>
                    )}
                  </div>
                </td>

                <td className="px-6 py-4">
                  <div className="flex flex-col gap-1">
                    {Array.isArray(member.churchLifeEvents) && member.churchLifeEvents.some((e: any) => e.type === 'BATISMO') ? (
                      <span className="text-xs inline-flex items-center gap-1 text-emerald-600">
                        <div className="w-1.5 h-1.5 rounded-full bg-emerald-500"></div> Batizado
                      </span>
                    ) : (
                      <span className="text-xs inline-flex items-center gap-1 text-slate-500">
                        <div className="w-1.5 h-1.5 rounded-full bg-slate-300"></div> Não batizado
                      </span>
                    )}
                    {Array.isArray(member.churchLifeEvents) && member.churchLifeEvents.some((e: any) => e.type === 'MEMBRO') && (
                      <span className="text-xs inline-flex items-center gap-1 text-blue-600">
                        <div className="w-1.5 h-1.5 rounded-full bg-blue-500"></div> Membro Ativo
                      </span>
                    )}
                  </div>
                </td>
                <td className="px-6 py-4 text-right">
                  <div className="flex items-center justify-end gap-3">
                    <Link 
                      href={`/members/${member.id}/edit`}
                      className="text-blue-600 hover:text-blue-800 text-sm font-medium"
                    >
                      Editar
                    </Link>
                    <button
                      onClick={() => handleDelete(member.id, member.fullName)}
                      disabled={deletingId === member.id}
                      className="text-red-500 hover:text-red-700 text-sm font-medium disabled:opacity-50"
                    >
                      {deletingId === member.id ? "Excluindo..." : "Excluir"}
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
