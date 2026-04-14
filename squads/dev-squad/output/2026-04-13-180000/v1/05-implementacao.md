# 05 — Implementação

**Entregue por:** Felipe Fullstack
**Data:** 2026-04-13
**Baseado em:** `03-plano-tecnico.md`, `04-aprovacao-plano.md`

---

## Resumo

Camada de autenticação (login, logout, recuperação de senha, primeiro acesso obrigatório) e CRUD de usuários (ADMIN-only) implementada. Supabase Auth nativo com SMTP Resend, tabela `public.users` sincronizada via Admin API, soft delete com invalidação de sessão, proteção de rota por middleware.

---

## Escopo entregue

### 1. Banco de dados

**Migration `0010_auth_profile_sync.sql`** (manual, `_journal.json` atualizado)

- `users.password_hash` agora é nullable (senha mora no Supabase Auth)
- Novas colunas em `users`:
  - `is_active boolean NOT NULL DEFAULT true`
  - `must_change_password boolean NOT NULL DEFAULT false`
  - `last_login_at timestamptz`
- Novo índice `idx_users_active` em `(church_id, is_active)`

Schema Drizzle em [src/lib/db/schema.ts](../../../../src/lib/db/schema.ts) refletindo tudo acima.

### 2. Fundação

- [src/lib/env.ts](../../../../src/lib/env.ts) — validação Zod das envs (`DATABASE_URL`, `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`, `SUPABASE_SERVICE_ROLE_KEY`, `NEXT_PUBLIC_SITE_URL`).
- [src/lib/supabase/admin.ts](../../../../src/lib/supabase/admin.ts) — cliente Supabase com service role (`server-only`).
- [src/lib/auth-context.ts](../../../../src/lib/auth-context.ts) — `getAuthUserContext()` cacheado + `requireRole()`, desloga automaticamente usuário inativo.
- [src/lib/supabase/middleware.ts](../../../../src/lib/supabase/middleware.ts) — gate ativado: não logado → `/login`; logado em `/login/*` → `/` (exceção: `/login/redefinir-senha`).

### 3. Actions

**Auth** — [src/actions/auth.ts](../../../../src/actions/auth.ts)
- `signIn({email, password})` — valida credenciais, checa `isActive`, atualiza `lastLoginAt`, retorna `mustChangePassword`.
- `signOut()` — desloga e redireciona para `/login`.
- `requestPasswordReset({email})` — dispara email via Supabase, sempre retorna sucesso (proteção anti-enumeração).
- `updatePasswordWithToken({password})` — atualiza senha com sessão de recuperação, zera `mustChangePassword`, desloga.
- `changeOwnPassword({currentPassword, newPassword})` — verifica senha atual, atualiza, zera `mustChangePassword`.

**Users (ADMIN-only)** — [src/actions/users.ts](../../../../src/actions/users.ts)
- `listUsers({search, role, status})` — self-join com supervisores, retorna `UserListItem[]`.
- `createUser(input)` — cria em Supabase Auth via admin + insere em `public.users` com mesmo ID; rollback de Auth se insert falhar.
- `updateUser(input)` — atualiza `fullName`, `phone`, `role`, `supervisorId`. Email e senha não são alteráveis aqui.
- `setUserActive({id, isActive})` — soft delete; bloqueia autodeativação; usa `admin.updateUserById(id, { ban_duration })` para invalidar sessões (`"876000h"` desativar, `"none"` reativar).
- `resendPasswordResetForUser(userId)` — busca email e aciona `requestPasswordReset`.
- `getSupervisorOptions()` — lista ADMIN/PASTOR/SUPERVISOR ativos.

### 4. Componentes compartilhados

- [src/components/ui/password-input.tsx](../../../../src/components/ui/password-input.tsx) — Input com toggle olho.
- [src/components/ui/dropdown-menu.tsx](../../../../src/components/ui/dropdown-menu.tsx) — wrapper shadcn do radix-ui DropdownMenu.
- [src/components/auth/password-requirements.tsx](../../../../src/components/auth/password-requirements.tsx) — `validatePassword`, `isValidPassword`, `<PasswordRequirements>` com checklist visual (8+ caracteres, letra, número).
- [src/components/users/user-role-badge.tsx](../../../../src/components/users/user-role-badge.tsx) — badge + `roleLabel()` com cores por perfil.
- [src/components/layout/user-menu.tsx](../../../../src/components/layout/user-menu.tsx) — avatar com dropdown e ação de logout.

### 5. Fluxo público de autenticação

- [src/app/(auth)/layout.tsx](../../../../src/app/<auth>/layout.tsx) — layout centralizado com logo.
- [src/app/(auth)/login/page.tsx](../../../../src/app/<auth>/login/page.tsx) + [login-form.tsx](../../../../src/app/<auth>/login/login-form.tsx) — formulário com react-hook-form, toast de sessão expirada, redireciona para `/login/redefinir-senha?first=true` se `mustChangePassword`.
- [src/app/(auth)/login/esqueci-senha/page.tsx](../../../../src/app/<auth>/login/esqueci-senha/page.tsx) + [forgot-password-form.tsx](../../../../src/app/<auth>/login/esqueci-senha/forgot-password-form.tsx) — tela de solicitação com estado de confirmação.
- [src/app/(auth)/login/redefinir-senha/page.tsx](../../../../src/app/<auth>/login/redefinir-senha/page.tsx) + [reset-password-form.tsx](../../../../src/app/<auth>/login/redefinir-senha/reset-password-form.tsx) — parser de hash do Supabase, `setSession` no cliente, state machine `loading | ready | invalid`; modo `first=true` para primeiro acesso.

