---
task: "Implementar Backend"
order: 1
input: "Plano técnico aprovado (03-plano-tecnico.md) + schema atual do projeto"
output: "Código backend funcional: migration, schema Drizzle, validação Zod e server action com auth, permissão e tratamento de erros"
---

# Implementar Backend

Pega o plano técnico aprovado e transforma em código backend funcionando. Ordem obrigatória: migration → schema Drizzle → Zod schema → server action. Cada camada é testada antes da próxima.

## Process

1. **Reler o plano técnico lado a lado com o schema atual.** Entender exatamente quais tabelas mudam, quais são novas, quais server actions precisam existir. Se algo estiver ambíguo, PARE e pergunte ao tech-lead antes de codar.
2. **Criar migration e atualizar o schema Drizzle.** Abrir o arquivo de schema mais parecido em `db/schema/` e seguir o padrão (naming snake_case nas colunas, camelCase nos campos TS, índices, foreign keys). Rodar a migration localmente e conferir no banco.
3. **Definir o Zod schema de input.** Criar `EntrySchema` (shape do banco) e `InputSchema` (o que o cliente manda). Reaproveitar tipos inferidos — nada de declarar tipo duplicado na mão.
4. **Escrever a server action.** Começar com `"use server"`, fazer auth check, checar permissão (`canLeadCell` ou equivalente), validar input com `InputSchema.parse()`, executar a query Drizzle (UPSERT quando fizer sentido) dentro de try/catch, retornar `{ ok: true }` ou `{ ok: false, error: "..." }` em PT-BR.
5. **Testar cada camada isoladamente.** Migration aplica? Schema compila? Zod rejeita input inválido? Server action retorna erro legível quando o usuário não tem permissão? Só avança quando tudo passa.

## Output Format

Para cada arquivo criado/modificado:
- Caminho absoluto do arquivo
- Diff ou conteúdo completo (se novo)
- Nota curta do que foi testado

## Output Example

**Arquivo:** `app/(app)/celulas/[id]/actions.ts`

```typescript
"use server";

import { z } from "zod";
import { revalidatePath } from "next/cache";
import { db } from "@/db";
import { attendance } from "@/db/schema/attendance";
import { getCurrentUser } from "@/lib/auth";
import { canLeadCell } from "@/lib/permissions";

const InputSchema = z.object({
  cellId: z.string().uuid(),
  meetingDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  memberId: z.string().uuid(),
  present: z.boolean(),
});

export async function recordAttendance(input: z.infer<typeof InputSchema>) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return { ok: false, error: "Você precisa estar logado para registrar presença." };
    }

    const parsed = InputSchema.parse(input);

    if (!(await canLeadCell(user.id, parsed.cellId))) {
      return { ok: false, error: "Você não tem permissão para registrar presença nesta célula." };
    }

    await db
      .insert(attendance)
      .values({
        cellId: parsed.cellId,
        meetingDate: parsed.meetingDate,
        memberId: parsed.memberId,
        present: parsed.present,
      })
      .onConflictDoUpdate({
        target: [attendance.cellId, attendance.meetingDate, attendance.memberId],
        set: { present: parsed.present, updatedAt: new Date() },
      });

    revalidatePath(`/celulas/${parsed.cellId}`);
    return { ok: true };
  } catch (error) {
    console.error("[recordAttendance]", error);
    return { ok: false, error: "Não foi possível salvar a presença. Tente novamente." };
  }
}
```

**Testado:**
- Happy path: líder marca presença, UPSERT grava, revalidatePath atualiza a tela.
- Edge case 1: usuário não-logado recebe mensagem em PT-BR.
- Edge case 2: usuário sem permissão na célula é bloqueado com mensagem clara.

## Quality Criteria

- Migration aplica sem erro e o schema Drizzle reflete exatamente o banco.
- Server action tem `"use server"`, auth check, permission check, Zod parse e try/catch — nessa ordem.
- Zero `any`. Todos os tipos inferidos do schema Drizzle ou Zod.
- Toda mensagem de erro é em português e acionável.
- UPSERT usa `onConflictDoUpdate` quando a operação é idempotente.

## Veto Conditions

- **Uso de `any` em qualquer lugar do código.** Implementação rejeitada — corrigir antes de seguir.
- **Server action sem validação Zod ou sem permission check.** Risco de segurança, não vai para o QA.
