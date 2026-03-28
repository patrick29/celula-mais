import { MeetingForm } from "../../components/meeting-form";
import { getMeetingById, getCellGroupsForSelect } from "@/actions/meetings";
import { ArrowLeft } from "lucide-react";
import Link from "next/link";
import { notFound } from "next/navigation";

interface EditMeetingPageProps {
  params: Promise<{ id: string }>;
}

export default async function EditMeetingPage({ params }: EditMeetingPageProps) {
  const { id } = await params;
  const [{ data: meeting }, { data: cellGroups }] = await Promise.all([
    getMeetingById(id),
    getCellGroupsForSelect(),
  ]);

  if (!meeting) {
    notFound();
  }

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
          <h1 className="text-2xl font-bold tracking-tight text-slate-900">Editar Reunião</h1>
          <p className="text-sm text-slate-500 mt-1">Atualize os dados e a frequência da reunião.</p>
        </div>
      </div>

      <MeetingForm meeting={meeting} cellGroups={cellGroups || []} />
    </div>
  );
}
