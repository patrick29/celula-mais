"use client";

import { useTransition } from "react";
import { AlertTriangle } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { setUserActive, type UserListItem } from "@/actions/users";
import { toast } from "@/lib/toast";

export function DeactivateUserDialog({
  open,
  user,
  onOpenChange,
  onSuccess,
}: {
  open: boolean;
  user: UserListItem | null;
  onOpenChange: (open: boolean) => void;
  onSuccess: () => void;
}) {
  const [isPending, startTransition] = useTransition();

  const handleConfirm = () => {
    if (!user) return;
    startTransition(async () => {
      const result = await setUserActive({ id: user.id, isActive: false });
      if (result.error) {
        toast.error(result.error);
        return;
      }
      toast.success(`${user.fullName} foi desativado.`);
      onSuccess();
    });
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <div className="flex justify-center mb-2">
            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-[#f6ead0] text-[#b88a28] border border-[#ebe3cf]">
              <AlertTriangle className="h-6 w-6" strokeWidth={1.75} />
            </div>
          </div>
          <DialogTitle className="text-center">Desativar acesso?</DialogTitle>
          <DialogDescription className="text-center">
            {user ? (
              <>
                <strong>{user.fullName}</strong> perderá o acesso imediatamente e
                suas sessões abertas serão encerradas. Você pode reativar a
                qualquer momento.
              </>
            ) : null}
          </DialogDescription>
        </DialogHeader>
        <DialogFooter className="sm:justify-center gap-2">
          <Button
            variant="outline"
            onClick={() => onOpenChange(false)}
            disabled={isPending}
          >
            Cancelar
          </Button>
          <Button
            variant="destructive"
            onClick={handleConfirm}
            disabled={isPending}
          >
            {isPending ? "Desativando…" : "Sim, desativar"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
