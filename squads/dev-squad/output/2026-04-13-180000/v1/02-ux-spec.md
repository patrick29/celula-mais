# UX Spec — Autenticação e Gerenciamento de Usuário

## Contexto de uso

Três contextos distintos que mudam o desenho:

1. **Login & recuperação de senha**: qualquer usuário (pastor, supervisor, líder, admin) — predominantemente **mobile**, frequentemente no meio de uma reunião ou em deslocamento. Precisa ser **rápido**, **tolerante a erros de digitação de email** e com **microcopy acolhedor**.
2. **CRUD de usuários**: apenas admin / pastor titular — predominantemente **desktop**, feito em momento dedicado (não em movimento). Pode ter mais densidade de informação e filtros.
3. **Perfil próprio**: qualquer usuário logado — principalmente para trocar a própria senha no primeiro acesso. Mobile e desktop.

O tom geral é **profissional, acolhedor e institucional** — nada de "Ops, deu ruim!". O usuário é um pastor ou líder cuidando da casa de Deus, não um gamer.

## Fluxo

### Fluxo 1 — Login
`URL direta ou redirect do middleware → /login → digita email + senha → clica "Entrar" → [happy: redirect para /] | [erro: toast + mantém email]`

### Fluxo 2 — Logout
`Header (avatar/menu) → "Sair" → confirma → /login`

### Fluxo 3 — Recuperação de senha
`/login → link "Esqueci minha senha" → /login/esqueci-senha → digita email → "Enviar link" → tela de confirmação genérica → [usuário sai da aba e checa email] → clica link no email → /login/redefinir-senha?token=xxx → digita nova senha 2x → "Salvar" → toast de sucesso → /login`

### Fluxo 4 — Primeiro login (troca forçada)
`/login → credenciais corretas → middleware detecta mustChangePassword=true → redirect automático para /login/redefinir-senha?first=true → define senha → /`

### Fluxo 5 — CRUD de usuários
`Sidebar → "Configurações" → "Usuários" → /settings/usuarios → [listagem] → "Novo usuário" (Dialog) | clicar linha para editar (Dialog) | menu "…" → "Desativar" (Dialog de confirmação)`

---

## Tela 1: Login (`/login`)

**Cabeçalho:**
- Logo do Célula Mais centralizado (topo)
- Título H1: "Entrar no Célula Mais"
- Subtítulo: "Acesse sua área como pastor, supervisor ou líder"

**Corpo (Card centralizado, largura máx 400px):**
- Campo `<Input type="email">` — label "Email", placeholder "seu-email@igreja.com", autoFocus, autoComplete="email"
- Campo `<Input type="password">` — label "Senha", com ícone de olho (mostrar/esconder), autoComplete="current-password"
- Link discreto alinhado à direita abaixo do campo de senha: "Esqueci minha senha" → `/login/esqueci-senha`
- `<Button size="lg" className="w-full">` — texto "Entrar"

**Rodapé:**
- Linha pequena: "Célula Mais · Gestão Pastoral"

---

## Tela 2: Esqueci minha senha (`/login/esqueci-senha`)

**Cabeçalho:**
- Link "← Voltar para o login" (top-left)
- Logo centralizado
- Título H1: "Recuperar acesso"
- Subtítulo: "Informe o email cadastrado. Enviaremos um link para você criar uma nova senha."

**Corpo (Card, 400px):**
- Campo `<Input type="email">` — label "Email cadastrado", autoFocus
- `<Button className="w-full">` — "Enviar link de recuperação"

**Estado pós-envio (mesma rota, substitui o formulário):**
- Ícone grande de envelope (Lucide `<Mail>`)
- Título: "Verifique seu email"
- Texto: "Se o email estiver cadastrado, enviamos um link para criar uma nova senha. O link vale por 1 hora."
- Botão secundário: "Voltar para o login"

---

## Tela 3: Redefinir senha (`/login/redefinir-senha?token=xxx`)

**Cabeçalho:**
- Logo centralizado
- Título H1: "Definir nova senha"
- Subtítulo condicional:
  - Token válido: "Crie uma senha forte para sua conta."
  - `?first=true` (primeiro acesso): "Este é seu primeiro acesso. Defina uma senha pessoal antes de continuar."

**Corpo (Card, 400px):**
- Campo `<Input type="password">` — label "Nova senha", com indicador de requisitos (mínimo 8 caracteres, 1 letra, 1 número) em checklist abaixo do campo (checks verdes quando atendidos)
- Campo `<Input type="password">` — label "Confirmar senha"
- `<Button className="w-full">` — "Salvar nova senha"

