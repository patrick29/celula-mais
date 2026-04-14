# Plano Técnico — Autenticação e Gerenciamento de Usuário

## Stack afetada

- **Next.js 16.1.6 (App Router)** + React 19 + TypeScript strict
- **Supabase Auth** via `@supabase/ssr` (já instalado, cliente existente em `src/lib/supabase/{client,server,middleware}.ts`)
- **Drizzle ORM 0.45** + PostgreSQL (schema em `src/lib/db/schema.ts`, migrations em `src/lib/db/migrations/` — última sequência é `0009_confused_maddog.sql`)
- **Zod 4** para validação de server actions
- **react-hook-form 7** + `@hookform/resolvers` (já presente no `package.json` e já usado nos forms existentes)
- **Shadcn UI** em `src/components/ui/` (componentes já instalados: button, input, label, card, dialog, select, checkbox, badge, skeleton, separator, sheet, sonner, textarea)
- **Sonner / toast** via `@/lib/toast` — já mountado em `src/app/(dashboard)/layout.tsx`
- **Resend** (`resend` package) — **A INSTALAR** para envio de emails transacionais
- **Shadcn `dropdown-menu`** — **A INSTALAR** via `npx shadcn@latest add dropdown-menu` (necessário para o `<UserMenu>` do header)

Nenhuma mudança em React, Tailwind, ESLint ou Next.js.

---

## Modelo de dados

### Alteração 1 — Tabela `users`: remover obrigatoriedade de `passwordHash` e adicionar campos operacionais

O Supabase Auth (em `auth.users`) é a fonte única de verdade para senhas. A tabela `public.users` passa a ser apenas o perfil de negócio ligado ao `auth.users.id` via mesmo UUID.

```sql
-- Drizzle migration: 0010_auth_profile_sync.sql

-- 1) Remove NOT NULL do password_hash (campo fica legado, não é mais populado em novos cadastros).
--    [DECISÃO HUMANA] — manter a coluna "por enquanto" ou dropar imediatamente?
--    Recomendação: deixar legada por 1 ciclo para não quebrar dados já migrados.
ALTER TABLE "users" ALTER COLUMN "password_hash" DROP NOT NULL;

-- 2) Adiciona flag de usuário ativo (soft delete).
ALTER TABLE "users" ADD COLUMN "is_active" boolean NOT NULL DEFAULT true;

-- 3) Adiciona flag para forçar troca de senha no primeiro acesso.
ALTER TABLE "users" ADD COLUMN "must_change_password" boolean NOT NULL DEFAULT false;

-- 4) Adiciona timestamp do último login (atualizado pelo login action — não por trigger).
ALTER TABLE "users" ADD COLUMN "last_login_at" timestamptz;

-- 5) Índice parcial para listagens de ativos.
CREATE INDEX "idx_users_active" ON "users" ("church_id") WHERE "is_active" = true;
```

**Migration destrutiva?** ❌ **Não.** Apenas `DROP NOT NULL` + `ADD COLUMN` com default seguro. Rollback trivial: reverter alterações.

**Arquivo a criar:**
- `src/lib/db/migrations/0010_auth_profile_sync.sql` (conteúdo acima)
- `src/lib/db/migrations/meta/_journal.json` — atualizar (gerado pelo `drizzle-kit generate`)

**Arquivo a editar:**
- `src/lib/db/schema.ts` — na definição de `users`:
  - `passwordHash: text("password_hash")` (sem `.notNull()`)
  - Adicionar `isActive: boolean("is_active").notNull().default(true)`
  - Adicionar `mustChangePassword: boolean("must_change_password").notNull().default(false)`
  - Adicionar `lastLoginAt: timestamp("last_login_at", { withTimezone: true })`

### Alteração 2 — Recuperação de senha: **usar fluxo nativo do Supabase**

**Decisão arquitetural** `[DECISÃO HUMANA]` — **recomendo usar o fluxo nativo do Supabase Auth** (`supabase.auth.resetPasswordForEmail`) em vez de criar tabela própria de `password_reset_tokens`.

