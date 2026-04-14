"use client";

import { useState, useTransition } from "react";
import Link from "next/link";
import { Mail } from "lucide-react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";

import { requestPasswordReset } from "@/actions/auth";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

const schema = z.object({
  email: z.string().email("Informe um email válido."),
});

type FormValues = z.infer<typeof schema>;

export function ForgotPasswordForm() {
  const [sent, setSent] = useState(false);
  const [isPending, startTransition] = useTransition();
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: { email: "" },
  });

  const onSubmit = (values: FormValues) => {
    startTransition(async () => {
      await requestPasswordReset(values);
      setSent(true);
    });
  };

  if (sent) {
    return (
      <Card className="p-6 space-y-4 text-center shadow-sm">
        <div className="flex justify-center">
          <div className="flex h-12 w-12 items-center justify-center rounded-full bg-blue-50 text-blue-600">
            <Mail className="h-6 w-6" />
          </div>
        </div>
        <div className="space-y-1">
          <h2 className="text-lg font-bold text-slate-800">Verifique seu email</h2>
          <p className="text-sm text-slate-500">
            Se o email estiver cadastrado, enviamos um link para criar uma nova
            senha. O link vale por 1 hora.
          </p>
        </div>
        <Button asChild variant="outline" size="lg" className="w-full">
          <Link href="/login">Voltar para o login</Link>
        </Button>
      </Card>
    );
  }

  return (
    <Card className="p-6 space-y-5 shadow-sm">
      <div className="space-y-1 text-center">
        <h2 className="text-xl font-bold text-slate-800">Recuperar acesso</h2>
        <p className="text-sm text-slate-500">
          Informe o email cadastrado. Enviaremos um link para você criar uma
          nova senha.
        </p>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4" noValidate>
        <div className="space-y-1.5">
          <Label htmlFor="email">Email cadastrado</Label>
          <Input
            id="email"
            type="email"
            autoFocus
            autoComplete="email"
            disabled={isPending}
            aria-invalid={!!errors.email}
            {...register("email")}
          />
          {errors.email ? (
            <p className="text-xs text-destructive">{errors.email.message}</p>
          ) : null}
        </div>

        <Button type="submit" size="lg" className="w-full" disabled={isPending}>
          {isPending ? "Enviando…" : "Enviar link de recuperação"}
        </Button>

        <div className="text-center">
          <Link
            href="/login"
            className="text-xs font-semibold text-slate-500 hover:text-slate-700 hover:underline"
          >
            ← Voltar para o login
          </Link>
        </div>
      </form>
    </Card>
  );
}
