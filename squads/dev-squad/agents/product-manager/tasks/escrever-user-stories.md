---
task: "Escrever User Stories"
order: 2
input: |
  - problem_statement: Problema real levantado na análise de requisitos
  - personas_afetadas: Lista de personas e seus papéis
  - contexto: Módulo afetado e fluxo atual
output: |
  - user_stories: Lista de user stories no formato "Como X, quero Y, para Z"
  - criterios_de_aceite: Critérios em Gherkin (Dado/Quando/Então) para cada story
---

# Escrever User Stories

Segunda tarefa do PM. Transforma o problema destilado em user stories rastreáveis e testáveis. Cada story precisa ser INVEST (Independent, Negotiable, Valuable, Estimable, Small, Testable) e conectar persona, ação e valor de negócio.

## Process

1. Para cada persona afetada, identifique a(s) ação(ões) que ela precisa realizar para resolver parte do problema. Uma story por ação atômica.
2. Escreva cada story no formato "Como <persona>, quero <ação>, para <benefício de negócio>". O benefício nunca pode ser "porque sim" — precisa conectar a um resultado concreto.
3. Para cada story, escreva de 2 a 5 critérios de aceite em Gherkin (Dado / Quando / Então). Cada critério precisa ser verificável manualmente pelo QA.
4. Numere as stories sequencialmente (US-01, US-02, ...) para facilitar rastreamento no restante do pipeline.
5. Releia cada story perguntando: "um dev consegue estimar isso sem me chamar de volta?" Se não, detalhe mais.

## Output Format

```yaml
user_stories:
  - id: "US-01"
    titulo: "Título curto descritivo"
    story: "Como <persona>, quero <ação>, para <benefício>"
    criterios_de_aceite:
      - "Dado ... Quando ... Então ..."
      - "Dado ... Quando ... Então ..."
```

## Output Example

```yaml
user_stories:
  - id: "US-01"
    titulo: "Registrar presença de membros na reunião de célula"
    story: "Como líder de célula, quero marcar quais membros compareceram à reunião, para que o supervisor possa acompanhar a frequência da minha célula."
    criterios_de_aceite:
      - "Dado que sou líder de uma célula com reunião agendada para hoje, Quando acesso a tela da reunião, Então vejo a lista de todos os membros ativos da minha célula com um checkbox de presença ao lado de cada nome."
      - "Dado que marquei a presença de um membro, Quando clico em 'Salvar', Então o sistema registra a presença com timestamp e confirma com mensagem de sucesso."
      - "Dado que sou líder de outra célula, Quando tento acessar a reunião de uma célula que não é minha, Então recebo mensagem de acesso negado."
  - id: "US-02"
    titulo: "Visualizar relatório agregado de presença por célula"
    story: "Como supervisor, quero visualizar a taxa de presença de cada célula da minha rede nas últimas 4 semanas, para identificar células com baixo engajamento que precisam de atenção pastoral."
    criterios_de_aceite:
      - "Dado que sou supervisor, Quando acesso o relatório de presença da minha rede, Então vejo uma lista com cada célula e a porcentagem de presença média das últimas 4 reuniões."
      - "Dado o relatório carregado, Quando clico no nome de uma célula, Então sou redirecionado para o detalhamento por reunião daquela célula."
```

## Quality Criteria

- [ ] Cada story segue o formato "Como X, quero Y, para Z" com os 3 campos preenchidos.
- [ ] Cada story tem pelo menos 2 critérios de aceite em Gherkin.
- [ ] Cada critério é verificável manualmente (o QA consegue reproduzir).
- [ ] As stories cobrem todas as personas listadas no problem_statement.

## Veto Conditions

Rejeite e refaça se:
1. Alguma story não tem o campo "para <benefício>" preenchido com valor de negócio real.
2. Os critérios de aceite são vagos ou não testáveis ("funciona bem", "é intuitivo", "é rápido").
