import { MeetingForm } from "../../components/meeting-form";
import { getMeetingById, getCellGroupsForSelect, getCellGroupMembers } from "@/actions/meetings";
import { ArrowLeft } from "lucide-react";
import Link from "next/link";
import { notFound, redirect } from "next/navigation";

interface EditMeetingPageProps {
  params: Promise<{ id: string }>;
}

export default async function EditMeetingPage({ params }: EditMeetingPageProps) {
  const { id } = await params;
  const [meetingResult, cellGroupsResult] = await Promise.all([
    getMeetingById(id),
    getCellGroupsForSelect(),
  ]);

  if (meetingResult.error || cellGroupsResult.error) {
    const errorMsg = meetingResult.error || cellGroupsResult.error;
    redirect(`/meetings?error=${encodeURIComponent(errorMsg as string)}`);
  }

  const meeting = meetingResult.data;
  const cellGroups = cellGroupsResult.data;

  if (!meeting) {
    notFound();
  }

  // Pre-fetch the members of the meeting's cell group to avoid client-side spinner pop-in
  let initialCellMembers: { id: string; fullName: string }[] = [];
  if (meeting.cellGroupId) {
    const membersResult = await getCellGroupMembers(meeting.cellGroupId);
    if (!membersResult.error && membersResult.data) {
      initialCellMembers = membersResult.data;
    }
  }

  return (
    <div className="p-6 max-w-3xl mx-auto space-y-6">
      <div className="flex items-center gap-4">
        <Link
          href="/meetings"
          className="p-2 hover:bg-muted rounded-full transition-colors text-muted-foreground"
        >
          <ArrowLeft className="w-5 h-5" />
        </Link>
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-foreground">Editar Reunião</h1>
          <p className="text-sm text-muted-foreground mt-1">Atualize os dados e a frequência da reunião.</p>
        </div>
      </div>

      <MeetingForm 
        meeting={meeting} 
        cellGroups={cellGroups || []} 
        initialCellMembers={initialCellMembers}
      />
    </div>
  );
}
