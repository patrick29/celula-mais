---
execution: inline
agent: product-manager
outputFile: squads/dev-squad/output/01-requisitos.md
---

# Step 01: Analisar Requisitos

O PM (Pedro Produto) recebe o pedido original do usuário, destila o problema real, define personas e escopo MoSCoW, e escreve user stories com critérios de aceite testáveis. É o ponto de entrada do ciclo.

## Context Loading

Carregue os arquivos abaixo antes de executar:

- `pipeline/data/research-brief.md` — contexto da squad e vocabulário do domínio Célula Mais
- `pipeline/data/domain-framework.md` — metodologia end-to-end (Fase 1 — Análise de Requisitos)
- `pipeline/data/quality-criteria.md` — seção "Product Manager (Requisitos)"
- `pipeline/data/output-examples.md` — Exemplo 1 (Requisitos — Registro de Presença)
- `pipeline/data/anti-patterns.md` — seção "Product Manager"
- `agents/product-manager.agent.md` — persona do Pedro Produto
- `agents/product-manager/tasks/analisar-requisitos.md`
- `agents/product-manager/tasks/escrever-user-stories.md`
- `agents/product-manager/tasks/priorizar-escopo.md`
- `_opensquad/_memory/company.md` — contexto institucional do Célula Mais

O pedido original do usuário é o input deste step (mensagem inicial do run).

## Instructions

### Process

1. **Leia o pedido literal** do usuário e identifique o que foi pedido. Execute a task `analisar-requisitos.md` para destilar o problema real — pergunte "por quê?" pelo menos 3 vezes antes de aceitar a solução sugerida.
2. **Mapeie contexto** do Célula Mais: módulo afetado, fluxo atual, personas envolvidas (líder, supervisor, administrador, pastor, membro). Liste assumptions explicitamente.
3. **Execute `escrever-user-stories.md`** para transformar o problema em user stories INVEST no formato "Como <persona>, quero <ação>, para <benefício>". Cada story deve ter critérios de aceite em Gherkin (Dado/Quando/Então) ou bullets objetivos.
4. **Execute `priorizar-escopo.md`** aplicando MoSCoW (Must, Should, Could, Won't). Lembre-se: minimum-viable = o menor incremento que entrega valor. Seja rigoroso no Must.
5. **Liste riscos e assumptions** explicitamente. Sinalize dependências conhecidas (ex: "assume que cadastro de membros por célula já existe").
6. **Escreva o documento final** seguindo o Output Format abaixo. Máximo 2 páginas — conciso é melhor que exaustivo.

## Output Format

```markdown
# Requisitos — {título da demanda}

## Problema
{1-2 frases descrevendo a dor real — não a solução pedida}

## Personas afetadas
- {Persona 1}: {papel no fluxo}
- {Persona 2}: {papel no fluxo}

## Escopo (MVP)
**Must:**
- {item}
**Should:**
- {item}
**Could:**
- {item}
**Won't (agora):**
- {item}

## User Stories

### US-01 — {título}
Como {persona}, quero {ação}, para {benefício}.

**Critérios de aceite:**
- Dado que {contexto}
- Quando {ação}
- Então {resultado}

## Riscos e assumptions
- {risco/assumption}
```

## Output Example

# Requisitos — Registro de Presença em Células

## Problema
Líderes de célula não têm como registrar quem compareceu à reunião semanal. A informação se perde em cadernos ou WhatsApp, e supervisores não acompanham o engajamento das células.

## Personas afetadas
- Líder de célula: registra a presença dos membros durante ou após a reunião (mobile).
- Supervisor: consulta relatórios de engajamento por célula.
- Administrador: configura membros e reuniões de cada célula.

## Escopo (MVP)
**Must:**
- Líder abre a reunião do dia e marca presença de cada membro (presente/ausente/justificado).
- Dados persistem no banco vinculados à célula e à data da reunião.
**Should:**
- Observação livre por membro (até 500 caracteres).
**Could:**
- Exportar relatório de presença em PDF.
**Won't (agora):**
- Notificações automáticas a faltosos.
- Presença via QR code.

## User Stories

### US-01 — Registrar presença de uma reunião
Como líder de célula, quero marcar quem compareceu à reunião de hoje, para que eu possa acompanhar o engajamento do meu grupo.

**Critérios de aceite:**
- Dado que estou logado como líder da célula "Graça"
- E existe uma reunião agendada para hoje
- Quando abro a tela "Presença"
- Então vejo a lista de membros com toggle presente/ausente/justificado
- E ao salvar, os dados ficam persistidos e recebo confirmação visual

## Riscos e assumptions
- Assume que cadastro de membros por célula já existe (verificar com Tech Lead).
- Assume que líder só pode registrar presença da própria célula (regra de permissão).
- Risco: fuso horário na gravação da data — usar UTC + conversão no front.

## Veto Conditions

Rejeite e refaça se:
1. O documento não tem ao menos 1 user story com critério de aceite testável.
2. O escopo MoSCoW não está explícito (must/should/could/won't todos presentes, mesmo que vazios).
3. A persona afetada não está nomeada.
4. O problem_statement é só uma repetição do pedido literal sem destilar a dor.

## Quality Criteria

- [ ] Toda user story tem pelo menos 1 critério de aceite testável (preferencialmente Gherkin).
- [ ] MoSCoW completo (must/should/could/won't).
- [ ] Personas nomeadas com seus papéis.
- [ ] Riscos e assumptions listados.
- [ ] Documento em 1-2 páginas, conciso.
- [ ] Nenhuma palavra vaga ("simples", "rápido", "fácil", "depois a gente vê").
