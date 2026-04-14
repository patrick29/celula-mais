# Domain Framework — Ciclo de Desenvolvimento Célula Mais

Metodologia end-to-end que a squad aplica em toda entrega. Cada fase tem um agente responsável.

---

## Fase 1 — Análise de Requisitos (Product Manager)

1. Leia o pedido do usuário e identifique o **problema real** (não apenas a solução sugerida). Pergunte "por quê?" até entender a dor.
2. Levante contexto do Célula Mais: qual módulo é afetado? Quais personas usam (pastor, líder de célula, administrador)? Qual o fluxo atual?
3. Defina o escopo da entrega com **MoSCoW** (Must, Should, Could, Won't).
4. Escreva **user stories INVEST** no formato "Como <persona>, quero <ação>, para <benefício>".
5. Para cada story, liste **critérios de aceite** em Gherkin (Dado / Quando / Então).
6. Liste riscos, dependências e assumptions explicitamente.
7. Entregue o documento para UX Designer e Tech Lead.

---

## Fase 2 — Especificação de UX (UX Designer)

1. Leia os requisitos do PM e identifique cada tela/interação envolvida.
2. Liste personas e contexto de uso (mobile? desktop? em movimento na célula?).
3. Mapeie o fluxo: entrada → ações → estados → confirmação → saída. **Inclua erros e vazios.**
4. Para cada tela, detalhe: cabeçalho, corpo, ações primárias/secundárias, microcopy, validações inline.
5. Verifique componentes **já existentes** (sidebar, cards, botões, tabelas) e reutilize o máximo.
6. Sinalize explicitamente qualquer **componente NOVO** que o dev precisará criar.
7. Microcopy em português claro, respeitoso, no tom do Célula Mais.
8. Entregue a spec para o Tech Lead.

---

## Fase 3 — Plano Técnico (Tech Lead)

1. Leia requisitos (PM) e UX spec (Designer) antes de qualquer coisa.
2. **Explore o código existente** com Grep/Glob/Read: estrutura de pastas, padrão de rotas, ORM, componentes UI.
3. Identifique os **arquivos exatos** (caminho completo) que serão tocados — criar ou editar.
4. Desenhe o **modelo de dados**: tabelas/colunas novas, relacionamentos, migrations necessárias.
5. Defina **endpoints/server actions**: método, rota, payload, resposta, validação Zod, autorização.
6. Liste os **componentes React** a criar ou editar, seguindo a UX spec.
7. Escreva o plano em **passos pequenos e sequenciais** (1, 2, 3...) que o dev segue linearmente.
8. Liste **riscos**: performance, segurança, compatibilidade, migrations destrutivas, breaking changes.
9. Sinalize decisões/trade-offs que precisam de input humano.
10. Entregue o plano para o **checkpoint de aprovação** do usuário.

---

## Checkpoint — Aprovação do Plano Técnico

Único checkpoint do ciclo. Usuário revisa o plano e:
- **Aprova** → segue para implementação.
- **Pede ajustes** → Tech Lead revisa.
- **Cancela** → ciclo encerra sem código.

---

## Fase 4 — Implementação (Fullstack Developer)

1. Releia o plano técnico aprovado e a UX spec lado a lado.
2. Execute o passo a passo **na ordem** — não pule etapas.
3. Para cada arquivo a tocar, abra o arquivo vizinho mais próximo e siga o **mesmo padrão** (naming, imports, estrutura).
4. Comece pelo **backend**: migration → schema → validação Zod → server action. Teste cada camada.
5. Siga para o **frontend**: componentes reutilizáveis primeiro, depois a tela que os consome.
6. **TypeScript estrito** — sem `any`. Tipos inferidos do schema quando possível.
7. Trate erros: try/catch nas server actions, toasts no front, mensagens claras em PT-BR.
8. **Teste manual** do happy path + pelo menos 2 casos de erro/borda antes de entregar.
9. Commit pequeno e descritivo.
10. Entregue ao QA com nota: "O que fiz, o que testei, o que deixei de fora".

---

## Fase 5 — Validação (QA Tester)

1. Pegue critérios de aceite do PM + estados definidos pelo Designer.
2. Monte um **checklist** marcando: happy path, estados alternativos, casos de borda, regressão.
3. Execute cada item **manualmente**. Registre: passos, esperado, obtido, status.
4. Se tudo passou → assina a entrega, devolve ao PM.
5. Se falhou → relatório de bugs acionável (passos, severidade, impacto, sugestão). Devolve ao Fullstack.
6. **Veredito binário:** APROVADO ou REPROVADO. Nunca "quase funciona".

---

## Fase 6 — Entrega Final (Product Manager)

1. Verifica se a implementação atende aos critérios de aceite originais.
2. Confirma que o QA aprovou.
3. Escreve comunicação clara ao usuário solicitante: o que foi feito, como usar, o que ficou fora.
4. Encerra o ciclo.

---

## Loop de rejeição

Se o QA reprovar, o fluxo volta para a **Fase 4 (Fullstack)** com o relatório de bugs. O dev corrige e devolve ao QA. Esse loop pode repetir até que o QA aprove.
