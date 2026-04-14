# Output Examples — Dev Squad Célula Mais

Exemplos completos de outputs esperados de cada fase da squad. Use como referência de qualidade, não como template rígido.

---

## Exemplo 1 — Requisitos (PM)

```markdown
# Requisitos — Registro de Presença em Células

## Problema
Líderes de célula hoje não têm como registrar quem compareceu à reunião semanal. A informação fica perdida em cadernos ou grupos de WhatsApp, e os supervisores não conseguem acompanhar o engajamento.

## Personas afetadas
- Líder de célula (registra a presença)
- Supervisor (consulta relatórios)
- Administrador (configura a célula)

## Escopo (MVP)
**Must:**
- Líder abre a reunião do dia e marca presença de cada membro (presente/ausente/justificado)
- Dados persistem no banco vinculados à célula e à data
**Should:**
- Observação livre por membro
**Could:**
- Exportar relatório em PDF
**Won't (agora):**
- Notificações automáticas a faltosos

## User Stories

### US-01 — Registrar presença de uma reunião
Como líder de célula, quero marcar quem compareceu à reunião de hoje, para que eu possa acompanhar o engajamento do meu grupo.

**Critérios de aceite:**
- Dado que estou logado como líder da célula X
- E existe uma reunião agendada para hoje
- Quando eu abro a tela "Presença"
- Então vejo a lista de membros da célula com opções presente/ausente/justificado
- E ao salvar, os dados ficam persistidos

## Riscos e assumptions
- Assume que o cadastro de membros por célula já existe (verificar com Tech Lead)
- Risco: fuso horário na gravação da data (usar UTC + conversão no front)
```

---

## Exemplo 2 — UX Spec (Designer)

```markdown
# UX Spec — Registro de Presença

## Contexto de uso
Líder acessa do celular, geralmente durante ou logo após a reunião. Precisa ser rápido (< 1 min para marcar 10 pessoas).

## Fluxo
Sidebar → "Minhas Células" → Card da célula → Botão "Registrar presença de hoje" → Tela de presença → Salvar → Toast de sucesso → volta ao card

## Tela: Registro de Presença
**Cabeçalho:** Nome da célula + data (ex: "Célula Graça — 10/04/2026")
**Corpo:** Lista de membros, cada linha com:
  - Avatar + nome
  - Toggle de 3 estados: Presente / Ausente / Justificado (default: presente)
  - Campo opcional de observação (ícone de lápis que expande)
**Rodapé fixo:** Botão primário "Salvar presença" + contador "8 de 12 marcados"

## Estados
- **Vazio:** "Esta célula ainda não tem membros cadastrados" + CTA para adicionar
- **Carregando:** Skeleton de 5 linhas
- **Erro ao salvar:** Toast vermelho "Não foi possível salvar. Tente novamente." + manter dados
- **Sucesso:** Toast verde "Presença registrada" + redirect após 1.5s

## Componentes reutilizados
`<Card>`, `<Avatar>`, `<Toggle>`, `<Toast>` (já existem)

## Componentes NOVOS
`<PresenceRow>` — linha de membro com toggle de 3 estados (CRIAR)
```

---

## Exemplo 3 — Plano Técnico (Tech Lead)

```markdown
# Plano Técnico — Registro de Presença em Células

## Stack afetada
Next.js App Router + TypeScript + Drizzle ORM + PostgreSQL + componentes em `components/ui/`.

## Modelo de dados
**Nova tabela:** `meeting_attendance`
```sql
id            uuid PK default gen_random_uuid()
meeting_id    uuid FK -> meetings.id (not null)
member_id     uuid FK -> members.id  (not null)
status        enum('presente','ausente','justificado') not null
observation   text
created_at    timestamptz default now()
unique(meeting_id, member_id)
```
**Migration:** criar `drizzle/0007_attendance.sql` com CREATE TABLE + índices.

## API (Server Actions)
- `recordAttendance(meetingId, entries[])` em `app/(app)/celulas/[id]/presenca/actions.ts`
  - Valida com Zod
  - Verifica permissão (usuário é líder daquela célula)
  - UPSERT em `meeting_attendance`
  - Retorna `{success: true}` ou `{error: string}`

## Componentes
**Criar:**
- `app/(app)/celulas/[id]/presenca/page.tsx`
- `app/(app)/celulas/[id]/presenca/presence-form.tsx`
- `components/ui/presence-row.tsx`
**Editar:**
- `components/sidebar.tsx` — adicionar link "Presença"

## Passo a passo
1. Criar migration e rodar `pnpm drizzle-kit push`
2. Adicionar schema Drizzle em `db/schema/meeting-attendance.ts`
3. Criar server action `recordAttendance` com validação Zod
4. Criar `presence-row.tsx` com os 3 estados
5. Criar `presence-form.tsx` consumindo a server action
6. Criar `page.tsx` que renderiza o form com os membros carregados
7. Atualizar sidebar com o novo link
8. Testar manualmente: happy path, erro de permissão, estado vazio

## Riscos e trade-offs
- **Risco:** Se a célula tem 100+ membros, renderizar 100 toggles pode ser lento.
- **Trade-off:** UPSERT por registro vs batch — escolhi batch (1 call) por performance.
- **Decisão que precisa input:** Líder pode registrar presença retroativa? Assumi SIM.
```

---

## Exemplo 4 — Código (Fullstack)

```typescript
// app/(app)/celulas/[id]/presenca/actions.ts
'use server'

import { z } from 'zod'
import { auth } from '@/lib/auth'
import { db } from '@/db'
import { meetingAttendance } from '@/db/schema/meeting-attendance'
import { canLeadCell } from '@/lib/permissions'

const EntrySchema = z.object({
  memberId: z.string().uuid(),
  status: z.enum(['presente', 'ausente', 'justificado']),
  observation: z.string().max(500).optional(),
})

const InputSchema = z.object({
  meetingId: z.string().uuid(),
  entries: z.array(EntrySchema).min(1),
})

export async function recordAttendance(input: unknown) {
  const parsed = InputSchema.safeParse(input)
  if (!parsed.success) return { error: 'Dados inválidos' }

  const session = await auth()
  if (!session?.user) return { error: 'Não autenticado' }

  const allowed = await canLeadCell(session.user.id, parsed.data.meetingId)
  if (!allowed) return { error: 'Sem permissão' }

  try {
    await db.insert(meetingAttendance).values(/* ... */)
    return { success: true }
  } catch (err) {
    console.error(err)
    return { error: 'Não foi possível salvar. Tente novamente.' }
  }
}
```

---

## Exemplo 5 — Relatório QA

```markdown
# Relatório QA — Registro de Presença

## Checklist executado
| # | Teste | Esperado | Obtido | Status |
|---|-------|----------|--------|--------|
| 1 | Líder abre tela de presença | Lista de membros com toggle "presente" default | Ok | PASS |
| 2 | Marcar 3 como ausente e salvar | Toast verde, dados persistem | Ok | PASS |
| 3 | Recarregar página | Dados salvos aparecem corretos | Ok | PASS |
| 4 | Célula sem membros | Estado vazio com CTA | Ok | PASS |
| 5 | Não-líder tenta acessar | Bloqueio de permissão | "Sem permissão" | PASS |
| 6 | Simular falha de rede | Toast vermelho, dados mantidos no form | Ok | PASS |

## Veredito
APROVADO. Entrega pronta para o usuário.
```