**Estado de token inválido/expirado (substitui o formulário):**
- Ícone de alerta (Lucide `<AlertTriangle>`)
- Título: "Link inválido ou expirado"
- Texto: "Este link não é mais válido. Os links de recuperação duram 1 hora por segurança."
- Botão primário: "Solicitar novo link" → volta a `/login/esqueci-senha`

---

## Tela 4: Listagem de Usuários (`/settings/usuarios`)

**Cabeçalho:**
- Breadcrumb: "Configurações › Usuários"
- Título H1: "Usuários do sistema"
- Subtítulo: "Cadastre e gerencie quem pode acessar o Célula Mais"
- Botão primário alinhado à direita: "Novo usuário" (abre Dialog)

**Corpo (Card + Tabela):**
Colunas da tabela:
1. **Nome** (com avatar circular à esquerda, nome bold, email em muted abaixo)
2. **Papel** (Badge colorido: ADMIN=roxo, PASTOR=azul, SUPERVISOR=verde, LEADER=amarelo, ASSISTANT=cinza)
3. **Supervisor** (nome do supervisor direto ou "—")
4. **Status** (Badge: "Ativo" verde / "Inativo" cinza)
5. **Último acesso** (data relativa: "há 2 horas", "ontem", "há 3 dias" — ou "nunca acessou")
6. **Ações** (menu `…` com: Editar, Redefinir senha, Desativar)

Filtros acima da tabela (linha horizontal):
- `<Input>` de busca (placeholder "Buscar por nome ou email")
- `<Select>` de filtro por papel ("Todos os papéis" / "Admin" / "Pastor" / "Supervisor" / "Líder" / "Assistente")
- `<Select>` de status ("Todos" / "Ativos" / "Inativos")

---

## Tela 5: Dialog — Novo/Editar Usuário

**Cabeçalho do Dialog:**
- Título: "Novo usuário" ou "Editar {Nome}"
- Subtítulo: "Defina os dados de acesso e o papel no sistema"

**Corpo (formulário de 1 coluna, scroll se necessário):**

Seção "Dados pessoais":
- `<Input>` — "Nome completo" (obrigatório)
- `<Input type="email">` — "Email" (obrigatório, **desabilitado no modo editar**)
- `<Input>` — "Telefone" (máscara `(00) 00000-0000`, opcional)

Seção "Acesso":
- `<Select>` — "Papel" (ADMIN / PASTOR / SUPERVISOR / LEADER / ASSISTANT)
- `<Select>` condicional — "Supervisor direto" (aparece apenas se papel ≠ ADMIN e ≠ PASTOR; lista usuários com papel hierárquico superior)

Seção "Senha inicial" (**apenas no modo novo**):
- `<Input type="password">` — "Senha provisória" com mesmo checklist de requisitos
- `<Checkbox>` — "Exigir troca de senha no primeiro acesso" (checked por padrão)

**Rodapé do Dialog:**
- Botão secundário "Cancelar"
- Botão primário "Salvar"

---

## Tela 6: Dialog — Confirmar desativação

**Cabeçalho:**
- Título: "Desativar {Nome}?"

**Corpo:**
- Texto: "O usuário não conseguirá mais acessar o Célula Mais, mas o histórico dele será preservado. Você pode reativar a qualquer momento."

**Rodapé:**
- Botão secundário "Cancelar"
- Botão destrutivo (`variant="destructive"`) "Desativar usuário"

---

## Estados

### Tela 1 — Login
- **Vazio (inicial):** Formulário pronto, foco no campo de email.
- **Loading (submit):** Botão "Entrar" vira `<Button disabled>` com spinner e texto "Entrando…". Campos desabilitados.
- **Erro de credenciais:** Toast vermelho `"Email ou senha inválidos"`. Campos mantêm valor; foco volta para senha; senha é limpa.
- **Erro de rede:** Toast `"Não foi possível entrar. Verifique sua conexão e tente novamente."` Campos mantidos intactos.
- **Sucesso:** Redirect imediato para `/` (sem toast — o dashboard já é a confirmação).
- **Sessão expirada:** Ao ser redirecionado pelo middleware por sessão expirada, exibir toast informativo `"Sua sessão expirou. Entre novamente para continuar."` (via query param `?expired=true`).

### Tela 2 — Esqueci minha senha
- **Vazio (inicial):** Formulário pronto, foco no email.
- **Loading:** Botão com spinner e texto "Enviando…".
- **Sucesso:** Substitui o formulário pela tela de confirmação genérica (não revela se o email existe).
- **Erro de rede:** Toast `"Não foi possível enviar o link agora. Tente novamente em instantes."` — mantém o formulário.

