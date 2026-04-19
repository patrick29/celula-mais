import { ArrowLeft } from "lucide-react";

export default function EditMeetingLoading() {
  return (
    <div className="p-6 max-w-3xl mx-auto space-y-6">
      <div className="flex items-center gap-4">
        <div className="p-2 text-muted-foreground/60">
          <ArrowLeft className="w-5 h-5" />
        </div>
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-foreground">Editar Reunião</h1>
          <p className="text-sm text-muted-foreground mt-1">Atualize os dados e a frequência da reunião.</p>
        </div>
      </div>

      <div className="space-y-8 mt-8 animate-pulse">
        {/* Date and Time Group */}
        <div className="space-y-4">
          <div className="h-6 bg-muted rounded-md w-1/4"></div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <div className="h-4 bg-muted rounded-md w-1/3"></div>
              <div className="h-10 bg-muted rounded-md w-full"></div>
            </div>
            <div className="space-y-2">
              <div className="h-4 bg-muted rounded-md w-1/3"></div>
              <div className="h-10 bg-muted rounded-md w-full"></div>
            </div>
          </div>
        </div>

        {/* Células Group */}
        <div className="space-y-4">
          <div className="h-6 bg-muted rounded-md w-1/4"></div>
          <div className="space-y-2">
            <div className="h-4 bg-muted rounded-md w-1/3"></div>
            <div className="h-10 bg-muted rounded-md w-full"></div>
          </div>
        </div>

        {/* Roles Group */}
        <div className="space-y-4">
          <div className="h-6 bg-muted rounded-md w-1/4"></div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="space-y-2">
              <div className="h-4 bg-muted rounded-md w-1/3"></div>
              <div className="h-10 bg-muted rounded-md w-full"></div>
            </div>
            <div className="space-y-2">
              <div className="h-4 bg-muted rounded-md w-1/3"></div>
              <div className="h-10 bg-muted rounded-md w-full"></div>
            </div>
            <div className="space-y-2">
              <div className="h-4 bg-muted rounded-md w-1/3"></div>
              <div className="h-10 bg-muted rounded-md w-full"></div>
            </div>
          </div>
        </div>

        {/* Members List Group */}
        <div className="space-y-4">
          <div className="h-6 bg-muted rounded-md w-1/4"></div>
          <div className="space-y-2">
            <div className="h-12 bg-muted rounded-md w-full"></div>
            <div className="h-12 bg-muted rounded-md w-full"></div>
            <div className="h-12 bg-muted rounded-md w-full"></div>
            <div className="h-12 bg-muted rounded-md w-full"></div>
            <div className="h-12 bg-muted rounded-md w-full"></div>
          </div>
        </div>

        {/* Actions */}
        <div className="flex justify-end gap-4 pt-4">
          <div className="h-10 bg-muted rounded-md w-24"></div>
          <div className="h-10 bg-muted rounded-md w-32"></div>
        </div>
      </div>
    </div>
  );
}
