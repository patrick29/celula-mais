"use client";

import { useState, useEffect } from "react";
import { X, Search, UserPlus, Loader2, Check } from "lucide-react";
import { getPersonsForSelect, createMember } from "@/actions/members";
import { toast } from "@/lib/toast";

interface Person {
  id: string;
  fullName: string;
}

interface AddVisitorDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: (person: Person) => void;
  excludeIds?: string[];
}

export function AddVisitorDialog({
  isOpen,
  onClose,
  onSuccess,
  excludeIds = [],
}: AddVisitorDialogProps) {
  const [mode, setMode] = useState<"search" | "create">("search");
  const [search, setSearch] = useState("");
  const [availablePersons, setAvailablePersons] = useState<Person[]>([]);
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  
  // Create mode state
  const [newName, setNewName] = useState("");
  const [newNickname, setNewNickname] = useState("");

  useEffect(() => {
    if (isOpen && mode === "search") {
      fetchPersons();
    }
  }, [isOpen, mode]);

  async function fetchPersons() {
    setLoading(true);
    try {
      const { data, error } = await getPersonsForSelect();
      if (error) {
        toast.error(error);
        setAvailablePersons([]);
        return;
      }
      setAvailablePersons(data || []);
    } catch {
      toast.error("Não foi possível carregar a lista de pessoas. Tente novamente em instantes.");
      setAvailablePersons([]);
    } finally {
      setLoading(false);
    }
  }

  const filteredPersons = availablePersons.filter(
    (p) =>
      p.fullName.toLowerCase().includes(search.toLowerCase()) &&
      !excludeIds.includes(p.id)
  );

  async function handleCreate() {
    if (!newName.trim()) return;
    setSubmitting(true);
    try {
      const { data, error } = await createMember({
        fullName: newName.trim(),
        nickname: newNickname.trim() || undefined,
        attendsChurch: false, // Visitors usually don't attend church yet
      } as any);

      if (error) {
        toast.error(error);
        return;
      }
      if (data) {
        toast.success("Visitante cadastrado");
        onSuccess({ id: data.id, fullName: data.fullName });
        handleClose();
      }
    } catch {
      toast.error("Não foi possível concluir esta ação. Tente novamente em instantes.");
    } finally {
      setSubmitting(false);
    }
  }

  function handleClose() {
    setMode("search");
    setSearch("");
    setNewName("");
    setNewNickname("");
    onClose();
  }

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-foreground/50 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-white rounded-xl shadow-2xl border border-border w-full max-w-md overflow-hidden animate-in zoom-in-95 duration-200">
        <div className="flex items-center justify-between p-4 border-b">
          <h3 className="font-semibold text-foreground">Adicionar Visitante</h3>
          <button
            onClick={handleClose}
            className="p-1 hover:bg-muted rounded-full text-muted-foreground transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-4 space-y-4">
          <div className="flex p-1 bg-muted rounded-lg">
            <button
              onClick={() => setMode("search")}
              className={`flex-1 flex items-center justify-center gap-2 py-2 text-sm font-medium rounded-md transition-all ${
                mode === "search"
                  ? "bg-white text-[#2d4a2b] shadow-sm"
                  : "text-foreground hover:text-foreground"
              }`}
            >
              <Search className="w-4 h-4" />
              Buscar
            </button>
            <button
              onClick={() => setMode("create")}
              className={`flex-1 flex items-center justify-center gap-2 py-2 text-sm font-medium rounded-md transition-all ${
                mode === "create"
                  ? "bg-white text-[#2d4a2b] shadow-sm"
                  : "text-foreground hover:text-foreground"
              }`}
            >
              <UserPlus className="w-4 h-4" />
              Novo
            </button>
          </div>

          {mode === "search" ? (
            <div className="space-y-3">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <input
                  autoFocus
                  type="text"
                  placeholder="Buscar por nome..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 bg-muted/60 border border-border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-ring focus:border-transparent"
                />
              </div>

              <div className="max-h-60 overflow-y-auto space-y-1 pr-1">
                {loading ? (
                  <div className="py-8 flex flex-col items-center justify-center gap-2 text-muted-foreground">
                    <Loader2 className="w-6 h-6 animate-spin" />
                    <span className="text-xs">Carregando pessoas...</span>
                  </div>
                ) : filteredPersons.length > 0 ? (
                  filteredPersons.map((person) => (
                    <button
                      key={person.id}
                      onClick={() => {
                        onSuccess(person);
                        handleClose();
                      }}
                      className="w-full flex items-center justify-between p-3 hover:bg-[#e5ecdf] text-left rounded-lg group transition-colors border border-transparent hover:border-[#e5ecdf]"
                    >
                      <span className="text-sm font-medium text-foreground group-hover:text-[#2d4a2b]">
                        {person.fullName}
                      </span>
                      <Check className="w-4 h-4 text-[#2d4a2b] opacity-0 group-hover:opacity-100" />
                    </button>
                  ))
                ) : (
                  <div className="py-8 text-center text-muted-foreground">
                    <p className="text-sm">Nenhuma pessoa encontrada.</p>
                    <button
                      onClick={() => setMode("create")}
                      className="text-xs text-[#2d4a2b] font-medium hover:underline mt-1"
                    >
                      Cadastrar novo visitante
                    </button>
                  </div>
                )}
              </div>
            </div>
          ) : (
            <div className="space-y-4 py-2">
              <div className="space-y-2">
                <label className="text-sm font-medium text-foreground">
                  Nome Completo
                </label>
                <input
                  autoFocus
                  type="text"
                  placeholder="Nome do visitante"
                  value={newName}
                  onChange={(e) => setNewName(e.target.value)}
                  className="w-full px-4 py-2 bg-muted/60 border border-border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-ring focus:border-transparent"
                />
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium text-foreground">
                  Apelido (Opcional)
                </label>
                <input
                  type="text"
                  placeholder="Ex: Marquinhos"
                  value={newNickname}
                  onChange={(e) => setNewNickname(e.target.value)}
                  className="w-full px-4 py-2 bg-muted/60 border border-border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-ring focus:border-transparent"
                />
              </div>

              <button
                disabled={!newName.trim() || submitting}
                onClick={handleCreate}
                className="w-full flex items-center justify-center gap-2 py-2.5 bg-primary hover:bg-[#3a5e36] text-white rounded-lg text-sm font-semibold transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-sm"
              >
                {submitting ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <UserPlus className="w-4 h-4" />
                )}
                {submitting ? "Salvando..." : "Cadastrar e Adicionar"}
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
