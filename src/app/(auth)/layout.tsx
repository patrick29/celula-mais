import Link from "next/link";
import { Sparkles } from "lucide-react";
import { Toaster } from "@/components/ui/sonner";

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen bg-slate-50 flex flex-col">
      <main className="flex-1 flex items-center justify-center px-4 py-12">
        <div className="w-full max-w-[400px] space-y-6">
          <div className="flex flex-col items-center gap-3">
            <Link
              href="/login"
              className="flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-blue-600 to-cyan-500 shadow-md"
            >
              <Sparkles className="h-6 w-6 text-white" />
            </Link>
            <h1 className="text-2xl font-black tracking-tight text-slate-800">
              Célula<span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-cyan-500">+</span>
            </h1>
          </div>
          {children}
        </div>
      </main>
      <footer className="py-4 text-center text-xs text-slate-400">
        Célula Mais · Gestão Pastoral
      </footer>
      <Toaster />
    </div>
  );
}
