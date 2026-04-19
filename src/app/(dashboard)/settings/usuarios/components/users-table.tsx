"use client";

import { useMemo, useState } from "react";
import { MoreHorizontal, Search, Users as UsersIcon } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";
import { UserRoleBadge, roleLabel } from "@/components/users/user-role-badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import type { UserListItem } from "@/actions/users";
import { USER_ROLES } from "@/app/(dashboard)/settings/usuarios/schemas";

type StatusFilter = "all" | "active" | "inactive";
type RoleFilter = "all" | (typeof USER_ROLES)[number];

function formatDate(date: Date | null) {
  if (!date) return "Nunca";
  const d = typeof date === "string" ? new Date(date) : date;
  return new Intl.DateTimeFormat("pt-BR", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  }).format(d);
}

export function UsersTable({
  users,
  isPending,
  onEdit,
  onResetPassword,
  onDeactivate,
  onReactivate,
  onCreateFirst,
}: {
  users: UserListItem[];
  isPending: boolean;
  onEdit: (user: UserListItem) => void;
  onResetPassword: (user: UserListItem) => void;
  onDeactivate: (user: UserListItem) => void;
  onReactivate: (user: UserListItem) => void;
  onCreateFirst: () => void;
}) {
  const [search, setSearch] = useState("");
  const [roleFilter, setRoleFilter] = useState<RoleFilter>("all");
  const [statusFilter, setStatusFilter] = useState<StatusFilter>("all");

  const filtered = useMemo(() => {
    const term = search.trim().toLowerCase();
    return users.filter((u) => {
      if (statusFilter === "active" && !u.isActive) return false;
      if (statusFilter === "inactive" && u.isActive) return false;
      if (roleFilter !== "all" && u.role !== roleFilter) return false;
      if (term) {
        const haystack = `${u.fullName} ${u.email}`.toLowerCase();
        if (!haystack.includes(term)) return false;
      }
      return true;
    });
  }, [users, search, roleFilter, statusFilter]);

  if (users.length === 0) {
    return (
      <div className="text-center p-12 bg-white rounded-lg border border-border shadow-sm flex flex-col items-center justify-center">
        <UsersIcon className="w-12 h-12 text-muted-foreground/60 mb-4" />
        <h3 className="text-lg font-medium text-foreground">
          Nenhum usuário cadastrado
        </h3>
        <p className="text-sm text-muted-foreground mt-1 max-w-sm">
          Comece cadastrando o primeiro usuário para dar acesso à plataforma.
        </p>
        <Button onClick={onCreateFirst} className="mt-4">
          Cadastrar primeiro usuário
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Buscar por nome ou email"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-9"
          />
        </div>
        <Select
          value={roleFilter}
          onValueChange={(v) => setRoleFilter(v as RoleFilter)}
        >
          <SelectTrigger className="w-full sm:w-44">
            <SelectValue placeholder="Perfil" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Todos os perfis</SelectItem>
            {USER_ROLES.map((r) => (
              <SelectItem key={r} value={r}>
                {roleLabel(r)}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Select
          value={statusFilter}
          onValueChange={(v) => setStatusFilter(v as StatusFilter)}
        >
          <SelectTrigger className="w-full sm:w-40">
            <SelectValue placeholder="Status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Todos</SelectItem>
            <SelectItem value="active">Ativos</SelectItem>
            <SelectItem value="inactive">Inativos</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="bg-white rounded-lg border border-border shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left">
            <thead className="bg-muted/60 border-b border-border text-foreground">
              <tr>
                <th className="px-6 py-4 font-medium">Usuário</th>
                <th className="px-6 py-4 font-medium">Perfil</th>
                <th className="px-6 py-4 font-medium">Supervisor</th>
                <th className="px-6 py-4 font-medium">Último acesso</th>
                <th className="px-6 py-4 font-medium">Status</th>
                <th className="px-6 py-4 font-medium text-right">Ações</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {filtered.length === 0 ? (
                <tr>
                  <td
                    colSpan={6}
                    className="px-6 py-10 text-center text-sm text-muted-foreground"
                  >
                    Nenhum usuário encontrado com os filtros atuais.
                  </td>
                </tr>
              ) : (
                filtered.map((user) => {
                  const initials = user.fullName
                    .split(" ")
                    .filter(Boolean)
                    .slice(0, 2)
                    .map((p) => p[0])
                    .join("")
                    .toUpperCase();
                  return (
                    <tr
                      key={user.id}
                      className="hover:bg-muted/40 transition-colors"
                    >
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <div className="h-10 w-10 rounded-full bg-[#e5ecdf] flex items-center justify-center text-[#2d4a2b] font-bold border border-[#ebe3cf]">
                            {initials || "?"}
                          </div>
                          <div>
                            <div className="font-medium text-foreground">
                              {user.fullName}
                            </div>
                            <div className="text-xs text-muted-foreground">
                              {user.email}
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <UserRoleBadge role={user.role} />
                      </td>
                      <td className="px-6 py-4">
                        {user.supervisorName ? (
                          <span className="text-sm text-foreground">
                            {user.supervisorName}
                          </span>
                        ) : (
                          <span className="text-xs text-muted-foreground italic">
                            Sem supervisor
                          </span>
                        )}
                      </td>
                      <td className="px-6 py-4">
                        <span className="text-sm text-foreground">
                          {formatDate(user.lastLoginAt)}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <span
                          className={`text-xs inline-flex items-center gap-1.5 ${
                            user.isActive
                              ? "text-[#3f7d4e]"
                              : "text-muted-foreground"
                          }`}
                        >
                          <span
                            className={`h-1.5 w-1.5 rounded-full ${
                              user.isActive ? "bg-[#3f7d4e]" : "bg-muted-foreground"
                            }`}
                          />
                          {user.isActive ? "Ativo" : "Inativo"}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-right">
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <button
                              type="button"
                              disabled={isPending}
                              className="inline-flex h-8 w-8 items-center justify-center rounded-md text-muted-foreground hover:bg-muted hover:text-foreground disabled:opacity-50"
                              aria-label={`Ações para ${user.fullName}`}
                            >
                              <MoreHorizontal className="h-4 w-4" />
                            </button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent>
                            <DropdownMenuLabel>Ações</DropdownMenuLabel>
                            <DropdownMenuItem onClick={() => onEdit(user)}>
                              Editar dados
                            </DropdownMenuItem>
                            <DropdownMenuItem
                              onClick={() => onResetPassword(user)}
                            >
                              Enviar link de nova senha
                            </DropdownMenuItem>
                            <DropdownMenuSeparator />
                            {user.isActive ? (
                              <DropdownMenuItem
                                onClick={() => onDeactivate(user)}
                                className="text-destructive focus:text-destructive/80"
                              >
                                Desativar acesso
                              </DropdownMenuItem>
                            ) : (
                              <DropdownMenuItem
                                onClick={() => onReactivate(user)}
                              >
                                Reativar acesso
                              </DropdownMenuItem>
                            )}
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
