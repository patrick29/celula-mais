# Plano Técnico — Tratamento Gracioso de Erros e Telas Amigáveis

## Stack afetada

Next.js **16.1.6** App Router + React **19.2** + TypeScript estrito + Tailwind **v4** + shadcn **radix-nova** + Lucide icons + `sonner` (NOVO — a ser instalado) + Drizzle 0.45 + Supabase server auth. Sem alteração em banco ou migrations.

## Modelo de dados

**Sem mudanças no banco.** Esta feature é puramente de apresentação e camada de apresentação de erros — nada toca schema, nada precisa de migration.

## API (Server Actions)

### Contrato preservado (backward compatible)

Todas as actions **continuam retornando a shape atual** `{ data, error }` (e `upload.ts` continua com `{ url, error }`). Não quebramos os componentes existentes. A única mudança é: **a `error.message` nunca mais vaza texto cru de Drizzle/Postgres** — é sempre substituída por uma mensagem acionável em PT-BR.

### Helper novo: `src/lib/actions/result.ts`

```ts
// Tipos puros para documentar o contrato das actions.
export type ActionResult<T> =
  | { data: T; error: null }
  | { data: null; error: string };

export type UploadResult =
  | { url: string; error: null }
  | { url: null; error: string };

/**
 * Converte qualquer exceção capturada em uma string PT-BR amigável.
 * Se o erro foi disparado via `throw new Error("mensagem em pt-BR")` dentro do try
 * (ex: "Célula não encontrada ou acesso negado"), essa mensagem é considerada
 * segura e é reaproveitada. Qualquer outra coisa (Postgres, Drizzle, rede)
 * vira o fallback genérico.
 */
export function toActionError(
  err: unknown,
  fallback = "Não foi possível concluir esta ação. Tente novamente em instantes."
): string {
  if (err instanceof Error && err.message.startsWith("[user] ")) {
    return err.message.slice("[user] ".length);
  }
  return fallback;
}

/** Lança um erro já marcado como "seguro para mostrar ao usuário". */
export function userError(message: string): never {
  throw new Error(`[user] ${message}`);
}

export function logActionError(
  action: string,
  err: unknown,
  context?: Record<string, unknown>
) {
  console.error(`[action:${action}]`, {
    message: err instanceof Error ? err.message : String(err),
    stack: err instanceof Error ? err.stack : undefined,
    context,
    at: new Date().toISOString(),
  });
}
```

**Regra do refactor nas actions existentes:**

1. Substituir `throw new Error("Célula não encontrada ou acesso negado")` por `userError("Esta célula não está mais disponível.")` (ou mensagem similar).
2. Substituir o bloco `catch (error: any) { ... return { data: null, error: error.message }; }` por:
   ```ts
   } catch (err) {
     logActionError("createCellGroup", err, { /* params relevantes */ });
     return { data: null, error: toActionError(err) };
   }
   ```
3. Onde havia `error: "Member not found"` em inglês (ex: `getMemberById`), traduzir para PT-BR: `"Este membro não está mais disponível."`.

### Lista de actions afetadas (audit)

| Arquivo | Função | Mudança |
|---|---|---|
| `src/actions/cell-groups.ts` | `getCellGroups`, `getCellGroupById`, `getLeadersForSelect`, `createCellGroup`, `updateCellGroup`, `deleteCellGroup` | Refactor catch + `userError` |
| `src/actions/members.ts` | `getPersonsForSelect`, `getMembers`, `getMemberById`, `createMember`, `updateMember`, `deleteMember` | Refactor catch + `userError` + tradução de "Member not found" |
| `src/actions/meetings.ts` | todas as funções (ver arquivo completo) | Refactor catch + `userError` |
| `src/actions/upload.ts` | `uploadMeetingPhoto` | Não expor `uploadError.message` cru — trocar por `"Não foi possível enviar a foto. Verifique o arquivo e tente novamente."` |

### Permissão e validação

Sem mudanças — o `getAuthUserContext()` já é a porta de entrada de todas as actions, e a regra de permissão continua a mesma (filtro por `churchId`). Esta feature **não** altera lógica de negócio, só encapsula os erros.

## Componentes

### Criar

