# Aprovação do Plano Técnico

**Status:** APROVADO
**Data:** 2026-04-13 20:38
**Usuário:** Patrick

## Decisão

Plano aprovado. Respostas às decisões pendentes:

1. **Gerenciador de pacotes:** `npm` (lockfile já existe).
2. **Instalação do sonner:** direto via `npm install sonner` + wrapper manual (sem `shadcn@latest add`).
3. **`<html lang="en">` → `<html lang="pt-BR">`:** SIM, incluir nesta entrega.

## Observações

- Preservar a shape `{ data, error }` das actions existentes — backward compat total.
- `confirm()` nativo das deleções fica fora desta entrega (é UX de confirmação, não de erro).
- Teste manual obrigatório com `npm run build && npm run start` para validar `global-error.tsx` (não funciona em `dev`).

## Próximo passo

Step 5 — Felipe Fullstack inicia a implementação seguindo o plano aprovado, com as 3 respostas acima aplicadas.
