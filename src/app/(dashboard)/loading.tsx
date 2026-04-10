import { Skeleton } from "@/components/ui/skeleton";

export default function DashboardLoading() {
  return (
    <div className="p-6 md:p-8 space-y-8 max-w-7xl mx-auto">
      {/* HEADER SECTION */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div className="space-y-3">
          <div className="flex items-center gap-2">
            <Skeleton className="h-6 w-6 rounded-full" />
            <Skeleton className="h-10 w-48 rounded-lg" />
          </div>
          <Skeleton className="h-5 w-64" />
        </div>
        <Skeleton className="h-9 w-40 rounded-full" />
      </div>

      {/* STATS GRID */}
      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
        {[1, 2, 3, 4].map((i) => (
          <div key={i} className="rounded-2xl border border-white/40 bg-white/60 p-6 backdrop-blur-xl shadow-sm flex items-start justify-between">
            <div className="space-y-4 w-full">
              <Skeleton className="h-4 w-28 uppercase" />
              <Skeleton className="h-10 w-16" />
              <Skeleton className="h-4 w-32" />
            </div>
            <Skeleton className="h-12 w-12 rounded-xl" />
          </div>
        ))}
      </div>

      {/* CHARTS & LISTS GRID */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-7">
        {/* CHART WIDGET */}
        <div className="col-span-4 rounded-2xl border border-slate-200/60 bg-white/80 shadow-sm overflow-hidden text-slate-400">
          <div className="p-6 md:p-8 border-b border-slate-100 flex justify-between items-center bg-white/50">
            <div className="space-y-2">
              <Skeleton className="h-7 w-56" />
              <Skeleton className="h-4 w-72" />
            </div>
          </div>
          <div className="p-6 md:p-8">
            <Skeleton className="h-[300px] w-full rounded-xl" />
          </div>
        </div>
        
        {/* AGENDA WIDGET */}
        <div className="col-span-3 rounded-2xl border border-slate-200/60 bg-white/80 shadow-sm overflow-hidden">
          <div className="p-6 md:p-8 border-b border-slate-100 flex justify-between items-center bg-white/50">
            <div className="space-y-2">
              <Skeleton className="h-7 w-48" />
              <Skeleton className="h-4 w-56" />
            </div>
            <Skeleton className="h-10 w-10 rounded-full" />
          </div>
          
          <div className="p-4 space-y-4">
            {[1, 2, 3].map((i) => (
              <div key={i} className="flex items-center gap-4 p-2">
                <Skeleton className="h-14 w-14 rounded-xl" />
                <div className="flex-1 space-y-3">
                  <Skeleton className="h-5 w-40" />
                  <Skeleton className="h-4 w-32" />
                  <Skeleton className="h-3 w-48" />
                </div>
                <Skeleton className="h-8 w-8 rounded-full" />
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
