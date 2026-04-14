---
task: "Reportar Bugs"
order: 3
input: |
  - resultados_testes: Tabela de resultados da execução de testes (PASS/FAIL por item)
output: |
  - relatorio_final: Relatório com veredito APROVADO ou REPROVADO
  - bugs: Lista de BUG-NN (quando houver) com severidade, passos, esperado, obtido
---

# Reportar Bugs

Consolidar os resultados da execução em um relatório final com veredito binário. Se houver falhas, escrever bug reports acionáveis e devolver ao Fullstack. Se tudo passou, assinar a aprovação.

## Process

1. **Contar falhas** — identificar todos os itens marcados como FAIL na tabela de execução.
2. **Para cada falha, escrever BUG-NN** — numerar sequencialmente (BUG-01, BUG-02, ...) e preencher: severidade, passos numerados para reproduzir, esperado, obtido, suspeita de causa (quando óbvia).
3. **Decidir veredito binário** — se houver qualquer FAIL, o veredito é REPROVADO. Se tudo passou, é APROVADO. Sem meio termo.
4. **Se REPROVADO, devolver ao Fullstack** — anexar o relatório ao retorno do pipeline com referência explícita ao step 5 (implementação).
5. **Se APROVADO, assinar e devolver ao PM** — escrever linha de aprovação e devolver para o Product Manager comunicar ao usuário.

## Escala de Severidade

- **Crítica** — quebra o fluxo principal, perda de dados ou bloqueio total. Requer correção imediata.
- **Alta** — funcionalidade importante falha, mas há workaround. Corrige antes de entregar.
- **Média** — estado alternativo ou edge case falha. Corrige nesta rodada.
- **Baixa** — ajuste cosmético ou melhoria pequena. Pode ir para backlog.

## Output Format

```markdown
## Bugs encontrados

### BUG-NN — {título curto}
- **Severidade:** crítica | alta | média | baixa
- **Passos para reproduzir:**
  1. ...
  2. ...
- **Esperado:** ...
- **Obtido:** ...
- **Suspeita:** ... (opcional)

## Veredito
**APROVADO** | **REPROVADO** — {justificativa curta + próximo passo do pipeline}
```

## Output Example

> Use como referência de qualidade, não como template rígido.

## Bugs encontrados

### BUG-01 — Visitante recém-criado não aparece marcado como presente
- **Severidade:** média
- **Passos para reproduzir:**
  1. Logar como líder da célula "Jovens Centro"
  2. Abrir registro de presença do dia
  3. Clicar em "Adicionar visitante" e preencher nome "Maria Silva"
  4. Salvar o visitante
  5. Observar a lista de presença
- **Esperado:** Maria Silva aparece na lista já marcada como presente.
- **Obtido:** Maria Silva aparece na lista, mas o toggle está em "ausente". É preciso marcar manualmente.
- **Suspeita:** estado local do formulário não sincroniza o flag `status: 'presente'` após o POST de criação do visitante.

### BUG-02 — Botão de salvar permite duplo envio em rede lenta
- **Severidade:** alta
- **Passos para reproduzir:**
  1. No DevTools, aplicar throttling "Slow 3G"
  2. Marcar 3 membros como presentes
  3. Clicar em "Salvar presença"
  4. Clicar novamente no botão enquanto o spinner está visível
- **Esperado:** segundo clique é ignorado, apenas 1 POST é feito.
- **Obtido:** segundo clique dispara novo POST. A server action usa UPSERT, então não duplica registros — mas gera 2 toasts de sucesso e pisca a tela.
- **Suspeita:** falta `disabled={isPending}` no botão durante o `useTransition`.

## Veredito
**REPROVADO** — 2 bugs encontrados (1 alta, 1 média). Devolvido ao Fullstack (step 5) para correção. Após fix, re-executar checklist completo incluindo regressão.

## Quality Criteria

- [ ] Cada BUG-NN tem severidade classificada (crítica/alta/média/baixa).
- [ ] Cada BUG-NN tem passos numerados e reproduzíveis por qualquer pessoa do time.
- [ ] Cada BUG-NN tem esperado vs obtido descritos factualmente.
- [ ] Veredito final é estritamente APROVADO ou REPROVADO.
- [ ] Se REPROVADO, há referência explícita ao step de retorno (step 5 — fullstack-dev).

## Veto Conditions

Rejeite e refaça se:
1. Qualquer BUG-NN está sem passos numerados e reproduzíveis.
2. O veredito não é estritamente "APROVADO" ou "REPROVADO" (qualquer variação como "aprovado com ressalvas" é rejeitada).
