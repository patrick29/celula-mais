---
task: "Implementar Frontend"
order: 2
input: "UX spec (02-ux-spec.md) + backend já implementado (server actions disponíveis)"
output: "Client components reutilizáveis em components/ui/ + tela principal em app/**/page.tsx, com estados de loading, vazio, erro e sucesso"
---

# Implementar Frontend

Pega a UX spec e o backend pronto e constrói a interface. Ordem obrigatória: componentes reutilizáveis primeiro (em `components/ui/`), depois a tela que os consome. Todos os estados de UI são cobertos: loading, vazio, erro e sucesso.

## Process

1. **Ler a UX spec e mapear cada estado da tela.** Listar: loading, empty state, erro, sucesso, disabled. Se algum estado não está na spec, PARE e pergunte ao ux-designer.
2. **Construir os componentes reutilizáveis primeiro.** Abrir o componente mais parecido em `components/ui/` e seguir o padrão (props tipadas, `"use client"` só quando precisa de estado/efeito, classes Tailwind do projeto).
3. **Montar a tela principal que consome os componentes.** Preferir Server Component para dados iniciais e Client Component apenas para a parte interativa — isolar o `"use client"` no menor escopo possível.
4. **Ligar a server action com `useTransition` e feedback por toast.** `startTransition` para UX otimista, `toast.success` / `toast.error` a partir do retorno da action.
5. **Cobrir todos os estados.** Loading via `isPending`, disabled durante transição, mensagem de erro visível, estado vazio com CTA. Testar cada um manualmente no navegador.

## Output Format

Para cada arquivo criado/modificado:
- Caminho absoluto do arquivo
- Conteúdo completo (se novo) ou diff (se edição)
- Estados cobertos (loading / vazio / erro / sucesso)

## Output Example

**Arquivo:** `components/ui/presence-form.tsx`

```tsx
"use client";

import { useState, useTransition } from "react";
import { toast } from "sonner";
import { recordAttendance } from "@/app/(app)/celulas/[id]/actions";
import { PresenceRow } from "@/components/ui/presence-row";

type Member = { id: string; name: string };

type PresenceFormProps = {
  cellId: string;
  meetingDate: string;
  members: Member[];
  initialPresence: Record<string, boolean>;
};

export function PresenceForm({ cellId, meetingDate, members, initialPresence }: PresenceFormProps) {
  const [presence, setPresence] = useState<Record<string, boolean>>(initialPresence);
  const [isPending, startTransition] = useTransition();

  function togglePresence(memberId: string, present: boolean) {
    // Atualização otimista para feedback imediato ao líder.
    setPresence((prev) => ({ ...prev, [memberId]: present }));

    startTransition(async () => {
      const result = await recordAttendance({ cellId, meetingDate, memberId, present });
      if (!result.ok) {
        // Reverte o estado local se o servidor recusou.
        setPresence((prev) => ({ ...prev, [memberId]: !present }));
        toast.error(result.error ?? "Não foi possível salvar a presença.");
        return;
      }
      toast.success("Presença atualizada.");
    });
  }

  if (members.length === 0) {
    return <p className="text-sm text-muted-foreground">Nenhum membro cadastrado nesta célula.</p>;
  }

  return (
    <ul className="divide-y">
      {members.map((member) => (
        <PresenceRow
          key={member.id}
          member={member}
          present={presence[member.id] ?? false}
          disabled={isPending}
          onToggle={(next) => togglePresence(member.id, next)}
        />
      ))}
    </ul>
  );
}
```

**Estados cobertos:**
- Loading: `isPending` desabilita os toggles durante o salvamento.
- Vazio: mensagem "Nenhum membro cadastrado nesta célula."
- Erro: toast em PT-BR + reversão do estado otimista.
- Sucesso: toast "Presença atualizada."

## Quality Criteria

- `"use client"` isolado no menor componente possível — a tela pai continua Server Component quando viável.
- Todos os estados da UX spec estão implementados (loading, vazio, erro, sucesso).
- Feedback ao usuário via toast em PT-BR, nunca via `alert` ou console.
- Componentes reutilizáveis estão em `components/ui/` com props tipadas.
- Zero `any` nas props ou no estado.

## Veto Conditions

- **Uso de `any` em props ou `useState`.** Implementação rejeitada.
- **Server action chamada sem tratamento de erro ou sem feedback visual ao usuário.** Volta para correção.
