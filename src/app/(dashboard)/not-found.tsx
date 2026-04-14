"use client";

import { MapPinOff, Home } from "lucide-react";
import { ErrorScreen } from "@/components/feedback/error-screen";

export default function DashboardNotFound() {
  return (
    <ErrorScreen
      variant="inline"
      icon={MapPinOff}
      iconColorClassName="text-slate-400"
      title="Não encontramos essa página"
      description="A página que você procura pode ter sido movida ou não existe mais. Vamos voltar para o começo?"
      primaryAction={{
        label: "Voltar ao início",
        icon: Home,
        href: "/",
      }}
    />
  );
}
