import { z } from "zod";

export const cellGroupSchema = z.object({
  name: z.string().min(2, "O nome deve ter pelo menos 2 caracteres"),
  cellGroupType: z.enum(["CHILDREN", "YOUNG_ADULTS", "TEENAGERS", "ADULTS"], {
    invalid_type_error: "O tipo da célula é obrigatório",
  }),
  status: z.enum(["ACTIVE", "PLANTING", "PAUSED", "CLOSED"]).default("ACTIVE"),
  meetingDay: z.string().optional(),
  meetingTime: z.string().optional(),
  addressLine: z.string().optional(),
  neighborhood: z.string().optional(),
  city: z.string().optional(),
  state: z.string().optional(),
  startDate: z.string().optional(),
  leaderId: z.string().uuid("ID do líder inválido").optional().or(z.literal("")),
  coLeaderId: z.string().uuid("ID do co-líder inválido").optional().or(z.literal("")),
  hostId: z.string().uuid("ID do anfitrião inválido").optional().or(z.literal("")),
  memberIds: z.array(z.string().uuid()).optional(),
});

export type CellGroupFormInput = z.input<typeof cellGroupSchema>;
export type CellGroupFormOutput = z.output<typeof cellGroupSchema>;
