import Link from "next/link";
import { getMeetings } from "@/actions/meetings";
import { MeetingsTable } from "./components/meetings-table";
import { Plus, CalendarDays, AlertCircle } from "lucide-react";

interface MeetingsPageProps {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}

export default async function MeetingsPage({ searchParams }: MeetingsPageProps) {
  const resolvedParams = await searchParams;
  const redirectError = resolvedParams.error as string;
  const { data: meetings, error } = await getMeetings();

  const displayError = redirectError || error;

  return (
    <div className="p-6 md:p-10 max-w-7xl mx-auto space-y-8">
      <div className="flex items-start md:items-end justify-between gap-4 flex-col md:flex-row">
        <div className="flex items-start gap-4">
          <div className="w-12 h-12 rounded-lg flex items-center justify-center bg-[#f6ead0] text-[#b88a28] border border-[#ebe3cf]">
            <CalendarDays className="w-6 h-6" strokeWidth={1.75} />
          </div>
          <div className="space-y-1">
            <h1 className="font-serif text-3xl md:text-[32px] leading-tight text-foreground">
              Encontros
            </h1>
            <p className="text-sm text-muted-foreground max-w-xl">
              Os momentos em que a videira se reúne — presença, tópicos e frutos
              de cada célula.
            </p>
          </div>
        </div>
        <Link
          href="/meetings/new"
          className="inline-flex items-center gap-2 bg-primary hover:bg-[#3a5e36] text-primary-foreground px-4 py-2 rounded-md font-medium text-sm transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background"
        >
          <Plus className="w-4 h-4" strokeWidth={1.75} />
          Novo encontro
        </Link>
      </div>

      {displayError && (
        <div className="p-4 bg-destructive/10 border border-destructive/30 text-destructive rounded-md flex items-center gap-3">
          <AlertCircle className="w-5 h-5 flex-shrink-0" strokeWidth={1.75} />
          <p className="text-sm font-medium">Não conseguimos carregar: {displayError}</p>
        </div>
      )}

      {!error && <MeetingsTable meetings={meetings || []} />}
    </div>
  );
}