Motivos:
1. Supabase já gera token, valida TTL (padrão 1h) e invalida após uso — código que não precisamos escrever e manter.
2. Segurança de armazenamento de token (hash, expiração, uso único) já é feita pelo Supabase.
3. A única desvantagem é que o email padrão do Supabase cai em spam. **Solução:** trocar o SMTP do Supabase para **Resend** no painel do projeto Supabase (Settings → Auth → SMTP Settings), apontando para `smtp.resend.com` com as credenciais do Resend. Isso mantém o token do Supabase mas com entrega via Resend.

Se preferirmos controle total dos templates e o painel do Supabase não permitir personalização suficiente, existe o plano B: criar tabela `password_reset_tokens` nossa e mandar email direto pelo pacote `resend` em código. **Este plano contempla o plano A (Supabase nativo + Resend SMTP).** Se o usuário aprovar o plano B no checkpoint, eu refaço a migration.

**Sem tabela nova** no plano A.

---

## API (Server Actions)

Todas seguem o shape `ActionResult<T> = { data: T; error: null } | { data: null; error: string }` já usado no projeto (ver `src/lib/actions/result.ts`). Todas usam `userError("msg PT-BR")` para mensagens amigáveis ao usuário e `toActionError` para fallback seguro. Todas fazem `logActionError` em catch.

### Arquivo novo: `src/actions/auth.ts`

- **`signIn(input)`**
  - Validação Zod: `z.object({ email: z.string().email(), password: z.string().min(1) })`
  - Permissão: pública (sem sessão).
  - Comportamento:
    1. `supabase.auth.signInWithPassword({ email, password })`
    2. Se erro do Supabase → retornar `{ data: null, error: "Email ou senha inválidos" }` (mensagem genérica para não vazar qual dos dois errou).
    3. Buscar `dbUser` em `users` por `id = authUser.id`.
    4. Se `isActive === false` → `supabase.auth.signOut()` e retornar `{ data: null, error: "Sua conta está desativada. Fale com o administrador." }`.
    5. `db.update(users).set({ lastLoginAt: new Date() }).where(eq(users.id, authUser.id))`.
    6. Retornar `{ data: { mustChangePassword: dbUser.mustChangePassword }, error: null }` — o client decide o redirect.

- **`signOut()`**
  - Validação Zod: nenhuma.
  - Permissão: autenticado.
  - Comportamento:
    1. `supabase.auth.signOut()`
    2. `revalidatePath("/", "layout")`
    3. `redirect("/login")` (import de `next/navigation`)

- **`requestPasswordReset(input)`**
  - Validação Zod: `z.object({ email: z.string().email() })`
  - Permissão: pública.
  - Comportamento:
    1. Chamar `supabase.auth.resetPasswordForEmail(email, { redirectTo: ${SITE_URL}/login/redefinir-senha })`.
    2. **Sempre retornar sucesso**, independente do email existir, para não vazar emails cadastrados. Erro real só é logado internamente.
    3. Retornar `{ data: { sent: true }, error: null }`.

- **`updatePasswordWithToken(input)`**
  - Validação Zod: `z.object({ password: z.string().min(8).regex(/[a-zA-Z]/).regex(/[0-9]/) })`
  - Permissão: sessão de recovery do Supabase (cliente foi autenticado ao clicar no link do email).
  - Comportamento:
    1. `supabase.auth.updateUser({ password })` — só funciona se a sessão atual vier do fluxo de recovery.
    2. Se sucesso, `supabase.auth.signOut()` (forçar novo login com a senha nova) e `db.update(users).set({ mustChangePassword: false }).where(eq(users.id, authUser.id))`.
    3. Retornar `{ data: { ok: true }, error: null }`.

