import Link from "next/link";
import { getCellGroups } from "@/actions/cell-groups";
import { CellGroupsTable } from "./components/cell-groups-table";
import { Plus, AlertCircle } from "lucide-react";

export default async function CellGroupsPage({
  searchParams,
}: {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}) {
  const params = await searchParams;
  const urlError = params.error as string;

  const { data: cellGroups, error } = await getCellGroups();

  return (
    <div className="p-6 md:p-10 max-w-7xl mx-auto space-y-8">
      <div className="flex items-start md:items-end justify-between gap-4 flex-col md:flex-row">
        <div className="space-y-1">
          <h1 className="font-serif text-3xl md:text-[32px] leading-tight text-foreground">
            Células
          </h1>
          <p className="text-sm text-muted-foreground max-w-xl">
            Os ramos que brotam da videira — líderes, locais e horários de cada
            encontro.
          </p>
        </div>
        <Link
          href="/cells/new"
          className="inline-flex items-center gap-2 bg-primary hover:bg-[#3a5e36] text-primary-foreground px-4 py-2 rounded-md font-medium text-sm transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background"
        >
          <Plus className="w-4 h-4" strokeWidth={1.75} />
          Nova célula
        </Link>
      </div>

      {urlError && (
        <div className="p-4 bg-destructive/10 border border-destructive/30 text-destructive rounded-md flex items-center gap-3">
          <AlertCircle className="w-5 h-5 flex-shrink-0" strokeWidth={1.75} />
          <p className="text-sm font-medium">{urlError}</p>
        </div>
      )}

      {error ? (
        <div className="p-4 bg-destructive/10 border border-destructive/30 text-destructive rounded-md flex items-center gap-3">
          <AlertCircle className="w-5 h-5 flex-shrink-0" strokeWidth={1.75} />
          <p className="text-sm font-medium">
            Não conseguimos carregar as células: {error}
          </p>
        </div>
      ) : (
        <CellGroupsTable cellGroups={cellGroups || []} />
      )}
    </div>
  );
}
