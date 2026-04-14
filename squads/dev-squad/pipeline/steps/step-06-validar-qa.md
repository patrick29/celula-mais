---
execution: inline
agent: qa-tester
inputFile: squads/dev-squad/output/05-implementacao.md
outputFile: squads/dev-squad/output/06-relatorio-qa.md
on_reject: step-05
---

# Step 06: Validar Qualidade

O QA Tester (Quirino Qualidade) monta um checklist manual a partir dos critérios de aceite do PM e dos estados da UX spec, executa cada item, classifica bugs por severidade e emite veredito binário — APROVADO ou REPROVADO. Se REPROVADO, o pipeline volta ao step 5 para o Fullstack corrigir.

## Context Loading

Carregue os arquivos abaixo antes de executar:

- `squads/dev-squad/output/01-requisitos.md` — critérios de aceite do PM
- `squads/dev-squad/output/02-ux-spec.md` — estados definidos pela Daniela
- `squads/dev-squad/output/05-implementacao.md` — nota do dev (o que fez, o que testou, o que deixou de fora)
- `pipeline/data/research-brief.md` — vocabulário de QA
- `pipeline/data/domain-framework.md` — seção "Fase 5 — Validação"
- `pipeline/data/quality-criteria.md` — seção "QA Tester"
- `pipeline/data/output-examples.md` — Exemplo 5 (Relatório QA)
- `pipeline/data/anti-patterns.md` — seção "QA Tester"
- `agents/qa-tester.agent.md` — persona do Quirino Qualidade
- `agents/qa-tester/tasks/montar-checklist.md`
- `agents/qa-tester/tasks/executar-testes.md`
- `agents/qa-tester/tasks/reportar-bugs.md`
- **Código fonte e app rodando** — para executar os testes manualmente

## Instructions

### Process

1. **Execute `montar-checklist.md`** — extraia cada critério de aceite do PM como item. Adicione linhas para estados alternativos (vazio/loading/erro), casos de borda (permissão, dados inválidos, limites) e regressão (fluxos adjacentes que podem ter quebrado).
2. **Execute `executar-testes.md`** — rode cada item manualmente. Registre passos, esperado, obtido, status PASS/FAIL.
3. **Execute `reportar-bugs.md`** — se houver FAILs, escreva BUG-NN com severidade (crítica/alta/média/baixa), passos numerados reproduzíveis, esperado vs obtido, suspeita.
4. **Emita veredito binário** — APROVADO se tudo PASS; REPROVADO se qualquer FAIL. Sem "aprovado com ressalvas". Se REPROVADO, o pipeline volta ao step 5 via `on_reject`.
5. **Escreva o relatório final** no Output Format abaixo.

## Output Format

```markdown
# Relatório QA — {título}

## Checklist executado
| # | Categoria | Teste | Esperado | Obtido | Status |
|---|-----------|-------|----------|--------|--------|
| 1 | happy | ... | ... | ... | PASS |

## Bugs encontrados (se houver)

### BUG-NN — {título curto}
- **Severidade:** crítica | alta | média | baixa
- **Passos:**
  1. ...
- **Esperado:** ...
- **Obtido:** ...
- **Suspeita:** ...

## Veredito
**APROVADO** | **REPROVADO** — {justificativa + próximo passo}
```

## Output Example

# Relatório QA — Registro de Presença

## Checklist executado
| # | Categoria | Teste | Esperado | Obtido | Status |
|---|-----------|-------|----------|--------|--------|
| 1 | happy | Líder abre tela com 12 membros | Lista com toggle "presente" default | Ok | PASS |
| 2 | happy | Marcar 3 ausentes e salvar | Toast verde, dados persistem | Ok | PASS |
| 3 | happy | Recarregar e conferir | Dados salvos aparecem corretos | Ok | PASS |
| 4 | vazio | Célula sem membros | Estado vazio com CTA | Ok | PASS |
| 5 | permissao | Supervisor tenta acessar URL direto | Bloqueio | "Sem permissão" | PASS |
| 6 | erro | Throttling Slow 3G + clique duplo em Salvar | 1 único POST | 2 POSTs, 2 toasts | FAIL |
| 7 | edge | Presença retroativa (7 dias atrás) | Permitido | Ok | PASS |
| 8 | edge | Presença retroativa (8 dias atrás) | Bloqueado | Ok | PASS |
| 9 | regressao | Sidebar mobile ainda fecha ao navegar | Fecha | Ok | PASS |

## Bugs encontrados

### BUG-01 — Botão Salvar permite duplo envio em rede lenta
- **Severidade:** alta
- **Passos:**
  1. DevTools → Network → Slow 3G
  2. Marcar 3 membros como ausentes
  3. Clicar em "Salvar presença"
  4. Clicar novamente enquanto o spinner está visível
- **Esperado:** segundo clique ignorado, apenas 1 POST.
- **Obtido:** segundo clique dispara novo POST. UPSERT protege o banco, mas geram 2 toasts "Presença registrada" piscando a tela e confundindo o usuário.
- **Suspeita:** falta `disabled={isPending}` no `<Button>` durante o `useTransition`.

## Veredito
**REPROVADO** — 1 bug alta severidade encontrado no happy path de rede lenta. Devolvendo ao Fullstack (step 5) para correção. Após fix, re-executar checklist completo incluindo item #6.

## Veto Conditions

Rejeite e refaça o relatório se:
1. Algum critério de aceite do PM NÃO virou item do checklist.
2. Estados alternativos (vazio/loading/erro) não foram testados.
3. Algum BUG-NN está sem passos numerados reproduzíveis.
4. Veredito não é estritamente "APROVADO" ou "REPROVADO" (variações ambíguas são vetadas).

## Quality Criteria

- [ ] Cada critério de aceite do PM aparece como item do checklist.
- [ ] Estados vazios, de erro e loading testados.
- [ ] Casos de borda (permissão, limites) testados.
- [ ] Regressão checada (o que já funcionava ainda funciona).
- [ ] Bugs têm passos numerados, esperado vs obtido, severidade.
- [ ] Veredito binário final claro.
