# Requisitos — Autenticação e Gerenciamento de Usuário

## Problema

Hoje o Célula Mais expõe todo o dashboard sem qualquer camada de autenticação: o middleware existe mas está com o gating comentado, a pasta `src/app/(auth)/login/` está vazia e o header mostra "Admin Silva" hardcoded. Qualquer pessoa com o link acessa dados pastorais sensíveis (membros, presença, supervisão). Sem login real, pastores e supervisores não podem nem usar o sistema em produção, nem responsabilizar quem fez o quê. E, quando alguém esquece a senha, não há caminho de recuperação — o único jeito é pedir a um admin para mexer no banco.

## Personas afetadas

- **Administrador da igreja**: cadastra, edita e desativa usuários do sistema (pastores, supervisores, líderes) e atribui papéis.
- **Pastor / Supervisor / Líder de célula**: faz login com email e senha, acessa apenas o que seu papel permite e recupera a senha sozinho quando esquece.
- **Pastor titular (admin padrão)**: primeiro usuário criado pelo seed — precisa existir para destravar o primeiro acesso ao sistema.

## Escopo (MVP)

**Must:**
- Página de login por email + senha em `src/app/(auth)/login/` usando Supabase Auth (já instalado).
- Middleware efetivo: rotas `(dashboard)/**` redirecionam para `/login` se não houver sessão; `/login` redireciona para `/` se já autenticado.
- Layout do dashboard lê o usuário autenticado via `getAuthUserContext()` **sem fallback hardcoded** — header e sidebar mostram o nome real do usuário logado.
- Logout com server action, invalida sessão Supabase e redireciona para `/login`.
- **CRUD de usuários** (apenas admin): listar, criar, editar, desativar (soft delete via campo `isActive`). Campos: nome completo, email, telefone, papel, igreja, supervisor.
- **Recuperação de senha por email**: usuário solicita reset em `/login/esqueci-senha`, recebe email com link (token de uso único, TTL 1 hora) e define nova senha em `/login/redefinir-senha`.
- Envio de email via **Resend** (lib a instalar) com template em PT-BR.
- Proteção por papel: apenas `ADMIN` e `PASTOR` acessam `/settings/usuarios` (a tela de CRUD).
- Validação de senha: mínimo 8 caracteres, ao menos 1 letra e 1 número (Zod).

**Should:**
- Forçar troca de senha no primeiro login (flag `mustChangePassword` no registro).
- Feedback visual claro em todos os formulários (toasts já disponíveis via `@/lib/toast`).
- Mensagem genérica em "esqueci senha" ("Se o email existir, enviamos um link…") para não vazar quais emails estão cadastrados.

**Could:**
- Trocar senha dentro da área logada (`/settings/minha-conta`).
- Bloqueio temporário após 5 tentativas falhas de login.
- Campo "última vez que logou" visível na listagem de usuários.

**Won't (agora):**
- Login com Google / SSO corporativo.
- 2FA / autenticação em dois fatores.
- Convite por email para novo usuário (admin define senha inicial e comunica fora do sistema).
- Magic link sem senha.
- Histórico de auditoria de ações por usuário.
- Permissões granulares por tela (basta o papel por enquanto).

## User Stories

### US-01 — Fazer login no sistema
**Como** líder de célula, **quero** fazer login com meu email e senha, **para** acessar o Célula Mais e registrar a vida da minha célula.

**Critérios de aceite:**
- Dado que eu não estou autenticado e acesso qualquer rota de `(dashboard)`
- Então sou redirecionado para `/login`
- E vejo um formulário com campos `email` e `senha` e um link "Esqueci minha senha"
- Quando digito credenciais válidas e clico em "Entrar"
- Então sou redirecionado para `/` (dashboard)
- E o header mostra meu nome real (não "Admin Silva")
- Quando digito credenciais inválidas
- Então vejo a mensagem "Email ou senha inválidos" sem pista de qual dos dois errei
- E permaneço na página de login

### US-02 — Fazer logout
**Como** usuário autenticado, **quero** sair do sistema, **para** proteger minha conta em computadores compartilhados.

**Critérios de aceite:**
- Dado que estou autenticado
- Quando clico em "Sair" no menu do header
- Então minha sessão Supabase é invalidada
- E sou redirecionado para `/login`
- E ao voltar para qualquer rota de `(dashboard)`, sou redirecionado novamente para `/login`

