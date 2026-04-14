---
task: "Priorizar Escopo"
order: 3
input: |
  - user_stories: Lista de user stories já escritas com critérios de aceite
  - problem_statement: Problema original para validar o que é essencial
output: |
  - moscow: Classificação de cada story em must / should / could / wont
  - justificativa: Razão curta por trás de cada classificação
---

# Priorizar Escopo

Terceira tarefa do PM. Define o que entra no MVP da entrega e o que fica de fora, usando MoSCoW. A quality bar da Dev Squad é minimum-viable, então o PM precisa ter coragem de mover a maioria das stories para "Could" ou "Won't".

## Process

1. Releia o problem_statement e pergunte: "qual é o menor conjunto de stories que, se entregue sozinho, já resolve parte real do problema?" Essas são as **Must**.
2. Identifique stories que melhoram significativamente a experiência mas não são indispensáveis para o problema central. Essas são as **Should** — ficam de fora do MVP mas entram no roadmap próximo.
3. Liste stories que seriam legais de ter mas não agregam valor crítico. Marque como **Could**.
4. Seja explícito sobre o que fica de fora desta entrega como **Won't** — isso previne scope creep no meio do desenvolvimento e dá clareza ao usuário.
5. Para cada classificação, escreva uma justificativa curta (1 frase) explicando por quê.

## Output Format

```yaml
moscow:
  must:
    - id: "US-XX"
      justificativa: "Por que é essencial para o MVP"
  should:
    - id: "US-XX"
      justificativa: "Por que importa mas não é bloqueador"
  could:
    - id: "US-XX"
      justificativa: "Por que é nice-to-have"
  wont:
    - descricao: "O que explicitamente NÃO entra"
      justificativa: "Por que fica de fora"
```

## Output Example

```yaml
moscow:
  must:
    - id: "US-01"
      justificativa: "Sem registrar presença, o problema central continua existindo — é o core do MVP."
  should:
    - id: "US-02"
      justificativa: "Relatório do supervisor agrega muito valor, mas pode vir numa iteração seguinte se apertarmos o prazo."
  could:
    - id: "US-03"
      justificativa: "Notificação automática por WhatsApp quando presença cai — legal, mas exige integração e pode esperar."
  wont:
    - descricao: "Exportação de relatório em PDF"
      justificativa: "Supervisor consegue imprimir a tela do navegador por enquanto; adicionar PDF multiplica o escopo."
    - descricao: "Presença por reconhecimento facial"
      justificativa: "Fora do escopo de minimum-viable; a complexidade técnica não se justifica no primeiro ciclo."
    - descricao: "Histórico de presença com mais de 4 semanas"
      justificativa: "O MVP foca no acompanhamento recente; histórico longo entra depois que o fluxo básico estiver validado."
```

## Quality Criteria

- [ ] Pelo menos 1 story está marcada como Must (o MVP precisa ter algo).
- [ ] Pelo menos 1 item está em Won't (força o PM a declarar o que fica de fora).
- [ ] Cada classificação tem justificativa escrita.
- [ ] O conjunto Must, se entregue sozinho, resolve parte real do problem_statement.

## Veto Conditions

Rejeite e refaça se:
1. Todas as stories estão em Must (não houve priorização real — o PM não teve coragem de cortar).
2. A lista Won't está vazia sem justificativa (scope creep garantido no meio do desenvolvimento).
