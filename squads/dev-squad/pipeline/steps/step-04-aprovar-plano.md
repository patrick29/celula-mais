---
type: checkpoint
---

# Step 04: Aprovar Plano Técnico

Checkpoint obrigatório. O Pipeline Runner pausa e apresenta ao usuário o plano técnico escrito pelo Tiago Técnico no step 3. Nada roda até o usuário aprovar (ou pedir ajustes) — é o único ponto de parada do ciclo.

## Context Loading

Carregue antes de apresentar ao usuário:

- `squads/dev-squad/output/03-plano-tecnico.md` — plano técnico completo
- `squads/dev-squad/output/01-requisitos.md` — referência do que o plano está implementando
- `squads/dev-squad/output/02-ux-spec.md` — UX spec que o plano precisa atender

## Instructions

### Process

1. **Apresente o plano técnico** ao usuário de forma resumida mas completa: stack, arquivos a criar/editar, modelo de dados, server actions, passo a passo, riscos e decisões que precisam input.
2. **Destaque as decisões pendentes** — qualquer item marcado como "decisão que precisa input humano" no plano deve aparecer em destaque para o usuário responder junto da aprovação.
3. **Faça a pergunta de aprovação** via `AskUserQuestion` com 3 opções:
   - **Aprovar e seguir** — Felipe Fullstack começa a codar no step 5
   - **Pedir ajustes** — voltar ao Tiago Técnico para revisar o plano
   - **Cancelar run** — encerrar o ciclo sem implementar
4. **Se "Aprovar e seguir"** → escreva confirmação + quaisquer respostas do usuário em `output/04-aprovacao-plano.md` e prossiga para step 5.
5. **Se "Pedir ajustes"** → registre os ajustes pedidos no mesmo arquivo e volte ao step 3 (tech-lead revisa o plano).
6. **Se "Cancelar run"** → registre o cancelamento e encerre o pipeline.

## Output Format

```markdown
# Aprovação do Plano Técnico

**Status:** APROVADO | AJUSTES | CANCELADO
**Data:** {timestamp}
**Usuário:** {nome}

## Decisão
{texto literal da escolha + qualquer resposta às decisões pendentes}

## Próximo passo
{step 5 (implementar) | step 3 (revisar plano) | encerrar}
```

## Output Example

# Aprovação do Plano Técnico

**Status:** APROVADO
**Data:** 2026-04-10 21:34
**Usuário:** Patrick

## Decisão
Plano aprovado. Resposta à decisão pendente:
- "Líder pode registrar presença retroativa?" → Sim, mas apenas nos últimos 7 dias. Bloquear datas anteriores a isso.

## Observações
Patrick pediu para priorizar velocidade no mobile — se houver dúvida entre elegância e performance, escolher performance.

## Próximo passo
Step 5 — Felipe Fullstack inicia a implementação do backend, seguindo o plano aprovado + ajuste de presença retroativa limitada a 7 dias.

## Veto Conditions

Rejeite e refaça se:
1. A apresentação ao usuário omitiu decisões pendentes que estavam marcadas no plano.
2. A resposta do usuário não foi registrada literalmente no arquivo de aprovação.

## Quality Criteria

- [ ] Plano foi apresentado ao usuário com todas as seções (stack, dados, API, componentes, passo a passo, riscos).
- [ ] Decisões pendentes foram destacadas antes da pergunta.
- [ ] Resposta do usuário capturada por `AskUserQuestion`.
- [ ] Arquivo de aprovação salvo com status, data, decisão e próximo passo.
