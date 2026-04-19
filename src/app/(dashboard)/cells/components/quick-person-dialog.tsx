"use client";

import { useState } from "react";
import { X, Loader2, UserPlus } from "lucide-react";
import { createMember } from "@/actions/members";
import { toast } from "@/lib/toast";

interface QuickPersonDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: (person: { id: string; fullName: string }) => void;
}

export function QuickPersonDialog({ isOpen, onClose, onSuccess }: QuickPersonDialogProps) {
  const [fullName, setFullName] = useState("");
  const [nickname, setNickname] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!fullName.trim() || fullName.trim().length < 2) {
      setError("O nome deve ter pelo menos 2 caracteres");
      return;
    }

    setIsSubmitting(true);
    setError(null);

    try {
      const result = await createMember({
        fullName: fullName.trim(),
        nickname: nickname.trim() || undefined,
        churchId: "", // Will be filled by server action
      } as any);

      if (result.error) {
        setError(result.error);
        toast.error(result.error);
      } else if (result.data) {
        toast.success("Pessoa cadastrada");
        onSuccess({
          id: result.data.id,
          fullName: result.data.fullName,
        });
        setFullName("");
        setNickname("");
        onClose();
      }
    } catch {
      const message = "Não foi possível concluir esta ação. Tente novamente em instantes.";
      setError(message);
      toast.error(message);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-foreground/40 backdrop-blur-sm transition-opacity"
        onClick={onClose}
      />

      {/* Dialog Content */}
      <div className="relative w-full max-w-md bg-white rounded-xl shadow-2xl border border-border overflow-hidden transform transition-all">
        <div className="flex items-center justify-between p-4 border-b border-border bg-muted/40">
          <div className="flex items-center gap-2 text-foreground">
            <div className="p-1.5 bg-[#e5ecdf] rounded-md text-[#2d4a2b]">
              <UserPlus className="w-4 h-4" />
            </div>
            <h3 className="font-semibold">Cadastro Rápido</h3>
          </div>
          <button
            onClick={onClose}
            className="p-1 text-muted-foreground hover:text-foreground hover:bg-muted rounded-md transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4 text-foreground">
          {error && (
            <div className="p-3 bg-destructive/10 border border-destructive/20 text-destructive rounded-lg text-sm">
              {error}
            </div>
          )}

          <div className="space-y-2">
            <label className="text-sm font-medium text-foreground">
              Nome Completo *
            </label>
            <input
              autoFocus
              type="text"
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              placeholder="Ex: Maria Oliveira"
              className="w-full flex h-11 rounded-lg border border-border bg-white px-3 py-2 text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:border-transparent transition-all"
            />
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium text-foreground">
              Apelido (Opcional)
            </label>
            <input
              type="text"
              value={nickname}
              onChange={(e) => setNickname(e.target.value)}
              placeholder="Ex: Marquinhos"
              className="w-full flex h-11 rounded-lg border border-border bg-white px-3 py-2 text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:border-transparent transition-all"
            />
          </div>

          <div className="flex justify-end gap-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-sm font-medium text-foreground hover:text-foreground transition-colors"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={isSubmitting || !fullName.trim()}
              className="inline-flex items-center justify-center gap-2 px-6 py-2 text-sm font-medium text-white bg-primary hover:bg-[#3a5e36] rounded-lg shadow-sm transition-all disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isSubmitting ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                "Cadastrar e Adicionar"
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
