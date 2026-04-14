---
task: "Mapear Fluxo"
order: 1
input: "Requisitos do PM (problem statement, personas, user stories) de 01-requisitos.md"
output: "Fluxo de telas estruturado em YAML com entry point, steps, estados alternativos e saída"
---

# Mapear Fluxo

Desenha o fluxo de telas e estados (happy path + alternativos) para a feature solicitada. O objetivo é tornar explícito cada passo que o usuário dá, desde o ponto de entrada até a confirmação final, incluindo os momentos em que algo pode dar errado ou estar vazio.

## Process

1. Leia `01-requisitos.md` e identifique a persona principal, o contexto de uso (mobile/desktop, em movimento?) e a tarefa que ela precisa completar.
2. Marque o **entry point**: de onde o usuário parte (sidebar? notificação? link direto?).
3. Liste a sequência do **happy path**: cada ação do usuário → estado da tela → próximo passo, até a confirmação e saída.
4. Para cada passo, enumere os **estados alternativos**: loading, vazio, erro de validação, erro de rede, sem permissão.
5. Garanta que o fluxo termina de forma explícita (toast de sucesso, redirecionamento, tela de confirmação) — nunca deixe o usuário "no limbo".
6. Valide contra os `quality-criteria.md`: todo passo tem pelo menos 2 estados alternativos documentados.

## Output Format

```yaml
feature: "<nome da feature>"
persona: "<persona principal>"
contexto: "<mobile/desktop, situação de uso>"
entry_point: "<de onde o usuário chega>"
steps:
  - passo: "<nome do passo>"
    acao_usuario: "<o que ele faz>"
    tela: "<qual tela aparece>"
    estados:
      - "<estado 1 — ex: loading>"
      - "<estado 2 — ex: erro de rede>"
exit_point: "<como o fluxo termina>"
```

## Output Example

```yaml
feature: "Registro de Presença na Célula"
persona: "Líder de célula (mobile, em pé na casa do membro)"
contexto: "Mobile, domingo à noite, conexão instável"
entry_point: "Sidebar > Minhas Células > Card da célula > Botão 'Registrar presença'"
steps:
  - passo: "Abrir tela de presença"
    acao_usuario: "Toca no botão 'Registrar presença' no card da célula"
    tela: "Tela de Registro de Presença com lista de membros e toggles"
    estados:
      - "loading: skeleton dos membros enquanto carrega"
      - "vazio: célula sem membros cadastrados → CTA 'Adicionar membro'"
      - "erro de rede: banner vermelho 'Sem conexão. Tente novamente.'"
  - passo: "Marcar presenças"
    acao_usuario: "Toca no Toggle ao lado de cada membro presente"
    tela: "Mesma tela, toggles atualizando em tempo real"
    estados:
      - "happy: toggle muda de cinza para verde"
      - "erro: toggle volta ao estado anterior + toast 'Não foi possível marcar presença'"
  - passo: "Salvar registro"
    acao_usuario: "Toca no botão 'Salvar presença' no rodapé fixo"
    tela: "Loading no botão, depois toast de sucesso"
    estados:
      - "loading: botão com spinner e texto 'Salvando'"
      - "sucesso: toast verde 'Presença registrada com sucesso'"
      - "erro: toast vermelho 'Não foi possível salvar. Tente novamente.'"
exit_point: "Toast de sucesso + redireciona de volta para o card da célula com data atualizada"
```

## Quality Criteria

- Todo passo do fluxo lista pelo menos 2 estados alternativos além do happy path.
- O entry point está explícito (sidebar, notificação, link direto).
- O exit point deixa claro para onde o usuário vai depois da confirmação.
- O contexto de uso (mobile/desktop) está documentado e influencia o fluxo.

## Veto Conditions

- Fluxo só com happy path, sem estados de erro/vazio/loading → rejeita e pede para completar.
- Passo sem tela definida ou sem ação clara do usuário → rejeita e pede detalhamento.
