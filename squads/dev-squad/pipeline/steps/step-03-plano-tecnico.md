---
execution: inline
agent: tech-lead
inputFile: squads/dev-squad/output/02-ux-spec.md
outputFile: squads/dev-squad/output/03-plano-tecnico.md
---

# Step 03: Desenhar Plano Técnico

O Tech Lead (Tiago Técnico) lê requisitos e UX spec, explora o código existente com Grep/Glob/Read, e escreve um plano técnico detalhado: arquivos exatos a criar/editar, modelo de dados, server actions com validação Zod e permissão, componentes React, passo a passo numerado e riscos explícitos. Este é o output que vai ao checkpoint.

## Context Loading

Carregue os arquivos abaixo antes de executar:

- `squads/dev-squad/output/01-requisitos.md` — requisitos do PM
- `squads/dev-squad/output/02-ux-spec.md` — UX spec da Daniela
- `pipeline/data/research-brief.md` — vocabulário técnico da squad
- `pipeline/data/domain-framework.md` — seção "Fase 3 — Plano Técnico"
- `pipeline/data/quality-criteria.md` — seção "Tech Lead (Plano Técnico)"
- `pipeline/data/output-examples.md` — Exemplo 3 (Plano Técnico)
- `pipeline/data/anti-patterns.md` — seção "Tech Lead"
- `agents/tech-lead.agent.md` — persona do Tiago Técnico
- `agents/tech-lead/tasks/analisar-impacto.md`
- `agents/tech-lead/tasks/desenhar-plano-tecnico.md`
- `agents/tech-lead/tasks/avaliar-riscos.md`
- **Código fonte do repositório Célula Mais** — use Grep/Glob/Read para mapear estrutura atual

## Instructions

### Process

1. **Leia requisitos e UX spec** lado a lado antes de qualquer código.
2. **Execute `analisar-impacto.md`** — use Grep/Glob/Read para mapear o código existente: estrutura de pastas, padrão de rotas Next.js App Router, schemas Drizzle, componentes UI disponíveis. Identifique arquivos exatos a criar/editar (caminhos completos).
3. **Execute `desenhar-plano-tecnico.md`** — escreva as seções: Stack afetada, Modelo de dados (SQL com colunas e tipos), API/Server Actions (rota + validação Zod + permissão), Componentes (criar/editar com caminhos), Passo a passo numerado sequencial.
4. **Execute `avaliar-riscos.md`** — liste riscos (performance, segurança, migrations destrutivas, breaking changes), trade-offs com justificativa, e decisões que precisam de input humano.
5. **Entregue o plano** no Output Format abaixo. Este documento vai ao checkpoint no próximo step — precisa estar auto-suficiente para o usuário aprovar ou pedir ajustes.

## Output Format

```markdown
# Plano Técnico — {título}

## Stack afetada
{tecnologias tocadas}

## Modelo de dados
**{Nova tabela / alteração}:**
```sql
-- SQL
```
**Migration:** {arquivo}

## API (Server Actions)
- `{nomeAction}(params)` em `{caminho/do/arquivo}`
  - Validação: Zod schema
  - Permissão: {regra}
  - Comportamento: {...}

## Componentes
**Criar:**
- `{caminho completo}`
**Editar:**
- `{caminho completo}`

## Passo a passo
1. ...
2. ...

## Riscos e trade-offs
- **Risco:** ...
- **Trade-off:** ...
- **Decisão que precisa input:** ...
```

## Output Example

# Plano Técnico — Registro de Presença em Células

## Stack afetada
Next.js App Router + TypeScript strict + Drizzle ORM + PostgreSQL + componentes em `components/ui/` + Sonner para toasts.

## Modelo de dados
**Nova tabela:** `meeting_attendance`
```sql
id            uuid PK default gen_random_uuid()
meeting_id    uuid FK -> meetings.id NOT NULL
member_id     uuid FK -> members.id  NOT NULL
status        enum('presente','ausente','justificado') NOT NULL
observation   text
created_at    timestamptz default now()
updated_at    timestamptz default now()
UNIQUE (meeting_id, member_id)
```
**Migration:** criar `drizzle/0007_meeting_attendance.sql`.

## API (Server Actions)
- `recordAttendance(meetingId, entries[])` em `app/(app)/celulas/[id]/presenca/actions.ts`
  - Validação: `z.object({ meetingId: z.string().uuid(), entries: z.array(EntrySchema).min(1) })`
  - Permissão: `canLeadCell(userId, meetingId)` — líder só pode registrar presença da própria célula
  - Comportamento: UPSERT em batch com `onConflictDoUpdate`, retorna `{success: true}` ou `{error: string}`

## Componentes
**Criar:**
- `app/(app)/celulas/[id]/presenca/page.tsx` (server component que carrega membros)
- `app/(app)/celulas/[id]/presenca/presence-form.tsx` (client component com estado)
- `components/ui/presence-row.tsx` (componente reutilizável do toggle)
**Editar:**
- `components/sidebar.tsx` — adicionar link "Presença" no submenu de células

## Passo a passo
1. Criar migration `drizzle/0007_meeting_attendance.sql` e rodar `pnpm drizzle-kit push`
2. Adicionar schema Drizzle em `db/schema/meeting-attendance.ts`
3. Criar server action `recordAttendance` em `actions.ts` com validação Zod
4. Criar `presence-row.tsx` com os 3 estados de toggle
5. Criar `presence-form.tsx` consumindo a server action
6. Criar `page.tsx` que renderiza o form com os membros carregados
7. Atualizar sidebar com o novo link
8. Testar manualmente: happy path, erro de permissão, estado vazio

## Riscos e trade-offs
- **Risco:** Célula com 100+ membros pode ter performance degradada ao renderizar todos os toggles. Mitigação: MVP renderiza todos; virtualização só se surgir reclamação.
- **Trade-off:** UPSERT batch (1 call) vs múltiplos inserts — escolhi batch por performance e atomicidade.
- **Decisão que precisa input humano:** Líder pode registrar presença retroativa (dias anteriores)? Assumi SIM por enquanto — confirmar antes de aprovar o plano.

## Veto Conditions

Rejeite e refaça se:
1. Algum arquivo citado não tem caminho completo (ex: só "page.tsx" sem o diretório).
2. Server action não descreve validação Zod E regra de permissão.
3. Migration destrutiva existe mas não está sinalizada em destaque.
4. Plano é um bloco único sem passo a passo numerado.

## Quality Criteria

- [ ] Plano lista arquivos exatos (caminho completo) a criar ou editar.
- [ ] Modelo de dados, APIs e componentes em seções separadas.
- [ ] Passo a passo numerado, executável sequencialmente.
- [ ] Riscos e trade-offs explícitos.
- [ ] Decisões que precisam input humano estão marcadas.
