# Revisão Completa do Projeto e Plano de Melhorias (Célula Mais)

Este documento contém uma análise aprofundada da estrutura atual do projeto "Célula Mais" (Next.js 16, Tailwind CSS v4, Drizzle ORM, Supabase), focando em oportunidades de melhoria em engenharia de software, arquitetura e design/UI.

## User Review Required

> [!IMPORTANT]
> Avalie as propostas listadas abaixo. Após a aprovação das frentes que você deseja priorizar, criaremos as tarefas para implementá-las.

## 1. Arquitetura e Engenharia de Software

A stack atual (Next.js App Router, Server Actions, Drizzle) é excelente e atualizada (Tailwind v4 é um grande diferencial). No entanto, algumas áreas de arquitetura podem ser aprimoradas para escalabilidade de longo prazo.

### Oportunidades:

- **Evolução para Domain-Driven Structure (Feature Slices):** 
  Em vez de agrupar todos os componentes de negócio na raiz de `/app` ou poluir a pasta genérica `/components`, adotar a criação de pastas `src/features/cells`, `src/features/meetings`, etc. Cada feature conterá suas tipagens unificadas, hooks, server actions exclusivas e sub-componentes.
- **Tratamento Global de Erros (Error Boundaries):**
  Atualmente, não identificamos arquivos universais `error.tsx` na maioria das rotas do App Router. Adicionar essas fronteiras juntamente com wrappers `try-catch` robustos nas Server Actions garantirá que qualquer falha (de rede, de ORM) degrade graciosamente sem "quebrar" a UI.
- **Melhoria no Sistema de Autenticação:**
  O arquivo `auth-context.ts` tem um fallback que busca o primeiro usuário (`limit 1`) se não houver contexto logado. Isso deve ser substituído por uma validação restrita, integrando o middleware (`middleware.ts`) do Next.js para redirecionar usuários não autenticados para `/login` antes mesmo das páginas tentarem ler dados do banco.
- **Melhoria de Performance com Caching:**
  Aproveitar mais profundamente a API `unstable_cache` ou a `fetch cache config` do Next.js 15+ nas requisições do Drizzle ORM para queries de leitura de "relatórios" e listagens estáticas, reduzindo hits frequentes no PostgreSQL (Supabase pooler).

---

## 2. Design de Interface (UI) e User Experience (UX)

O esquema atual tem uma configuração avançada (`globals.css` usando `oklch` com variáveis responsivas) e fontes bem escolhidas (Plus Jakarta Sans para visualização limpa).

### Oportunidades:

- **Padrão de Layout (Max-Width e Containers):**
  O layout atual usa a tela toda (flex e w-full). À medida que as telas ficam ultra-largas (Ultrawide), tabelas e dashboards podem ficar esticados demais. É recomendável implementar limites confortáveis (`max-w-7xl` aliado a alinhamento centralizado) para a área de conteúdo do dashboard.
- **Feedback Visual (Micro-Interações e Loading States):**
  - Utilizar a biblioteca nativa do Next.js `loading.tsx` não só com `spinners`, mas com **Skeleton Loaders** ricos em todas as listagens (Células, Membros), garantindo a sensação de carregamento rápido (`perceived performance`).
  - Botões de ações destrutivas ou primárias devem implementar o hook `useFormStatus` (ou equivalente no React 19 `useActionState`) com bloqueio e indicador visual de salvamento.
- **Design de Componentes Complexos (Empty States):**
  Criar ilustrações nativas limpas (ou SVG abstratos com as cores tema) para indicar "Nenhuma célula encontrada" ou "Nenhuma reunião marcada", acompanhados de botões fortes de "Call to Action" ("Criar Primeira Reunião").
- **Dark Mode Completo:** 
  O css global já prevê `.dark`, mas é preciso construir o switch de tema garantindo que a sidebar, cards e gráficos se adaptem apropriadamente ao tema escuro para dar uma aparência mais "Premium".

---

## Open Questions

Para que possamos avançar na consolidação funcional do "Dash Board", preciso que você responda:

> [!CAUTION]
> 1. Na parte de Engenharia: Devemos focar primeiro em refinar a **Autenticação (remover o fallback local e forçar login real)** ou você prefere manter o bypass (fallback user) focado no desenvolvimento da UI por hora?
> 2. Na parte de Design: Você gostaria de incluir o **Tema Escuro (Dark Mode)** como parte prioritária dessa modernização visual?
> 3. Na sua visão de negócio: Qual módulo do Dashboard deve ser a vitrine destas melhorias estéticas para eu atacar primeiro? A home do **Dashboard Principal (Relatórios)** ou a tela de **Gestão de Reuniões**?

## Verification Plan

Assim que for aprovada a direção, irei:
- [ ] Aplicar refatoração base na Autenticação (caso decidido).
- [ ] Implementar a estrutura sugerida de Componentes visuais como Skeletons e Empty States.
- [ ] Ajustar o `layout` e a `Sidebar` principal com o refinamento estético.
- [ ] O usuário fará uma verificação visual manual iniciando localmente o servidor e navegando pela nova UX.
