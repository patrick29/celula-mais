# UX Spec — Tratamento Gracioso de Erros

## Contexto de uso

- **Multi-dispositivo:** líder abre do mobile em movimento; supervisor/administrador usa desktop sentado.
- **Momento emocional:** o usuário já está com outra coisa em mente (membro, reunião, relatório) e bate numa falha que ele não provocou. O design precisa absorver a frustração e devolver controle em segundos.
- **Frequência:** idealmente raro. Quando acontece, precisa parecer um tropeço cuidadoso — não um sistema instável.
- **Tom:** profissional, acolhedor, organizado, intuitivo, respeitoso. Vocabulário do Célula Mais.

## Fluxo

**Fluxo 1 — Erro dentro de uma rota do dashboard**
`Usuário em /cells` → erro é lançado (render ou server action) → `error.tsx` do route group captura → Tela de erro renderiza dentro do shell do dashboard (sidebar e header permanecem) → Usuário clica **Tentar novamente** → `reset()` → rota re-renderiza.

**Fluxo 2 — Erro no layout raiz (catastrófico)**
Erro no `RootLayout` → `global-error.tsx` captura → Tela de erro renderiza em tela cheia (sem sidebar) → Usuário clica **Recarregar a página** → `reset()` → app recarrega.

**Fluxo 3 — Erro em server action (não catastrófico, durante uma ação)**
Usuário clica **Salvar membro** → action falha e retorna `{ success: false, error: "..."}` → Toast vermelho aparece no canto inferior direito → Formulário mantém dados → Botão volta ao estado normal → Usuário pode tentar de novo.

**Fluxo 4 — URL inexistente**
Usuário digita `/cells/xpto` → `notFound()` → Tela `not-found.tsx` dentro do shell do dashboard (se dentro do route group) ou global (se fora) → Botão **Voltar ao início** leva para `/`.

---

## Tela: Error Boundary de Rota (`error.tsx`)

**Contexto visual:** renderizada dentro do shell do dashboard (a sidebar e o header do `(dashboard)/layout.tsx` continuam visíveis). A tela preenche apenas a área de conteúdo.

**Cabeçalho:**
- Ícone `TriangleAlert` do Lucide (cor âmbar, `text-amber-500`, 48px), centralizado
- Título: **"Algo não saiu como esperado"** (H1, `text-2xl font-semibold text-slate-800`)

**Corpo:**
- Subtítulo em `text-slate-600`:
  *"Encontramos um imprevisto ao carregar esta parte do sistema. Não se preocupe — seus dados estão seguros. Vamos tentar novamente?"*
- Espaçamento generoso (`space-y-4`), centralizado vertical e horizontalmente, max-width `max-w-md`
- Card com glassmorphism alinhado ao dashboard: `rounded-2xl border border-white/40 bg-white/60 p-8 backdrop-blur-xl shadow-sm`
- Opcional (visível só se `process.env.NODE_ENV === 'development'`): bloco `<details>` colapsado com `error.digest` e `error.message` para o dev local — **jamais** em produção.

**Rodapé (ações):**
- Botão primário: **"Tentar novamente"** (`Button` padrão, ícone `RotateCw` à esquerda) → chama `reset()`
- Botão secundário (ghost): **"Voltar ao início"** (`Button variant="outline"`, ícone `Home`) → `<Link href="/">`

**Layout:** `flex flex-col items-center justify-center min-h-[60vh] px-6 text-center`

## Tela: Erro Global (`global-error.tsx`)

**Contexto visual:** tela cheia, sem sidebar nem header (o layout raiz falhou). Precisa incluir `<html>` e `<body>` próprios (exigência do Next.js App Router).

**Cabeçalho:**
- Ícone `ShieldAlert` do Lucide (48px, âmbar)
- Título: **"O sistema encontrou um problema inesperado"** (H1, `text-3xl font-semibold`)

**Corpo:**
- Texto em `text-slate-600`:
  *"Tivemos um imprevisto ao carregar o Célula Mais. Seus dados estão seguros. Tente recarregar a página — se o problema continuar, avise sua equipe de TI."*
- Fundo: gradiente suave `bg-gradient-to-br from-slate-50 to-white` (não depende do tema do dashboard)
- Card glassmorphism centralizado `max-w-md`

**Rodapé:**
- Botão primário: **"Recarregar a página"** → `reset()`
- Texto secundário pequeno: *"Código do erro: {digest}"* (se existir) — útil para suporte, mas discreto

**Layout:** `<html lang="pt-BR"><body className="font-sans antialiased"><div className="flex min-h-screen items-center justify-center px-6">...</div></body></html>`

## Tela: Página Não Encontrada (`not-found.tsx`)

**Contexto visual:** renderizada dentro do shell do dashboard quando `notFound()` é chamado em rotas filhas. A versão raiz (fora do dashboard) também existe como fallback.

**Cabeçalho:**
- Ícone `MapPinOff` do Lucide (48px, slate-400)
- Título: **"Não encontramos essa página"**

**Corpo:**
- Texto: *"A página que você procura pode ter sido movida ou não existe mais. Vamos voltar para o começo?"*
- Card glassmorphism, mesmo padrão visual do `error.tsx`