- **`changeOwnPassword(input)`** (usado no fluxo "primeiro acesso / `mustChangePassword`" e em troca voluntária futura)
  - Validação Zod: `z.object({ currentPassword: z.string().min(1), newPassword: z.string().min(8).regex(/[a-zA-Z]/).regex(/[0-9]/) })`
  - Permissão: autenticado.
  - Comportamento:
    1. Verificar senha atual com `supabase.auth.signInWithPassword({ email: currentUser.email, password: currentPassword })` — se falhar, `userError("Senha atual incorreta")`.
    2. `supabase.auth.updateUser({ password: newPassword })`.
    3. Atualizar `users.mustChangePassword = false`.
    4. Retornar `{ data: { ok: true }, error: null }`.

### Arquivo novo: `src/actions/users.ts`

Helper interno em `src/lib/auth-context.ts` (alteração): adicionar `requireRole(roles: UserRole[])` que chama `getAuthUserContext()` e lança `userError("Você não tem permissão para acessar esta área.")` se `dbUser.role` não estiver no array.

- **`listUsers(params)`**
  - Validação Zod: `z.object({ search: z.string().optional(), role: z.enum([...]).optional(), status: z.enum(["all","active","inactive"]).optional() })`
  - Permissão: `requireRole(["ADMIN","PASTOR"])`
  - Comportamento:
    1. Query em `users` com `eq(users.churchId, dbUser.churchId)` + filtros dinâmicos (search por `ilike` em `fullName` OR `email`, role por `eq`, status por `eq(users.isActive, ...)`).
    2. `leftJoin` com `users` (self-join para nome do supervisor).
    3. Ordenar por `fullName`.
    4. Retornar `{ data: userList, error: null }`.

- **`createUser(input)`**
  - Validação Zod:
    ```ts
    z.object({
      fullName: z.string().min(3).max(120),
      email: z.string().email(),
      phone: z.string().optional().nullable(),
      role: z.enum(["ADMIN","PASTOR","SUPERVISOR","LEADER","ASSISTANT"]),
      supervisorId: z.string().uuid().optional().nullable(),
      initialPassword: z.string().min(8).regex(/[a-zA-Z]/).regex(/[0-9]/),
      mustChangePassword: z.boolean().default(true),
    })
    ```
  - Permissão: `requireRole(["ADMIN","PASTOR"])`
  - Comportamento:
    1. Verificar email único no `users` da mesma `churchId` antes de chamar Supabase (fail-fast com `userError("Este email já está cadastrado.")`).
    2. Criar o `auth.users` via **Supabase Admin API** (`supabase.auth.admin.createUser`) — requer `SUPABASE_SERVICE_ROLE_KEY` e um client separado criado com `createAdminClient()` (**a criar** em `src/lib/supabase/admin.ts`).
       ```ts
       const { data, error } = await admin.auth.admin.createUser({
         email, password: initialPassword, email_confirm: true,
       });
       ```
    3. Com o `auth.users.id` retornado, `db.insert(users).values({ id: authUser.id, fullName, email, phone, role, churchId: currentUser.churchId, supervisorId, mustChangePassword, isActive: true })`.
    4. Se o insert falhar, fazer rollback via `admin.auth.admin.deleteUser(authUser.id)` — para evitar usuário órfão no Supabase Auth.
    5. `revalidatePath("/settings/usuarios")`.
    6. Retornar `{ data: newUser, error: null }`.

- **`updateUser(id, input)`**
  - Validação Zod: mesmo do create sem `initialPassword` e sem `mustChangePassword`, com `id: z.string().uuid()`.
  - Permissão: `requireRole(["ADMIN","PASTOR"])`
  - Comportamento:
    1. Garantir que o usuário alvo pertence à mesma `churchId` do admin.
    2. `db.update(users).set({ fullName, phone, role, supervisorId }).where(and(eq(users.id, id), eq(users.churchId, ctx.churchId))).returning()`.
    3. `revalidatePath("/settings/usuarios")`.
    4. Retornar usuário atualizado.

