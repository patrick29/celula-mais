import { MeetingForm } from "../components/meeting-form";
import { getCellGroupsForSelect } from "@/actions/meetings";
import { ArrowLeft } from "lucide-react";
import Link from "next/link";

export default async function NewMeetingPage() {
  const { data: cellGroups } = await getCellGroupsForSelect();

  return (
    <div className="p-6 max-w-3xl mx-auto space-y-6">
      <div className="flex items-center gap-4">
        <Link
          href="/meetings"
          className="p-2 hover:bg-slate-100 rounded-full transition-colors text-slate-500"
        >
          <ArrowLeft className="w-5 h-5" />
        </Link>
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900">Nova Reunião</h1>
          <p className="text-sm text-slate-500 mt-1">Registre as informações de uma nova reunião de célula.</p>
        </div>
      </div>

      <MeetingForm cellGroups={cellGroups || []} />
    </div>
  );
}
