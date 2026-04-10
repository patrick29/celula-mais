# Plano de Tarefas: Refinamento Estético e Arquitetural (Home Dashboard)

## 1. Melhorias Base de Layout
- [x] Otimizar `src/app/(dashboard)/layout.tsx` introduzindo largura máxima (`max-w`) para preservar visualização em monitores largos e melhorando os espaçamentos gerais.
- [x] Refinar esteticamente a `src/components/layout/sidebar.tsx` com melhores micro-interações, estados ativos (active states) e espaçamentos no hover.

## 2. Experiência de Carregamento (Loading) e Skeleton states
- [x] Criar ou atualizar os `Skeleton` loaders e integrá-los no `src/app/(dashboard)/loading.tsx`
- [x] Desenhar *Empty States* abstratos/clean, caso não existam dados ao exibir componentes do painel home.

## 3. Construção do Dashboard Principal (Home Vitrine)
- [x] Intervir em `src/app/(dashboard)/page.tsx` para apresentar um design premium.
- [x] Refatorar os Cards analíticos aplicando gradientes sutis, efeitos de borda ou glassmorphism de impacto inicial (WOW factor).
- [x] Integrar micro-animações (Tw-Animate-Css) nos itens de renderização para garantir suavidade.
- [x] (Opcional) Refinar e enriquecer gráficos (`recharts`) caso presentes na página principal para maior integração de paleta (`oklch`).

## 4. Verificação
- [x] Avaliar as alterações responsivas.
- [x] Ajustar dependências visuais.
