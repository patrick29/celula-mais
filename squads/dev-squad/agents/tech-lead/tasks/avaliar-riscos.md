---
task: "Avaliar Riscos"
order: 3
input:
  - "squads/dev-squad/output/{feature}/03-plano-tecnico.md"
output: "Seção de riscos, trade-offs e decisões humanas anexada ao plano técnico"
---

# Avaliar Riscos

Revisar o plano técnico à caça de riscos escondidos e trade-offs relevantes. O objetivo é que nenhuma surpresa técnica chegue em produção sem ter sido nomeada antes.

## Process

1. **Revisar o plano** buscando riscos em cinco dimensões: performance, segurança, compatibilidade, migrations destrutivas e breaking changes em código existente.
2. **Para cada risco encontrado**, descrever impacto concreto (o que pode dar errado) e mitigação proposta (o que fazer para reduzir).
3. **Listar trade-offs explícitos**: escolhas técnicas que têm custo (ex: server action vs route handler, índice vs espaço, denormalização vs join).
4. **Listar decisões que precisam input humano** com `[DECISÃO HUMANA]` — tudo que o Tech Lead não deve escolher sozinho.

## Output Format

Saída em YAML anexada ao plano técnico, em `squads/dev-squad/output/{feature}/_riscos.yaml`, e resumida como seção `## Riscos e Trade-offs` ao final de `03-plano-tecnico.md`.

```yaml
riscos:
  - descricao: "..."
    dimensao: "performance | seguranca | compatibilidade | migration | breaking-change"
    severidade: "baixa | media | alta"
    mitigacao: "..."
trade_offs:
  - escolha: "..."
    alternativa: "..."
    motivo: "..."
decisoes_humano:
  - pergunta: "..."
    opcoes: ["...", "..."]
    impacto: "..."
```

## Output Example

```yaml
feature: "Registro de Presença em Células"

riscos:
  - descricao: "Query de listagem de presença pode ficar lenta com muitos membros"
    dimensao: "performance"
    severidade: "media"
    mitigacao: "Índice composto (celula_id, reuniao_data) já previsto no schema"

  - descricao: "Server action recordAttendance sem rate limit permite flood"
    dimensao: "seguranca"
    severidade: "media"
    mitigacao: "Adicionar checagem de autorização por célula + rate limit no middleware"

  - descricao: "Upsert por (celula, membro, data) exige UNIQUE constraint — migration falha se já existem duplicatas"
    dimensao: "migration"
    severidade: "alta"
    mitigacao: "Rodar query de checagem de duplicatas antes da migration; limpar manualmente se existir"

  - descricao: "Sidebar ganha novo item e pode quebrar layout mobile"
    dimensao: "breaking-change"
    severidade: "baixa"
    mitigacao: "Testar sidebar em viewport mobile antes do deploy"

trade_offs:
  - escolha: "Server action em vez de route handler"
    alternativa: "POST /api/presenca"
    motivo: "Server action integra melhor com forms do App Router e reduz boilerplate; custo é menor testabilidade isolada"

  - escolha: "UNIQUE constraint no banco em vez de checagem na aplicação"
    alternativa: "SELECT antes de INSERT"
    motivo: "Garante integridade mesmo em race condition; custo é tratar erro de constraint na server action"

decisoes_humano:
  - pergunta: "Permitir registrar presença de reunião retroativa?"
    opcoes: ["Só do dia atual", "Últimos 7 dias", "Qualquer data passada"]
    impacto: "Afeta validação do campo reuniaoData na server action"

  - pergunta: "Quem pode registrar presença além do líder da célula?"
    opcoes: ["Só líder", "Líder e co-líder", "Líder e admin da igreja"]
    impacto: "Afeta regra de autorização em recordAttendance"
```

## Quality Criteria

- Cada risco tem dimensão, severidade e mitigação descritas.
- Trade-offs listam escolha feita e alternativa rejeitada com motivo.
- Decisões humanas são perguntas fechadas com opções claras, não abertas.
- Migrations destrutivas ou com risco de perda de dado aparecem como severidade alta.

## Veto Conditions

- Plano sem nenhum risco listado — ou o plano é trivial demais, ou a análise foi preguiçosa.
- Decisão arquitetural controversa sem `[DECISÃO HUMANA]` correspondente.
