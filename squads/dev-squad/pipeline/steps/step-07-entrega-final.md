---
execution: inline
agent: product-manager
inputFile: squads/dev-squad/output/06-relatorio-qa.md
outputFile: squads/dev-squad/output/07-entrega-final.md
---

# Step 07: Entrega Final

O PM (Pedro Produto) fecha o ciclo. Confirma que o QA aprovou, valida que os critérios de aceite originais foram atendidos, e escreve uma comunicação clara ao usuário solicitante: o que foi feito, como usar, o que ficou de fora, próximos passos.

## Context Loading

Carregue os arquivos abaixo antes de executar:

- `squads/dev-squad/output/01-requisitos.md` — requisitos originais (critérios de aceite)
- `squads/dev-squad/output/06-relatorio-qa.md` — relatório do QA com veredito APROVADO
- `squads/dev-squad/output/05-implementacao.md` — nota do dev sobre o que foi entregue
- `pipeline/data/research-brief.md` — tom do Célula Mais
- `pipeline/data/domain-framework.md` — seção "Fase 6 — Entrega Final"
- `pipeline/data/quality-criteria.md` — seção "Entrega Final"
- `agents/product-manager.agent.md` — persona do Pedro Produto
- `agents/product-manager/tasks/entrega-final.md`

## Instructions

### Process

1. **Verifique o veredito do QA** — só prossiga se o relatório do step 6 tiver veredito APROVADO. Se REPROVADO, o pipeline não deveria chegar aqui (o `on_reject` do step 6 teria voltado ao step 5).
2. **Cheque critérios de aceite** — para cada critério do PM no step 1, confirme que aparece como PASS no checklist do QA. Se faltou algum, é falha de processo — escale.
3. **Execute `entrega-final.md`** — escreva a comunicação ao usuário solicitante em linguagem de negócio (não técnica): o que foi feito (valor, não código), como usar (caminho no app), o que ficou de fora (Should/Could não implementados), próximos passos sugeridos.
4. **Tom** — profissional, acolhedor, respeitoso. Vocabulário do Célula Mais (pastor, célula, membro, líder). Nada de jargão técnico (não mencione Zod, server action, migration).
5. **Escreva o documento final** no Output Format abaixo.

## Output Format

```markdown
# Entrega — {título}

## O que foi feito
{1-2 parágrafos em linguagem de negócio, não técnica}

## Como usar
1. {passo 1 no app}
2. {passo 2 no app}

## O que ficou de fora (nesta entrega)
- {Should/Could não implementado} — {justificativa}
- {item} — {justificativa}

## Próximos passos sugeridos
- {sugestão 1}
- {sugestão 2}

## Encerramento
{linha final acolhedora, reforçando o valor da entrega}
```

## Output Example

# Entrega — Registro de Presença em Células

## O que foi feito
Agora os líderes de célula podem registrar a presença dos membros em cada reunião, direto do celular, em menos de 1 minuto. A informação fica salva no sistema e estará disponível para supervisores e pastores acompanharem o engajamento de cada grupo. Antes, essa informação se perdia em cadernos e mensagens de WhatsApp.

## Como usar
1. Acesse "Minhas Células" no menu lateral.
2. Toque no card da célula que teve reunião hoje.
3. Toque no botão "Registrar presença de hoje".
4. Para cada membro, marque "Presente", "Ausente" ou "Justificado" (todos começam como presentes por padrão, basta ajustar quem faltou).
5. Se quiser, adicione uma observação rápida sobre algum membro.
6. Toque em "Salvar presença". Pronto.

O registro também funciona para reuniões dos últimos 7 dias — útil se você esquecer de marcar na hora.

## O que ficou de fora (nesta entrega)
- **Relatório em PDF** — fica para a próxima entrega. Por enquanto, os dados podem ser consultados direto no sistema pelo supervisor.
- **Notificação automática para faltosos** — decidimos esperar feedback real do uso antes de construir.
- **Presença via QR code** — descartado para esta rodada por ser complexidade extra sem validação de demanda.

## Próximos passos sugeridos
- Use por 2-3 semanas em pelo menos 3 células diferentes e nos conte o que funcionou e o que não funcionou.
- Se faltou algum campo ou botão, abra uma nova solicitação descrevendo o caso real.
- Se os supervisores pedirem um relatório agregado, isso vira a próxima demanda.

## Encerramento
Essa entrega nasceu para devolver tempo aos líderes e dar visibilidade às lideranças. Esperamos que facilite o acompanhamento das células — qualquer coisa, estamos à disposição para ajustar juntos. 🙏

## Veto Conditions

Rejeite e refaça se:
1. O texto "Como usar" usa jargão técnico (Zod, server action, migration, endpoint, etc.).
2. Algum critério de aceite do PM do step 1 não foi confirmado como PASS no QA.
3. Faltou a seção "O que ficou de fora" ou ela não explica o porquê.

## Quality Criteria

- [ ] Todos os critérios de aceite originais confirmados como atendidos.
- [ ] Comunicação em linguagem de negócio, sem jargão técnico.
- [ ] "Como usar" é um passo a passo que o usuário final consegue seguir no app.
- [ ] "O que ficou de fora" está explícito com justificativa.
- [ ] Tom acolhedor, respeitoso, no padrão do Célula Mais.
