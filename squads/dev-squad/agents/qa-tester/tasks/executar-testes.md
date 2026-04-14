---
task: "Executar Testes"
order: 2
input: "Checklist montado na task anterior + implementação do Fullstack pronta no ambiente"
output: "Tabela de resultados com esperado vs obtido e status PASS/FAIL para cada item"
---

# Executar Testes

Executar cada item do checklist manualmente contra a implementação real e documentar o resultado obtido. Esta é a etapa onde o trabalho do dev encontra a realidade.

## Process

1. **Preparar ambiente** — garantir que a implementação está rodando localmente ou em staging, com dados de teste relevantes (célula com membros, usuário líder logado, etc.).
2. **Executar cada item do checklist manualmente** — seguir os passos descritos, sem pular etapas, sem presumir resultado. Um item de cada vez.
3. **Registrar esperado vs obtido** — para cada teste, anotar exatamente o que foi observado. Se houve diferença, descrever a diferença de forma factual.
4. **Marcar status PASS ou FAIL** — binário. Se o obtido não bate com o esperado, é FAIL, mesmo que "quase funcione".
5. **Anotar observações relevantes** — coisas que não são bug mas merecem atenção (ex: "loading spinner aparece por apenas 100ms, difícil confirmar visualmente").

## Output Format

Tabela markdown visível ao usuário com as colunas: `#`, `Teste`, `Esperado`, `Obtido`, `Status`. Linha por item do checklist. Ao final, um resumo com contagem de PASS/FAIL.

## Output Example

### Resultados da Execução — Registro de Presença da Célula

| # | Teste | Esperado | Obtido | Status |
|---|-------|----------|--------|--------|
| T01 | Líder marca 5 membros como presentes | Lista salva, toast de sucesso, redireciona | Lista salvou, toast apareceu, redirecionou corretamente | PASS |
| T02 | Líder adiciona visitante durante registro | Visitante criado e marcado como presente | Visitante criado, mas não aparece marcado como presente automaticamente | FAIL |
| T03 | Célula sem membros cadastrados | Empty state com CTA para adicionar membro | Empty state aparece corretamente, CTA funcional | PASS |
| T04 | Rede lenta ao salvar | Botão com spinner, desabilitado | Botão com spinner aparece, mas permite clique duplo e gera 2 POSTs | FAIL |
| T05 | Falha de rede no POST | Toast de erro, dados preservados | Toast de erro apareceu, lista permaneceu editável | PASS |
| T06 | Membro comum tenta acessar rota | Redireciona ou mostra 403 | Rota redireciona para dashboard corretamente | PASS |
| T07 | Célula com presença do mesmo dia | Carrega para edição, sem duplicata | Carrega presença existente, permite editar | PASS |
| T08 | Regressão: cadastro de novo membro | Fluxo inalterado | Cadastro funcionando normalmente | PASS |

**Resumo:** 6 PASS / 2 FAIL (T02, T04)

**Observações adicionais:**
- T04: o spinner aparece mas a proteção contra duplo envio não foi implementada.
- T02: parece ser um bug de estado local não sincronizado após criar visitante.

## Quality Criteria

- Todo item do checklist foi executado — nenhum foi pulado ou marcado como "não aplicável" sem justificativa.
- Para cada teste, o "Obtido" descreve factualmente o que aconteceu, não uma interpretação.
- Status é estritamente binário: PASS ou FAIL, sem "parcial" ou "com ressalva".
- Resumo final com contagem de PASS/FAIL está presente.

## Veto Conditions

- **Item pulado sem justificativa** — se algum teste do checklist ficou sem execução, a task é rejeitada.
- **Status ambíguo ("parcial", "quase")** — se apareceu qualquer status que não seja PASS ou FAIL, a task é rejeitada e refeita.
