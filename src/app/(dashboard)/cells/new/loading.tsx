import { ArrowLeft } from "lucide-react";
import Link from "next/link";

export default function LoadingNewCellPage() {
  return (
    <div className="p-6 max-w-4xl mx-auto space-y-6 animate-pulse">
      {/* Header Skeleton */}
      <div className="flex items-center gap-4">
        <div className="p-2 bg-muted rounded-full w-9 h-9"></div>
        <div className="space-y-2">
          <div className="h-7 w-48 bg-muted rounded-md"></div>
          <div className="h-4 w-72 bg-muted rounded-md"></div>
        </div>
      </div>

      {/* Form Skeleton */}
      <div className="bg-white rounded-lg border border-border shadow-sm p-6 space-y-8">
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Box 1 */}
          <div className="space-y-4 md:col-span-2">
            <div className="h-5 w-40 bg-muted rounded-md border-b pb-2"></div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2 md:col-span-2">
                <div className="h-4 w-32 bg-muted rounded-md"></div>
                <div className="h-10 w-full bg-muted rounded-md"></div>
              </div>
              <div className="space-y-2">
                <div className="h-4 w-32 bg-muted rounded-md"></div>
                <div className="h-10 w-full bg-muted rounded-md"></div>
              </div>
              <div className="space-y-2">
                <div className="h-4 w-32 bg-muted rounded-md"></div>
                <div className="h-10 w-full bg-muted rounded-md"></div>
              </div>
            </div>
          </div>

          {/* Box 2 */}
          <div className="space-y-4 md:col-span-2 mt-4">
            <div className="h-5 w-40 bg-muted rounded-md border-b pb-2"></div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="space-y-2">
                <div className="h-4 w-32 bg-muted rounded-md"></div>
                <div className="h-10 w-full bg-muted rounded-md"></div>
              </div>
              <div className="space-y-2">
                <div className="h-4 w-32 bg-muted rounded-md"></div>
                <div className="h-10 w-full bg-muted rounded-md"></div>
              </div>
              <div className="space-y-2">
                <div className="h-4 w-32 bg-muted rounded-md"></div>
                <div className="h-10 w-full bg-muted rounded-md"></div>
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-end gap-3 pt-6 border-t border-border">
          <div className="h-9 w-24 bg-muted rounded-md"></div>
          <div className="h-9 w-32 bg-[#e5ecdf] rounded-md"></div>
        </div>
      </div>
    </div>
  );
}