**Rodapé:**
- Botão primário: **"Voltar ao início"** → `<Link href="/">`

## Tela: Toaster Global (feedback de server action)

**Contexto visual:** componente `<Toaster />` do Sonner injetado no `(dashboard)/layout.tsx`. Posição `bottom-right` em desktop e `top-center` em mobile.

**Variantes:**
- **Sucesso:** ícone `CircleCheck` verde, título curto (ex: "Membro adicionado"), duração 3s
- **Erro:** ícone `CircleAlert` vermelho, título = mensagem acionável da `ActionResult.error`, duração 5s
- **Loading (opcional):** usado com `toast.promise()` em ações demoradas (upload, batch)

**Microcopy de erro** (todas vêm da server action, não do frontend):
- `VALIDATION_FAILED`: *"Revise os campos destacados e tente novamente."*
- `UNAUTHORIZED`: *"Você não tem permissão para essa ação."*
- `NOT_FOUND`: *"Este registro não está mais disponível."*
- `UNKNOWN`: *"Não foi possível concluir esta ação. Tente novamente em instantes."*

## Estados

- **Vazio:** N/A (estas telas são estados de exceção)
- **Loading:** `loading.tsx` já existe no dashboard raiz — manter; acrescentar nos route segments que ainda não têm (opcional/Should)
- **Erro (esta feature):** coberto pelos 3 layouts acima
- **Sucesso:** toast verde confirmando ação concluída

## Componentes reutilizados

- `<Button>` (já existe, `components/ui/button.tsx`) — usado em todas as telas
- `<Card>` — **Não existe ainda**! Mas os layouts usam apenas `<div>` com classes Tailwind de card glassmorphism; não criar componente `<Card>` só para essa feature.
- Skeleton (já existe)
- Ícones `lucide-react` (já é a lib do projeto: `TriangleAlert`, `ShieldAlert`, `MapPinOff`, `RotateCw`, `Home`, `CircleCheck`, `CircleAlert`)

## Componentes NOVOS

- `<ErrorScreen>` em `src/components/feedback/error-screen.tsx` — **CRIAR**. Componente reutilizável que os três arquivos (`error.tsx`, `global-error.tsx`, `not-found.tsx`) consomem para evitar duplicação visual. Props: `{ icon, title, description, actions, showDigest?, digest? }`.
- `<Toaster>` (do pacote `sonner`) — **CRIAR** via `pnpm add sonner` + wrapper em `src/components/ui/sonner.tsx` (padrão shadcn). Injetado uma única vez no `(dashboard)/layout.tsx`.

## Microcopy

**error.tsx (route)**
- Título: *"Algo não saiu como esperado"*
- Descrição: *"Encontramos um imprevisto ao carregar esta parte do sistema. Não se preocupe — seus dados estão seguros. Vamos tentar novamente?"*
- Botão primário: *"Tentar novamente"*
- Botão secundário: *"Voltar ao início"*

**global-error.tsx**
- Título: *"O sistema encontrou um problema inesperado"*
- Descrição: *"Tivemos um imprevisto ao carregar o Célula Mais. Seus dados estão seguros. Tente recarregar a página — se o problema continuar, avise sua equipe de TI."*
- Botão primário: *"Recarregar a página"*
- Código do erro: *"Código do erro: {digest}"*

**not-found.tsx**
- Título: *"Não encontramos essa página"*
- Descrição: *"A página que você procura pode ter sido movida ou não existe mais. Vamos voltar para o começo?"*
- Botão primário: *"Voltar ao início"*

**Toasts (de sucesso por módulo — exemplos)**
- Membro: *"Membro adicionado"* / *"Membro atualizado"* / *"Membro removido"*
- Célula: *"Célula criada"* / *"Célula atualizada"*
- Reunião: *"Reunião registrada"* / *"Presença salva"*

**Toasts de erro (vindos do código de erro)**
- `VALIDATION_FAILED`: *"Revise os campos destacados e tente novamente."*
- `UNAUTHORIZED`: *"Você não tem permissão para essa ação."*
- `NOT_FOUND`: *"Este registro não está mais disponível."*
- `UNKNOWN`: *"Não foi possível concluir esta ação. Tente novamente em instantes."*

## Veto Conditions

Rejeite e refaça se:
1. Alguma microcopy contém termos técnicos (Zod, Drizzle, Next.js, server action, exception, stack).
2. `global-error.tsx` não tem `<html>` e `<body>` próprios na especificação.
3. Alguma tela não oferece pelo menos uma ação (tentar de novo, recarregar, voltar).
4. Componente novo é marcado sem justificativa de que **não** existe hoje.

## Quality Criteria

- [x] Fluxo cobre happy path + 3 cenários alternativos (erro de rota, erro global, 404, erro de action).
- [x] Componentes novos explicitamente marcados com "CRIAR".
- [x] Componentes reutilizados listados (Button, Skeleton, ícones Lucide).
- [x] Microcopy em PT-BR, tom acolhedor do Célula Mais.
- [x] Spec permite implementar sem adivinhar layout ou palavras.
