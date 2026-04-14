---
task: "Analisar Impacto"
order: 1
input:
  - "squads/dev-squad/output/{feature}/01-requisitos.md"
  - "squads/dev-squad/output/{feature}/02-ux-spec.md"
  - "Código-fonte do repo Célula Mais"
output: "Lista estruturada de arquivos afetados, dependências descobertas e padrões observados"
---

# Analisar Impacto

Mapear o que existe no repo Célula Mais antes de desenhar qualquer plano. O objetivo é encaixar a feature no código atual — não propor arquitetura paralela.

## Process

1. **Ler requisitos e UX spec** para saber o que precisa existir: entidades, telas, fluxos, permissões.
2. **Usar Grep/Glob para mapear módulos relacionados:**
   - `Glob` em `db/schema/**/*.ts` para listar tabelas existentes.
   - `Glob` em `app/**/page.tsx` e `app/**/route.ts` para rotas atuais.
   - `Grep` por entidades relacionadas (ex: `celula`, `membro`, `presenca`) em todo o repo.
   - `Glob` em `components/ui/**/*.tsx` para componentes reutilizáveis disponíveis.
3. **Ler arquivos-chave** identificados no passo 2 com `Read` para entender o padrão atual: como são feitas as server actions, como o Drizzle é usado, como os componentes UI são compostos.
4. **Classificar arquivos** entre criar (novos) e editar (existentes que precisam mudar), sempre com caminho completo.
5. **Listar dependências** envolvidas: bibliotecas já instaladas (Zod, Drizzle, etc.), schemas relacionados, componentes base.
6. **Registrar padrões observados** no código atual para o plano seguir o mesmo estilo (naming, estrutura de pastas, forma de exportação).

## Output Format

Saída em YAML dentro do documento de análise, em `squads/dev-squad/output/{feature}/_analise-impacto.yaml`.

```yaml
arquivos_a_criar:
  - caminho: "db/schema/..."
    proposito: "..."
arquivos_a_editar:
  - caminho: "..."
    motivo: "..."
dependencias:
  bibliotecas: []
  schemas_relacionados: []
  componentes_base: []
padroes_observados:
  - "..."
```

## Output Example

```yaml
feature: "Registro de Presença em Células"

arquivos_a_criar:
  - caminho: "db/schema/attendance.ts"
    proposito: "Nova tabela attendance com fk para celulas e membros"
  - caminho: "db/migrations/0003_add_attendance.sql"
    proposito: "Migration de criação da tabela"
  - caminho: "app/celulas/[id]/presenca/page.tsx"
    proposito: "Tela de registro de presença da reunião"
  - caminho: "app/celulas/[id]/presenca/actions.ts"
    proposito: "Server action recordAttendance"
  - caminho: "components/presenca/AttendanceList.tsx"
    proposito: "Lista de membros com checkbox de presença"

arquivos_a_editar:
  - caminho: "db/schema/index.ts"
    motivo: "Exportar novo schema attendance"
  - caminho: "app/celulas/[id]/page.tsx"
    motivo: "Adicionar link para a tela de presença"
  - caminho: "components/sidebar/Sidebar.tsx"
    motivo: "Adicionar item de menu Presença"

dependencias:
  bibliotecas:
    - "drizzle-orm (já instalado)"
    - "zod (já instalado)"
  schemas_relacionados:
    - "db/schema/celulas.ts"
    - "db/schema/membros.ts"
  componentes_base:
    - "components/ui/checkbox.tsx"
    - "components/ui/button.tsx"
    - "components/ui/card.tsx"

padroes_observados:
  - "Schemas Drizzle usam pgTable e exportam type Insert/Select"
  - "Server actions ficam em actions.ts junto da page.tsx"
  - "Validação com Zod antes de qualquer chamada ao db"
  - "Componentes de feature vivem em components/{feature}/"
```

## Quality Criteria

- Todo arquivo listado tem caminho completo a partir da raiz do repo.
- Distinção clara entre criar e editar.
- Dependências incluem bibliotecas, schemas e componentes reutilizáveis.
- Padrões observados são extraídos de leitura real do código, não suposição.

## Veto Conditions

- Análise feita sem usar Grep/Glob/Read no repo — é chute, não análise.
- Lista de arquivos com nomes genéricos ("o schema", "a página") sem caminho completo.
