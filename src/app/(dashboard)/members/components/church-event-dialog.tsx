"use client";

import { useState } from "react";
import { Calendar, Plus } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

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

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <div className="flex items-center gap-2">
            <div className="p-1.5 bg-[#e5ecdf] rounded-md text-[#2d4a2b]">
              <Calendar className="w-4 h-4" />
            </div>
            <DialogTitle>Lançar Novo Evento</DialogTitle>
          </div>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4 pt-4">
          {error && (
            <div className="p-3 bg-destructive/10 border border-destructive/20 text-destructive rounded-lg text-sm">
              {error}
            </div>
          )}

          <div className="space-y-2">
            <Label htmlFor="event-type">Evento *</Label>
            <Select value={type} onValueChange={setType}>
              <SelectTrigger id="event-type">
                <SelectValue placeholder="Selecione o evento..." />
              </SelectTrigger>
              <SelectContent>
                {eventTypes.map((et) => (
                  <SelectItem key={et.value} value={et.value}>
                    {et.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="event-date">Data *</Label>
            <Input
              id="event-date"
              type="date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="event-notes">Observação (Opcional)</Label>
            <Input
              id="event-notes"
              type="text"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Ex: Local, batizador, etc."
            />
          </div>

          <DialogFooter className="pt-4">
            <Button
              type="button"
              variant="ghost"
              onClick={onClose}
            >
              Cancelar
            </Button>
            <Button
              type="submit"
              disabled={!type || !date}
              className="bg-primary hover:bg-[#3a5e36] text-white"
            >
              <Plus className="w-4 h-4 mr-2" />
              Adicionar Evento
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
