import { z } from "zod";

export const memberSchema = z.object({
  fullName: z.string().min(2, "O nome deve ter pelo menos 2 caracteres"),
  nickname: z.string().optional(),
  phone: z.string().optional(),
  birthDate: z.string().optional(),
  gender: z.enum(["MALE", "FEMALE", "OTHER", ""]).optional()
    .transform(val => val === "" ? undefined : val),
  maritalStatus: z.string().optional(),
  // Cônjuge já cadastrado
  spouseId: z.string().uuid().optional().nullable(),
  // Cadastro rápido de cônjuge não cadastrado
  spouseQuickName: z.string().optional(),
  spouseAttends: z.boolean().optional(),
  addressLine: z.string().optional(),
  neighborhood: z.string().optional(),
  churchLifeEvents: z.array(z.object({
    type: z.string().min(1, "O tipo do evento é obrigatório"),
    date: z.string().min(1, "A data do evento é obrigatória"),
    notes: z.string().optional(),
    isNew: z.boolean().optional(),
  })).default([]),
  notes: z.string().optional(),
});

export type MemberFormInput = z.input<typeof memberSchema>;
export type MemberFormOutput = z.output<typeof memberSchema>;
