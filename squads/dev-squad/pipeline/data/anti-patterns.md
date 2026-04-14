# Anti-Patterns — Dev Squad Célula Mais

Erros recorrentes em desenvolvimento de software que a squad evita explicitamente. Cada anti-pattern tem um "por quê" e uma alternativa.

---

## Product Manager

### Escrever stories sem critérios de aceite
**Problema:** O dev não sabe quando terminou e o QA não sabe o que testar. A entrega fica indefinida.
**Alternativa:** Toda story tem ao menos 1 critério em Gherkin ou bullets objetivos.

### Aceitar o pedido literal sem perguntar "por quê?"
**Problema:** Você resolve o sintoma, não a causa. O usuário volta dias depois com o problema real.
**Alternativa:** Pergunte "por quê?" pelo menos 3 vezes antes de fechar escopo.

### Empilhar 20 stories num MVP
**Problema:** Minimum-viable significa o **menor** incremento com valor. Mais stories = mais risco, atraso, escopo inflado.
**Alternativa:** Aplique MoSCoW rigorosamente. Must é pouca coisa, Should/Could ficam para depois.

### Deixar assumptions implícitas
**Problema:** O dev assume o contrário do que você pensou e retrabalha a entrega.
**Alternativa:** Liste assumptions explicitamente, mesmo que óbvias.

---

## UX Designer

### Esquecer estados de erro e vazio
**Problema:** O usuário trava na primeira falha e perde confiança no produto.
**Alternativa:** Todo fluxo tem happy path + ao menos 2 estados alternativos (vazio/erro/loading).

### Inventar componentes novos quando já existe um similar
**Problema:** Quebra a consistência visual e aumenta o débito técnico do design system.
**Alternativa:** Antes de criar, verifique `components/ui/` e marque "CRIAR" apenas o que realmente não existe.

### Microcopy genérica ("Ops, algo deu errado")
**Problema:** Não ajuda o usuário a resolver — é só um pedido de desculpas vazio.
**Alternativa:** Mensagem acionável: "Não foi possível salvar. Tente novamente em instantes."

### Desenhar só happy path
**Problema:** 80% dos bugs vêm de fluxos alternativos ignorados.
**Alternativa:** Cada tela lista explicitamente loading, vazio, erro, sucesso.

---

## Tech Lead

### Escrever plano sem ler o código existente
**Problema:** O plano propõe arquitetura incompatível com o que já existe — retrabalho garantido.
**Alternativa:** Grep/Glob/Read antes de planejar. Cite arquivos vizinhos que seguem o padrão.

### Pular validação/autorização nas APIs
**Problema:** É a maior fonte de vulnerabilidade em SaaS. Qualquer um burla o client.
**Alternativa:** Toda server action descreve validação (Zod) e autorização (quem pode chamar).

### Ignorar migrations destrutivas sem avisar
**Problema:** Drops, renames ou mudanças de tipo podem perder dados em produção.
**Alternativa:** Sinalize migrations destrutivas em destaque. Escreva plano de rollback quando aplicável.

### Plano em bloco único sem passo a passo
**Problema:** O dev se perde no meio da implementação e pula etapas por engano.
**Alternativa:** Passo a passo numerado, sequencial, cada passo pequeno e testável.

---

## Fullstack Developer

### Usar `any` em TypeScript
**Problema:** Perde a segurança de tipos, esconde bugs que aparecem só em produção.
**Alternativa:** Tipos inferidos do schema Zod/Drizzle. `unknown` + parsing quando o tipo é dinâmico.

### Pular validação server-side confiando no front
**Problema:** Qualquer um abre o DevTools e burla o client. É a vulnerabilidade clássica de SaaS.
**Alternativa:** Validação Zod em toda server action, sempre. Client é conveniência, não segurança.

### Hardcodar strings que deveriam vir do schema/i18n
**Problema:** Quando muda o label, quebra em 10 lugares. Quebra manutenção.
**Alternativa:** Constantes centralizadas ou inferidas do schema.

### Commitar sem rodar teste manual
**Problema:** Entrega bugs óbvios ao QA — tempo desperdiçado no loop de correção.
**Alternativa:** Teste manual do happy path + 2 casos de erro antes de commitar.

---

## QA Tester

### Aprovar sem testar edge cases
**Problema:** Bugs graves passam porque só o happy path foi visto. Vão para produção.
**Alternativa:** Teste os estados alternativos (vazio/erro/loading) e casos de permissão sempre.

### Reportar bug sem passos para reproduzir
**Problema:** O dev não consegue corrigir o que não reproduz — perde horas tentando.
**Alternativa:** Passos numerados, browser/viewport, esperado vs obtido, severidade.

### Usar "não está funcionando" como relatório
**Problema:** Zero informação acionável. O dev tem que adivinhar o que você viu.
**Alternativa:** Descrição factual: o que clicou, o que esperou, o que apareceu.

### Aprovar "com ressalva"
**Problema:** "Quase funciona" vira "funciona" na cabeça do usuário. Bug vira débito.
**Alternativa:** Veredito binário — APROVADO ou REPROVADO. Sem meio-termo.

---

## Processuais (toda a squad)

### Pular o checkpoint do plano técnico
**Problema:** O dev codifica na direção errada e descobre só no fim. Retrabalho massivo.
**Alternativa:** Plano é sempre aprovado pelo usuário antes do dev começar.

### Fazer "só mais uma coisinha" fora do escopo
**Problema:** Aumenta risco, atrasa a entrega, introduz bugs não-planejados.
**Alternativa:** Anote como "Could" ou "nova story" e volte para o ciclo.

### Débito invisível ("depois arrumo")
**Problema:** Nunca é "depois". Vira manutenção pior 3 meses depois.
**Alternativa:** Se for decisão consciente, documente. Caso contrário, faça certo agora.
