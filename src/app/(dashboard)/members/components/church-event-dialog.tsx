"use client";

import { useState } from "react";
import { X, Calendar, Plus, Save } from "lucide-react";

interface ChurchEventDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: (event: { type: string; date: string; notes?: string }) => void;
}

const eventTypes = [
  { value: "BAPTISM", label: "Batismo nas Águas" },
  { value: "BECAME_MEMBER", label: "Tornou-se Membro" },
  { value: "MARRIAGE", label: "Casamento" },
  { value: "BECAME_LEADER", label: "Tornou-se Líder" },
  { value: "LEFT_LEADERSHIP", label: "Deixou de ser Líder" },
  { value: "BECAME_CO_LEADER", label: "Tornou-se Co-líder" },
  { value: "LEFT_CO_LEADERSHIP", label: "Deixou de ser Co-líder" },
  { value: "BECAME_HOST", label: "Tornou-se Anfitrião" },
  { value: "LEFT_HOST", label: "Deixou de ser Anfitrião" },
  { value: "BECAME_SUPERVISOR", label: "Tornou-se Supervisor" },
  { value: "LEFT_SUPERVISOR", label: "Deixou de ser Supervisor" },
];

export function ChurchEventDialog({ isOpen, onClose, onSuccess }: ChurchEventDialogProps) {
  const [type, setType] = useState("");
  const [date, setDate] = useState(new Date().toISOString().split("T")[0]);
  const [notes, setNotes] = useState("");
  const [error, setError] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!type || !date) {
      setError("Selecione o tipo de evento e a data");
      return;
    }

    onSuccess({ type, date, notes });
    setType("");
    setNotes("");
    setDate(new Date().toISOString().split("T")[0]);
    onClose();
  };

  const inputCls = "w-full flex h-10 rounded-md border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-600 transition-all";

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
              <Calendar className="w-4 h-4" />
            </div>
            <h3 className="font-semibold">Lançar Novo Evento</h3>
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
            <label className="text-sm font-medium text-slate-700">Evento *</label>
            <select 
              value={type}
              onChange={(e) => setType(e.target.value)}
              className={inputCls}
            >
              <option value="">Selecione...</option>
              {eventTypes.map((et) => (
                <option key={et.value} value={et.value}>{et.label}</option>
              ))}
            </select>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium text-slate-700">Data *</label>
            <input
              type="date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
              className={inputCls}
            />
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium text-slate-700">Observação (Opcional)</label>
            <input
              type="text"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Ex: Local, batizador, etc."
              className={inputCls}
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
              disabled={!type || !date}
              className="inline-flex items-center justify-center gap-2 px-6 py-2 text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 rounded-lg shadow-sm transition-all disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <Plus className="w-4 h-4" />
              Adicionar Evento
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
