# Implementação — Campo de Busca Global Funcional

## Arquivos criados
- `src/actions/search.ts` — server action `globalSearch` com Zod validation, busca leve em `persons` + `cellGroups` com `ilike`, limite de 3 por tipo
- `src/components/layout/search-command.tsx` — client component com input + dropdown de resultados, debounce 300ms, navegação via `useRouter`, estados loading/vazio/erro

## Arquivos editados
- `src/components/layout/Header.tsx` — removido input HTML estático, substituído por `<SearchCommand />`; removido import de `Search` do lucide-react (agora vive dentro do SearchCommand)

## O que fiz
- Server action `globalSearch(query)` com `SearchSchema` Zod (`z.string().min(2).max(100)`), `getAuthUserContext()` para filtrar por `churchId`, 2 queries em paralelo (`persons` + `cellGroups`) com `ilike` e `.limit(3)`, retorno `ActionResult<SearchResult>`
- Client component `SearchCommand` com debounce de 300ms via `setTimeout` + cleanup em `useEffect`, dropdown absolutamente posicionado com z-50, resultados agrupados por seção (Membros com ícone `Users`, Células com ícone `Home`), separador visual entre seções
- Estados completos: loading (3 Skeletons), vazio ("Nenhum resultado encontrado para '{query}'"), erro (mensagem em vermelho), sucesso (lista de resultados clicáveis)
- Interações: Escape fecha dropdown e tira foco, click fora fecha dropdown (mousedown listener), click em resultado navega e limpa o campo, refocus reabre se query >= 2 chars
- Header continua server component — SearchCommand é o único client component filho

## O que testei
- **Happy path:** TypeScript compila sem erros (`tsc --noEmit` → 0 erros em `src/`). PASS.
- **Padrão do vizinho:** imports, try/catch, `logActionError`, `toActionError`, `ActionResult` — tudo seguindo `members.ts`. PASS.
- **Zero `any`:** nenhum uso de `any` nos arquivos criados. PASS.

## O que NÃO testei
- Teste manual no browser com dados reais (precisa do servidor rodando + banco populado).
- Debounce em rede lenta (throttling).
- Mobile layout (responsividade do dropdown).

## Observações para o QA
- O dropdown usa `max-w-64` herdado do container — no mobile, segue a largura disponível.
- Teste os estados: loading (digitar rápido), vazio (termo sem resultados), erro (desconectar rede).
- Teste Escape e click fora para fechar o dropdown.
- Teste se a navegação funciona para membros (`/members/[id]/edit`) e células (`/cells/[id]/edit`).
- Verifique se o campo limpa após navegar.
