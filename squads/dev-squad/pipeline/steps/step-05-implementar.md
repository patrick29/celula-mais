---
execution: inline
agent: fullstack-dev
inputFile: squads/dev-squad/output/03-plano-tecnico.md
outputFile: squads/dev-squad/output/05-implementacao.md
---

# Step 05: Implementar Solução

O Fullstack Dev (Felipe Fullstack) executa o plano técnico aprovado — cria migrations, schemas Drizzle, server actions com Zod + permissão, componentes React com estados completos, e faz teste manual do happy path antes de entregar ao QA.

## Context Loading

Carregue os arquivos abaixo antes de executar:

- `squads/dev-squad/output/03-plano-tecnico.md` — plano aprovado (fonte de verdade)
- `squads/dev-squad/output/02-ux-spec.md` — UX spec da Daniela
- `squads/dev-squad/output/04-aprovacao-plano.md` — ajustes/decisões capturadas no checkpoint
- `pipeline/data/research-brief.md` — vocabulário técnico
- `pipeline/data/domain-framework.md` — seção "Fase 4 — Implementação"
- `pipeline/data/quality-criteria.md` — seção "Fullstack Developer"
- `pipeline/data/output-examples.md` — Exemplo 4 (Código)
- `pipeline/data/anti-patterns.md` — seção "Fullstack Developer"
- `agents/fullstack-dev.agent.md` — persona do Felipe Fullstack
- `agents/fullstack-dev/tasks/implementar-backend.md`
- `agents/fullstack-dev/tasks/implementar-frontend.md`
- `agents/fullstack-dev/tasks/teste-manual.md`
- **Código fonte do repositório** — use Read/Edit para modificar arquivos reais

## Instructions

### Process

1. **Releia o plano técnico aprovado** e a UX spec lado a lado. Confirme que entendeu todas as decisões capturadas no step 4.
2. **Execute `implementar-backend.md`** seguindo a ordem: migration → schema Drizzle → Zod schema → server action com auth + permissão + try/catch + mensagens de erro em PT-BR. Teste cada camada isoladamente (ex: rodar migration, importar schema no REPL, chamar action via script).
3. **Execute `implementar-frontend.md`** — componentes reutilizáveis primeiro, tela que os consome depois. Estados completos: loading, vazio, erro, sucesso. Error handling com toasts em português. TypeScript estrito, zero `any`.
4. **Execute `teste-manual.md`** — execute o happy path + pelo menos 2 casos de erro/borda antes de considerar pronto. Registre resultados.
5. **Escreva o documento de entrega** no Output Format abaixo — é a nota para o QA contendo "o que fiz, o que testei, o que deixei de fora". Commit pequeno, mensagem descritiva no padrão do projeto.

## Output Format

```markdown
# Implementação — {título}

## Arquivos criados
- `{caminho}` — {descrição curta}

## Arquivos editados
- `{caminho}` — {o que mudou}

## O que fiz
- {bullet 1}
- {bullet 2}

## O que testei
- **Happy path:** {cenário} → PASS
- **Edge case 1:** {cenário} → PASS
- **Edge case 2:** {cenário} → PASS

## O que NÃO testei
- {bullet — honestidade sobre lacunas}

## Commits
- `{hash curto}` — {mensagem}

## Observações para o QA
{pontos de atenção, caminhos recomendados de teste}
```

## Output Example

# Implementação — Registro de Presença em Células

## Arquivos criados
- `drizzle/0007_meeting_attendance.sql` — migration com CREATE TABLE + índice único
- `db/schema/meeting-attendance.ts` — schema Drizzle e tipos inferidos
- `app/(app)/celulas/[id]/presenca/actions.ts` — server action `recordAttendance` com Zod + permissão
- `app/(app)/celulas/[id]/presenca/page.tsx` — server component carregando membros
- `app/(app)/celulas/[id]/presenca/presence-form.tsx` — client component com estado e submit
- `components/ui/presence-row.tsx` — linha de membro com toggle de 3 estados

## Arquivos editados
- `components/sidebar.tsx` — adicionado link "Presença" no submenu de células

## O que fiz
- Migration + schema Drizzle com constraint unique (meeting_id, member_id)
- Server action `recordAttendance` com `InputSchema` Zod, `canLeadCell` permission, UPSERT batch via `onConflictDoUpdate`, try/catch com mensagens PT-BR
- `<PresenceRow>` reutilizável com toggle de 3 estados + campo opcional de observação
- Tela `page.tsx` carrega membros da célula via server component e passa para o form
- Sidebar atualizada com link "Presença" dentro do submenu de células

## O que testei
- **Happy path:** líder abre tela com 12 membros → marca 8 presentes e 4 ausentes → salva → toast verde → reload mostra dados persistidos. PASS.
- **Permissão negada:** supervisor (não-líder) tenta acessar URL direto → server action retorna `{error: "Sem permissão"}`, toast vermelho. PASS.
- **Estado vazio:** célula sem membros → tela exibe estado vazio com CTA "Adicionar membros". PASS.

## O que NÃO testei
- Rede lenta (throttling Slow 3G) — não testado manualmente.
- Célula com 100+ membros — só testei com 15 membros.
- Concorrência (dois líderes salvando ao mesmo tempo) — não testado, mas UPSERT protege.

## Commits
- `a3f82b1` — feat(celulas): adicionar registro de presença em reuniões

## Observações para o QA
- Teste caminho do supervisor tentando acessar a URL diretamente (permissão).
- Teste o toggle entre os 3 estados rapidamente (sem esperar animação).
- O estado vazio só aparece se a célula não tem membros — não confundir com "sem reunião agendada".

## Veto Conditions

Rejeite e refaça se:
1. Qualquer arquivo novo usa `any` em TypeScript.
2. Alguma server action está sem validação Zod OU sem verificação de permissão.
3. O dev não rodou nenhum teste manual antes de entregar (seção "O que testei" vazia).
4. Mensagens de erro ao usuário estão em inglês ou são stack traces.

## Quality Criteria

- [ ] Zero `any` no código novo.
- [ ] Toda server action tem Zod + permissão.
- [ ] Mensagens de erro em PT-BR, acionáveis.
- [ ] Happy path testado manualmente.
- [ ] Pelo menos 2 edge cases testados.
- [ ] Commit pequeno, mensagem descritiva.
- [ ] Seção "O que NÃO testei" é honesta, não vazia por padrão.
