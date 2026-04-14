# Requisitos — Tratamento Gracioso de Erros e Telas Amigáveis

## Problema

Hoje qualquer exceção não capturada no Célula Mais "estoura" para o usuário: em desenvolvimento aparece a stack trace vermelha do Next.js; em produção, uma tela em branco ou o erro genérico "Application error: a client-side exception has occurred". Pastores, líderes e supervisores — público não-técnico — perdem a confiança no sistema quando isso acontece no meio de um fluxo pastoral (ex: registrar membros antes da reunião). A dor real **não** é "ter zero bugs" — é que, quando algo falha, o usuário precisa entender o que aconteceu, saber o que fazer a seguir, e manter o senso de que o sistema é confiável.

## Personas afetadas

- **Líder de célula** (mobile, uso rápido): está em movimento e não pode parar para interpretar mensagem técnica. Precisa saber "deu certo" ou "não deu, tente isso".
- **Supervisor** (desktop, uso semanal): consulta relatórios e dashboards. Um erro silencioso faz parecer que "não há dados", o que mascara problemas reais.
- **Administrador / Pastor** (desktop, uso recorrente): gerencia membros, células e reuniões. Se um erro bloquear uma ação importante (ex: deletar membro), precisa saber se o problema é temporário ou permanente.
- **Desenvolvedor do Célula Mais** (indireto): precisa de logs estruturados do erro real para corrigir rápido — sem esse canal, o usuário vira oráculo de bugs.

## Escopo (MVP)

**Must:**
- `error.tsx` em cada route segment do dashboard (`(dashboard)`, `cells`, `members`, `meetings`, `reports`, `settings`) com UI amigável, botão "Tentar novamente" (`reset()`) e link "Voltar ao início".
- `global-error.tsx` na raiz do `src/app/` para capturar falhas do próprio layout raiz.
- `not-found.tsx` global com mensagem acolhedora e CTA de volta.
- Server actions (`cell-groups.ts`, `meetings.ts`, `members.ts`, `upload.ts`) convertidas para retornar `ActionResult<T>` (`{ success: true, data }` ou `{ success: false, error, code }`) em vez de `throw` cru, com tradução para mensagens em PT-BR acionáveis.
- Toaster global (`sonner` ou equivalente já alinhado com o stack) integrado ao layout do dashboard, para que o frontend consuma `ActionResult` e exiba toast de erro/sucesso.
- Logger server-side mínimo (`console.error` estruturado com contexto: action, userId, params) para que o dev consiga rastrear o erro real mesmo quando o usuário vê a mensagem amigável.

**Should:**
- `loading.tsx` ausentes em route segments que ainda não têm (alinhar com o `loading.tsx` existente no dashboard raiz).
- Error boundary client-side explícito (`<ErrorBoundary>`) em componentes críticos com estado rico (ex: tela de reunião com múltiplos membros), para evitar que o componente inteiro remonte.
- Código de erro semântico no `ActionResult` (ex: `UNAUTHORIZED`, `NOT_FOUND`, `VALIDATION_FAILED`, `UNKNOWN`) para o frontend decidir se mostra toast, redireciona, ou pede confirmação.

**Could:**
- Integração futura com Sentry ou similar para monitoramento remoto.
- Página 404 personalizada por route segment (`cells/not-found.tsx` etc).
- Retry automático com backoff para erros de rede transitórios.

**Won't (agora):**
- Tradução i18n de mensagens de erro — mantemos tudo em PT-BR hardcoded.
- Telemetria de métricas (contagem de erros por rota, taxa de recuperação).
- Error tracking de terceiros (Sentry, Datadog, Logtail).
- Reescrita de componentes para introduzir `useFormState`/`useActionState` onde já usam `useTransition` simples.

## User Stories

### US-01 — Tela amigável de erro em rotas do dashboard

Como **líder de célula**, quero **ver uma tela clara quando algo falhar no sistema**, para que **eu saiba o que aconteceu e o que posso fazer, sem ficar travado num erro técnico**.

**Critérios de aceite:**
- Dado que estou logado e navegando em `/cells`, `/members`, `/meetings`, `/reports` ou `/settings`
- Quando uma exceção não capturada é lançada durante o render (server ou client)
- Então vejo uma tela com título "Algo não saiu como esperado", descrição acolhedora em PT-BR e dois botões: "Tentar novamente" (chama `reset()`) e "Voltar ao início" (link para `/`)
- E **não** vejo stack trace, nome de arquivo, linha ou qualquer termo técnico (Zod, Drizzle, Next.js, etc.)
- E o erro é registrado no console do servidor com contexto (rota, timestamp, mensagem original)

