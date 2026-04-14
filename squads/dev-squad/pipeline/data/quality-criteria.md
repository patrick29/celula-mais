# Quality Criteria — Dev Squad Célula Mais

Critérios de qualidade por fase. Cada agente se auto-verifica antes de entregar; o QA valida o resultado final contra os critérios de PM e UX.

---

## Product Manager (Requisitos)

- [ ] Toda user story tem pelo menos 1 critério de aceite testável (preferencialmente em Gherkin).
- [ ] O escopo está explícito em must/should/could/won't (MoSCoW).
- [ ] A(s) persona(s) afetada(s) está nomeada explicitamente.
- [ ] Riscos e assumptions estão listados (mesmo que a lista seja pequena).
- [ ] O documento cabe em 1-2 páginas — é conciso.
- [ ] Cada story está no formato "Como <persona>, quero <ação>, para <benefício>".
- [ ] Nenhuma story tem palavras vagas como "simples", "rápido", "fácil", "depois a gente vê".

---

## UX Designer (UX Spec)

- [ ] Todo fluxo tem **happy path** + pelo menos 2 estados alternativos (erro/vazio/loading).
- [ ] Cada componente NOVO está explicitamente marcado como "CRIAR".
- [ ] Componentes reutilizados do design system estão listados.
- [ ] Microcopy está em português, sem erros, no tom do Célula Mais.
- [ ] A spec permite ao dev implementar sem adivinhar decisões visuais.
- [ ] Estados vazios têm CTA apropriado, não só texto passivo.
- [ ] Mensagens de erro são acionáveis (dizem o que fazer a seguir).

---

## Tech Lead (Plano Técnico)

- [ ] O plano lista **arquivos exatos** (caminho completo) a criar ou editar.
- [ ] Contém seções separadas: modelo de dados, APIs/server actions, componentes.
- [ ] Tem passo a passo numerado executável sequencialmente.
- [ ] Lista riscos e trade-offs explicitamente.
- [ ] Sinaliza decisões que precisam de input humano.
- [ ] Server actions têm validação Zod e verificação de permissão descritas.
- [ ] Migrations destrutivas (se houver) estão claramente sinalizadas.
- [ ] Segue convenções do código existente (Next.js App Router, Drizzle, etc.).

---

## Fullstack Developer (Implementação)

- [ ] **Zero** uso de `any` em TypeScript.
- [ ] Toda server action tem validação Zod e verificação de permissão.
- [ ] Toda mensagem de erro ao usuário é em português e acionável.
- [ ] O dev rodou e testou manualmente o happy path antes de entregar.
- [ ] Testou pelo menos 2 casos de erro/borda.
- [ ] Commits seguem o padrão existente do repositório.
- [ ] Código novo segue o mesmo padrão do arquivo vizinho.
- [ ] Sem `console.log` esquecido, sem código comentado, sem TODOs vagos.

---

## QA Tester (Validação)

- [ ] Cada critério de aceite do PM aparece como item do checklist.
- [ ] Estados vazios, de erro e loading foram testados.
- [ ] Casos de borda identificados (permissões, dados inválidos, limites) foram testados.
- [ ] Regressão: o que já funcionava continua funcionando.
- [ ] Todo bug relatado tem: passos numerados, esperado vs obtido, severidade.
- [ ] Veredito final é binário: APROVADO ou REPROVADO.
- [ ] Severidade usa escala padrão: crítica / alta / média / baixa.

---

## Entrega Final (Product Manager)

- [ ] Todos os critérios de aceite originais foram atendidos.
- [ ] QA aprovou explicitamente.
- [ ] Comunicação ao usuário é clara: o que foi feito, como usar, o que ficou fora.
- [ ] Débitos conhecidos (Should/Could que ficaram para depois) estão listados.
