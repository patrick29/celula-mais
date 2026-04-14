---
task: "Analisar Requisitos"
order: 1
input: |
  - user_request: Pedido original do usuário em linguagem natural (feature, bug, refactor)
  - company_context: Informações do Célula Mais (módulos existentes, personas)
output: |
  - problem_statement: Descrição do problema real por trás do pedido
  - personas_afetadas: Lista de personas envolvidas
  - contexto: Módulo afetado e fluxo atual
  - assumptions: Lista de suposições explícitas
---

# Analisar Requisitos

Primeira tarefa do PM. Transforma um pedido solto em entendimento estruturado do problema, personas envolvidas e contexto no Célula Mais. É a base para todas as user stories que virão a seguir.

## Process

1. Leia o pedido literalmente e identifique o que o usuário **pediu**. Anote o texto original sem interpretar.
2. Pergunte "por quê?" pelo menos 3 vezes (mentalmente ou ao usuário se tiver acesso) para descobrir a dor real por trás do pedido. Destile o problema em uma frase curta.
3. Identifique qual(is) módulo(s) do Célula Mais são afetados (cadastro de membros, células, reuniões, relatórios, visitantes, etc.) e descreva como o fluxo atual funciona — ou diga "não existe".
4. Liste as personas envolvidas (líder de célula, supervisor, administrador, pastor, membro, visitante) e o que cada uma faz neste fluxo específico.
5. Anote assumptions explicitamente — tudo o que você está assumindo sem confirmar com o usuário (permissões, dados existentes, integração com outros módulos).

## Output Format

```yaml
problem_statement: "Descrição de 1-2 frases do problema real"
pedido_original: "Texto literal do pedido"
modulo_afetado: "Nome do módulo"
fluxo_atual: "Como funciona hoje (ou 'não existe')"
personas_afetadas:
  - persona: "Nome da persona"
    papel: "O que ela faz no fluxo"
assumptions:
  - "Assumption 1"
  - "Assumption 2"
```

## Output Example

> Use como referência de qualidade, não como template rígido.

```yaml
problem_statement: "Líderes de célula não têm como registrar a presença dos membros nas reuniões semanais, o que impede supervisores de acompanhar engajamento e identificar membros em afastamento."
pedido_original: "Quero uma forma de marcar quem veio na célula"
modulo_afetado: "Células / Reuniões"
fluxo_atual: "Hoje os líderes anotam presença em caderno ou grupo de WhatsApp; a informação não chega ao supervisor de forma estruturada e se perde entre semanas."
personas_afetadas:
  - persona: "Líder de célula"
    papel: "Registra quem compareceu à reunião, no celular, durante ou logo após o encontro."
  - persona: "Supervisor"
    papel: "Consulta relatórios agregados de presença para acompanhar a saúde das células da sua rede."
  - persona: "Administrador"
    papel: "Configura a célula, os membros vinculados e as reuniões agendadas."
assumptions:
  - "O cadastro de membros por célula já existe no sistema."
  - "As reuniões já são modeladas como entidade no banco."
  - "Líder só pode registrar presença da própria célula (regra de permissão)."
  - "Presença retroativa é permitida (líder pode marcar dias anteriores)."
```

## Quality Criteria

- [ ] O problem_statement descreve o PROBLEMA, não a solução pedida.
- [ ] Pelo menos 2 personas estão nomeadas com seus papéis específicos.
- [ ] O módulo afetado do Célula Mais está identificado por nome.
- [ ] Assumptions estão explícitas (pelo menos 2, ou justificativa se vazio).

## Veto Conditions

Rejeite e refaça se:
1. O problem_statement apenas repete o pedido literal do usuário sem destilar a dor real por trás.
2. Assumptions estão implícitas ou ausentes sem justificativa escrita.
