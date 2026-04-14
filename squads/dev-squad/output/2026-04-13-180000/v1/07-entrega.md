# 07 — Entrega final

**Entregue por:** Pedro Produto
**Data:** 2026-04-13
**Demanda original:** "implemente a camada de autenticação e gerenciamento de usuário com CRUD e método de recuperação de senha"

---

## O que está pronto

A camada de autenticação e o CRUD de usuários do Célula Mais saíram do zero para um estado utilizável em produção (barra mínima viável, aprovada pelo QA).

**Autenticação** — login real com Supabase, logout, middleware efetivo bloqueando todo o `(dashboard)` para quem não está logado, gating de `/login/*` para quem já está (exceto o fluxo de recuperação), e primeiro acesso obrigando troca de senha.

**Recuperação de senha** — fluxo nativo do Supabase com SMTP Resend (configurado no painel, sem código custom), mensagem anti-enumeração na tela de pedido, parser de hash na tela de nova senha com estados loading/válido/inválido, token com TTL de 1h.

**CRUD de usuários (ADMIN-only)** — listagem com busca client-side, filtros por perfil e status, tabela com supervisor, último acesso e badge colorido de papel. Criação cria no Supabase Auth + `public.users` atomicamente (com rollback se qualquer lado falha). Edição permite nome/telefone/papel/supervisor. Desativação é soft delete com invalidação imediata de sessões abertas via `ban_duration` no Auth. Ação extra: reenvio de link de recuperação direto da tabela.

**UI/UX** — header mostra nome real (sem "Admin Silva" hardcoded), sidebar tem "Configurações" apontando para `/settings/usuarios` quando ADMIN, botão com initials + dropdown para logout, checklist visual de senha ao vivo em todos os formulários, confirmação modal antes de desativar, estados de vazio com CTA.

## Critérios de aceite

Todos os 5 user stories (US-01 a US-05) foram contemplados. QA mapeou 20 critérios de aceite contra o código e todos passaram. Nenhum bug crítico, alto ou médio. 4 observações registradas como follow-ups informacionais (detalhes em `06-qa.md`).

## O que mudou em relação ao plano

Nada de escopo. Dois ajustes técnicos menores:
- Tipos dos schemas Zod de usuário exportados como `z.input` em vez de `z.infer` para compatibilizar com react-hook-form (transform de campo `phone` opcional gerava incompatibilidade de tipo). Sem impacto funcional — o Zod ainda valida igual, só o TS fica feliz.
- QA manual dos itens que dependem de runtime (envio real de email, fluxo completo de login) ficou sob responsabilidade do Patrick, com passo-a-passo documentado.

## Decisões do checkpoint aplicadas

- **Plano A (Supabase nativo + SMTP Resend):** sem tabela custom de tokens, sem código de envio próprio.
- **Admin inicial criado manualmente no painel do Supabase:** nenhum script de seed.
- **Somente perfil ADMIN** gerencia usuários (PASTOR não entra ainda).

## O que o Patrick precisa fazer para rodar

1. Aplicar a migration `0010_auth_profile_sync.sql` (adiciona `is_active`, `must_change_password`, `last_login_at`, índice e torna `password_hash` nullable).
2. Configurar no `.env.local`:
   - `SUPABASE_SERVICE_ROLE_KEY` (necessário pro Admin API)
   - `NEXT_PUBLIC_SITE_URL=http://localhost:3000`
3. Configurar SMTP do Resend em Supabase > Authentication > Emails.
4. Criar o primeiro ADMIN manualmente no painel do Supabase:
   - Authentication > Users > Add user (com email confirmado)
   - Inserir linha correspondente em `public.users` com `id` = auth user id, `role='ADMIN'`, `is_active=true`, `must_change_password=false`, `church_id` da igreja existente.
5. `npm run dev` → `/` redireciona para `/login` → entra com o ADMIN criado → Configurações → gerencia usuários.

Passo-a-passo completo do caminho feliz (12 passos) está em `05-implementacao.md`.

## Riscos conhecidos

- **Rate limit do Resend** se houver pico de "esqueci senha". Monitorar fila do painel.
- **`src/app/(dashboard)/settings/page.tsx`** continua sendo um placeholder antigo — ADMIN é levado direto para `/settings/usuarios`, mas deep-links em `/settings` mostram tela vazia. Cosmético.
- **`dashboard/src/`** (projeto Opensquad Office, fora do escopo) tem 38 erros de TypeScript pré-existentes. Não foram introduzidos nesta entrega e não afetam o build do Célula Mais.

## Próximos passos que o time pode sugerir

Nada obrigatório. Candidatos naturais de próximo sprint:
- **Trocar própria senha logado** (`/settings/minha-conta`) — action `changeOwnPassword` já existe, falta só a tela.
- **Auditoria de ações por usuário** (logar quem criou/editou/desativou quem).
- **Bloqueio após N tentativas falhas** de login (pendurar no middleware ou na action).
- **Convite por email** em vez de senha inicial manual.
- **Abrir o CRUD para PASTOR** quando o modelo de permissão evoluir.

---

## Artefatos desta rodada

- `v1/01-requisitos.md` — requisitos PM
- `v1/02-ux-spec.md` — especificação UX
- `v1/03-plano-tecnico.md` — plano técnico
- `04-aprovacao-plano.md` — checkpoint aprovado
- `v1/05-implementacao.md` — nota de entrega do Felipe
- `v1/06-qa.md` — veredito do Quirino (APROVADO)
- `v1/07-entrega.md` — este documento

Todos os artefatos ficam em `squads/dev-squad/output/2026-04-13-180000/`.

---

**Status:** pronto para uso. Qualquer dúvida, volta pra gente.
