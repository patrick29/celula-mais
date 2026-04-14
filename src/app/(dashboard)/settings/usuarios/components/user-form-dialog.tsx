"use client";

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { UserForm } from "./user-form";
import type { UserListItem } from "@/actions/users";

type SupervisorOption = { id: string; fullName: string; role: string };

export function UserFormDialog({
  open,
  mode,
  user,
  supervisors,
  onOpenChange,
  onSuccess,
}: {
  open: boolean;
  mode: "create" | "edit";
  user: UserListItem | null;
  supervisors: SupervisorOption[];
  onOpenChange: (open: boolean) => void;
  onSuccess: () => void;
}) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle>
            {mode === "create" ? "Novo usuário" : "Editar usuário"}
          </DialogTitle>
          <DialogDescription>
            {mode === "create"
              ? "Cadastre um novo acesso. O usuário será obrigado a trocar a senha no primeiro login."
              : "Atualize as informações de acesso. O email não pode ser alterado."}
          </DialogDescription>
        </DialogHeader>
        {open ? (
          <UserForm
            mode={mode}
            user={user}
            supervisors={supervisors}
            onCancel={() => onOpenChange(false)}
            onSuccess={onSuccess}
          />
        ) : null}
      </DialogContent>
    </Dialog>
  );
}
