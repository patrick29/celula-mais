"use client";

import { Home, Clock, CalendarDays, User, Grape } from "lucide-react";
import Link from "next/link";
import { deleteCellGroup } from "@/actions/cell-groups";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { toast } from "@/lib/toast";

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

const statusConfig: Record<
  string,
  { label: string; color: string; dot: string }
> = {
  ACTIVE: {
    label: "Ativa",
    color: "text-[#2d4a2b]",
    dot: "bg-[#3f7d4e]",
  },
  PLANTING: {
    label: "Em plantio",
    color: "text-[#b88a28]",
    dot: "bg-[#d4a43c]",
  },
  PAUSED: {
    label: "Pausada",
    color: "text-[#b88a28]",
    dot: "bg-[#e2b859]",
  },
  CLOSED: {
    label: "Encerrada",
    color: "text-muted-foreground",
    dot: "bg-muted-foreground",
  },
};

export function CellGroupsTable({ cellGroups }: { cellGroups: CellGroup[] }) {
  const router = useRouter();
  const [deletingId, setDeletingId] = useState<string | null>(null);

  async function handleDelete(id: string, name: string) {
    if (
      !confirm(
        `Tem certeza que deseja remover a célula "${name}"? Esta ação não pode ser desfeita.`
      )
    )
      return;

    setDeletingId(id);
    try {
      const result = await deleteCellGroup(id);

      if (result.error) {
        toast.error(result.error);
        return;
      }

      toast.success("Célula removida");
      router.refresh();
    } catch {
      toast.error(
        "Não foi possível concluir esta ação. Tente novamente em instantes."
      );
    } finally {
      setDeletingId(null);
    }
  }

  if (cellGroups.length === 0) {
    return (
      <div className="text-center p-12 bg-card rounded-xl border border-border flex flex-col items-center justify-center">
        <div className="w-14 h-14 rounded-full bg-[#e5ecdf] flex items-center justify-center mb-4">
          <Grape className="w-7 h-7 text-[#2d4a2b]" strokeWidth={1.75} />
        </div>
        <h3 className="font-serif text-lg text-foreground">
          Ainda não há ramos nesta videira
        </h3>
        <p className="text-sm text-muted-foreground mt-1 max-w-sm">
          Plante a primeira célula para começar a acompanhar encontros e
          frutos.
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
                Célula
              </th>
              <th className="px-6 py-3 font-medium text-[11px] uppercase tracking-[0.1em]">
                Tipo
              </th>
              <th className="px-6 py-3 font-medium text-[11px] uppercase tracking-[0.1em]">
                Líder
              </th>
              <th className="px-6 py-3 font-medium text-[11px] uppercase tracking-[0.1em]">
                Encontro
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
            {cellGroups.map((cellGroup) => {
              const status =
                statusConfig[cellGroup.status] ?? statusConfig.ACTIVE;
              return (
                <tr
                  key={cellGroup.id}
                  className="hover:bg-muted/40 transition-colors"
                >
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-lg bg-[#e5ecdf] flex items-center justify-center flex-shrink-0 text-[#2d4a2b] border border-[#ebe3cf]">
                        <Home className="w-5 h-5" strokeWidth={1.75} />
                      </div>
                      <div>
                        <div className="font-medium text-foreground">
                          {cellGroup.name}
                        </div>
                        {cellGroup.neighborhood && (
                          <div className="text-xs text-muted-foreground">
                            {cellGroup.neighborhood}
                          </div>
                        )}
                      </div>
                    </div>
                  </td>

                  <td className="px-6 py-4">
                    <span className="text-sm text-foreground">
                      {cellGroupTypeLabels[cellGroup.cellGroupType] ??
                        cellGroup.cellGroupType}
                    </span>
                  </td>

                  <td className="px-6 py-4">
                    {cellGroup.leaderName ? (
                      <div className="flex items-center gap-2 text-foreground">
                        <User
                          className="w-3.5 h-3.5 text-muted-foreground"
                          strokeWidth={1.75}
                        />
                        <span className="text-sm">
                          {cellGroup.leaderName}
                        </span>
                      </div>
                    ) : (
                      <span className="text-xs text-muted-foreground italic">
                        Sem líder definido
                      </span>
                    )}
                  </td>

                  <td className="px-6 py-4">
                    <div className="space-y-1">
                      {cellGroup.meetingDay && (
                        <div className="flex items-center gap-2 text-foreground">
                          <CalendarDays
                            className="w-3.5 h-3.5 text-muted-foreground"
                            strokeWidth={1.75}
                          />
                          <span className="text-xs">
                            {cellGroup.meetingDay}
                          </span>
                        </div>
                      )}
                      {cellGroup.meetingTime && (
                        <div className="flex items-center gap-2 text-foreground">
                          <Clock
                            className="w-3.5 h-3.5 text-muted-foreground"
                            strokeWidth={1.75}
                          />
                          <span className="text-xs">
                            {cellGroup.meetingTime}
                          </span>
                        </div>
                      )}
                      {!cellGroup.meetingDay && !cellGroup.meetingTime && (
                        <span className="text-xs text-muted-foreground italic">
                          Não definido
                        </span>
                      )}
                    </div>
                  </td>

                  <td className="px-6 py-4">
                    <span
                      className={`text-xs inline-flex items-center gap-1.5 ${status.color}`}
                    >
                      <span
                        className={`w-1.5 h-1.5 rounded-full ${status.dot}`}
                      />
                      {status.label}
                    </span>
                  </td>

                  <td className="px-6 py-4 text-right">
                    <div className="flex items-center justify-end gap-4">
                      <Link
                        href={`/cells/${cellGroup.id}/edit`}
                        className="text-[#2d4a2b] hover:text-[#6b2d3f] text-sm font-medium transition-colors"
                      >
                        Editar
                      </Link>
                      <button
                        onClick={() =>
                          handleDelete(cellGroup.id, cellGroup.name)
                        }
                        disabled={deletingId === cellGroup.id}
                        className="text-destructive hover:text-destructive/80 text-sm font-medium disabled:opacity-50 transition-colors"
                      >
                        {deletingId === cellGroup.id
                          ? "Removendo…"
                          : "Remover"}
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
