"use client";

import { useState, useEffect } from "react";
import { X, Search, UserPlus, Loader2, Check } from "lucide-react";
import { getPersonsForSelect, createMember } from "@/actions/members";

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

  useEffect(() => {
    if (isOpen && mode === "search") {
      fetchPersons();
    }
  }, [isOpen, mode]);

  async function fetchPersons() {
    setLoading(true);
    try {
      const { data, error } = await getPersonsForSelect();
      if (error) throw new Error(error);
      setAvailablePersons(data || []);
    } catch (err) {
      console.error(err);
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
        attendsChurch: false, // Visitors usually don't attend church yet
      } as any);

      if (error) throw new Error(error);
      if (data) {
        onSuccess({ id: data.id, fullName: data.fullName });
        handleClose();
      }
    } catch (err) {
      console.error(err);
    } finally {
      setSubmitting(false);
    }
  }

  function handleClose() {
    setMode("search");
    setSearch("");
    setNewName("");
    onClose();
  }

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-white rounded-xl shadow-2xl border border-slate-200 w-full max-w-md overflow-hidden animate-in zoom-in-95 duration-200">
        <div className="flex items-center justify-between p-4 border-b">
          <h3 className="font-semibold text-slate-900">Adicionar Visitante</h3>
          <button
            onClick={handleClose}
            className="p-1 hover:bg-slate-100 rounded-full text-slate-500 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-4 space-y-4">
          <div className="flex p-1 bg-slate-100 rounded-lg">
            <button
              onClick={() => setMode("search")}
              className={`flex-1 flex items-center justify-center gap-2 py-2 text-sm font-medium rounded-md transition-all ${
                mode === "search"
                  ? "bg-white text-indigo-600 shadow-sm"
                  : "text-slate-600 hover:text-slate-900"
              }`}
            >
              <Search className="w-4 h-4" />
              Buscar
            </button>
            <button
              onClick={() => setMode("create")}
              className={`flex-1 flex items-center justify-center gap-2 py-2 text-sm font-medium rounded-md transition-all ${
                mode === "create"
                  ? "bg-white text-indigo-600 shadow-sm"
                  : "text-slate-600 hover:text-slate-900"
              }`}
            >
              <UserPlus className="w-4 h-4" />
              Novo
            </button>
          </div>

          {mode === "search" ? (
            <div className="space-y-3">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                <input
                  autoFocus
                  type="text"
                  placeholder="Buscar por nome..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-600 focus:border-transparent"
                />
              </div>

              <div className="max-h-60 overflow-y-auto space-y-1 pr-1">
                {loading ? (
                  <div className="py-8 flex flex-col items-center justify-center gap-2 text-slate-400">
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
                      className="w-full flex items-center justify-between p-3 hover:bg-indigo-50 text-left rounded-lg group transition-colors border border-transparent hover:border-indigo-100"
                    >
                      <span className="text-sm font-medium text-slate-700 group-hover:text-indigo-700">
                        {person.fullName}
                      </span>
                      <Check className="w-4 h-4 text-indigo-600 opacity-0 group-hover:opacity-100" />
                    </button>
                  ))
                ) : (
                  <div className="py-8 text-center text-slate-400">
                    <p className="text-sm">Nenhuma pessoa encontrada.</p>
                    <button
                      onClick={() => setMode("create")}
                      className="text-xs text-indigo-600 font-medium hover:underline mt-1"
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
                <label className="text-sm font-medium text-slate-700">
                  Nome Completo
                </label>
                <input
                  autoFocus
                  type="text"
                  placeholder="Nome do visitante"
                  value={newName}
                  onChange={(e) => setNewName(e.target.value)}
                  className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-600 focus:border-transparent"
                />
              </div>

              <button
                disabled={!newName.trim() || submitting}
                onClick={handleCreate}
                className="w-full flex items-center justify-center gap-2 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg text-sm font-semibold transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-sm"
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
