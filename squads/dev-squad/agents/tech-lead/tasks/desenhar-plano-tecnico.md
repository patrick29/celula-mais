---
task: "Desenhar Plano Técnico"
order: 2
input:
  - "squads/dev-squad/output/{feature}/_analise-impacto.yaml"
  - "squads/dev-squad/output/{feature}/01-requisitos.md"
  - "squads/dev-squad/output/{feature}/02-ux-spec.md"
output: "squads/dev-squad/output/{feature}/03-plano-tecnico.md"
---

# Desenhar Plano Técnico

Escrever o plano executável que o dev vai seguir linearmente: stack, modelo de dados, server actions, componentes e passo a passo numerado.

## Process

1. **Consolidar a análise de impacto** com os requisitos e UX spec para ter a visão completa do que precisa existir.
2. **Desenhar o modelo de dados** em SQL: tabelas novas, colunas alteradas, índices, foreign keys. Marcar migrations destrutivas em destaque.
3. **Definir server actions/endpoints**: para cada operação, listar método, caminho, payload Zod, resposta, validação e checagem de autorização.
4. **Listar componentes React** a criar/editar com caminho completo, props principais e descrição curta da responsabilidade.
5. **Escrever o passo a passo numerado** em ordem de execução: cada passo deve ser pequeno, claro e idealmente testável isoladamente.
6. **Revisar o plano** checando se cobre happy path e edge cases relevantes citados pelo PM/Designer.

## Output Format

Documento markdown em `squads/dev-squad/output/{feature}/03-plano-tecnico.md` com as seções:

- `# Plano Técnico — {Feature}`
- `## Stack afetada`
- `## Modelo de dados` (com SQL `CREATE TABLE` / `ALTER TABLE`)
- `## Server Actions / Endpoints` (método, rota, payload Zod, autorização)
- `## Componentes` (criar/editar com caminho exato)
- `## Passo a passo` (lista numerada sequencial)
- `## Decisões pendentes` (marcadas com `[DECISÃO HUMANA]`)

## Output Example

```markdown
# Plano Técnico — Registro de Presença em Células

## Stack afetada
Next.js App Router, Drizzle ORM, Postgres, Zod, componentes em `components/ui/`.

## Modelo de dados
Nova tabela `attendance`:

```sql
CREATE TABLE attendance (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  celula_id uuid NOT NULL REFERENCES celulas(id) ON DELETE CASCADE,
  membro_id uuid NOT NULL REFERENCES membros(id) ON DELETE CASCADE,
  reuniao_data date NOT NULL,
  presente boolean NOT NULL DEFAULT false,
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (celula_id, membro_id, reuniao_data)
);
CREATE INDEX idx_attendance_celula_data ON attendance (celula_id, reuniao_data);
```

Migration: `db/migrations/0003_add_attendance.sql`. Não destrutiva.

## Server Actions / Endpoints

### `recordAttendance`
- **Arquivo:** `app/celulas/[id]/presenca/actions.ts`
- **Tipo:** server action (`"use server"`)
- **Payload Zod:**
  ```ts
  z.object({
    celulaId: z.string().uuid(),
    reuniaoData: z.string().date(),
    presencas: z.array(z.object({
      membroId: z.string().uuid(),
      presente: z.boolean(),
    })).min(1),
  })
  ```
- **Autorização:** usuário precisa ser líder da célula (checar via `getLiderByCelula`).
- **Resposta:** `{ ok: true, registros: number }` ou `{ ok: false, erro: string }`.
- **Edge case:** se já existe registro para (celula, data), faz upsert.

## Componentes

**Criar:**
- `app/celulas/[id]/presenca/page.tsx` — server component, carrega membros da célula.
- `components/presenca/AttendanceList.tsx` — client component com checkboxes.
- `components/presenca/AttendanceHeader.tsx` — exibe data e botão salvar.

**Editar:**
- `app/celulas/[id]/page.tsx` — adicionar link "Registrar presença".
- `components/sidebar/Sidebar.tsx` — novo item de menu.

## Passo a passo

1. Criar `db/schema/attendance.ts` com o schema Drizzle seguindo padrão de `celulas.ts`.
2. Exportar o novo schema em `db/schema/index.ts`.
3. Gerar migration com `drizzle-kit generate` e revisar o SQL.
4. Rodar migration em ambiente local e validar tabela criada.
5. Criar `app/celulas/[id]/presenca/actions.ts` com a server action `recordAttendance` e schema Zod.
6. Criar `components/presenca/AttendanceList.tsx` consumindo `components/ui/checkbox.tsx`.
7. Criar `app/celulas/[id]/presenca/page.tsx` carregando membros e renderizando a lista.
8. Adicionar link em `app/celulas/[id]/page.tsx` e item em `components/sidebar/Sidebar.tsx`.
9. Teste manual do happy path e do edge case de upsert.

## Decisões pendentes
- `[DECISÃO HUMANA]` Presença retroativa: permitir registrar presença de reunião passada ou só do dia? Impacta validação de `reuniaoData`.
```

## Quality Criteria

- Todas as seções obrigatórias presentes (Stack, Modelo de dados, Server Actions, Componentes, Passo a passo).
- SQL concreto, não pseudocódigo.
- Toda server action tem payload Zod e regra de autorização.
- Passo a passo numerado e sequencial, sem pular pré-requisitos.
- Componentes listados com caminho completo (`app/...` ou `components/...`).

## Veto Conditions

- Plano sem seção de passo a passo numerado — dev não consegue executar.
- Server action sem validação Zod ou sem regra de autorização descrita.
