---
task: "Especificar Telas"
order: 2
input: "Fluxo de telas mapeado na tarefa anterior (mapear-fluxo)"
output: "Spec detalhada de cada tela: cabeçalho, corpo, ações, microcopy, validações, estados"
---

# Especificar Telas

Detalha cada tela do fluxo: componentes visuais, textos finais em português, ações primárias e secundárias, validações inline e microcopy de todos os estados. O dev deve conseguir implementar lendo esta spec, sem precisar inferir nada.

## Process

1. Para cada tela do fluxo mapeado, identifique os três blocos visuais: cabeçalho, corpo, rodapé/ações.
2. Liste no cabeçalho: título da tela, botão de voltar, ações contextuais (ex: filtro, busca).
3. Detalhe o corpo: quais componentes aparecem, em que ordem, com quais dados.
4. Defina as ações primária e secundária do rodapé, com microcopy final.
5. Para cada campo editável, especifique validações inline e mensagens de erro.
6. Escreva microcopy de cada estado: vazio, loading, erro, sucesso — tudo em português, no tom acolhedor do Célula Mais.

## Output Format

```yaml
tela: "<nome da tela>"
cabecalho:
  titulo: "<título>"
  acoes_contextuais: ["<ação 1>", "<ação 2>"]
corpo:
  componentes:
    - tipo: "<componente>"
      conteudo: "<o que mostra>"
rodape:
  acao_primaria: "<texto do botão>"
  acao_secundaria: "<texto do botão>"
validacoes:
  - campo: "<campo>"
    regra: "<regra>"
    mensagem_erro: "<microcopy>"
estados:
  vazio: "<microcopy>"
  loading: "<microcopy>"
  erro: "<microcopy>"
  sucesso: "<microcopy>"
```

## Output Example

```yaml
tela: "Registro de Presença na Célula"
cabecalho:
  titulo: "Presença — Célula Esperança"
  acoes_contextuais:
    - "Botão voltar (seta à esquerda) retorna para Minhas Células"
    - "Data da reunião (seletor à direita, default: hoje)"
corpo:
  componentes:
    - tipo: "<Card>"
      conteudo: "Resumo da célula: nome, líder, total de membros, data da última reunião"
    - tipo: "Lista de membros"
      conteudo: "Para cada membro: <Avatar> + nome + <Toggle> de presença"
    - tipo: "<Input>"
      conteudo: "Campo opcional 'Observações da reunião' (textarea, até 500 caracteres)"
rodape:
  acao_primaria: "Botão <Button variant='primary'> com texto 'Salvar presença' (fixo no rodapé em mobile)"
  acao_secundaria: "Botão <Button variant='ghost'> com texto 'Cancelar' (volta sem salvar, abre <Dialog> de confirmação se houver alterações)"
validacoes:
  - campo: "Observações"
    regra: "Máximo 500 caracteres"
    mensagem_erro: "As observações devem ter no máximo 500 caracteres."
  - campo: "Lista de membros"
    regra: "Pelo menos 1 membro marcado como presente para salvar"
    mensagem_erro: "Marque ao menos um membro presente para registrar a reunião."
estados:
  vazio: "Esta célula ainda não tem membros cadastrados. [Botão: Adicionar membro]"
  loading: "Skeleton dos cards de membros enquanto carrega. Botão 'Salvar presença' desabilitado com spinner e texto 'Salvando'."
  erro: "<Toast variant='error'> com texto 'Não foi possível salvar a presença. Verifique sua conexão e tente novamente.'"
  sucesso: "<Toast variant='success'> com texto 'Presença registrada com sucesso.' Redireciona para Minhas Células após 2 segundos."
```

## Quality Criteria

- Cada tela tem cabeçalho, corpo e rodapé especificados.
- Toda ação (primária e secundária) tem microcopy final em português.
- Toda validação inline tem a mensagem de erro escrita por extenso.
- Os 4 estados (vazio, loading, erro, sucesso) têm microcopy definida.

## Veto Conditions

- Tela sem microcopy final nos botões ou nas mensagens de erro → rejeita e pede texto pronto.
- Tela sem estado de erro ou vazio especificados → rejeita e pede cobertura completa.
