"use client";

import { CalendarDays, Users, Baby, UserCheck, Layers } from "lucide-react";
import Link from "next/link";
import { deleteMeeting } from "@/actions/meetings";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { toast } from "@/lib/toast";

type Meeting = {
  id: string;
  meetingDate: string;
  topic: string | null;
  memberCount: number | null;
  visitorCount: number | null;
  childrenCount: number | null;
  totalCount: number | null;
  cellGroupId: string;
  cellGroupName: string | null;
  photoUrl: string | null;
};

const statBox = (icon: React.ReactNode, value: number | null, label: string) => (
  <div className="flex items-center gap-1.5 text-foreground">
    <span className="text-muted-foreground">{icon}</span>
    <span className="text-sm font-medium">{value ?? 0}</span>
    <span className="text-xs text-muted-foreground">{label}</span>
  </div>
);

export function MeetingsTable({ meetings }: { meetings: Meeting[] }) {
  const router = useRouter();
  const [deletingId, setDeletingId] = useState<string | null>(null);

  async function handleDelete(id: string, date: string) {
    if (
      !confirm(
        `Tem certeza que deseja remover o encontro do dia ${formatDate(date)}? Esta ação não pode ser desfeita.`
      )
    )
      return;
    setDeletingId(id);
    try {
      const result = await deleteMeeting(id);
      if (result.error) {
        toast.error(result.error);
        return;
      }
      toast.success("Encontro removido");
      router.refresh();
    } catch {
      toast.error(
        "Não foi possível concluir esta ação. Tente novamente em instantes."
      );
    } finally {
      setDeletingId(null);
    }
  }

  if (meetings.length === 0) {
    return (
      <div className="text-center p-12 bg-card rounded-xl border border-border flex flex-col items-center justify-center">
        <div className="w-14 h-14 rounded-full bg-[#f6ead0] flex items-center justify-center mb-4">
          <CalendarDays className="w-7 h-7 text-[#b88a28]" strokeWidth={1.75} />
        </div>
        <h3 className="font-serif text-lg text-foreground">
          Nenhum encontro agendado
        </h3>
        <p className="text-sm text-muted-foreground mt-1 max-w-sm">
          Marque o próximo momento de comunhão para começar a registrar presenças.
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
              <th className="px-6 py-3 font-medium text-[11px] uppercase tracking-[0.1em]">Data</th>
              <th className="px-6 py-3 font-medium text-[11px] uppercase tracking-[0.1em]">Célula</th>
              <th className="px-6 py-3 font-medium text-[11px] uppercase tracking-[0.1em]">Tópico</th>
              <th className="px-6 py-3 font-medium text-[11px] uppercase tracking-[0.1em]">Presença</th>
              <th className="px-6 py-3 font-medium text-[11px] uppercase tracking-[0.1em] text-right">Total</th>
              <th className="px-6 py-3 font-medium text-[11px] uppercase tracking-[0.1em] text-right">Ações</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {meetings.map((meeting) => (
              <tr
                key={meeting.id}
                className="hover:bg-muted/40 transition-colors"
              >
                <td className="px-6 py-4">
                  <div className="flex items-center gap-3">
                    {meeting.photoUrl ? (
                      <div className="w-10 h-10 rounded-lg overflow-hidden flex-shrink-0 border border-border">
                        <img
                          src={meeting.photoUrl}
                          alt="Encontro"
                          className="w-full h-full object-cover"
                        />
                      </div>
                    ) : (
                      <div className="w-10 h-10 rounded-lg bg-[#f6ead0] flex items-center justify-center flex-shrink-0 text-[#b88a28] border border-[#ebe3cf]">
                        <CalendarDays className="w-5 h-5" strokeWidth={1.75} />
                      </div>
                    )}
                    <span className="font-medium text-foreground">
                      {formatDate(meeting.meetingDate)}
                    </span>
                  </div>
                </td>

                <td className="px-6 py-4">
                  <div className="flex items-center gap-2 text-foreground">
                    <Layers
                      className="w-3.5 h-3.5 text-muted-foreground"
                      strokeWidth={1.75}
                    />
                    <span className="text-sm">
                      {meeting.cellGroupName ?? "—"}
                    </span>
                  </div>
                </td>

                <td className="px-6 py-4">
                  <span className="text-sm text-foreground">
                    {meeting.topic ?? (
                      <span className="text-muted-foreground italic">
                        Sem tópico
                      </span>
                    )}
                  </span>
                </td>

                <td className="px-6 py-4">
                  <div className="flex flex-wrap gap-3">
                    {statBox(
                      <UserCheck className="w-3.5 h-3.5" strokeWidth={1.75} />,
                      meeting.memberCount,
                      "membros"
                    )}
                    {statBox(
                      <Users className="w-3.5 h-3.5" strokeWidth={1.75} />,
                      meeting.visitorCount,
                      "visitas"
                    )}
                    {statBox(
                      <Baby className="w-3.5 h-3.5" strokeWidth={1.75} />,
                      meeting.childrenCount,
                      "crianças"
                    )}
                  </div>
                </td>

                <td className="px-6 py-4 text-right">
                  <span className="inline-flex items-center justify-center w-10 h-10 rounded-full bg-[#e5ecdf] font-medium text-[#2d4a2b] text-sm border border-[#ebe3cf]">
                    {meeting.totalCount ?? 0}
                  </span>
                </td>

                <td className="px-6 py-4 text-right">
                  <div className="flex items-center justify-end gap-4">
                    <Link
                      href={`/meetings/${meeting.id}/edit`}
                      className="text-[#2d4a2b] hover:text-[#6b2d3f] text-sm font-medium transition-colors"
                    >
                      Editar
                    </Link>
                    <button
                      onClick={() =>
                        handleDelete(meeting.id, meeting.meetingDate)
                      }
                      disabled={deletingId === meeting.id}
                      className="text-destructive hover:text-destructive/80 text-sm font-medium disabled:opacity-50 transition-colors"
                    >
                      {deletingId === meeting.id ? "Removendo…" : "Remover"}
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

function formatDate(date: string) {
  const [year, month, day] = date.split("-");
  return `${day}/${month}/${year}`;
}
