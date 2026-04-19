"use client";

import { useTransition } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { PasswordInput } from "@/components/ui/password-input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  PasswordRequirements,
  isValidPassword,
} from "@/components/auth/password-requirements";
import { roleLabel } from "@/components/users/user-role-badge";
import {
  createUserSchema,
  updateUserSchema,
  USER_ROLES,
  type CreateUserInput,
  type UpdateUserInput,
} from "@/app/(dashboard)/settings/usuarios/schemas";
import { createUser, updateUser, type UserListItem } from "@/actions/users";
import { toast } from "@/lib/toast";

type SupervisorOption = { id: string; fullName: string; role: string };

const NONE_VALUE = "__none__";

export function UserForm({
  mode,
  user,
  supervisors,
  onCancel,
  onSuccess,
}: {
  mode: "create" | "edit";
  user: UserListItem | null;
  supervisors: SupervisorOption[];
  onCancel: () => void;
  onSuccess: () => void;
}) {
  const [isPending, startTransition] = useTransition();

  if (mode === "edit" && user) {
    return (
      <EditForm
        user={user}
        supervisors={supervisors}
        isPending={isPending}
        startTransition={startTransition}
        onCancel={onCancel}
        onSuccess={onSuccess}
      />
    );
  }

  return (
    <CreateForm
      supervisors={supervisors}
      isPending={isPending}
      startTransition={startTransition}
      onCancel={onCancel}
      onSuccess={onSuccess}
    />
  );
}