**Telas de erro e 404 (Next.js App Router convention)**
- `src/app/global-error.tsx` — Global error boundary. Precisa incluir `<html>` + `<body>` próprios. Usa o componente `<ErrorScreen>`. Client component (`"use client"`).
- `src/app/(dashboard)/error.tsx` — Error boundary do route group do dashboard. Captura erros de layouts/páginas filhas. Client component. Usa `<ErrorScreen>`, renderiza dentro do shell do dashboard.
- `src/app/(dashboard)/not-found.tsx` — 404 dentro do dashboard. Server component.
- `src/app/not-found.tsx` — 404 fallback global (fora do dashboard). Server component.

**Componente reutilizável**
- `src/components/feedback/error-screen.tsx` — Componente visual compartilhado pelas 3 telas de erro. Client component (usa `onClick` nos botões de ação).
  ```tsx
  interface ErrorScreenProps {
    icon: LucideIcon;
    title: string;
    description: string;
    primaryAction: { label: string; onClick?: () => void; href?: string };
    secondaryAction?: { label: string; href: string };
    digest?: string;
    variant?: "inline" | "fullscreen"; // inline = dentro do dashboard, fullscreen = global-error
  }
  ```
  Deve renderizar o card glassmorphism (`rounded-2xl border border-white/40 bg-white/60 p-8 backdrop-blur-xl shadow-sm`), ícone Lucide passado por prop, título, descrição e botões. Em dev, renderizar `<details>` colapsado com `digest` e erro para debug local.

**Wrapper shadcn do Sonner**
- `src/components/ui/sonner.tsx` — Wrapper padrão do shadcn para `<Toaster />`. Usa `next-themes` OU fallback para tema claro (confirmar se `next-themes` está instalado; se não, usar `theme="light"` hardcoded).
- `src/lib/toast.ts` — Helper fino sobre o `toast` do sonner para padronizar mensagens de sucesso/erro de action:
  ```ts
  import { toast } from "sonner";
  export function toastActionResult<T>(
    result: { data: T; error: null } | { data: null; error: string },
    successMessage: string
  ) {
    if (result.error) toast.error(result.error);
    else toast.success(successMessage);
    return result;
  }
  ```

### Editar

- `src/app/(dashboard)/layout.tsx` — Acrescentar `<Toaster />` do sonner no final do `<main>`. 1 linha.
- `src/app/layout.tsx` — Trocar `<html lang="en">` por `<html lang="pt-BR">` (coerência com a UX spec e o público-alvo).
- `src/actions/cell-groups.ts` — Refactor catches e `throw new Error` → `userError` (ver regra acima).
- `src/actions/members.ts` — Refactor catches + tradução de "Member not found".
- `src/actions/meetings.ts` — Refactor catches + `userError` nos `throw` existentes.
- `src/actions/upload.ts` — Refactor catches, esconder `uploadError.message`.
- `src/app/(dashboard)/members/components/members-table.tsx` — Trocar `alert()` por `toast.error()` / `toast.success()`. **Manter `confirm()` por enquanto** (é questão de UX, não de erro — fica como Should futuro).
- `src/app/(dashboard)/cells/components/cell-groups-table.tsx` — Mesmo ajuste.
- `src/app/(dashboard)/members/components/member-form.tsx` — Se usar `alert()` em falha, substituir por toast.
- `src/app/(dashboard)/cells/components/cell-group-form.tsx` — Idem.
- `src/app/(dashboard)/meetings/components/add-visitor-dialog.tsx` — Idem.
- `src/app/(dashboard)/cells/components/quick-person-dialog.tsx` — Idem.

**Não editar:**
- Nenhum schema Drizzle.
- Nenhum arquivo em `src/lib/db/`.
- O `middleware.ts` (não tem nada de auth que precise tocar aqui).

## Passo a passo