### US-02 — Tela de erro global fallback

Como **qualquer usuário do Célula Mais**, quero **nunca ver uma tela em branco ou o erro cru do Next.js**, para que **o sistema pareça cuidadoso mesmo quando algo dá muito errado**.

**Critérios de aceite:**
- Dado que ocorre um erro no próprio `layout.tsx` raiz (antes do `error.tsx` de rota conseguir capturar)
- Quando o navegador renderiza a página
- Então vejo a tela definida em `global-error.tsx` com a mesma linguagem amigável do `error.tsx` de rota
- E a tela inclui `<html>` e `<body>` próprios (requisito do Next.js App Router)
- E há um botão "Recarregar a página"

### US-03 — Server actions devolvem resultado previsível

Como **desenvolvedor do Célula Mais**, quero que **toda server action retorne `ActionResult<T>` em vez de lançar exceções cruas**, para que **o frontend consiga decidir o que mostrar ao usuário sem `try/catch` espalhado em cada componente**.

**Critérios de aceite:**
- Dado que uma server action (em `src/actions/*.ts`) executa
- Quando encontra um erro esperado (validação Zod, permissão negada, registro não encontrado)
- Então retorna `{ success: false, error: "mensagem PT-BR acionável", code: "VALIDATION_FAILED" | "UNAUTHORIZED" | "NOT_FOUND" }`
- E quando encontra um erro inesperado
- Então captura a exceção, loga server-side com contexto e retorna `{ success: false, error: "Não foi possível concluir esta ação. Tente novamente.", code: "UNKNOWN" }`
- E quando a operação tem sucesso
- Então retorna `{ success: true, data: <resultado> }`
- E **nenhuma** server action em `src/actions/` contém `throw new Error(...)` sem estar dentro de um `try/catch` que converte para `ActionResult`

### US-04 — Frontend consome `ActionResult` e exibe feedback visual

Como **líder de célula**, quero **ver um toast claro após cada ação (cadastrar membro, salvar reunião, etc.)**, para que **eu saiba se deu certo e, se não, o que fazer**.

**Critérios de aceite:**
- Dado que disparo uma server action pelo frontend (ex: criar membro)
- Quando a action retorna `{ success: true }`
- Então vejo um toast verde com mensagem de sucesso em PT-BR (ex: "Membro adicionado")
- Quando a action retorna `{ success: false, error }`
- Então vejo um toast vermelho com a `error.message` da action, sem termos técnicos
- E o formulário **preserva** os dados digitados (não limpa em caso de erro)
- E o botão de submit volta ao estado normal (não fica travado em loading)

### US-05 — Página 404 acolhedora

Como **qualquer usuário**, quero **ver uma página amigável quando acesso uma URL que não existe**, para que **eu entenda que é um endereço errado e possa voltar ao início**.

**Critérios de aceite:**
- Dado que acesso uma URL inexistente (ex: `/cells/inexistente`)
- Quando o Next.js dispara `notFound()` ou não encontra a rota
- Então vejo a tela `not-found.tsx` com mensagem "Esta página não existe" e CTA "Voltar ao início"
- E o tom é acolhedor (não zombeteiro) — é um pastor ou líder que pode ter digitado errado

## Riscos e assumptions

- **Assumption:** o stack já tem (ou aceita instalar) `sonner` como biblioteca de toast. Se não, o Tech Lead precisa propor alternativa compatível com Radix/shadcn já usado em `components/ui/`.
- **Assumption:** server actions hoje são consumidas diretamente por componentes client (`useTransition` + handler). Não há `useActionState`/`useFormState` em uso, então o refactor é compatível.
- **Risco:** converter `throw` em `ActionResult` em todas as actions pode quebrar chamadas existentes se algum componente espera que a action "lance" o erro. Mitigação: grep cruzado por chamadas antes do refactor; teste manual por fluxo afetado.
- **Risco:** `error.tsx` no Next.js App Router **não captura erros de layout pai** — por isso `global-error.tsx` é obrigatório para cobrir o layout raiz.
- **Risco:** a pasta `src/app/(dashboard)` é um route group com seu próprio layout; `error.tsx` lá dentro só captura erros dos filhos desse grupo, não do layout raiz. É o comportamento esperado, mas precisa ser explícito no plano técnico.
- **Assumption:** logger estruturado por enquanto é só `console.error` com objeto rico — sem Sentry. Está alinhado com a bar "minimum-viable" da squad.
- **Decisão que precisa input humano:** instalar `sonner` OU reusar algum componente já existente? (Verificar `components.json` do shadcn.)