### Tela 3 — Redefinir senha
- **Loading inicial:** Skeleton do card enquanto valida o token na URL.
- **Token válido:** Formulário renderiza normalmente.
- **Token inválido/expirado:** Substitui o formulário pela tela de erro descrita acima.
- **Validação inline:** Checklist atualiza em tempo real conforme usuário digita. Botão "Salvar" fica disabled até todos os critérios baterem e as duas senhas coincidirem.
- **Senhas divergem:** Mensagem inline vermelha abaixo do segundo campo: "As senhas não coincidem."
- **Sucesso:** Toast verde `"Senha atualizada com sucesso"` + redirect para `/login` após 1.5s.
- **Erro ao salvar:** Toast `"Não foi possível atualizar sua senha. Tente novamente."` — mantém formulário.

### Tela 4 — Listagem de usuários
- **Vazio (nenhum usuário além do próprio admin):** Estado ilustrado com ícone de pessoas + texto "Nenhum outro usuário cadastrado ainda. Clique em 'Novo usuário' para começar a montar seu time pastoral." + CTA primário.
- **Vazio por filtro:** "Nenhum usuário corresponde aos filtros aplicados." + botão "Limpar filtros".
- **Loading:** `<Skeleton>` de 5 linhas da tabela.
- **Erro ao carregar:** Card com `"Não foi possível carregar a lista de usuários. Tente recarregar a página."` + botão "Tentar novamente".

### Tela 5 — Dialog de novo/editar
- **Loading (submit):** Botão "Salvar" disabled com spinner + texto "Salvando…". Formulário inteiro desabilitado.
- **Erro de validação inline:** Mensagens vermelhas abaixo de cada campo inválido.
- **Erro de email duplicado:** Mensagem inline no campo email: `"Este email já está cadastrado."`
- **Sucesso:** Dialog fecha, toast verde `"Usuário cadastrado"` ou `"Alterações salvas"`, tabela atualiza.
- **Erro genérico:** Toast `"Não foi possível salvar. Tente novamente em instantes."` — mantém dialog aberto com dados preenchidos.

### Tela 6 — Dialog de desativação
- **Loading (submit):** Botão destrutivo com spinner + "Desativando…".
- **Sucesso:** Dialog fecha, toast `"Usuário desativado"`, linha na tabela atualiza para status Inativo.

---

## Componentes reutilizados

Todos estes já existem em `src/components/ui/`:

- `<Button>` — todos os botões (primário, destrutivo, ghost)
- `<Input>` — campos de email, senha, texto, telefone
- `<Label>` — rótulos dos campos
- `<Card>` — containers das telas de login e do layout da listagem
- `<Dialog>` — modais de novo/editar usuário e confirmação
- `<Select>` — papel, supervisor, filtros
- `<Checkbox>` — "Exigir troca de senha no primeiro acesso"
- `<Badge>` — papéis e status
- `<Skeleton>` — loadings
- `<Separator>` — divisões entre seções do formulário
- `<Sonner>` (toast) — via `@/lib/toast` já mountado no layout
- `<Sheet>` — alternativa mobile ao Dialog se o time preferir

Componentes do app já existentes:
- `src/components/layout/Header.tsx` — adicionar menu de usuário com avatar + item "Sair"
- `src/components/feedback/` — componentes de feedback (já usados para erro/empty state)

---

## Componentes NOVOS

- **`<PasswordRequirements>`** — checklist visual de requisitos de senha (mín 8 chars, 1 letra, 1 número) com ícones de check que acendem em verde quando o requisito é atendido. Reusado nas telas de redefinir senha e no Dialog de novo usuário. (CRIAR em `src/components/auth/password-requirements.tsx`)

- **`<PasswordInput>`** — wrapper sobre `<Input type="password">` com botão de mostrar/esconder senha (ícone de olho). Reusado em todas as telas de senha. (CRIAR em `src/components/ui/password-input.tsx`)

- **`<UserRoleBadge>`** — `<Badge>` pré-estilizado que recebe um papel e aplica a cor correspondente (ADMIN=roxo, PASTOR=azul, SUPERVISOR=verde, LEADER=amarelo, ASSISTANT=cinza). (CRIAR em `src/components/users/user-role-badge.tsx`)

- **`<AuthLayout>`** — layout compartilhado das rotas `(auth)/**`: fundo sóbrio com logo centralizado e card com largura máx 400px. Evita repetir o mesmo wrapper em 3 páginas. (CRIAR em `src/app/(auth)/layout.tsx`)

- **`<UserMenu>`** — dropdown no Header com avatar do usuário logado, nome, email e item "Sair" (executa a server action de logout). (CRIAR em `src/components/layout/user-menu.tsx`)

