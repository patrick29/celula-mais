"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { useRouter } from "next/navigation";
import { Search, Users, Home } from "lucide-react";
import { globalSearch, type SearchResult } from "@/actions/search";
import { Skeleton } from "@/components/ui/skeleton";

export function SearchCommand() {
  const router = useRouter();
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<SearchResult | null>(null);
  const [isOpen, setIsOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  // Debounced search
  useEffect(() => {
    if (query.length < 2) {
      setResults(null);
      setIsOpen(false);
      setError(null);
      return;
    }

    setIsLoading(true);
    setIsOpen(true);
    setError(null);

    const timer = setTimeout(async () => {
      const { data, error: searchError } = await globalSearch(query);
      setIsLoading(false);
      if (searchError) {
        setError(searchError);
        setResults(null);
      } else {
        setResults(data);
        setError(null);
      }
    }, 300);

    return () => clearTimeout(timer);
  }, [query]);

  // Close on click outside
  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleKeyDown = useCallback((e: React.KeyboardEvent) => {
    if (e.key === "Escape") {
      setIsOpen(false);
      (e.target as HTMLInputElement).blur();
    }
  }, []);

  function navigate(path: string) {
    setIsOpen(false);
    setQuery("");
    setResults(null);
    router.push(path);
  }

  const hasMembers = results && results.members.length > 0;
  const hasCells = results && results.cells.length > 0;
  const isEmpty = results && !hasMembers && !hasCells;

  return (
    <div ref={containerRef} className="relative w-full max-w-64">
      <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-slate-400" />
      <input
        type="text"
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        onFocus={() => { if (query.length >= 2) setIsOpen(true); }}
        onKeyDown={handleKeyDown}
        placeholder="Buscar membro, célula..."
        className="w-full rounded-md border border-slate-200 bg-slate-50 pl-9 pr-4 py-2 text-sm outline-none transition-colors focus:border-blue-500 focus:bg-white focus:ring-1 focus:ring-blue-500"
      />

      {isOpen && (
        <div className="absolute top-full left-0 mt-1 w-full rounded-md border bg-white shadow-lg z-50 overflow-hidden">
          {isLoading && (
            <div className="p-3 space-y-2">
              <Skeleton className="h-4 w-3/4" />
              <Skeleton className="h-4 w-1/2" />
              <Skeleton className="h-4 w-2/3" />
            </div>
          )}

          {!isLoading && error && (
            <div className="px-3 py-4 text-sm text-red-500 text-center">
              {error}
            </div>
          )}

          {!isLoading && !error && isEmpty && (
            <div className="px-3 py-4 text-sm text-slate-500 text-center">
              Nenhum resultado encontrado para &ldquo;{query}&rdquo;
            </div>
          )}

          {!isLoading && !error && results && (hasMembers || hasCells) && (
            <>
              {hasMembers && (
                <div>
                  <div className="px-3 py-1.5 text-xs font-semibold text-slate-400">
                    Membros
                  </div>
                  {results.members.map((member) => (
                    <button
                      key={member.id}
                      onClick={() => navigate(`/members/${member.id}/edit`)}
                      className="flex w-full items-center gap-2 px-3 py-2 text-sm text-slate-700 hover:bg-slate-100 transition-colors cursor-pointer"
                    >
                      <Users className="h-4 w-4 text-slate-400 shrink-0" />
                      <span className="truncate">{member.fullName}</span>
                    </button>
                  ))}
                </div>
              )}

              {hasMembers && hasCells && (
                <div className="mx-1 my-1 h-px bg-slate-200" />
              )}

              {hasCells && (
                <div>
                  <div className="px-3 py-1.5 text-xs font-semibold text-slate-400">
                    Células
                  </div>
                  {results.cells.map((cell) => (
                    <button
                      key={cell.id}
                      onClick={() => navigate(`/cells/${cell.id}/edit`)}
                      className="flex w-full items-center gap-2 px-3 py-2 text-sm text-slate-700 hover:bg-slate-100 transition-colors cursor-pointer"
                    >
                      <Home className="h-4 w-4 text-slate-400 shrink-0" />
                      <span className="truncate">{cell.name}</span>
                    </button>
                  ))}
                </div>
              )}
            </>
          )}
        </div>
      )}
    </div>
  );
}
