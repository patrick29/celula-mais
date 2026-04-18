# Requisitos — Campo de Busca Global Funcional

## Problema
O campo de busca no cabeçalho do dashboard é puramente visual — não tem handler, estado nem lógica conectada. Usuários veem "Buscar membro, célula..." mas ao digitar nada acontece, gerando frustração e perda de confiança na ferramenta.

## Personas afetadas
- **Líder de célula:** busca membros da sua célula para acessar perfil, registrar presença ou verificar informações rapidamente.
- **Supervisor:** busca membros ou células da sua rede para acompanhamento pastoral.
- **Administrador:** busca qualquer membro ou célula do sistema para gestão operacional.

## Escopo (MVP)
**Must:**
- Busca de membros pelo nome com resultados em tempo real (dropdown) ao digitar >= 2 caracteres.
- Busca de células pelo nome com resultados no mesmo dropdown, diferenciados por ícone.
- Navegação para a página de detalhes ao clicar em um resultado.
- Estado vazio ("Nenhum resultado encontrado") quando a busca não retorna dados.

**Should:**
_(vazio nesta entrega)_

**Could:**
_(vazio nesta entrega)_

**Won't (agora):**
- Busca de reuniões por data — reuniões têm fluxo próprio na tela de células.
- Busca fuzzy (tolerante a erros de digitação) — `ilike` com `%` já atende o MVP.
- Atalho de teclado (Ctrl+K) para focar no campo — o campo já está visível no topo.

## User Stories

### US-01 — Buscar membros pelo nome no campo de busca global
Como líder de célula, quero digitar o nome de um membro no campo de busca do cabeçalho e ver resultados em tempo real, para acessar rapidamente o perfil sem navegar por menus.

**Critérios de aceite:**
- Dado que estou logado no dashboard, Quando digito pelo menos 2 caracteres no campo de busca, Então vejo uma lista dropdown com membros cujo nome contém o texto digitado.
- Dado que vejo resultados de busca, Quando clico em um membro da lista, Então sou redirecionado para a página de detalhes desse membro.
- Dado que digito um nome que não existe, Quando a busca retorna vazio, Então vejo a mensagem "Nenhum resultado encontrado".

### US-02 — Buscar células pelo nome no campo de busca global
Como supervisor, quero buscar uma célula pelo nome no campo de busca do cabeçalho, para navegar diretamente para a célula sem percorrer a listagem completa.

**Critérios de aceite:**
- Dado que digito pelo menos 2 caracteres no campo de busca, Quando existem células com nome correspondente, Então vejo células listadas junto com membros nos resultados, com ícone diferenciando o tipo.
- Dado que clico em uma célula nos resultados, Quando navego, Então sou redirecionado para a página de detalhes daquela célula.

## Riscos e assumptions
- Assume que `getMembers({ search })` já funciona com `ilike` no backend (verificado no código).
- Assume que existe uma rota de detalhes de membro acessível (ex: `/members/[id]`).
- Assume que existe uma rota de detalhes de célula acessível (ex: `/cells/[id]` ou equivalente).
- Header.tsx é server component — o campo de busca precisa ser extraído como client component separado.
- Risco: debounce necessário para evitar chamadas excessivas ao servidor a cada caractere digitado.