Nenhum componente "tabela complexa" precisa ser criado — reutilizar o padrão já usado em `cell-groups-table.tsx` e `members-table.tsx`.

---

## Microcopy

### Tela de Login
- Título: "Entrar no Célula Mais"
- Subtítulo: "Acesse sua área como pastor, supervisor ou líder"
- Label email: "Email"
- Label senha: "Senha"
- Link: "Esqueci minha senha"
- Botão: "Entrar"
- Botão loading: "Entrando…"
- Erro credenciais: "Email ou senha inválidos"
- Erro rede: "Não foi possível entrar. Verifique sua conexão e tente novamente."
- Sessão expirada: "Sua sessão expirou. Entre novamente para continuar."

### Esqueci minha senha
- Título: "Recuperar acesso"
- Subtítulo: "Informe o email cadastrado. Enviaremos um link para você criar uma nova senha."
- Label: "Email cadastrado"
- Botão: "Enviar link de recuperação"
- Botão loading: "Enviando…"
- Confirmação (título): "Verifique seu email"
- Confirmação (texto): "Se o email estiver cadastrado, enviamos um link para criar uma nova senha. O link vale por 1 hora."
- Confirmação (botão): "Voltar para o login"

### Email de recuperação (enviado pela Resend)
- Assunto: "Recupere seu acesso ao Célula Mais"
- Saudação: "Olá, {Nome}"
- Corpo: "Recebemos um pedido para criar uma nova senha para sua conta no Célula Mais. Clique no botão abaixo para continuar — o link é válido por 1 hora."
- Botão: "Criar nova senha"
- Rodapé: "Se você não solicitou esta recuperação, pode ignorar este email com segurança. Sua senha atual continua funcionando."

### Redefinir senha
- Título: "Definir nova senha"
- Subtítulo (token válido): "Crie uma senha forte para sua conta."
- Subtítulo (primeiro acesso): "Este é seu primeiro acesso. Defina uma senha pessoal antes de continuar."
- Label 1: "Nova senha"
- Label 2: "Confirmar senha"
- Checklist:
  - "Pelo menos 8 caracteres"
  - "Pelo menos 1 letra"
  - "Pelo menos 1 número"
- Mensagem inline: "As senhas não coincidem."
- Botão: "Salvar nova senha"
- Botão loading: "Salvando…"
- Toast sucesso: "Senha atualizada com sucesso"
- Toast erro: "Não foi possível atualizar sua senha. Tente novamente."
- Título token inválido: "Link inválido ou expirado"
- Texto token inválido: "Este link não é mais válido. Os links de recuperação duram 1 hora por segurança."
- Botão token inválido: "Solicitar novo link"

### Listagem de usuários
- Breadcrumb: "Configurações › Usuários"
- Título: "Usuários do sistema"
- Subtítulo: "Cadastre e gerencie quem pode acessar o Célula Mais"
- Botão novo: "Novo usuário"
- Placeholder busca: "Buscar por nome ou email"
- Filtro papel: "Todos os papéis"
- Filtro status: "Todos"
- Coluna "nunca acessou": "Nunca acessou"
- Vazio inicial: "Nenhum outro usuário cadastrado ainda. Clique em 'Novo usuário' para começar a montar seu time pastoral."
- Vazio por filtro: "Nenhum usuário corresponde aos filtros aplicados."
- Erro carregar: "Não foi possível carregar a lista de usuários. Tente recarregar a página."

### Dialog novo/editar
- Título novo: "Novo usuário"
- Título editar: "Editar {Nome}"
- Subtítulo: "Defina os dados de acesso e o papel no sistema"
- Seção 1: "Dados pessoais"
- Seção 2: "Acesso"
- Seção 3: "Senha inicial"
- Label checkbox: "Exigir troca de senha no primeiro acesso"
- Erro email duplicado: "Este email já está cadastrado."
- Botão cancelar: "Cancelar"
- Botão salvar: "Salvar"
- Toast sucesso novo: "Usuário cadastrado"
- Toast sucesso editar: "Alterações salvas"
- Toast erro: "Não foi possível salvar. Tente novamente em instantes."

### Dialog desativar
- Título: "Desativar {Nome}?"
- Corpo: "O usuário não conseguirá mais acessar o Célula Mais, mas o histórico dele será preservado. Você pode reativar a qualquer momento."
- Botão cancelar: "Cancelar"
- Botão confirmar: "Desativar usuário"
- Toast sucesso: "Usuário desativado"

### Menu do Header
- Item: "Sair"
- Toast ao sair (opcional): — (sem toast, o redirect para /login já é a confirmação)

### Mensagens de permissão
- Acesso negado (papel insuficiente): "Você não tem permissão para acessar esta área."
