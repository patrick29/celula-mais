"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Plus, UserPlus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { UsersTable } from "./users-table";
import { UserFormDialog } from "./user-form-dialog";
import { DeactivateUserDialog } from "./deactivate-user-dialog";
import {
  resendPasswordResetForUser,
  setUserActive,
  type UserListItem,
} from "@/actions/users";
import { toast } from "@/lib/toast";

type SupervisorOption = { id: string; fullName: string; role: string };

type DialogState =
  | { kind: "closed" }
  | { kind: "create" }
  | { kind: "edit"; user: UserListItem };

type DeactivateState =
  | { kind: "closed" }
  | { kind: "open"; user: UserListItem };

export function UsersPageClient({
  initialUsers,
  loadError,
  supervisors,
}: {
  initialUsers: UserListItem[];
  loadError: string | null;
  supervisors: SupervisorOption[];
}) {
  const router = useRouter();
  const [dialog, setDialog] = useState<DialogState>({ kind: "closed" });
  const [deactivateState, setDeactivateState] = useState<DeactivateState>({
    kind: "closed",
  });
  const [isPending, startTransition] = useTransition();

  function handleResetPassword(user: UserListItem) {
    startTransition(async () => {
      const result = await resendPasswordResetForUser(user.id);
      if (result.error) {
        toast.error(result.error);
        return;
      }
      toast.success(`Link de recuperação enviado para ${user.email}.`);
    });
  }

  function handleReactivate(user: UserListItem) {
    startTransition(async () => {
      const result = await setUserActive({ id: user.id, isActive: true });
      if (result.error) {
        toast.error(result.error);
        return;
      }
      toast.success(`${user.fullName} foi reativado.`);
      router.refresh();
    });
  }

  return (
    <div className="p-6 space-y-6">
      <header className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900">
            Usuários
          </h1>
          <p className="text-sm text-slate-500 mt-1">
            Cadastre e gerencie quem pode acessar a plataforma da sua igreja.
          </p>
        </div>
        <Button
          size="lg"
          onClick={() => setDialog({ kind: "create" })}
          disabled={isPending}
        >
          <UserPlus className="h-4 w-4" />
          Novo usuário
        </Button>
      </header>

      {loadError ? (
        <div className="rounded-lg border border-amber-200 bg-amber-50 p-4 text-sm text-amber-800">
          {loadError}
        </div>
      ) : (
        <UsersTable
          users={initialUsers}
          isPending={isPending}
          onEdit={(user) => setDialog({ kind: "edit", user })}
          onResetPassword={handleResetPassword}
          onDeactivate={(user) => setDeactivateState({ kind: "open", user })}
          onReactivate={handleReactivate}
          onCreateFirst={() => setDialog({ kind: "create" })}
        />
      )}

      <UserFormDialog
        open={dialog.kind !== "closed"}
        mode={dialog.kind === "edit" ? "edit" : "create"}
        user={dialog.kind === "edit" ? dialog.user : null}
        supervisors={supervisors}
        onOpenChange={(open) => {
          if (!open) setDialog({ kind: "closed" });
        }}
        onSuccess={() => {
          setDialog({ kind: "closed" });
          router.refresh();
        }}
      />

      <DeactivateUserDialog
        open={deactivateState.kind === "open"}
        user={deactivateState.kind === "open" ? deactivateState.user : null}
        onOpenChange={(open) => {
          if (!open) setDeactivateState({ kind: "closed" });
        }}
        onSuccess={() => {
          setDeactivateState({ kind: "closed" });
          router.refresh();
        }}
      />
    </div>
  );
}
