"use client";

import { CalendarDays, Users, Baby, UserCheck, Layers } from "lucide-react";
import Link from "next/link";
import { deleteMeeting } from "@/actions/meetings";
import { useRouter } from "next/navigation";
import { useState } from "react";

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
  <div className="flex items-center gap-1.5 text-slate-600">
    <span className="text-slate-400">{icon}</span>
    <span className="text-sm font-medium">{value ?? 0}</span>
    <span className="text-xs text-slate-400">{label}</span>
  </div>
);

export function MeetingsTable({ meetings }: { meetings: Meeting[] }) {
  const router = useRouter();
  const [deletingId, setDeletingId] = useState<string | null>(null);

  async function handleDelete(id: string, date: string) {
    if (!confirm(`Tem certeza que deseja excluir a reunião do dia ${formatDate(date)}? Esta ação não pode ser desfeita.`)) return;
    setDeletingId(id);
    const result = await deleteMeeting(id);
    setDeletingId(null);
    if (result.error) {
      alert(`Erro ao excluir: ${result.error}`);
    } else {
      router.refresh();
    }
  }

  if (meetings.length === 0) {
    return (
      <div className="text-center p-12 bg-white rounded-lg border border-slate-200 shadow-sm flex flex-col items-center justify-center">
        <CalendarDays className="w-12 h-12 text-slate-300 mb-4" />
        <h3 className="text-lg font-medium text-slate-900">Nenhuma reunião encontrada</h3>
        <p className="text-sm text-slate-500 mt-1 max-w-sm">
          Você ainda não tem reuniões registradas. Clique em "Nova Reunião" para começar.
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
              <th className="px-6 py-4 font-medium">Data</th>
              <th className="px-6 py-4 font-medium">Célula</th>
              <th className="px-6 py-4 font-medium">Tópico</th>
              <th className="px-6 py-4 font-medium">Presença</th>
              <th className="px-6 py-4 font-medium text-right">Total</th>
              <th className="px-6 py-4 font-medium text-right">Ações</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-200">
            {meetings.map((meeting) => (
              <tr key={meeting.id} className="hover:bg-slate-50/50 transition-colors">
                <td className="px-6 py-4">
                  <div className="flex items-center gap-3">
                    {meeting.photoUrl ? (
                      <div className="w-10 h-10 rounded-lg overflow-hidden flex-shrink-0 border border-slate-200">
                        <img 
                          src={meeting.photoUrl} 
                          alt="Meeting" 
                          className="w-full h-full object-cover" 
                        />
                      </div>
                    ) : (
                      <div className="w-10 h-10 rounded-lg bg-indigo-100 flex items-center justify-center flex-shrink-0 text-indigo-600">
                        <CalendarDays className="w-5 h-5" />
                      </div>
                    )}
                    <span className="font-medium text-slate-900">{formatDate(meeting.meetingDate)}</span>
                  </div>
                </td>

                <td className="px-6 py-4">
                  <div className="flex items-center gap-2 text-slate-600">
                    <Layers className="w-3.5 h-3.5 text-slate-400" />
                    <span className="text-sm">{meeting.cellGroupName ?? "—"}</span>
                  </div>
                </td>

                <td className="px-6 py-4">
                  <span className="text-sm text-slate-700">
                    {meeting.topic ?? <span className="text-slate-400 italic">Sem tópico</span>}
                  </span>
                </td>

                <td className="px-6 py-4">
                  <div className="flex flex-wrap gap-3">
                    {statBox(<UserCheck className="w-3.5 h-3.5" />, meeting.memberCount, "membros")}
                    {statBox(<Users className="w-3.5 h-3.5" />, meeting.visitorCount, "visitas")}
                    {statBox(<Baby className="w-3.5 h-3.5" />, meeting.childrenCount, "crianças")}
                  </div>
                </td>

                <td className="px-6 py-4 text-right">
                  <span className="inline-flex items-center justify-center w-10 h-10 rounded-full bg-slate-100 font-semibold text-slate-700 text-sm">
                    {meeting.totalCount ?? 0}
                  </span>
                </td>

                <td className="px-6 py-4 text-right">
                  <div className="flex items-center justify-end gap-3">
                    <Link
                      href={`/meetings/${meeting.id}/edit`}
                      className="text-blue-600 hover:text-blue-800 text-sm font-medium"
                    >
                      Editar
                    </Link>
                    <button
                      onClick={() => handleDelete(meeting.id, meeting.meetingDate)}
                      disabled={deletingId === meeting.id}
                      className="text-red-500 hover:text-red-700 text-sm font-medium disabled:opacity-50"
                    >
                      {deletingId === meeting.id ? "Excluindo..." : "Excluir"}
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
  // date comes as "YYYY-MM-DD" from the DB
  const [year, month, day] = date.split("-");
  return `${day}/${month}/${year}`;
}