- **`setUserActive(id, isActive)`**
  - Validação Zod: `z.object({ id: z.string().uuid(), isActive: z.boolean() })`
  - Permissão: `requireRole(["ADMIN","PASTOR"])`
  - Comportamento:
    1. Bloquear se `id === currentUser.id` → `userError("Você não pode desativar a si mesmo.")`.
    2. Atualizar `isActive` na tabela.
    3. Quando `isActive === false`, também invalidar todas as sessões ativas do usuário via `admin.auth.admin.signOut(id)` (ou equivalente — Supabase tem `admin.auth.admin.deleteUser({revoke: true})` mas isso apaga o auth; usar `admin.auth.admin.updateUserById(id, { banned_until: "infinity" })` como fallback seguro).
    4. `revalidatePath("/settings/usuarios")`.

- **`resendPasswordReset(userId)`** — atalho para admin disparar reset pela listagem.
  - Validação Zod: `z.object({ userId: z.string().uuid() })`
  - Permissão: `requireRole(["ADMIN","PASTOR"])`
  - Comportamento: busca email do usuário e chama `requestPasswordReset({ email })`.

### Alteração: `src/lib/auth-context.ts` — **remover fallback hardcoded**

1. Remover as linhas 21-30 que retornam o primeiro usuário do DB como fallback.
2. Substituir por `throw userError("Sua sessão expirou. Entre novamente.")` — o `error.tsx` do dashboard exibe a mensagem e o middleware redireciona no próximo request.
3. Adicionar `requireRole(allowed: UserRole[])` exportada:
   ```ts
   export async function requireRole(allowed: UserRole[]) {
     const ctx = await getAuthUserContext();
     if (!allowed.includes(ctx.dbUser.role)) {
       userError("Você não tem permissão para acessar esta área.");
     }
     return ctx;
   }
   ```

---

## Componentes

### Criar

#### Rotas `(auth)`

- **`src/app/(auth)/layout.tsx`** — `<AuthLayout>` client-free wrapper com logo + card centralizado, largura máx 400px, fundo `bg-slate-50`. Aplica a todas as telas de auth.
- **`src/app/(auth)/login/page.tsx`** — server component que, se já houver sessão, redireciona para `/`; senão renderiza `<LoginForm>`.
- **`src/app/(auth)/login/login-form.tsx`** — client component com `useForm` + zod (schema `z.object({email, password})`), chama `signIn` action, trata erro com toast, redireciona para `/` ou `/login/redefinir-senha?first=true` baseado em `mustChangePassword`.
- **`src/app/(auth)/login/esqueci-senha/page.tsx`** — server component que renderiza `<ForgotPasswordForm>`.
- **`src/app/(auth)/login/esqueci-senha/forgot-password-form.tsx`** — client component com 2 estados: formulário e confirmação genérica. Chama `requestPasswordReset`.
- **`src/app/(auth)/login/redefinir-senha/page.tsx`** — server component. Lê `searchParams.first` e `searchParams.token` (quando presente, Supabase já consumiu via URL fragment). Renderiza `<ResetPasswordForm>`.
- **`src/app/(auth)/login/redefinir-senha/reset-password-form.tsx`** — client component. Ao montar, lê `access_token` e `refresh_token` do hash da URL (padrão do Supabase) e chama `supabase.auth.setSession(...)` no cliente para estabelecer sessão de recovery. Depois mostra o formulário com `<PasswordRequirements>`. Submit chama `updatePasswordWithToken`. Em caso de `first=true`, esconde o aviso de token inválido (foi autenticação normal).

#### Rotas `(dashboard)/settings/usuarios`

