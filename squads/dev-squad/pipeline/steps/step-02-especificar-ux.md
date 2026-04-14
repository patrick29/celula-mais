---
execution: inline
agent: ux-designer
inputFile: squads/dev-squad/output/01-requisitos.md
outputFile: squads/dev-squad/output/02-ux-spec.md
---

# Step 02: Especificar UX

A designer (Daniela Design) transforma os requisitos do PM em spec de UX: fluxo de telas com todos os estados (happy path + vazio + loading + erro + sucesso), microcopy no tom do Célula Mais e clareza sobre o que reutilizar vs criar do design system.

## Context Loading

Carregue os arquivos abaixo antes de executar:

- `squads/dev-squad/output/01-requisitos.md` — requisitos do PM (problema, personas, user stories, critérios)
- `pipeline/data/research-brief.md` — contexto da squad
- `pipeline/data/domain-framework.md` — seção "Fase 2 — Especificação de UX"
- `pipeline/data/quality-criteria.md` — seção "UX Designer (UX Spec)"
- `pipeline/data/output-examples.md` — Exemplo 2 (UX Spec — Registro de Presença)
- `pipeline/data/anti-patterns.md` — seção "UX Designer"
- `agents/ux-designer.agent.md` — persona da Daniela
- `agents/ux-designer/tasks/mapear-fluxo.md`
- `agents/ux-designer/tasks/especificar-telas.md`
- `agents/ux-designer/tasks/alinhar-design-system.md`

## Instructions

### Process

1. **Leia os requisitos** e identifique cada tela/interação envolvida. Liste personas e contexto de uso (mobile? desktop? em movimento na célula?).
2. **Execute `mapear-fluxo.md`** para desenhar o fluxo: ponto de entrada → ações → estados intermediários → confirmação → saída. **Obrigatório** incluir estados alternativos (vazio, loading, erro, sucesso).
3. **Execute `especificar-telas.md`** detalhando cada tela: cabeçalho, corpo, ações primárias/secundárias, microcopy, validações inline, estados.
4. **Execute `alinhar-design-system.md`** separando componentes reutilizados (já existem em `components/ui/`) de componentes NOVOS que o dev precisa criar. Marque explicitamente "CRIAR" apenas o que realmente não existe.
5. **Escreva a microcopy em português** claro, acolhedor, respeitoso — tom do Célula Mais. Sem "Ops, algo deu errado" genérico; sempre mensagens acionáveis.
6. **Entregue o documento final** para o Tech Lead no Output Format abaixo.

## Output Format

```markdown
# UX Spec — {título}

## Contexto de uso
{Dispositivo, momento, frequência}

## Fluxo
{Ponto de entrada → ações → estados → saída}

## Tela: {Nome}
**Cabeçalho:** ...
**Corpo:** ...
**Rodapé:** ...

## Estados
- **Vazio:** ...
- **Loading:** ...
- **Erro:** ...
- **Sucesso:** ...

## Componentes reutilizados
- `<Componente>` (já existe)

## Componentes NOVOS
- `<NovoComponente>` — {descrição} (CRIAR)

## Microcopy
- Título: "..."
- Botão: "..."
- Erro: "..."
```

## Output Example

# UX Spec — Registro de Presença

## Contexto de uso
Líder acessa do celular durante ou logo após a reunião. Precisa ser rápido — menos de 1 minuto para marcar 10 pessoas.

## Fluxo
Sidebar → "Minhas Células" → Card da célula → Botão "Registrar presença de hoje" → Tela de presença → Salvar → Toast de sucesso → volta ao card

## Tela: Registro de Presença
**Cabeçalho:** Nome da célula + data formatada (ex: "Célula Graça — 10/04/2026")
**Corpo:** Lista de membros, cada linha com:
  - Avatar + nome
  - Toggle de 3 estados: Presente / Ausente / Justificado (default: presente)
  - Campo opcional de observação (ícone de lápis que expande inline)
**Rodapé fixo:** Botão primário "Salvar presença" + contador "8 de 12 marcados"

## Estados
- **Vazio:** "Esta célula ainda não tem membros cadastrados." + CTA "Adicionar membros"
- **Loading:** Skeleton de 5 linhas
- **Erro ao salvar:** Toast vermelho "Não foi possível salvar. Tente novamente." + manter dados preenchidos
- **Sucesso:** Toast verde "Presença registrada" + redirect após 1.5s

## Componentes reutilizados
- `<Card>`, `<Avatar>`, `<Toggle>`, `<Toast>`, `<Button>`, `<Input>` (já existem)

## Componentes NOVOS
- `<PresenceRow>` — linha de membro com toggle de 3 estados + campo de observação expansível (CRIAR)

## Microcopy
- Título da tela: "Presença de hoje"
- Botão primário: "Salvar presença"
- Confirmação: "Presença registrada com sucesso"
- Erro: "Não foi possível salvar. Verifique sua conexão e tente novamente."
- Vazio: "Esta célula ainda não tem membros. Adicione antes de registrar presença."

## Veto Conditions

Rejeite e refaça se:
1. O fluxo só cobre happy path — estados alternativos (vazio/loading/erro) estão ausentes.
2. Algum componente é marcado como NOVO sem verificar se já existe em `components/ui/`.
3. Microcopy contém frases genéricas ("Ops, algo deu errado") sem ser acionável.
4. Não há menção clara ao dispositivo/contexto de uso.

## Quality Criteria

- [ ] Fluxo tem happy path + ao menos 2 estados alternativos.
- [ ] Cada componente novo está marcado "CRIAR".
- [ ] Componentes reutilizados estão listados.
- [ ] Microcopy em português, no tom acolhedor do Célula Mais.
- [ ] Spec permite implementar sem adivinhar decisões visuais.
