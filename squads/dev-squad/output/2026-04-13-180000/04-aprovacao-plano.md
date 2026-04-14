# Aprovação do Plano Técnico

**Status:** APROVADO
**Data:** 2026-04-13
**Usuário:** Patrick

## Decisão

Plano aprovado. Respostas às decisões pendentes:

1. **Fluxo de recuperação de senha:** Plano A — Supabase nativo (`resetPasswordForEmail`) + SMTP do Resend configurado no painel do Supabase. Sem tabela própria de tokens, sem pacote `resend` como dependência do projeto.

2. **Admin inicial:** Criar manualmente no painel do Supabase. Patrick copia o UUID do `auth.users` e insere a linha correspondente em `public.users`. Documentar no README. Não criar script de seed neste run.

3. **Coluna `password_hash` legada:** (não perguntado, seguir recomendação do Tiago) — manter a coluna com `DROP NOT NULL` nesta migration. Remoção fica para um PR futuro só de limpeza.

4. **Permissão no CRUD de usuários:** **Apenas o perfil `ADMIN`** pode acessar e operar `/settings/usuarios`. Ajuste no plano: toda chamada a `requireRole(["ADMIN","PASTOR"])` deve virar `requireRole(["ADMIN"])`. `PASTOR` não vê nem acessa o CRUD de usuários por enquanto.

## Observações

- Manter o shape `ActionResult<T> = { data, error }` e o helper `userError("[user] …")` em todas as actions novas (memória técnica da squad já registra isso).
- Não rodar `npm run build` para validação — usar `npx tsc --noEmit` filtrado em `^src/` (o projeto Vite em `dashboard/` na raiz quebra o build por motivo pré-existente, fora do escopo).
- Toaster global já está mountado no layout — usar `import { toast } from "@/lib/toast"` em client components.

## Próximo passo

Step 5 — Felipe Fullstack inicia a implementação seguindo o plano técnico aprovado, com os ajustes acima (permissão exclusiva para ADMIN + plano A de reset de senha + documentar seed manual no README).
