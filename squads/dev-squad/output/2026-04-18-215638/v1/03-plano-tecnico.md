# Plano Técnico — Campo de Busca Global Funcional

## Stack afetada
Next.js App Router + TypeScript strict + Drizzle ORM (queries) + componentes em `src/components/layout/` + lucide-react icons.

**Sem migrations.** Nenhuma alteração de schema — as tabelas `persons` e `cell_groups` já existem e já suportam busca com `ilike`.

## Modelo de dados

**Nenhuma tabela nova.** A busca será feita nas tabelas existentes:

- `persons` — busca por `fullName` com `ilike` (já usado em `getMembers`)
- `cell_groups` — busca por `name` com `ilike` (já usado em `getCellGroups`)

Para a busca global, os dados retornados serão leves (apenas `id` e `name`), sem carregar relações (sem `churchLifeEvents`, sem `spouse`, sem join com `persons` para líder). Isso evita o overhead das queries pesadas de `getMembers` e `getCellGroups`.

## API (Server Actions)

### `globalSearch(query: string)` em `src/actions/search.ts`

- **Validação:** Zod — `z.string().min(2).max(100)`
- **Permissão:** `getAuthUserContext()` — filtra por `churchId` do usuário logado (já é o padrão do projeto)
- **Comportamento:**
  1. Recebe o termo de busca (mínimo 2 caracteres)
  2. Executa 2 queries em paralelo com `Promise.all`:
     - `db.select({ id, fullName }).from(persons).where(and(eq(churchId), ilike(fullName, %query%))).limit(3)`
     - `db.select({ id, name }).from(cellGroups).where(and(eq(churchId), ilike(name, %query%))).limit(3)`
  3. Retorna `{ data: { members: [...], cells: [...] }, error: null }` ou `{ data: null, error: string }`
- **Limite:** 3 resultados por tipo (total máximo 6) — mantém o dropdown enxuto
- **Retorno:**
  ```typescript
  type SearchResult = {
    members: { id: string; fullName: string }[];
    cells: { id: string; name: string }[];
  };
  ```

## Componentes

### Criar:
- `src/actions/search.ts` — server action `globalSearch` com query leve em `persons` + `cellGroups`
- `src/components/layout/search-command.tsx` — client component com input + dropdown de resultados, debounce de 300ms, navegação via `useRouter`

### Editar:
- `src/components/layout/Header.tsx` — substituir o input HTML estático por `<SearchCommand />`

## Passo a passo

1. **Criar `src/actions/search.ts`**
   - Server action `globalSearch(query: string)`
   - Validação Zod: `z.string().min(2).max(100)`
   - Auth: `getAuthUserContext()` para obter `churchId`
   - 2 queries em paralelo (persons + cellGroups), ambas com `ilike` e `.limit(3)`
   - Retorna `{ data: { members, cells }, error: null }` no shape padrão `ActionResult`
   - Seguir o padrão de `src/actions/members.ts` (imports, try/catch, `toActionError`, `logActionError`)

2. **Criar `src/components/layout/search-command.tsx`**
   - `"use client"` no topo
   - Estado: `query` (string), `results` (SearchResult | null), `isOpen` (boolean), `isLoading` (boolean)
   - `useEffect` com debounce de 300ms no `query`: se `query.length >= 2`, chama `globalSearch(query)` e seta resultados
   - Se `query.length < 2`, fecha dropdown e limpa resultados
   - Dropdown renderizado como `div` absolutamente posicionada abaixo do input (mesmo padrão visual de `DropdownMenuContent`: `bg-white border rounded-md shadow-lg z-50`)
   - Resultados agrupados: seção "Membros" com ícone `Users`, seção "Células" com ícone `Home`
   - Cada item: click → `router.push('/members/[id]/edit')` ou `router.push('/cells/[id]/edit')` → fecha dropdown
   - Loading state: 3 `<Skeleton />` dentro do dropdown
   - Empty state: texto "Nenhum resultado encontrado para '{query}'"
   - Error state: texto "Não foi possível buscar. Tente novamente."
   - Fechar dropdown: Escape, click fora (ref + `useEffect` com `mousedown` listener)
   - Manter exatamente o mesmo estilo visual do input atual (classes CSS copiadas do Header)

3. **Editar `src/components/layout/Header.tsx`**
   - Remover o bloco do `<div className="relative w-full max-w-64">` com o input estático
   - Importar `<SearchCommand />` e renderizar no lugar
   - Remover import de `Search` do lucide-react (agora vive dentro do SearchCommand)
   - Header continua sendo server component — `SearchCommand` é o único client component filho

4. **Testar manualmente**
   - Happy path: digitar "Mar" → ver membros e células com "Mar" no nome
   - Sem resultado: digitar "xyzabc" → ver "Nenhum resultado encontrado"
   - Navegação: clicar em um membro → ir para `/members/[id]/edit`
   - Navegação: clicar em uma célula → ir para `/cells/[id]/edit`
   - Escape fecha o dropdown
   - Click fora fecha o dropdown
   - Debounce: digitar rápido não dispara múltiplas requests

## Riscos e trade-offs

- **Trade-off:** Criar server action nova (`globalSearch`) vs reutilizar `getMembers` + `getCellGroups` — escolhi action nova porque as existentes carregam relações pesadas (churchLifeEvents, spouse, join com persons) que não são necessárias para o dropdown de busca. A action nova faz select leve com apenas `id` e `name`.
- **Trade-off:** Dropdown com HTML/CSS manual vs usar Radix Popover/Combobox — escolhi HTML manual porque o comportamento é simples (abrir/fechar/click) e não justifica adicionar nova dependência ou componente complexo. O estilo visual segue o padrão do `DropdownMenuContent` existente.
- **Risco:** Debounce de 300ms pode parecer lento para quem digita devagar e rápido para quem digita rápido. 300ms é o valor padrão amplamente aceito — podemos ajustar se surgir reclamação.
- **Risco:** Limite de 3 resultados por tipo pode esconder o resultado desejado em bases com muitos membros com nomes parecidos. Mitigação: o usuário pode refinar o termo de busca. Expandir para mais resultados fica para iteração futura.