### 6. CRUD de usuários (ADMIN)

- [src/app/(dashboard)/settings/usuarios/schemas.ts](../../../../src/app/<dashboard>/settings/usuarios/schemas.ts) — schemas Zod compartilhados (`createUserSchema`, `updateUserSchema`, `listUsersSchema`, `setUserActiveSchema`, `passwordSchema`). Types exportados como `z.input` para compatibilidade com react-hook-form.
- [src/app/(dashboard)/settings/usuarios/page.tsx](../../../../src/app/<dashboard>/settings/usuarios/page.tsx) — server component com `requireRole(["ADMIN"])` + `Promise.all` de `listUsers` e `getSupervisorOptions`.
- [components/users-page-client.tsx](../../../../src/app/<dashboard>/settings/usuarios/components/users-page-client.tsx) — state de diálogos + handlers de reset/reativação com `useTransition`.
- [components/users-table.tsx](../../../../src/app/<dashboard>/settings/usuarios/components/users-table.tsx) — tabela com busca client-side, filtros (perfil, status), menu de ações por linha (editar / link de nova senha / desativar / reativar), estado vazio convidando primeiro cadastro.
- [components/user-form-dialog.tsx](../../../../src/app/<dashboard>/settings/usuarios/components/user-form-dialog.tsx) — wrapper de `<Dialog>`.
- [components/user-form.tsx](../../../../src/app/<dashboard>/settings/usuarios/components/user-form.tsx) — formulário `create` e `edit` com react-hook-form, campo de supervisor condicional (LEADER/ASSISTANT), checklist de senha ao vivo, botão bloqueado até senha válida.
- [components/deactivate-user-dialog.tsx](../../../../src/app/<dashboard>/settings/usuarios/components/deactivate-user-dialog.tsx) — confirmação modal destrutiva com aviso de sessões ativas.

### 7. Dashboard layout

- [src/app/(dashboard)/layout.tsx](../../../../src/app/<dashboard>/layout.tsx) — agora é async, chama `getAuthUserContext`, redireciona para `/login` se falhar e para `/login/redefinir-senha?first=true` se `mustChangePassword`, passa user para Header e role para Sidebar.
- [src/components/layout/Header.tsx](../../../../src/components/layout/Header.tsx) — recebe `user` e substitui "Admin Silva" hardcoded por `<UserMenu>`.
- [src/components/layout/Sidebar.tsx](../../../../src/components/layout/Sidebar.tsx) — recebe `role`, item "Configurações" aponta para `/settings/usuarios` quando ADMIN, caso contrário `/settings`; active state cobre todo `/settings/*`.

---

## Decisões técnicas aplicadas (conforme checkpoint)

- **Plano A (Supabase nativo + SMTP Resend)** — sem token custom, sem tabela extra.
- **Admin seed manual** — nenhum script de seed; ADMIN será criado pelo Patrick no painel do Supabase.
- **Somente ADMIN** pode gerenciar usuários — PASTOR não tem acesso ao CRUD por ora.
- **Soft delete** via `isActive` + ban no Supabase Auth (`876000h`).
- **Autodeativação bloqueada** no `setUserActive`.
- **Rollback de criação:** se o insert em `public.users` falhar, o usuário é removido do Supabase Auth.

---

## Como testar (caminho feliz)

Pré-requisito: criar manualmente no painel do Supabase um usuário ADMIN com email confirmado, depois inserir a linha correspondente em `public.users` com `is_active=true`, `must_change_password=false`, `role='ADMIN'` e o `id` igual ao do Auth.

1. `npx drizzle-kit migrate` — aplica `0010_auth_profile_sync`.
2. Configurar envs: `SUPABASE_SERVICE_ROLE_KEY`, `NEXT_PUBLIC_SITE_URL` (http://localhost:3000), demais já existentes.
3. Configurar SMTP Resend no Auth > Email Templates do Supabase.
4. `npm run dev`.
5. Acessar `/` → deve redirecionar para `/login`.
6. Login com ADMIN → cai em `/`.
7. Ir em Configurações → ver lista de usuários.
8. Criar novo usuário LEADER com supervisor → aparece na tabela, `mustChangePassword=true`.
9. Logout, login com o novo LEADER → redireciona para `/login/redefinir-senha?first=true`.
10. Definir nova senha → volta para `/login`, logar com a senha nova → entra normalmente.
11. Como ADMIN, desativar um usuário → status muda para Inativo, ações trocam para "Reativar".
12. "Esqueci a senha" → recebe email do Resend com link válido por 1h.

---

## Riscos e follow-ups conhecidos

- **Rate limit do Resend** no pico: requestPasswordReset ignora erros silenciosamente; monitorar fila.
- **Middleware não diferencia rotas públicas futuras** (ex: landing). Se precisar, adicionar ao matcher.
- **`src/app/(dashboard)/settings/page.tsx`** ainda é o placeholder antigo; navegação ADMIN já aponta direto para `/settings/usuarios`.
- **`dashboard/src/`** (projeto Opensquad Office, fora do escopo) tem 38 erros de TS pré-existentes, não introduzidos por esta entrega.
- Nenhum teste automatizado; validação é manual e visual.

---

## Typecheck

`npx tsc --noEmit` está **limpo em `src/`**. Os 38 erros remanescentes pertencem a `dashboard/src/` (pré-existentes, fora do escopo).

Pronto para QA.
