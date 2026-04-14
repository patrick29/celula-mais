"use client";

import { useEffect, useState, useTransition } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";

import { signIn } from "@/actions/auth";
import { toast } from "@/lib/toast";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { PasswordInput } from "@/components/ui/password-input";

const schema = z.object({
  email: z.string().email("Informe um email válido."),
  password: z.string().min(1, "Informe sua senha."),
});

type FormValues = z.infer<typeof schema>;

export function LoginForm({ expired }: { expired: boolean }) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [serverError, setServerError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors },
    setFocus,
    setValue,
  } = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: { email: "", password: "" },
  });

  useEffect(() => {
    if (expired) {
      toast.info("Sua sessão expirou. Entre novamente para continuar.");
    }
  }, [expired]);

  const onSubmit = (values: FormValues) => {
    setServerError(null);
    startTransition(async () => {
      const result = await signIn(values);
      if (result.error) {
        setServerError(result.error);
        setValue("password", "");
        setFocus("password");
        return;
      }
      if (result.data?.mustChangePassword) {
        router.replace("/login/redefinir-senha?first=true");
      } else {
        router.replace("/");
      }
    });
  };

  return (
    <Card className="p-6 space-y-5 shadow-sm">
      <div className="space-y-1 text-center">
        <h2 className="text-xl font-bold text-slate-800">Entrar no Célula Mais</h2>
        <p className="text-sm text-slate-500">
          Acesse sua área como pastor, supervisor ou líder
        </p>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4" noValidate>
        <div className="space-y-1.5">
          <Label htmlFor="email">Email</Label>
          <Input
            id="email"
            type="email"
            autoFocus
            autoComplete="email"
            placeholder="seu-email@igreja.com"
            disabled={isPending}
            aria-invalid={!!errors.email}
            {...register("email")}
          />
          {errors.email ? (
            <p className="text-xs text-destructive">{errors.email.message}</p>
          ) : null}
        </div>

        <div className="space-y-1.5">
          <div className="flex items-center justify-between">
            <Label htmlFor="password">Senha</Label>
            <Link
              href="/login/esqueci-senha"
              className="text-xs font-semibold text-blue-600 hover:underline"
            >
              Esqueci minha senha
            </Link>
          </div>
          <PasswordInput
            id="password"
            autoComplete="current-password"
            disabled={isPending}
            aria-invalid={!!errors.password}
            {...register("password")}
          />
          {errors.password ? (
            <p className="text-xs text-destructive">{errors.password.message}</p>
          ) : null}
        </div>

        {serverError ? (
          <p className="rounded-md bg-destructive/10 px-3 py-2 text-xs font-medium text-destructive">
            {serverError}
          </p>
        ) : null}

        <Button type="submit" size="lg" className="w-full" disabled={isPending}>
          {isPending ? "Entrando…" : "Entrar"}
        </Button>
      </form>
    </Card>
  );
}
