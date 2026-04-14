---
task: "Montar Checklist"
order: 1
input: "Requisitos do PM (01-requisitos.md) e UX spec (02-ux-spec.md) com estados definidos"
output: "Checklist de testes manuais cobrindo happy path, estados alternativos, edge cases e regressão"
---

# Montar Checklist

Gerar um checklist de testes manuais a partir dos critérios de aceite do PM e dos estados definidos pela UX spec. O checklist é o contrato que guia toda a execução dos testes.

## Process

1. **Extrair cada critério de aceite como item** — leia `01-requisitos.md` e transforme cada critério em uma linha do checklist, categoria "happy path". Um critério vira um item, sem agrupar.
2. **Adicionar estados alternativos** — para cada tela/fluxo, consulte `02-ux-spec.md` e adicione itens para estado vazio, estado de loading e estado de erro. Se o Designer especificou, eu testo.
3. **Adicionar casos de borda** — pense em permissões (líder vs membro vs visitante), limites (0 itens, 1 item, muitos itens), dados inválidos (campos vazios, caracteres especiais) e condições de rede (offline, lento).
4. **Adicionar itens de regressão** — identifique fluxos vizinhos que podem ter sido afetados pela mudança (ex: se mexeu em presença, checar cadastro de membro também).
5. **Validar cobertura** — rode uma verificação final: todo critério de aceite do PM aparece? Todos os estados do Designer estão cobertos? Se não, completar.

## Output Format

Arquivo YAML com array de itens. Cada item tem `id`, `categoria`, `teste` e `esperado`.

```yaml
checklist:
  - id: "T01"
    categoria: "happy path"
    teste: "Descrição do teste"
    esperado: "Resultado esperado"
```

## Output Example

```yaml
feature: "Registro de Presença da Célula"
checklist:
  - id: "T01"
    categoria: "happy path"
    teste: "Líder abre a célula do dia e marca 5 membros como presentes"
    esperado: "Lista salva com 5 presenças, toast de sucesso, redireciona para dashboard"
  - id: "T02"
    categoria: "happy path"
    teste: "Líder adiciona um visitante novo durante o registro de presença"
    esperado: "Visitante criado e marcado como presente na mesma reunião"
  - id: "T03"
    categoria: "estado vazio"
    teste: "Líder abre célula sem membros cadastrados"
    esperado: "Empty state com mensagem 'Nenhum membro cadastrado' e CTA para adicionar membro"
  - id: "T04"
    categoria: "estado loading"
    teste: "Simular rede lenta ao salvar presença"
    esperado: "Botão mostra spinner, fica desabilitado, impede duplo envio"
  - id: "T05"
    categoria: "estado erro"
    teste: "Simular falha de rede no POST de presença"
    esperado: "Toast de erro com mensagem clara, lista permanece editável, dados não se perdem"
  - id: "T06"
    categoria: "edge case"
    teste: "Membro comum tenta acessar rota de registro de presença"
    esperado: "Redireciona para dashboard ou mostra 403 — apenas líder pode registrar"
  - id: "T07"
    categoria: "edge case"
    teste: "Líder tenta registrar presença em célula que já tem presença do mesmo dia"
    esperado: "Carrega presença existente para edição, não cria duplicata"
  - id: "T08"
    categoria: "regressao"
    teste: "Cadastro de novo membro continua funcionando após a mudança"
    esperado: "Fluxo de criar membro inalterado, membro aparece na célula"
```

## Quality Criteria

- Cada critério de aceite do PM está representado por ao menos um item do checklist.
- Todos os estados definidos pela UX spec (vazio, loading, erro) têm itens dedicados.
- Pelo menos um caso de borda de permissão é testado quando há regras de acesso.
- Itens de regressão cobrem ao menos um fluxo vizinho relevante.

## Veto Conditions

- **Não cobre estados alternativos** — se o checklist só tem happy path, é rejeitado e refeito.
- **Critério de aceite do PM não aparece** — se qualquer critério ficou de fora, é rejeitado e refeito.
