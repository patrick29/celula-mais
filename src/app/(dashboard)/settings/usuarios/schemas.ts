import { z } from "zod";

export const USER_ROLES = [
  "ADMIN",
  "PASTOR",
  "SUPERVISOR",
  "LEADER",
  "ASSISTANT",
] as const;

export const passwordSchema = z
  .string()
  .min(8, "A senha precisa ter ao menos 8 caracteres.")
  .regex(/[a-zA-Z]/, "A senha precisa ter ao menos 1 letra.")
  .regex(/[0-9]/, "A senha precisa ter ao menos 1 número.");

export const createUserSchema = z.object({
  fullName: z
    .string()
    .trim()
    .min(3, "Informe o nome completo.")
    .max(120, "Nome muito longo."),
  email: z.string().email("Informe um email válido."),
  phone: z
    .string()
    .trim()
    .optional()
    .transform((v) => (v === "" ? undefined : v)),
  role: z.enum(USER_ROLES),
  supervisorId: z
    .string()
    .uuid()
    .optional()
    .nullable()
    .transform((v) => (v === "" || v === undefined ? null : v)),
  initialPassword: passwordSchema,
  mustChangePassword: z.boolean().default(true),
});

export const updateUserSchema = z.object({
  id: z.string().uuid(),
  fullName: z.string().trim().min(3).max(120),
  phone: z
    .string()
    .trim()
    .optional()
    .transform((v) => (v === "" ? undefined : v)),
  role: z.enum(USER_ROLES),
  supervisorId: z.string().uuid().optional().nullable(),
});

export const listUsersSchema = z.object({
  search: z.string().optional(),
  role: z.enum(USER_ROLES).optional(),
  status: z.enum(["all", "active", "inactive"]).default("all"),
});

export const setUserActiveSchema = z.object({
  id: z.string().uuid(),
  isActive: z.boolean(),
});

export type CreateUserInput = z.input<typeof createUserSchema>;
export type UpdateUserInput = z.input<typeof updateUserSchema>;
export type ListUsersInput = z.input<typeof listUsersSchema>;