### US-03 — Recuperar senha esquecida
**Como** pastor, **quero** redefinir minha senha quando esqueço, **para** voltar a acessar o sistema sem depender do admin.

**Critérios de aceite:**
- Dado que estou em `/login` e clico em "Esqueci minha senha"
- Quando informo meu email cadastrado e clico em "Enviar link"
- Então recebo a mensagem "Se o email existir, enviamos um link de recuperação" (genérica)
- E recebo um email (via Resend) com um link contendo um token de uso único
- Quando clico no link do email em até 1 hora
- Então sou levado a `/login/redefinir-senha` com o token validado
- E defino uma nova senha (validada: mín 8 chars, 1 letra + 1 número)
- E ao salvar, meu `passwordHash` é atualizado, o token é invalidado e sou redirecionado para `/login` com toast de sucesso
- Quando o token está expirado ou já foi usado
- Então vejo "Link inválido ou expirado" e um botão para solicitar novo link

### US-04 — Administrar usuários do sistema (CRUD)
**Como** administrador da igreja, **quero** cadastrar, editar e desativar usuários, **para** controlar quem tem acesso ao Célula Mais.

**Critérios de aceite:**
- Dado que sou `ADMIN` ou `PASTOR` e acesso `/settings/usuarios`
- Então vejo uma tabela com: nome, email, papel, supervisor, status (ativo/inativo), ações
- Quando clico em "Novo usuário"
- Então vejo um formulário com: nome completo, email, telefone, papel, igreja, supervisor (condicional), senha inicial
- E ao salvar, o usuário é criado no Supabase Auth e na tabela `users` em uma única transação
- Quando clico em "Editar" em uma linha
- Então consigo alterar nome, papel, supervisor (não email, não senha)
- Quando clico em "Desativar"
- Então o usuário fica com `isActive=false` (soft delete) e não consegue mais logar
- Quando um usuário não-admin tenta acessar `/settings/usuarios` diretamente pela URL
- Então recebe a tela 403 / redirecionamento para `/`

### US-05 — Proteção de rotas por papel
**Como** administrador, **quero** que apenas usuários com papel adequado acessem telas sensíveis, **para** garantir que um líder não enxergue o que é responsabilidade do pastor.

**Critérios de aceite:**
- Dado que existe a rota `/settings/usuarios`
- Quando um usuário com papel `LEADER` ou `ASSISTANT` tenta acessar
- Então é redirecionado para `/` com toast "Você não tem permissão para acessar esta área"
- E o mesmo se aplica a chamadas de server actions do CRUD de usuários (validação no servidor, não só na UI)

## Riscos e assumptions

- **Assumption**: Supabase Auth já está instalado (`@supabase/ssr`, `@supabase/supabase-js`) e as env vars `NEXT_PUBLIC_SUPABASE_URL` + `NEXT_PUBLIC_SUPABASE_ANON_KEY` estão configuradas — confirmado pelo Tech Lead na análise do código.
- **Assumption**: O campo `passwordHash` na tabela `users` é herança de um desenho anterior e **não será usado** — senhas ficam sob responsabilidade do Supabase Auth (`auth.users`). A tabela `public.users` armazena apenas o perfil de negócio (nome, papel, igreja, supervisor). Validar com Tech Lead se o campo pode ser marcado como deprecated na migration.
- **Assumption**: Existe pelo menos um usuário admin criado manualmente no Supabase (ou seed) antes do primeiro deploy — senão ninguém consegue entrar para administrar.
- **Risco**: Recuperação de senha via Supabase Auth nativo usa o email interno do Supabase, que costuma ser rejeitado por filtros de spam. Usar Resend e template PT-BR via `resetPasswordForEmail({ redirectTo })` ou fluxo de token customizado — decisão do Tech Lead.
- **Risco**: Conflito entre o fluxo de reset do Supabase e uma tabela `password_reset_tokens` customizada. Preferir o fluxo nativo do Supabase se possível; só criar tabela própria se a UX exigir.
- **Risco**: Remover o fallback hardcoded de `getAuthUserContext()` (`src/lib/auth-context.ts` linhas 21-30) pode quebrar o dashboard em dev se ninguém estiver logado. Garantir que o seed de dev crie um admin + documentar no README.
- **Dependência**: `RESEND_API_KEY` precisa ser provisionado e adicionado ao `.env.local` e ao ambiente de produção antes do deploy.
