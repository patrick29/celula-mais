"use client";

import { useState } from "react";
import { Search, ChevronRight, ChevronLeft, ChevronsRight, ChevronsLeft } from "lucide-react";
import { cn } from "@/lib/utils";

interface Item {
  id: string;
  label: string;
}

interface DualListSelectorProps {
  items: Item[];
  selectedIds: string[];
  disabledIds?: string[];
  onChange: (selectedIds: string[]) => void;
  leftTitle?: string;
  rightTitle?: string;
  className?: string;
}

export function DualListSelector({
  items,
  selectedIds,
  disabledIds = [],
  onChange,
  leftTitle = "Disponíveis",
  rightTitle = "Selecionados",
  className,
}: DualListSelectorProps) {
  const [leftSearch, setLeftSearch] = useState("");
  const [rightSearch, setRightSearch] = useState("");

  const availableItems = items.filter((item) => !selectedIds.includes(item.id));
  const selectedItems = items.filter((item) => selectedIds.includes(item.id));

  const filteredAvailable = availableItems.filter((item) =>
    item.label.toLowerCase().includes(leftSearch.toLowerCase())
  );

  const filteredSelected = selectedItems.filter((item) =>
    item.label.toLowerCase().includes(rightSearch.toLowerCase())
  );

  const moveRight = (id: string) => {
    if (disabledIds.includes(id)) return;
    onChange([...selectedIds, id]);
  };

  const moveLeft = (id: string) => {
    if (disabledIds.includes(id)) return;
    onChange(selectedIds.filter((itemId) => itemId !== id));
  };

  const moveAllRight = () => {
    const moveables = availableItems.filter(i => !disabledIds.includes(i.id));
    const newIds = [...new Set([...selectedIds, ...moveables.map((i) => i.id)])];
    onChange(newIds);
  };

  const moveAllLeft = () => {
    const keptIds = selectedIds.filter(id => disabledIds.includes(id));
    onChange(keptIds);
  };

  return (
    <div className={cn("grid grid-cols-1 md:grid-cols-[1fr_auto_1fr] gap-4 items-center", className)}>
      {/* Left List */}
      <div className="flex flex-col h-[400px] border border-slate-200 rounded-lg bg-slate-50 overflow-hidden">
        <div className="p-3 border-b border-slate-200 bg-white">
          <label className="text-sm font-semibold text-slate-700 block mb-2">{leftTitle}</label>
          <div className="relative">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-slate-400" />
            <input
              type="text"
              placeholder="Buscar..."
              value={leftSearch}
              onChange={(e) => setLeftSearch(e.target.value)}
              className="w-full pl-9 pr-3 py-2 text-sm border border-slate-200 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>
        </div>
        <div className="flex-1 overflow-y-auto p-2 space-y-1">
          {filteredAvailable.length === 0 ? (
            <p className="text-xs text-slate-400 text-center py-4">Nenhum item encontrado</p>
          ) : (
            filteredAvailable.map((item) => {
              const isDisabled = disabledIds.includes(item.id);
              return (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => moveRight(item.id)}
                  disabled={isDisabled}
                  className={cn(
                    "w-full text-left px-3 py-2 text-sm rounded-md transition-all flex items-center justify-between group",
                    isDisabled 
                      ? "bg-slate-50 text-slate-400 cursor-not-allowed opacity-70" 
                      : "hover:bg-white hover:shadow-sm border border-transparent hover:border-slate-200"
                  )}
                >
                  <span className="truncate">{item.label}</span>
                  {!isDisabled && <ChevronRight className="h-4 w-4 text-slate-300 group-hover:text-indigo-500" />}
                </button>
              );
            })
          )}
        </div>
        <div className="p-2 border-t border-slate-200 bg-white text-right">
          <span className="text-[10px] uppercase font-bold text-slate-400">
            {availableItems.length} itens
          </span>
        </div>
      </div>

      {/* Bulk Actions (Desktop) */}
      <div className="hidden md:flex flex-col gap-2">
        <button
          type="button"
          onClick={moveAllRight}
          disabled={availableItems.length === 0}
          className="p-2 rounded-md hover:bg-slate-100 disabled:opacity-30 transition-colors"
          title="Mover todos para a direita"
        >
          <ChevronsRight className="h-5 w-5 text-slate-600" />
        </button>
        <button
          type="button"
          onClick={moveAllLeft}
          disabled={selectedIds.length === 0}
          className="p-2 rounded-md hover:bg-slate-100 disabled:opacity-30 transition-colors"
          title="Mover todos para a esquerda"
        >
          <ChevronsLeft className="h-5 w-5 text-slate-600" />
        </button>
      </div>

      {/* Bulk Actions (Mobile) */}
      <div className="flex md:hidden justify-center gap-4 py-2">
        <button
          type="button"
          onClick={moveAllRight}
          className="flex items-center gap-2 px-4 py-2 bg-slate-100 rounded-md text-sm font-medium"
        >
          Adicionar Todos <ChevronsRight className="h-4 w-4" />
        </button>
        <button
          type="button"
          onClick={moveAllLeft}
          className="flex items-center gap-2 px-4 py-2 bg-slate-100 rounded-md text-sm font-medium"
        >
          <ChevronsLeft className="h-4 w-4" /> Remover Todos
        </button>
      </div>

      {/* Right List */}
      <div className="flex flex-col h-[400px] border border-indigo-100 rounded-lg bg-indigo-50/30 overflow-hidden">
        <div className="p-3 border-b border-indigo-100 bg-white">
          <label className="text-sm font-semibold text-indigo-700 block mb-2">{rightTitle}</label>
          <div className="relative">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-slate-400" />
            <input
              type="text"
              placeholder="Buscar..."
              value={rightSearch}
              onChange={(e) => setRightSearch(e.target.value)}
              className="w-full pl-9 pr-3 py-2 text-sm border border-slate-200 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>
        </div>
        <div className="flex-1 overflow-y-auto p-2 space-y-1">
          {filteredSelected.length === 0 ? (
            <p className="text-xs text-slate-400 text-center py-4">Nenhum item selecionado</p>
          ) : (
            filteredSelected.map((item) => {
              const isDisabled = disabledIds.includes(item.id);
              return (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => moveLeft(item.id)}
                  disabled={isDisabled}
                  className={cn(
                    "w-full text-left px-3 py-2 text-sm rounded-md transition-all flex items-center justify-between group",
                    isDisabled
                      ? "bg-indigo-50/50 text-indigo-400 cursor-not-allowed italic"
                      : "bg-white shadow-sm border border-indigo-100 hover:border-indigo-300"
                  )}
                >
                  <span className={cn("truncate font-medium", !isDisabled && "text-indigo-900")}>
                    {item.label} {isDisabled && "(Visitante)"}
                  </span>
                  {!isDisabled && <ChevronLeft className="h-4 w-4 text-indigo-400 group-hover:text-indigo-600" />}
                </button>
              );
            })
          )}
        </div>
        <div className="p-2 border-t border-indigo-100 bg-white text-right">
          <span className="text-[10px] uppercase font-bold text-indigo-400">
            {selectedIds.length} itens
          </span>
        </div>
      </div>
    </div>
  );
}
