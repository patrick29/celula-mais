"use client";

import { useEffect, useState, useTransition } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { AlertTriangle } from "lucide-react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";

import { updatePasswordWithToken } from "@/actions/auth";
import { createClient } from "@/lib/supabase/client";
import { toast } from "@/lib/toast";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { PasswordInput } from "@/components/ui/password-input";
import {
  PasswordRequirements,
  isValidPassword,
} from "@/components/auth/password-requirements";

const schema = z
  .object({
    newPassword: z
      .string()
      .min(8, "A senha precisa ter ao menos 8 caracteres.")
      .regex(/[a-zA-Z]/, "A senha precisa ter ao menos 1 letra.")
      .regex(/[0-9]/, "A senha precisa ter ao menos 1 número."),
    confirmPassword: z.string().min(1, "Confirme sua nova senha."),
  })
  .refine((data) => data.newPassword === data.confirmPassword, {
    message: "As senhas não coincidem.",
    path: ["confirmPassword"],
  });

type FormValues = z.infer<typeof schema>;

type SessionState = "loading" | "ready" | "invalid";

export function ResetPasswordForm({ first }: { first: boolean }) {
  const router = useRouter();
  const [sessionState, setSessionState] = useState<SessionState>(
    first ? "ready" : "loading"
  );
  const [isPending, startTransition] = useTransition();

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors },
  } = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: { newPassword: "", confirmPassword: "" },
    mode: "onChange",
  });

  const newPassword = watch("newPassword");

  useEffect(() => {
    if (first) return;
    const supabase = createClient();

    const hash = typeof window !== "undefined" ? window.location.hash : "";
    if (!hash || !hash.includes("access_token")) {
      supabase.auth.getSession().then(({ data }) => {
        setSessionState(data.session ? "ready" : "invalid");
      });
      return;
    }

    const params = new URLSearchParams(hash.replace(/^#/, ""));
    const accessToken = params.get("access_token");
    const refreshToken = params.get("refresh_token");

    if (!accessToken || !refreshToken) {
      setSessionState("invalid");
      return;
    }

    supabase.auth
      .setSession({ access_token: accessToken, refresh_token: refreshToken })
      .then(({ error }) => {
        setSessionState(error ? "invalid" : "ready");
        if (!error && typeof window !== "undefined") {
          window.history.replaceState(null, "", window.location.pathname);
        }
      });
  }, [first]);

  const onSubmit = (values: FormValues) => {
    startTransition(async () => {
      const result = await updatePasswordWithToken({
        password: values.newPassword,
      });
      if (result.error) {
        toast.error(result.error);
        return;
      }
      toast.success("Senha atualizada com sucesso");
      setTimeout(() => router.replace("/login"), 1200);
    });
  };

  if (sessionState === "loading") {
    return (
      <Card className="p-6 space-y-4 shadow-sm">
        <div className="h-4 w-3/4 animate-pulse rounded bg-slate-200" />
        <div className="h-10 w-full animate-pulse rounded bg-slate-200" />
        <div className="h-10 w-full animate-pulse rounded bg-slate-200" />
      </Card>
    );
  }

  if (sessionState === "invalid") {
    return (
      <Card className="p-6 space-y-4 text-center shadow-sm">
        <div className="flex justify-center">
          <div className="flex h-12 w-12 items-center justify-center rounded-full bg-amber-50 text-amber-600">
            <AlertTriangle className="h-6 w-6" />
          </div>
        </div>
        <div className="space-y-1">
          <h2 className="text-lg font-bold text-slate-800">
            Link inválido ou expirado
          </h2>
          <p className="text-sm text-slate-500">
            Este link não é mais válido. Os links de recuperação duram 1 hora
            por segurança.
          </p>
        </div>
        <Button asChild size="lg" className="w-full">
          <Link href="/login/esqueci-senha">Solicitar novo link</Link>
        </Button>
      </Card>
    );
  }

  const passwordOk = isValidPassword(newPassword);

  return (
    <Card className="p-6 space-y-5 shadow-sm">
      <div className="space-y-1 text-center">
        <h2 className="text-xl font-bold text-slate-800">Definir nova senha</h2>
        <p className="text-sm text-slate-500">
          {first
            ? "Este é seu primeiro acesso. Defina uma senha pessoal antes de continuar."
            : "Crie uma senha forte para sua conta."}
        </p>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4" noValidate>
        <div className="space-y-1.5">
          <Label htmlFor="newPassword">Nova senha</Label>
          <PasswordInput
            id="newPassword"
            autoComplete="new-password"
            disabled={isPending}
            aria-invalid={!!errors.newPassword}
            {...register("newPassword")}
          />
          <PasswordRequirements value={newPassword} />
        </div>

        <div className="space-y-1.5">
          <Label htmlFor="confirmPassword">Confirmar senha</Label>
          <PasswordInput
            id="confirmPassword"
            autoComplete="new-password"
            disabled={isPending}
            aria-invalid={!!errors.confirmPassword}
            {...register("confirmPassword")}
          />
          {errors.confirmPassword ? (
            <p className="text-xs text-destructive">
              {errors.confirmPassword.message}
            </p>
          ) : null}
        </div>

        <Button
          type="submit"
          size="lg"
          className="w-full"
          disabled={isPending || !passwordOk}
        >
          {isPending ? "Salvando…" : "Salvar nova senha"}
        </Button>
      </form>
    </Card>
  );
}
