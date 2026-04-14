---
task: "Alinhar Design System"
order: 3
input: "Specs detalhadas de cada tela (saída da tarefa especificar-telas)"
output: "Lista de componentes reutilizados do design system + lista de componentes NOVOS a criar"
---

# Alinhar Design System

Verifica quais componentes do design system existente do Célula Mais podem ser reutilizados para cada elemento das specs, e marca explicitamente qualquer componente novo que o dev precisará criar. O objetivo é maximizar consistência e minimizar trabalho novo.

## Process

1. Leia as specs de tela geradas na tarefa anterior e liste todos os elementos UI mencionados.
2. Para cada elemento, mapeie o componente existente correspondente no design system (`<Sidebar>`, `<Card>`, `<Button>`, `<Dialog>`, `<Toast>`, `<Avatar>`, `<Toggle>`, `<Input>`, `<Select>`).
3. Só marque como "CRIAR" quando nenhum componente existente atende ao caso, e justifique por quê não dá para adaptar um existente.

## Output Format

```yaml
reused_components:
  - name: "<nome do componente>"
    usage: "<onde e para quê>"
new_components:
  - name: "<nome do componente NOVO>"
    rationale: "<por que precisa ser criado, por que não dá para reaproveitar>"
    priority: "<alta|media|baixa>"
```

## Output Example

```yaml
reused_components:
  - name: "<Sidebar>"
    usage: "Navegação lateral com item 'Minhas Células' ativo durante todo o fluxo de presença."
  - name: "<Card>"
    usage: "Card de resumo da célula no topo da tela de presença (nome, líder, total de membros)."
  - name: "<Avatar>"
    usage: "Foto de cada membro na lista de presença (fallback: iniciais do nome)."
  - name: "<Toggle>"
    usage: "Marcar membro como presente/ausente na lista."
  - name: "<Input>"
    usage: "Campo de observações da reunião (variante textarea, max 500 caracteres)."
  - name: "<Button>"
    usage: "Ação primária 'Salvar presença' (variant='primary') e secundária 'Cancelar' (variant='ghost')."
  - name: "<Dialog>"
    usage: "Confirmação ao cancelar com alterações não salvas ('Descartar alterações?')."
  - name: "<Toast>"
    usage: "Feedback de sucesso ('Presença registrada com sucesso') e erro ('Não foi possível salvar')."
new_components:
  - name: "<MemberPresenceRow>"
    rationale: "Linha composta por <Avatar> + nome + <Toggle> alinhados horizontalmente com espaçamento específico da lista de presença. Não existe um componente de lista item pronto que combine esses três elementos com o comportamento de tap em mobile — criar um componente dedicado garante consistência quando a feature de presença for expandida para outros módulos (eventos, visitantes)."
    priority: "alta"
  - name: "<DatePickerInline>"
    rationale: "Seletor de data compacto no cabeçalho (default: hoje, permite escolher datas passadas até 30 dias). O <Input type='date'> nativo não atende ao padrão visual do Célula Mais e não permite restringir o range. Necessário criar um componente específico."
    priority: "media"
```

## Quality Criteria

- Todo elemento UI das specs foi mapeado para um componente (reutilizado ou novo).
- Cada componente novo tem justificativa clara de por que não dá para reaproveitar um existente.
- Componentes reutilizados estão nomeados exatamente como aparecem no design system.
- A lista de componentes novos inclui prioridade (alta/média/baixa) para o Tech Lead planejar.

## Veto Conditions

- Componente marcado como "CRIAR" quando existe claramente um equivalente no design system → rejeita e pede reaproveitamento.
- Elemento da spec sem mapeamento (nem reutilizado nem novo) → rejeita e pede cobertura completa.