function CreateForm({
  supervisors,
  isPending,
  startTransition,
  onCancel,
  onSuccess,
}: {
  supervisors: SupervisorOption[];
  isPending: boolean;
  startTransition: React.TransitionStartFunction;
  onCancel: () => void;
  onSuccess: () => void;
}) {
  const {
    register,
    handleSubmit,
    watch,
    setValue,
    formState: { errors },
  } = useForm<CreateUserInput>({
    resolver: zodResolver(createUserSchema),
    mode: "onChange",
    defaultValues: {
      fullName: "",
      email: "",
      phone: "",
      role: "LEADER",
      supervisorId: null,
      initialPassword: "",
      mustChangePassword: true,
    },
  });

  const role = watch("role");
  const supervisorId = watch("supervisorId") ?? null;
  const initialPassword = watch("initialPassword");
  const needsSupervisor = role === "LEADER" || role === "ASSISTANT";

  const onSubmit = (values: CreateUserInput) => {
    startTransition(async () => {
      const result = await createUser(values);
      if (result.error) {
        toast.error(result.error);
        return;
      }
      toast.success(`${values.fullName} foi cadastrado com sucesso.`);
      onSuccess();
    });
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4" noValidate>
      <Field
        id="fullName"
        label="Nome completo"
        error={errors.fullName?.message}
      >
        <Input
          id="fullName"
          autoFocus
          disabled={isPending}
          {...register("fullName")}
        />
      </Field>

      <Field id="email" label="Email" error={errors.email?.message}>
        <Input
          id="email"
          type="email"
          autoComplete="off"
          disabled={isPending}
          {...register("email")}
        />
      </Field>

      <Field id="phone" label="Telefone (opcional)" error={errors.phone?.message}>
        <Input id="phone" disabled={isPending} {...register("phone")} />
      </Field>

      <Field id="role" label="Perfil" error={errors.role?.message}>
        <Select
          value={role}
          onValueChange={(v) =>
            setValue("role", v as CreateUserInput["role"], {
              shouldValidate: true,
            })
          }
        >
          <SelectTrigger id="role" disabled={isPending}>
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {USER_ROLES.map((r) => (
              <SelectItem key={r} value={r}>
                {roleLabel(r)}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </Field>

      {needsSupervisor ? (
        <Field
          id="supervisorId"
          label="Supervisor"
          error={errors.supervisorId?.message}
        >
          <Select
            value={supervisorId ?? NONE_VALUE}
            onValueChange={(v) =>
              setValue("supervisorId", v === NONE_VALUE ? null : v, {
                shouldValidate: true,
              })
            }
          >
            <SelectTrigger id="supervisorId" disabled={isPending}>
              <SelectValue placeholder="Selecione um supervisor" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value={NONE_VALUE}>Sem supervisor</SelectItem>
              {supervisors.map((s) => (
                <SelectItem key={s.id} value={s.id}>
                  {s.fullName} · {roleLabel(s.role as (typeof USER_ROLES)[number])}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </Field>
      ) : null}

      <Field
        id="initialPassword"
        label="Senha inicial"
        error={errors.initialPassword?.message}
      >
        <PasswordInput
          id="initialPassword"
          autoComplete="new-password"
          disabled={isPending}
          {...register("initialPassword")}
        />
        <PasswordRequirements value={initialPassword} />
      </Field>

      <p className="text-xs text-muted-foreground">
        O usuário receberá o email e a senha por um canal privado seu. No
        primeiro acesso, será obrigado a definir uma senha pessoal.
      </p>

      <div className="flex items-center justify-end gap-2 pt-2">
        <Button
          type="button"
          variant="outline"
          onClick={onCancel}
          disabled={isPending}
        >
          Cancelar
        </Button>
        <Button
          type="submit"
          disabled={isPending || !isValidPassword(initialPassword)}
        >
          {isPending ? "Cadastrando…" : "Cadastrar usuário"}
        </Button>
      </div>
    </form>
  );
}

function EditForm({
  user,
  supervisors,
  isPending,
  startTransition,
  onCancel,
  onSuccess,
}: {
  user: UserListItem;
  supervisors: SupervisorOption[];
  isPending: boolean;
  startTransition: React.TransitionStartFunction;
  onCancel: () => void;
  onSuccess: () => void;
}) {
  const {
    register,
    handleSubmit,
    watch,
    setValue,
    formState: { errors },
  } = useForm<UpdateUserInput>({
    resolver: zodResolver(updateUserSchema),
    mode: "onChange",
    defaultValues: {
      id: user.id,
      fullName: user.fullName,
      phone: user.phone ?? "",
      role: user.role,
      supervisorId: user.supervisorId ?? null,
    },
  });

  const role = watch("role");
  const supervisorId = watch("supervisorId") ?? null;
  const needsSupervisor = role === "LEADER" || role === "ASSISTANT";

  const onSubmit = (values: UpdateUserInput) => {
    startTransition(async () => {
      const result = await updateUser(values);
      if (result.error) {
        toast.error(result.error);
        return;
      }
      toast.success("Dados do usuário atualizados.");
      onSuccess();
    });
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4" noValidate>
      <Field id="emailReadonly" label="Email">
        <Input id="emailReadonly" value={user.email} disabled readOnly />
        <p className="text-xs text-muted-foreground mt-1">
          O email é usado para login e não pode ser alterado.
        </p>
      </Field>

      <Field
        id="fullName"
        label="Nome completo"
        error={errors.fullName?.message}
      >
        <Input
          id="fullName"
          autoFocus
          disabled={isPending}
          {...register("fullName")}
        />
      </Field>

      <Field id="phone" label="Telefone (opcional)" error={errors.phone?.message}>
        <Input id="phone" disabled={isPending} {...register("phone")} />
      </Field>

      <Field id="role" label="Perfil" error={errors.role?.message}>
        <Select
          value={role}
          onValueChange={(v) =>
            setValue("role", v as UpdateUserInput["role"], {
              shouldValidate: true,
            })
          }
        >
          <SelectTrigger id="role" disabled={isPending}>
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {USER_ROLES.map((r) => (
              <SelectItem key={r} value={r}>
                {roleLabel(r)}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </Field>

      {needsSupervisor ? (
        <Field
          id="supervisorId"
          label="Supervisor"
          error={errors.supervisorId?.message}
        >
          <Select
            value={supervisorId ?? NONE_VALUE}
            onValueChange={(v) =>
              setValue("supervisorId", v === NONE_VALUE ? null : v, {
                shouldValidate: true,
              })
            }
          >
            <SelectTrigger id="supervisorId" disabled={isPending}>
              <SelectValue placeholder="Selecione um supervisor" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value={NONE_VALUE}>Sem supervisor</SelectItem>
              {supervisors
                .filter((s) => s.id !== user.id)
                .map((s) => (
                  <SelectItem key={s.id} value={s.id}>
                    {s.fullName} ·{" "}
                    {roleLabel(s.role as (typeof USER_ROLES)[number])}
                  </SelectItem>
                ))}
            </SelectContent>
          </Select>
        </Field>
      ) : null}

      <div className="flex items-center justify-end gap-2 pt-2">
        <Button
          type="button"
          variant="outline"
          onClick={onCancel}
          disabled={isPending}
        >
          Cancelar
        </Button>
        <Button type="submit" disabled={isPending}>
          {isPending ? "Salvando…" : "Salvar alterações"}
        </Button>
      </div>
    </form>
  );
}

function Field({
  id,
  label,
  error,
  children,
}: {
  id: string;
  label: string;
  error?: string;
  children: React.ReactNode;
}) {
  return (
    <div className="space-y-1.5">
      <Label htmlFor={id}>{label}</Label>
      {children}
      {error ? <p className="text-xs text-destructive">{error}</p> : null}
    </div>
  );
}
