---
task: "Teste Manual"
order: 3
input: "Implementação completa (backend + frontend) rodando localmente"
output: "Nota de entrega ao QA em 05-implementacao.md com 'o que fiz, o que testei, o que deixei de fora'"
---

# Teste Manual

Antes de entregar ao QA, o dev executa o happy path e pelo menos 2 casos de erro/borda manualmente no navegador. O resultado vira uma nota curta em `05-implementacao.md`.

## Process

1. **Executar o happy path completo.** Fluxo principal descrito na UX spec, do início ao fim, como um líder de célula faria. Observar: carrega sem erro? Os estados mudam? O toast aparece? O banco foi atualizado?
2. **Executar pelo menos 2 casos de erro/borda.** Exemplos: usuário sem permissão, input inválido, rede lenta (DevTools throttling), lista vazia, dados antigos (conflict na UPSERT).
3. **Escrever a nota de entrega ao QA.** YAML curto com três listas: `o_que_fiz`, `o_que_testei` (cada item com cenário + resultado) e `o_que_nao_testei` (honesto, sem esconder).

## Output Format

Arquivo `05-implementacao.md` com frontmatter YAML:

```yaml
---
feature: "<nome da feature>"
dev: "Felipe Fullstack"
data: "<YYYY-MM-DD>"
o_que_fiz:
  - "<arquivo ou camada tocada>"
o_que_testei:
  - cenario: "<descrição>"
    resultado: "ok | erro tratado | bug"
o_que_nao_testei:
  - "<cenário fora do escopo ou pendente>"
---
```

## Output Example

```yaml
---
feature: "Registro de Presença na Célula"
dev: "Felipe Fullstack"
data: "2026-04-10"
o_que_fiz:
  - "Migration `0007_attendance.sql` criando tabela attendance com índice composto (cell_id, meeting_date, member_id)"
  - "Schema Drizzle em `db/schema/attendance.ts`"
  - "Server action `recordAttendance` em `app/(app)/celulas/[id]/actions.ts` com Zod + auth + canLeadCell + UPSERT"
  - "Componente `PresenceForm` em `components/ui/presence-form.tsx` com useTransition e toast"
  - "Componente `PresenceRow` em `components/ui/presence-row.tsx` (toggle reutilizável)"
  - "Tela `app/(app)/celulas/[id]/presenca/page.tsx` consumindo o formulário"
o_que_testei:
  - cenario: "Líder marca 5 presenças e 2 ausências — happy path"
    resultado: "ok — toasts de sucesso, banco atualizado, revalidatePath refletiu na tela"
  - cenario: "Usuário deslogado tenta acessar a tela de presença"
    resultado: "ok — redirect para /login, nenhuma chamada à action"
  - cenario: "Usuário logado, mas sem permissão na célula, tenta marcar presença via DevTools"
    resultado: "erro tratado — action retorna 'Você não tem permissão para registrar presença nesta célula.' e o toggle reverte"
  - cenario: "Marcar a mesma presença duas vezes (teste de UPSERT)"
    resultado: "ok — onConflictDoUpdate atualiza updated_at sem duplicar linha"
  - cenario: "Célula sem membros cadastrados"
    resultado: "ok — estado vazio exibe 'Nenhum membro cadastrado nesta célula.'"
o_que_nao_testei:
  - "Comportamento com rede lenta / timeout (deixei para o QA com throttling)"
  - "Responsividade em telas < 360px (UX spec só cobria mobile padrão 375px)"
  - "Concorrência: dois líderes marcando presença ao mesmo tempo"
---
```

## Quality Criteria

- Happy path foi executado de ponta a ponta, não só a parte do meio.
- Pelo menos 2 edge cases testados, incluindo um de permissão ou input inválido.
- A seção `o_que_nao_testei` é honesta — não esconder lacunas do QA.
- A nota está em português, objetiva, sem jargão desnecessário.

## Veto Conditions

- **Entregar sem ter rodado o happy path no navegador.** Volta imediato, sem passar para o QA.
- **Nota de entrega sem a seção `o_que_nao_testei` ou com ela vazia de forma desonesta.** O QA precisa saber onde olhar.
