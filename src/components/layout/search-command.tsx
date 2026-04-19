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
      <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" strokeWidth={1.75} />
      <input
        type="text"
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        onFocus={() => { if (query.length >= 2) setIsOpen(true); }}
        onKeyDown={handleKeyDown}
        placeholder="Buscar em tudo…"
        className="w-full rounded-md border border-border bg-background pl-9 pr-4 py-2 text-sm outline-none transition-colors focus:border-ring focus:ring-2 focus:ring-ring/30 placeholder:text-muted-foreground"
      />

      {isOpen && (
        <div className="absolute top-full left-0 mt-1 w-full rounded-md border border-border bg-popover shadow-md z-50 overflow-hidden">
          {isLoading && (
            <div className="p-3 space-y-2">
              <Skeleton className="h-4 w-3/4" />
              <Skeleton className="h-4 w-1/2" />
              <Skeleton className="h-4 w-2/3" />
            </div>
          )}

          {!isLoading && error && (
            <div className="px-3 py-4 text-sm text-destructive text-center">
              {error}
            </div>
          )}

          {!isLoading && !error && isEmpty && (
            <div className="px-3 py-4 text-sm text-muted-foreground text-center">
              Nenhum resultado encontrado para &ldquo;{query}&rdquo;
            </div>
          )}

          {!isLoading && !error && results && (hasMembers || hasCells) && (
            <>
              {hasMembers && (
                <div>
                  <div className="px-3 py-1.5 text-[11px] font-medium uppercase tracking-[0.1em] text-muted-foreground">
                    Membros
                  </div>
                  {results.members.map((member) => (
                    <button
                      key={member.id}
                      onClick={() => navigate(`/members/${member.id}/edit`)}
                      className="flex w-full items-center gap-2 px-3 py-2 text-sm text-foreground hover:bg-muted transition-colors cursor-pointer"
                    >
                      <Users className="h-4 w-4 text-muted-foreground shrink-0" strokeWidth={1.75} />
                      <span className="truncate">{member.fullName}</span>
                    </button>
                  ))}
                </div>
              )}

              {hasMembers && hasCells && (
                <div className="mx-1 my-1 h-px bg-border" />
              )}

              {hasCells && (
                <div>
                  <div className="px-3 py-1.5 text-[11px] font-medium uppercase tracking-[0.1em] text-muted-foreground">
                    Células
                  </div>
                  {results.cells.map((cell) => (
                    <button
                      key={cell.id}
                      onClick={() => navigate(`/cells/${cell.id}/edit`)}
                      className="flex w-full items-center gap-2 px-3 py-2 text-sm text-foreground hover:bg-muted transition-colors cursor-pointer"
                    >
                      <Home className="h-4 w-4 text-muted-foreground shrink-0" strokeWidth={1.75} />
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
