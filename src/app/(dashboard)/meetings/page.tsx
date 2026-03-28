import Link from "next/link";
import { getMeetings } from "@/actions/meetings";
import { MeetingsTable } from "./components/meetings-table";
import { Plus, CalendarDays } from "lucide-react";

export default async function MeetingsPage() {
  const { data: meetings, error } = await getMeetings();

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 bg-indigo-100 rounded-xl flex items-center justify-center text-indigo-600 shadow-sm">
            <CalendarDays className="w-6 h-6" />
          </div>
          <div>
            <h1 className="text-2xl font-bold tracking-tight text-slate-900">Reuniões</h1>
            <p className="text-sm text-slate-500 mt-1">
              Gerencie a frequência e os tópicos das reuniões das células.
            </p>
          </div>
        </div>
        <Link
          href="/meetings/new"
          className="inline-flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-md font-medium text-sm transition-colors shadow-sm"
        >
          <Plus className="w-4 h-4" />
          Nova Reunião
        </Link>
      </div>

      {error ? (
        <div className="p-4 bg-red-50 text-red-600 rounded-md border border-red-100">
          Ocorreu um erro ao carregar as reuniões: {error}
        </div>
      ) : (
        <MeetingsTable meetings={meetings || []} />
      )}
    </div>
  );
}