- **`src/app/(dashboard)/settings/layout.tsx`** — se ainda não existir, layout simples com breadcrumb; ou reusar o dashboard layout direto.
- **`src/app/(dashboard)/settings/usuarios/page.tsx`** — server component. Chama `requireRole(["ADMIN","PASTOR"])` e `listUsers()`, passa para `<UsersTable>`.
- **`src/app/(dashboard)/settings/usuarios/components/users-table.tsx`** — client component com `<Input>` de busca, 2 `<Select>` de filtro, tabela, menu de ações `…` (reusar padrão de `src/app/(dashboard)/cells/components/cell-groups-table.tsx` para consistência).
- **`src/app/(dashboard)/settings/usuarios/components/user-form-dialog.tsx`** — `<Dialog>` com `<UserForm>` dentro, props `mode: "create" | "edit"` e `user?: User`. Controla abertura via props.
- **`src/app/(dashboard)/settings/usuarios/components/user-form.tsx`** — `react-hook-form` com schema Zod idêntico ao server (fonte única em `src/app/(dashboard)/settings/usuarios/schemas.ts`). Campos condicionais (senha só no `create`, supervisor só se não for ADMIN/PASTOR). Chama `createUser` ou `updateUser`.
- **`src/app/(dashboard)/settings/usuarios/components/deactivate-user-dialog.tsx`** — `<Dialog>` de confirmação com botão destrutivo. Chama `setUserActive(id, false)`.
- **`src/app/(dashboard)/settings/usuarios/schemas.ts`** — schemas Zod compartilhados entre client form e server action.

#### Primitivas reutilizáveis

- **`src/components/ui/password-input.tsx`** — wrapper sobre `<Input type="password">` com botão de olho (Lucide `<Eye>` / `<EyeOff>`). Props idênticas a `<Input>`.
- **`src/components/auth/password-requirements.tsx`** — checklist visual. Props: `value: string`. Lógica: `hasMinLength`, `hasLetter`, `hasNumber`. Render de 3 linhas com ícone check + texto.
- **`src/components/users/user-role-badge.tsx`** — `<Badge>` pré-estilizado por papel.
- **`src/components/layout/user-menu.tsx`** — dropdown usando `<DropdownMenu>` do shadcn (a instalar). Server component que recebe `user: { fullName, email, role }` como prop e contém botão de sair como form action.

#### Infra auxiliar

- **`src/lib/supabase/admin.ts`** — `createAdminClient()` que retorna um `supabase-js` client usando `SUPABASE_SERVICE_ROLE_KEY` (server-side only; NUNCA importar em client component). **Comentário explícito no topo:** "NEVER import this in a client component".
- **`src/lib/env.ts`** (se ainda não existir — criar) — export e validação de env vars obrigatórias com Zod: `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`, `SUPABASE_SERVICE_ROLE_KEY`, `NEXT_PUBLIC_SITE_URL`. Falhar fast no boot se faltar.

### Editar

- **`src/middleware.ts` / `src/lib/supabase/middleware.ts`** — **ativar o gating**:
  - Descomentar o bloco do redirect (linhas 38-49 em `src/lib/supabase/middleware.ts`).
  - Ajustar condição para:
    - Rotas `(auth)` (path começa com `/login`) → se **usuário logado**, redirecionar para `/`.
    - Qualquer outra rota → se **não logado**, redirecionar para `/login`.
  - Exceção: quando `pathname === "/login/redefinir-senha"` **NÃO** redirecionar se logado — o Supabase cria sessão temporária ao clicar no link.
- **`src/app/(dashboard)/layout.tsx`** — transformar em `async` server component. Chamar `getAuthUserContext()` e passar `dbUser` como prop para `<Header>` (server component que renderiza `<UserMenu>` com os dados reais).
- **`src/components/layout/Header.tsx`** — aceitar prop `user: { fullName: string; email: string; role: UserRole }`, substituir bloco hardcoded "Admin Silva" por `<UserMenu user={user} />`.
- **`src/components/layout/Sidebar.tsx`** — adicionar item "Configurações" apontando para `/settings` com ícone `Settings` (já importado). Já existe `route.label = "Relatórios"` como referência de estilo.
- **`src/lib/db/schema.ts`** — alterações listadas em "Modelo de dados".
- **`src/lib/auth-context.ts`** — remover fallback + adicionar `requireRole`.
- **`package.json`** — dependência nova: `resend` (apenas para envio transacional **se** for plano B; no plano A, o SMTP é configurado no painel Supabase, sem dep nova). `[DECISÃO HUMANA]` captura essa bifurcação.
- **`.env.local` / `.env.example`** — adicionar `SUPABASE_SERVICE_ROLE_KEY=` e `NEXT_PUBLIC_SITE_URL=http://localhost:3000`.