1. **Instalar `sonner`:** `pnpm add sonner` (ou `npm install sonner` — confirmar gerenciador com Patrick). Se ele usa shadcn CLI, também pode rodar `pnpm dlx shadcn@latest add sonner`.
2. **Criar `src/lib/actions/result.ts`** com `ActionResult`, `UploadResult`, `toActionError`, `userError`, `logActionError`.
3. **Criar `src/components/feedback/error-screen.tsx`** com a API de props definida acima.
4. **Criar `src/components/ui/sonner.tsx`** (wrapper shadcn).
5. **Criar `src/lib/toast.ts`** com `toastActionResult`.
6. **Criar `src/app/global-error.tsx`** — usa `<ErrorScreen variant="fullscreen">`. Inclui `<html lang="pt-BR"><body>`.
7. **Criar `src/app/(dashboard)/error.tsx`** — usa `<ErrorScreen variant="inline">`.
8. **Criar `src/app/(dashboard)/not-found.tsx`** — usa `<ErrorScreen variant="inline">` com ícone `MapPinOff`.
9. **Criar `src/app/not-found.tsx`** — fallback global de 404.
10. **Editar `src/app/(dashboard)/layout.tsx`** — adicionar `<Toaster richColors position="bottom-right" />` no final.
11. **Editar `src/app/layout.tsx`** — `lang="pt-BR"`.
12. **Refatorar `src/actions/cell-groups.ts`** — aplicar a regra do helper em cada função.
13. **Refatorar `src/actions/members.ts`** — idem + traduzir "Member not found".
14. **Refatorar `src/actions/meetings.ts`** — idem.
15. **Refatorar `src/actions/upload.ts`** — idem.
16. **Editar componentes de tabela/form (lista na seção Editar)** — substituir `alert()` e tratamento silencioso por `toast.error()`/`toast.success()` via `toastActionResult` do helper.
17. **Teste manual (Felipe):**
    a. Criar um membro → ver toast verde "Membro adicionado".
    b. Forçar erro (derrubar DB temporariamente OU digitar UUID inválido numa action) → ver toast vermelho com mensagem amigável.
    c. Jogar uma exceção no render de `/cells` (linha `throw new Error("test")` no `page.tsx` temporariamente) → ver `error.tsx` dentro do shell.
    d. Remover temporariamente o `<Toaster />` e jogar erro no `layout.tsx` raiz → ver `global-error.tsx`.
    e. Acessar `/rota-inexistente` → ver `not-found.tsx`.
    f. Reverter todos os `throw` temporários antes do commit.
18. **Rodar `pnpm lint`** e garantir zero warnings.
19. **Rodar `pnpm build`** (ou `next build`) — garantir que as novas páginas client/server compilam sem erro.
20. **Commit único** seguindo o padrão do repo: `feat: add graceful error boundaries and toast feedback`.

## Riscos e trade-offs

- **Risco:** `global-error.tsx` só funciona em produção — em dev o Next.js mostra o overlay de erro antes. Mitigação: testar com `pnpm build && pnpm start` localmente, não só em `dev`.
- **Risco:** `error.tsx` do Next captura erros em render e em effects, mas **não** captura erros lançados fora do ciclo do React (ex: event handlers assíncronos). O plano mitiga isso via toast nas chamadas de server action — que é exatamente a superfície onde o usuário dispara efeitos.
- **Risco:** Se `next-themes` não estiver instalado, o wrapper do sonner precisa de fallback. Mitigação: plano já prevê `theme="light"` hardcoded como alternativa — zero instalação extra.
- **Risco:** O refactor das actions é mecânico mas amplo (4 arquivos, ~15 funções). Um `any` ou import esquecido pode quebrar build. Mitigação: rodar `pnpm build` após cada arquivo refatorado, não só no fim.
- **Risco:** Tabelas ainda usam `confirm()` nativo para deletar. Isso **não** é erro — é UX de confirmação. Deixar como está nesta entrega (fica como Should futuro para migrar para `<AlertDialog>` do shadcn).
- **Trade-off:** Manter a shape `{ data, error }` em vez de migrar para `{ success, data } | { success, error }`. Escolhi **preservar** porque: (1) backward compat total; (2) é "minimum-viable"; (3) migrar a shape implicaria tocar cada callsite de cada action, dobrando o escopo do refactor sem benefício imediato ao usuário final. Se o squad decidir adotar discriminated unions depois, o `ActionResult<T>` já está exportado e pronto para uso.
- **Trade-off:** Sem Sentry/telemetria remota. O `logActionError` é só `console.error`. Em produção (Vercel/Supabase), os logs ainda são acessíveis via dashboard do provedor. Para uma squad minimum-viable, é suficiente.
- **Decisão que precisa input humano:**
  1. **Gerenciador de pacotes:** `pnpm`, `npm` ou `yarn`? (O `package.json` não força — há `package-lock.json` indicando npm, mas o CLAUDE.md global fala em `rtk pnpm`.) Assumindo **npm** por causa do lockfile, mas confirmar.
  2. **Instalar `sonner` via shadcn CLI ou `npm install` direto?** Recomendo direto (`npm install sonner`) + criar o wrapper manualmente — é mais rápido e previsível.
  3. **Traduzir `<html lang="en">` para `<html lang="pt-BR">`** no root layout: faz parte do escopo de "tela amigável" ou fica como patch separado? Proposta: **incluir nesta entrega** (é 1 linha, coerente com o tom).
