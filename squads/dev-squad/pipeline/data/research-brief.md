# Research Brief — Dev Squad Célula Mais

## Contexto da squad

Squad de desenvolvimento de software para o **Célula Mais** — SaaS de gestão religiosa (Next.js + TypeScript + Drizzle/Postgres + UI componentizada). A squad entrega features novas, módulos completos, bug fixes e refactors.

- **Quality bar:** minimum-viable — funciona, foi testado manualmente, não exige testes automatizados obrigatórios.
- **Escopo por run:** qualquer tamanho (feature pequena, módulo completo, bug fix, refactor).
- **Stack-specific:** todas as decisões assumem o stack já existente do Célula Mais (Next.js App Router, TypeScript estrito, Drizzle ORM, Postgres, componentes UI em `components/ui/`, sidebar já pronta).
- **Checkpoints:** mínimo — apenas 1 checkpoint após o plano técnico, antes de codar.

## Audience do produto

Pastores, líderes de células, supervisores e administradores da igreja. Tom da marca: profissional, acolhedor, organizado, intuitivo, respeitoso.

## Frameworks aplicados pela squad

### Product Management
- **User Stories INVEST** (Independent, Negotiable, Valuable, Estimable, Small, Testable)
- **Critérios de aceite em Gherkin** (Dado / Quando / Então)
- **Priorização MoSCoW** (Must, Should, Could, Won't)

### UX / Design
- **Happy path + estados alternativos obrigatórios:** vazio, loading, erro, sucesso
- **Reuso de design system:** componentes existentes primeiro, novos componentes explícitos
- **Microcopy no tom da marca** — português claro, acolhedor

### Arquitetura / Tech Lead
- **Leitura prévia de código** (Grep/Glob/Read) antes de propor plano
- **Plano com arquivos exatos** (caminhos completos) a criar ou editar
- **Passo a passo numerado** executável sequencialmente
- **Riscos e trade-offs explícitos**

### Desenvolvimento
- **TypeScript estrito** — zero uso de `any`
- **Validação server-side com Zod** — nunca confiar no client
- **Server Actions (Next.js App Router)** com validação de autenticação e permissão
- **Error handling com toasts** — mensagens úteis ao usuário em português
- **Commits pequenos** seguindo o padrão do repositório

### QA
- **Checklist manual** baseado nos critérios de aceite do PM + estados da UX spec
- **Teste dos estados alternativos** (vazio/erro/loading) como obrigatório
- **Bug report acionável:** passos numerados, esperado vs obtido, severidade (crítica/alta/média/baixa)
- **Veredito binário:** APROVADO ou REPROVADO — sem "quase funciona"

## Vocabulário de domínio

user story, critério de aceite, MVP, escopo mínimo, persona, happy path, edge case, estado vazio, server action, migration, trade-off, breaking change, severidade, regressão, MoSCoW, Gherkin, Zod schema, refactor.

## Anti-patterns comuns (e a squad evita)

- `any` no TypeScript
- Pular validação server-side
- Aprovar sem testar edge cases
- Plano técnico vago sem arquivos exatos
- Stories sem critérios de aceite
- Microcopy genérica ("Ops, algo deu errado")
- Ignorar estados de erro e vazio
- Assumir requisitos em vez de perguntar "por quê?"
- Commits grandes sem teste manual prévio

## Domain-specific

O Célula Mais é um SaaS de gestão de células/grupos de igreja. Entidades principais: célula, membro, reunião, presença, líder, supervisor, pastor. Qualquer feature deve considerar quem usa (persona) e o fluxo dentro da hierarquia da igreja.
