import Link from "next/link";
import { Grape } from "lucide-react";
import { Toaster } from "@/components/ui/sonner";

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen bg-background flex flex-col">
      <main className="flex-1 flex items-center justify-center px-4 py-12">
        <div className="w-full max-w-[400px] space-y-8">
          <div className="flex flex-col items-center gap-3">
            <Link
              href="/login"
              className="flex h-12 w-12 items-center justify-center rounded-lg bg-[#d4a43c] text-[#1f3a1f]"
              aria-label="Célula Mais"
            >
              <Grape className="h-6 w-6" strokeWidth={1.75} />
            </Link>
            <div className="flex flex-col items-center">
              <h1 className="font-serif text-2xl text-foreground">
                Célula Mais
              </h1>
              <p className="text-xs text-muted-foreground tracking-[0.12em] uppercase mt-1">
                Gestão pastoral
              </p>
            </div>
          </div>
          {children}
        </div>
      </main>
      <footer className="py-4 text-center text-xs text-muted-foreground">
        &ldquo;Eu sou a videira, vós os ramos.&rdquo;
      </footer>
      <Toaster />
    </div>
  );
}
