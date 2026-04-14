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
        className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm transition-opacity" 
        onClick={onClose}
      />
      
      {/* Dialog Content */}
      <div className="relative w-full max-w-md bg-white rounded-xl shadow-2xl border border-slate-200 overflow-hidden transform transition-all">
        <div className="flex items-center justify-between p-4 border-b border-slate-100 bg-slate-50/50">
          <div className="flex items-center gap-2 text-slate-900">
            <div className="p-1.5 bg-blue-100 rounded-md text-blue-600">
              <UserPlus className="w-4 h-4" />
            </div>
            <h3 className="font-semibold">Cadastro Rápido</h3>
          </div>
          <button 
            onClick={onClose}
            className="p-1 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-md transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4 text-slate-900">
          {error && (
            <div className="p-3 bg-red-50 border border-red-100 text-red-600 rounded-lg text-sm">
              {error}
            </div>
          )}

          <div className="space-y-2">
            <label className="text-sm font-medium text-slate-700">
              Nome Completo *
            </label>
            <input
              autoFocus
              type="text"
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              placeholder="Ex: Maria Oliveira"
              className="w-full flex h-11 rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-600 focus:border-transparent transition-all"
            />
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium text-slate-700">
              Apelido (Opcional)
            </label>
            <input
              type="text"
              value={nickname}
              onChange={(e) => setNickname(e.target.value)}
              placeholder="Ex: Marquinhos"
              className="w-full flex h-11 rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-600 focus:border-transparent transition-all"
            />
          </div>

          <div className="flex justify-end gap-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-sm font-medium text-slate-700 hover:text-slate-900 transition-colors"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={isSubmitting || !fullName.trim()}
              className="inline-flex items-center justify-center gap-2 px-6 py-2 text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 rounded-lg shadow-sm transition-all disabled:opacity-50 disabled:cursor-not-allowed"
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