---

## Passo a passo

1. **Migration + schema** — editar `src/lib/db/schema.ts` (adicionar campos, relaxar `passwordHash`). Rodar `npm run db:generate` para gerar `0010_*.sql` e `npm run db:migrate` para aplicar.
2. **Env vars** — criar `src/lib/env.ts` com validação Zod. Adicionar `SUPABASE_SERVICE_ROLE_KEY` e `NEXT_PUBLIC_SITE_URL` em `.env.local` (Patrick deve setar os valores reais antes de rodar) e em `.env.example`.
3. **Supabase admin client** — criar `src/lib/supabase/admin.ts` com `createAdminClient()` usando service role.
4. **`requireRole` helper** — adicionar em `src/lib/auth-context.ts`. **Remover fallback hardcoded** (linhas 21-30).
5. **Instalar shadcn `dropdown-menu`** — `npx shadcn@latest add dropdown-menu` → `src/components/ui/dropdown-menu.tsx`.
6. **Primitivas de auth UI** — criar `password-input.tsx`, `password-requirements.tsx`, `user-role-badge.tsx`.
7. **Server actions de auth** — criar `src/actions/auth.ts` com `signIn`, `signOut`, `requestPasswordReset`, `updatePasswordWithToken`, `changeOwnPassword`.
8. **Rotas (auth)** — criar layout, login, esqueci-senha, redefinir-senha (páginas + forms).
9. **Ativar middleware** — editar `src/lib/supabase/middleware.ts` para descomentar e ajustar o redirect conforme regras descritas.
10. **Seed/smoke** — rodar `npm run dev`, acessar `/login`, testar login com um usuário seed (Patrick precisa ter 1 usuário admin criado manualmente no painel Supabase + linha correspondente na tabela `users`). **[DECISÃO HUMANA]** — existe algum script de seed? Se não, documentar no README como criar o admin inicial.
11. **`src/app/(dashboard)/layout.tsx` server-side** — transformar em async, buscar `dbUser`, passar para Header.
12. **Header + UserMenu** — editar Header para aceitar prop, criar `user-menu.tsx` com dropdown + form action de logout.
13. **Server actions de users** — criar `src/actions/users.ts` com `listUsers`, `createUser`, `updateUser`, `setUserActive`, `resendPasswordReset`.
14. **Tela de CRUD** — criar página `/settings/usuarios` + `users-table.tsx` + `user-form-dialog.tsx` + `user-form.tsx` + `deactivate-user-dialog.tsx` + `schemas.ts`.
15. **Sidebar** — adicionar item "Configurações" apontando para `/settings/usuarios`.
16. **Proteção no servidor** — garantir que `requireRole(["ADMIN","PASTOR"])` é chamado tanto na `page.tsx` quanto em cada server action de `users.ts`.
17. **Configurar SMTP Resend no Supabase** (manual, via painel) — Patrick precisa provisionar conta Resend, copiar chave SMTP, colar em Supabase → Settings → Auth → SMTP Settings. **[DECISÃO HUMANA]**: Patrick confirma se segue plano A (SMTP via Supabase) ou plano B (enviar via pacote `resend` em código + tabela própria de tokens).
18. **Smoke manual** — happy paths: login/logout, recuperar senha (com link real no email), criar usuário, editar, desativar, tentativa de acesso com `LEADER` a `/settings/usuarios` (deve ser redirecionada/403), sessão expirada.
19. **Typecheck** — `npx tsc --noEmit` filtrando por `^src/` (conforme memória da squad — `dashboard/` raiz quebra o build por motivo pré-existente).

