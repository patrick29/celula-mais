# UX Spec — Campo de Busca Global Funcional

## Contexto de uso
Todos os usuários do dashboard (líder, supervisor, admin) acessam tanto de desktop quanto mobile. O campo de busca fica no Header, visível em todas as telas. Uso mais frequente: localizar um membro rapidamente para acessar seu cadastro, ou encontrar uma célula sem percorrer a listagem.

## Fluxo
Header (campo de busca) → Usuário digita >= 2 caracteres → Dropdown aparece abaixo do input com resultados agrupados (Membros / Células) → Clica em um resultado → Navega para a página de edição (`/members/[id]/edit` ou `/cells/[id]/edit`) → Dropdown fecha

### Fluxos alternativos
- **Nenhum resultado:** dropdown exibe "Nenhum resultado encontrado para '{termo}'"
- **Limpeza:** ao apagar o texto (< 2 caracteres), dropdown fecha
- **Escape:** pressionando Escape, dropdown fecha e input perde foco
- **Click fora:** clicando em qualquer lugar fora do dropdown, ele fecha
- **Loading:** enquanto busca, exibe skeleton de 3 linhas no dropdown

## Componente: SearchCommand (client component extraído do Header)

### Estrutura
O campo de busca existente no Header será substituído por um client component `<SearchCommand />` que encapsula input + dropdown de resultados.

**Input (reutiliza o estilo visual atual):**
- Ícone `<Search />` à esquerda (já existe)
- Placeholder: "Buscar membro, célula..."
- `max-w-64` no desktop (já existe)
- Ao focar e digitar >= 2 caracteres, abre dropdown abaixo

**Dropdown de resultados (posicionado abaixo do input):**
- Largura: mesma do input (`w-full`)
- Background: `bg-white`, `border`, `rounded-md`, `shadow-lg`
- Z-index alto para sobrepor conteúdo da página
- Máximo de 6 resultados visíveis (scroll se houver mais)
- Agrupamento com labels de seção:

```
┌─────────────────────────────┐
│ 🔍 "maria"                  │
├─────────────────────────────┤
│ Membros                     │  ← label de seção (muted, xs)
│  👤 Maria Silva             │  ← item clicável
│  👤 Maria Oliveira Santos   │
├─────────────────────────────┤
│ Células                     │  ← label de seção
│  🏠 Célula Maria Madalena   │  ← item clicável
└─────────────────────────────┘
```

**Cada item do resultado:**
- Ícone: `Users` (lucide) para membros, `Home` (lucide) para células
- Texto: nome completo do membro ou nome da célula
- Hover: `bg-slate-100` (consistente com dropdown-menu existente)
- Cursor: pointer
- Click: navega via `router.push()` e fecha dropdown

### Microcopy
- Placeholder: "Buscar membro, célula..."
- Label da seção de membros: "Membros"
- Label da seção de células: "Células"
- Estado vazio: "Nenhum resultado encontrado para '{termo}'"
- Erro de busca: "Não foi possível buscar. Tente novamente."

## Estados

### Loading
Enquanto a busca está em andamento (debounce + fetch):
- Dropdown aberto com 3 `<Skeleton />` bars (reutiliza componente existente)
- Input mantém o texto digitado

### Vazio (sem resultados)
- Dropdown aberto com texto centralizado: "Nenhum resultado encontrado para '{termo}'"
- Cor: `text-slate-500`, `text-sm`
- Sem CTA (não faz sentido neste contexto — a busca é global)

### Erro
- Dropdown aberto com texto: "Não foi possível buscar. Tente novamente."
- Cor: `text-red-500`, `text-sm`

### Sucesso
- Dropdown com resultados agrupados por tipo (Membros primeiro, Células depois)
- Cada grupo mostra até 3 resultados (total máximo ~6 itens visíveis)
- Se houver mais que 3 por grupo, exibir apenas os 3 primeiros (MVP — sem paginação)

### Idle (< 2 caracteres)
- Dropdown fechado
- Input normal, sem indicação visual extra

## Componentes reutilizados
- `<Search />` de lucide-react (ícone — já em uso no Header)
- `<Skeleton />` de `components/ui/skeleton.tsx` (loading state)
- Estilo do input atual do Header (classe CSS mantida)
- Padrão visual do `<DropdownMenuContent>` para o container do dropdown (border, rounded, shadow, bg-white)
- Padrão visual do `<DropdownMenuItem>` para hover state dos itens

## Componentes NOVOS
- `<SearchCommand />` em `src/components/layout/search-command.tsx` — client component que encapsula o input de busca + dropdown de resultados com debounce. **CRIAR** — justificativa: não existe componente de busca global com dropdown no design system; o `<Input />` e o `<DropdownMenu>` existentes servem como referência visual, mas a interação (debounce, fetch, agrupamento, navegação) exige componente dedicado.

## Interação e acessibilidade
- **Debounce:** 300ms após o usuário parar de digitar (evita chamadas excessivas)
- **Mínimo de caracteres:** 2 (evita resultados muito amplos)
- **Keyboard:** Escape fecha dropdown; Tab move foco para fora
- **Click outside:** fecha dropdown (event listener no document)
- **Mobile:** o input já ocupa largura disponível; dropdown segue a mesma largura
