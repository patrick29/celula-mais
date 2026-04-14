# Squad Memory: Dev Squad Célula Mais

## Estilo de Escrita

## Design Visual

## Estrutura de Conteúdo

## Proibições Explícitas

## Técnico (específico do squad)

- **Shape `{ data, error }` em server actions** — o projeto usa `ActionResult<T> = { data: T; error: null } | { data: null; error: string }` (não o shape `{ success, data, error, code }`). Preservar ao adicionar novas actions para manter compatibilidade com callsites existentes.
- **Convenção `userError()` + prefixo `[user] `** — use `userError("msg PT-BR")` (de `@/lib/actions/result`) quando quiser que uma mensagem lançada via `throw` seja mostrada ao usuário. O helper `toActionError` reconhece o prefixo `[user] ` e distingue de exceptions genuínas (que viram fallback seguro).
- **Toaster global** — `<Toaster />` já mountado em `src/app/(dashboard)/layout.tsx`. Use `import { toast } from "@/lib/toast"` em qualquer client component.
- **Error boundary em route group** — `src/app/(dashboard)/error.tsx` cobre todos os filhos do grupo. Não precisa criar boundary por rota individual.
- **`dashboard/` quebra o build** — existe um projeto Vite separado em `dashboard/` no raiz que é incluído no tsconfig via glob `**/*.tsx`. `npm run build` falha por causa disso — é pré-existente, fora do escopo de runs de features. Usar `npx tsc --noEmit` + filtrar por `^src/` para validação limpa.
- **Supabase Auth + `public.users` são separados** — senhas ficam em `auth.users` (gerenciado pelo Supabase), perfil de negócio fica em `public.users`. Ao criar usuário, crie primeiro no Auth via `admin.auth.admin.createUser()` (precisa `SUPABASE_SERVICE_ROLE_KEY`), depois insira na tabela com o mesmo `id`. Faça rollback do Auth se o insert falhar.
- **Soft delete que invalida sessão de verdade** — além de `isActive=false` no DB, chame `admin.auth.admin.updateUserById(id, { ban_duration: "876000h" })` para matar sessões ativas. Reativar: `{ ban_duration: "none" }`.
- **Recuperação de senha via Supabase nativo + SMTP Resend** — não precisa criar tabela de tokens nem código de envio. Configure o SMTP do Resend no painel do Supabase (Authentication > Emails) e use `supabase.auth.resetPasswordForEmail(email, { redirectTo: SITE_URL + "/login/redefinir-senha" })`. Tokens vêm no hash da URL (`#access_token=...&refresh_token=...`), então na tela de reset use `supabase.auth.setSession()` no cliente. TTL default é 1h.
- **Anti-enumeração em "esqueci senha"** — `requestPasswordReset` sempre retorna `{ data: { sent: true }, error: null }`, mesmo se o email não existir ou o envio falhar. Log o erro internamente via `logActionError`, nunca exponha.
- **`z.input` vs `z.infer` em forms com react-hook-form** — quando o schema Zod tem `.transform()` (ex: `phone` optional que vira `undefined`), use `z.input<typeof schema>` como tipo do form, não `z.infer` (output). O react-hook-form vê o lado pré-transform. Exportar `CreateUserInput = z.input<...>` resolve incompatibilidade de `defaultValues` e `onSubmit`.
- **`radix-ui` umbrella package** — o projeto usa `import { DropdownMenu as DropdownMenuPrimitive } from "radix-ui"` (não `@radix-ui/react-dropdown-menu`). Seguir o padrão de `src/components/ui/dialog.tsx` ao criar novos wrappers shadcn-style.
- **Middleware gate** — `src/lib/supabase/middleware.ts` bloqueia não-logados de tudo que não é `/login` ou `/auth`, e devolve logados tentando acessar `/login` para `/`. Exceção crítica: `/login/redefinir-senha` é permitido em ambos os estados (primeiro acesso precisa acessar mesmo logado).
- **Primeiro acesso (`mustChangePassword`)** — flag na tabela `users`. `signIn` retorna `mustChangePassword` no `ActionResult.data`, o `login-form` redireciona para `/login/redefinir-senha?first=true`, que renderiza a mesma tela de reset sem precisar de token (usa a sessão do próprio login). Após salvar, `updatePasswordWithToken` zera a flag e desloga.
