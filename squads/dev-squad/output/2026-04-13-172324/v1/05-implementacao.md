# Step 5 — Implementação (Fênix Fullstack)

**Run:** 2026-04-13-172324
**Agente:** Fênix Fullstack
**Status:** ✅ Concluído
**Build:** ✅ Lint 0 erros / 0 warnings · TypeScript `src/` limpo
**Nota de build:** Erros de `dashboard/` (projeto Vite independente) são pré-existentes e não impactam este release.

---

## 1. Resumo executivo

Refatorei a camada de tratamento de erros do Célula Mais para que **nenhum erro bruto ou stack trace escape para o usuário**. Implementei error boundaries do Next.js, padronizei a saída das server actions, substituí `alert()` por toasts e criei uma tela amigável reutilizável.

Cobertura:
- 6 arquivos novos (helpers, toaster, error screen, boundaries)
- 4 server actions refatoradas (cell-groups, members, meetings, upload)
- 7 componentes client-side corrigidos (tabelas, forms, dialogs, upload)
- 1 ajuste de i18n (`<html lang="pt-BR">`)

---

## 2. Arquivos criados

### 2.1 `src/lib/actions/result.ts`
Helper central para padronizar erros em server actions.

- `ActionResult<T>` — tipo discriminado `{ data, error }` (mantém shape existente, zero breaking change)
- `toActionError(err, fallback)` — extrai mensagens marcadas com prefixo `[user] ` ou retorna fallback seguro
- `userError(msg)` — lança `Error("[user] msg")` para sinalizar mensagens que podem ser mostradas ao usuário
- `logActionError(action, err, context)` — logger estruturado para console do servidor

**Por que prefixo `[user] `:** permite distinguir `throw` intencional (validação de negócio) de exceptions genuínas sem precisar refatorar 100% dos callsites.

### 2.2 `src/lib/toast.ts`
Re-export centralizado do `sonner` com helpers `toastActionResult` e `toastUploadResult`.

### 2.3 `src/components/ui/sonner.tsx`
Wrapper do `<Toaster>` com estética glassmorphic alinhada ao design system (rounded-2xl, backdrop-blur-xl, position bottom-right, richColors).

### 2.4 `src/components/feedback/error-screen.tsx`
Componente reutilizável que renderiza o card glassmórfico de erro.

Props:
- `icon` — Lucide icon
- `iconColorClassName` — override de cor do ícone
- `title` / `description` — microcopy em PT-BR
- `primaryAction` / `secondaryAction` — objetos com `label`, `icon`, `href` ou `onClick`
- `digest` — exibido quando disponível (error boundary do Next)
- `devErrorMessage` — renderizado dentro de `<details>` apenas em `NODE_ENV === "development"`
- `variant` — `"inline"` (60vh) ou `"fullscreen"` (min-h-screen gradient)

### 2.5 Error boundaries
- `src/app/(dashboard)/error.tsx` — boundary do dashboard. Ícone `TriangleAlert`, botão "Tentar novamente" (chama `reset()`) e "Voltar ao início". Loga via `console.error("[dashboard:error-boundary]", …)`.
- `src/app/global-error.tsx` — fallback raiz com `<html lang="pt-BR">` e `<body>` próprios. Ícone `ShieldAlert` em vermelho, variant fullscreen, título "O sistema encontrou um problema inesperado".
- `src/app/(dashboard)/not-found.tsx` + `src/app/not-found.tsx` — server components com ícone `MapPinOff` e CTA "Voltar ao início".

---

## 3. Arquivos modificados

### 3.1 Server actions

Padrão aplicado em **todas** as funções:

```ts
try {
  // ... lógica
  if (!record) userError("Este recurso não está mais disponível ou você não tem permissão.");
  // ...
  return { data: result, error: null };
} catch (err) {
  logActionError("funcName", err, { id });
  return { data: null, error: toActionError(err, "Fallback PT-BR específico da ação.") };
}
```

Arquivos:
- `src/actions/cell-groups.ts` — 6 funções (create/update/delete/list/get/getLeaders)
- `src/actions/members.ts` — 6 funções + tradução de "Member not found" → "Este membro não está mais disponível."
- `src/actions/meetings.ts` — 9 funções incluindo `getCellGroupMembers`
- `src/actions/upload.ts` — oculta `uploadError.message` bruto, retorna fallback amigável

Todas as mensagens de exceção internas (como `"Célula não encontrada ou acesso negado"`) foram substituídas por `userError(…)` com texto mais amigável.

### 3.2 Client components

Substituições de `alert()` e leaks de `err.message`:

| Arquivo | Correção |
|---|---|
| `src/app/(dashboard)/members/components/members-table.tsx` | `alert()` → `toast.error()` / `toast.success()` |
| `src/app/(dashboard)/cells/components/cell-groups-table.tsx` | `alert()` → `toast.error()` / `toast.success()` |
| `src/app/(dashboard)/meetings/components/meetings-table.tsx` | `alert()` → `toast.error()` / `toast.success()`; try/catch protege `deleteMeeting` |
| `src/app/(dashboard)/members/components/member-form.tsx` | catch genérico não expõe `err.message`; toast em sucesso e erro |
| `src/app/(dashboard)/cells/components/cell-group-form.tsx` | mesmo tratamento; toast em sucesso e erro |
| `src/app/(dashboard)/cells/components/quick-person-dialog.tsx` | remove `err.message` leak; toast + fallback |
| `src/app/(dashboard)/meetings/components/add-visitor-dialog.tsx` | `fetchPersons` e `handleCreate` sem swallowing silencioso; toast + fallback |
| `src/app/(dashboard)/meetings/components/meeting-form.tsx` | `onSubmit` nunca expõe `err.message`; fluxo de upload + create/update com toasts consistentes |
| `src/components/ui/image-upload.tsx` | `alert()` de validação de tamanho → `toast.error()` |

### 3.3 Layouts

- `src/app/layout.tsx` — `<html lang="en">` → `<html lang="pt-BR">` (conforme decisão do checkpoint)
- `src/app/(dashboard)/layout.tsx` — adiciona `<Toaster />` global

---

## 4. Decisões técnicas

### 4.1 Preservar shape `{ data, error }`
**Por quê:** alterar para tupla ou Result pattern quebraria 20+ callsites. O prefixo `[user] ` resolve o problema de origem sem rework massivo.

### 4.2 Error boundary apenas no `(dashboard)` segment
**Por quê:** `(auth)` tem suas próprias rotas de erro via Supabase e é mais simples de diagnosticar. O `global-error.tsx` cobre o catastrófico.

### 4.3 Sonner instalado direto via `npm install`
Conforme decisão do checkpoint (`npm install sonner`). Não foi usado o shadcn CLI porque o wrapper glassmorphic já foi customizado manualmente para alinhar ao design system existente.

### 4.4 `console.error` estruturado (não logger externo)
**Por quê:** o escopo do pedido é evitar leak ao usuário, não observabilidade. `logActionError` já usa payload estruturado com `{ message, stack, context, at }`, permitindo migrar para Sentry/Pino facilmente no futuro.

### 4.5 Zero `any` introduzido
Usei `unknown` + narrowing em todos os catch blocks. Os únicos `as any` restantes já existiam no código original (não fazem parte deste escopo).

---

## 5. Validações automáticas

```
npm run lint   → 0 erros, 0 warnings
npx tsc --noEmit → 0 erros em src/ (38 erros pré-existentes em dashboard/, projeto separado)
```

Build completo do Next.js (`npm run build`) falha em arquivos do diretório `dashboard/` — projeto Vite separado incluído no glob `**/*.tsx` do `tsconfig.json`. Issue pré-existente, documentada para QA.

---

## 6. Para QA testar

### Cenários críticos
1. **Rota `/cells` com erro forçado** — lançar erro dentro do componente server → deve mostrar `error.tsx` com título "Algo não saiu como esperado"
2. **Rota inexistente `/abcxyz`** — deve mostrar `not-found.tsx` com ícone MapPinOff
3. **Excluir membro com ID inválido** — deve mostrar toast.error com mensagem PT-BR amigável (não stack trace)
4. **Upload de arquivo 10MB** — deve mostrar toast "O arquivo é muito grande. O limite é 5MB."
5. **Upload com extensão inválida no Storage** — deve mostrar fallback amigável, NÃO o erro do Supabase
6. **Formulário de célula com campo inválido** — validação client-side funciona normalmente (zod)
7. **Criar reunião sem seleção de célula** — toast amigável, não crash
8. **Fluxo sucesso**: criar/editar/excluir célula, membro, reunião — deve mostrar toast de sucesso verde

### Regressões a verificar
- Todos os botões "Editar" continuam navegando
- Formulários continuam submitando
- Login/logout não foi tocado
- Tabelas renderizam normalmente

---

## 7. Observações e riscos conhecidos

- **Pre-existing:** `tsconfig.json` inclui `dashboard/` no glob. Não é escopo desta task, mas QA deve saber que `npm run build` quebra por este motivo.
- **Pre-existing:** `_opensquad/_memory/preferences.md` e outros arquivos do opensquad aparecem com mudanças não relacionadas.
- Nenhuma mudança de schema de banco, nenhuma migration.
- Nenhuma mudança em `.env` ou configurações sensíveis.