---

## Riscos e trade-offs

- **Risco: remover fallback do `getAuthUserContext` quebra dev sem usuário logado.**
  Mitigação: fallback foi uma muleta de dev. Agora é obrigatório ter pelo menos um admin criado no Supabase Auth **e** na tabela `users` com o mesmo UUID. Documentar no README como criar o admin inicial via painel Supabase (copiar UUID do `auth.users` e inserir a linha em `public.users`).

- **Risco: conflito de sessão entre recovery e sessão normal.**
  O fluxo de reset do Supabase cria uma sessão "de recovery" no client após clicar no link. Se o usuário já estiver logado com outra conta, pode haver confusão. Mitigação: na tela de `redefinir-senha`, fazer `signOut()` antes de `setSession()` com os tokens do hash.

- **Risco: `SUPABASE_SERVICE_ROLE_KEY` vazando para o client.**
  Mitigação: criar `src/lib/supabase/admin.ts` com comentário no topo "NEVER IMPORT IN CLIENT" e uso exclusivo dentro de `"use server"` actions. Não exportar nenhum símbolo desse arquivo via `index.ts` de `lib/supabase/`.

- **Risco: email de reset caindo em spam.**
  Mitigação primária: trocar SMTP do Supabase para Resend (plano A). Se o usuário abrir um ticket de "não recebi o email", verificar primeiro se o SMTP foi provisionado.

- **Risco: `passwordHash` continua obrigatório em seeds antigos.**
  Mitigação: `DROP NOT NULL` na migration. Código novo **não** lê nem escreve essa coluna.

- **Risco: `admin.auth.admin.deleteUser` em rollback de `createUser` falha.**
  Mitigação: se o delete do auth também falhar, logar agressivamente (`logActionError`) e retornar erro amigável. Caso residual de "usuário órfão no auth" resolve-se no Supabase dashboard manualmente — aceitável dada a raridade.

- **Trade-off: usar Supabase nativo vs tabela própria de tokens.**
  Escolhi nativo (plano A) porque é menos código para manter, usa infraestrutura testada e é rápido de entregar (objetivo minimum-viable). Contra: menos controle sobre template do email. A decisão vai ao checkpoint para Patrick confirmar.

- **Trade-off: `admin.createUser` + insert na `users` sem transação real.**
  Supabase Auth e o Postgres da aplicação são "bancos" separados. Não dá pra envolver numa `BEGIN ... COMMIT` única. Escolhi o padrão **create-in-auth → insert-in-db → rollback-auth-if-db-fails**. Alternativa descartada: criar apenas no `users` e deixar o auth para o primeiro login — quebra porque Supabase não aceita `signIn` sem `auth.users` existente.

- **Trade-off: UserMenu como server component que recebe prop.**
  Alternativa seria client component que busca o user via `createClient()` do browser. Escolhi server component porque o dashboard layout já vai pagar o custo de `getAuthUserContext()` — reusar o dado via prop é mais simples e não introduz uma fonte extra de verdade.

- **Decisão que precisa input humano:**
  1. **`[DECISÃO HUMANA]` Plano A (Supabase SMTP via Resend) ou Plano B (pacote `resend` + tabela própria de tokens)?** Recomendo A.
  2. **`[DECISÃO HUMANA]` Manter a coluna `password_hash` legada na tabela `users` por 1 ciclo, ou dropar agora?** Recomendo manter (reversível) e remover em um PR futuro só de limpeza.
  3. **`[DECISÃO HUMANA]` Já existe um script de seed para criar o admin inicial, ou Patrick cria manualmente no painel do Supabase antes do primeiro deploy?** Precisa de resposta antes do step 5 rodar para o dev não ficar bloqueado.
  4. **`[DECISÃO HUMANA]` `ADMIN` e `PASTOR` têm os mesmos direitos sobre `/settings/usuarios`?** Assumi que sim. Se houver distinção, preciso atualizar o `requireRole` e os testes de permissão.
