"use client";

import { Home, Clock, CalendarDays, User } from "lucide-react";
import Link from "next/link";
import { deleteCellGroup } from "@/actions/cell-groups";
import { useRouter } from "next/navigation";
import { useState } from "react";

type CellGroup = {
  id: string;
  name: string;
  cellGroupType: string;
  status: string;
  meetingDay: string | null;
  meetingTime: string | null;
  neighborhood: string | null;
  leaderName?: string | null;
};

const cellGroupTypeLabels: Record<string, string> = {
  CHILDREN: "Infantil",
  YOUNG_ADULTS: "Jovens Adultos",
  TEENAGERS: "Adolescentes",
  ADULTS: "Adultos",
};

const statusConfig: Record<string, { label: string; color: string; dot: string }> = {
  ACTIVE: { label: "Ativa", color: "text-emerald-600", dot: "bg-emerald-500" },
  PLANTING: { label: "Em Plantio", color: "text-blue-600", dot: "bg-blue-500" },
  PAUSED: { label: "Pausada", color: "text-amber-600", dot: "bg-amber-500" },
  CLOSED: { label: "Encerrada", color: "text-slate-500", dot: "bg-slate-400" },
};

export function CellGroupsTable({ cellGroups }: { cellGroups: CellGroup[] }) {
  const router = useRouter();
  const [deletingId, setDeletingId] = useState<string | null>(null);

  async function handleDelete(id: string, name: string) {
    if (!confirm(`Tem certeza que deseja excluir a célula "${name}"? Esta ação não pode ser desfeita.`)) return;

    setDeletingId(id);
    const result = await deleteCellGroup(id);
    setDeletingId(null);

    if (result.error) {
      alert(`Erro ao excluir: ${result.error}`);
    } else {
      router.refresh();
    }
  }

  if (cellGroups.length === 0) {
    return (
      <div className="text-center p-12 bg-white rounded-lg border border-slate-200 shadow-sm flex flex-col items-center justify-center">
        <Home className="w-12 h-12 text-slate-300 mb-4" />
        <h3 className="text-lg font-medium text-slate-900">Nenhuma célula encontrada</h3>
        <p className="text-sm text-slate-500 mt-1 max-w-sm">
          Você ainda não tem células cadastradas. Clique em "Nova Célula" para começar.
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
              <th className="px-6 py-4 font-medium">Célula</th>
              <th className="px-6 py-4 font-medium">Tipo</th>
              <th className="px-6 py-4 font-medium">Líder</th>
              <th className="px-6 py-4 font-medium">Reunião</th>
              <th className="px-6 py-4 font-medium">Status</th>
              <th className="px-6 py-4 font-medium text-right">Ações</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-200">
            {cellGroups.map((cellGroup) => {
              const status = statusConfig[cellGroup.status] ?? statusConfig.ACTIVE;
              return (
                <tr key={cellGroup.id} className="hover:bg-slate-50/50 transition-colors">
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center flex-shrink-0 text-blue-600">
                        <Home className="w-5 h-5" />
                      </div>
                      <div>
                        <div className="font-medium text-slate-900">{cellGroup.name}</div>
                        {cellGroup.neighborhood && (
                          <div className="text-xs text-slate-500">{cellGroup.neighborhood}</div>
                        )}
                      </div>
                    </div>
                  </td>

                  <td className="px-6 py-4">
                    <span className="text-sm text-slate-700">
                      {cellGroupTypeLabels[cellGroup.cellGroupType] ?? cellGroup.cellGroupType}
                    </span>
                  </td>

                  <td className="px-6 py-4">
                    {cellGroup.leaderName ? (
                      <div className="flex items-center gap-2 text-slate-600">
                        <User className="w-3.5 h-3.5 text-slate-400" />
                        <span className="text-sm">{cellGroup.leaderName}</span>
                      </div>
                    ) : (
                      <span className="text-xs text-slate-400 italic">Sem líder definido</span>
                    )}
                  </td>

                  <td className="px-6 py-4">
                    <div className="space-y-1">
                      {cellGroup.meetingDay && (
                        <div className="flex items-center gap-2 text-slate-600">
                          <CalendarDays className="w-3.5 h-3.5 text-slate-400" />
                          <span className="text-xs">{cellGroup.meetingDay}</span>
                        </div>
                      )}
                      {cellGroup.meetingTime && (
                        <div className="flex items-center gap-2 text-slate-600">
                          <Clock className="w-3.5 h-3.5 text-slate-400" />
                          <span className="text-xs">{cellGroup.meetingTime}</span>
                        </div>
                      )}
                      {!cellGroup.meetingDay && !cellGroup.meetingTime && (
                        <span className="text-xs text-slate-400 italic">Não definido</span>
                      )}
                    </div>
                  </td>

                  <td className="px-6 py-4">
                    <span className={`text-xs inline-flex items-center gap-1 ${status.color}`}>
                      <div className={`w-1.5 h-1.5 rounded-full ${status.dot}`}></div>
                      {status.label}
                    </span>
                  </td>

                  <td className="px-6 py-4 text-right">
                    <div className="flex items-center justify-end gap-3">
                      <Link
                        href={`/cells/${cellGroup.id}/edit`}
                        className="text-blue-600 hover:text-blue-800 text-sm font-medium"
                      >
                        Editar
                      </Link>
                      <button
                        onClick={() => handleDelete(cellGroup.id, cellGroup.name)}
                        disabled={deletingId === cellGroup.id}
                        className="text-red-500 hover:text-red-700 text-sm font-medium disabled:opacity-50"
                      >
                        {deletingId === cellGroup.id ? "Excluindo..." : "Excluir"}
                      </button>
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
