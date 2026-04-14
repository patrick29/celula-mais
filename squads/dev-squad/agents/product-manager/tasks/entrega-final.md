---
task: "Entrega Final"
order: 4
input: |
  - qa_report: Relatório do QA com resultado dos testes manuais
  - requisitos_originais: Problem statement, user stories e MoSCoW definidos no step 1
output: |
  - entrega_final: Comunicação clara ao usuário sobre o que foi entregue, como usar, o que ficou de fora e próximos passos
---

# Entrega Final

Última tarefa do PM. Fecha o ciclo de entrega validando que o que foi construído resolve o problema original e comunica o resultado ao usuário em linguagem de negócio. Não é relatório técnico — é uma mensagem que um pastor ou líder de célula entende sem precisar abrir código.

## Process

1. Releia o problem_statement original e confirme que o problema foi de fato resolvido (ou parcialmente resolvido, com transparência).
2. Verifique o relatório do QA: todos os critérios de aceite das stories Must foram validados? Se algum falhou, comunique explicitamente.
3. Escreva a seção "Entregue" listando o que foi feito em linguagem de negócio, referenciando as user stories por ID para rastreabilidade.
4. Escreva a seção "Como usar" com um passo a passo curto para a persona principal começar a usar hoje.
5. Escreva a seção "Ficou de fora" repetindo as decisões do Won't + qualquer Should/Could que não coube, para alinhar expectativas.
6. Escreva a seção "Próximos passos" sugerindo o que pode vir no próximo ciclo.

## Output Format

```yaml
entrega_final:
  titulo: "Título curto da entrega"
  resumo: "1-2 frases sobre o que foi resolvido"
  entregue:
    - "Item 1 (US-XX)"
    - "Item 2 (US-XX)"
  como_usar:
    - "Passo 1"
    - "Passo 2"
  ficou_de_fora:
    - "Item e motivo"
  proximos_passos:
    - "Sugestão para próximo ciclo"
```

## Output Example

```yaml
entrega_final:
  titulo: "Registro de presença em reuniões de célula"
  resumo: "Líderes agora conseguem marcar quem compareceu na reunião semanal direto do celular, e a informação fica disponível para o supervisor acompanhar."
  entregue:
    - "Tela de registro de presença por reunião, com lista de membros ativos da célula (US-01)"
    - "Permissão garantindo que o líder só marca presença da própria célula (US-01)"
    - "Confirmação visual ao salvar a presença (US-01)"
  como_usar:
    - "Entre no Célula Mais pelo celular ou computador."
    - "Abra a célula que você lidera e clique na reunião da semana."
    - "Marque os membros presentes e clique em 'Salvar'."
    - "Pronto — a informação já aparece para o seu supervisor."
  ficou_de_fora:
    - "Relatório agregado do supervisor (US-02) — entra no próximo ciclo por ser Should."
    - "Exportação em PDF — fora de escopo no MVP; use a impressão do navegador se precisar."
    - "Notificações automáticas de baixa presença — planejado para ciclos futuros."
  proximos_passos:
    - "Próximo ciclo: relatório consolidado de presença para supervisores (US-02)."
    - "Coletar feedback dos 3 primeiros líderes que usarem o fluxo antes de expandir."
```

## Quality Criteria

- [ ] A entrega é escrita em linguagem de negócio (sem jargão técnico de dev).
- [ ] Cada item entregue referencia a user story de origem (US-XX).
- [ ] A seção "Como usar" tem no mínimo 3 passos acionáveis pela persona principal.
- [ ] "Ficou de fora" repete explicitamente o que foi Won't/Could para alinhar expectativas.

## Veto Conditions

Rejeite e refaça se:
1. Alguma story Must falhou no QA e isso não está comunicado de forma transparente ao usuário.
2. O documento usa jargão técnico (migration, endpoint, schema, hook) que a persona principal não entenderia.
