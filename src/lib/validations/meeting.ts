import { z } from "zod";

export const meetingSchema = z.object({
  cellGroupId: z.string().uuid("Selecione uma célula válida"),
  meetingDate: z.string().min(1, "A data da reunião é obrigatória"),
  topic: z.string().optional(),
  initialPrayer: z.string().uuid().optional(),
  finalPrayer: z.string().uuid().optional(),
  responsibleForReflection: z.string().uuid().optional(),
  notes: z.string().optional(),
  photoUrl: z.string().optional(),
  memberCount: z.coerce.number().int().min(0).optional(),
  visitorCount: z.coerce.number().int().min(0).default(0),
  childrenCount: z.coerce.number().int().min(0).default(0),
  attendances: z.array(z.object({
    personId: z.string().uuid(),
    status: z.enum(["PRESENT", "ABSENT", "VISITOR"]),
  })).optional(),
});

export type MeetingFormInput = z.input<typeof meetingSchema>;
export type MeetingFormOutput = z.output<typeof meetingSchema>;
