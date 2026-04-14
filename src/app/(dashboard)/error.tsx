"use client";

import { useEffect } from "react";
import { TriangleAlert, RotateCw, Home } from "lucide-react";
import { ErrorScreen } from "@/components/feedback/error-screen";

export default function DashboardError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error("[dashboard:error-boundary]", {
      message: error.message,
      digest: error.digest,
      stack: error.stack,
      at: new Date().toISOString(),
    });
  }, [error]);

  return (
    <ErrorScreen
      variant="inline"
      icon={TriangleAlert}
      title="Algo não saiu como esperado"
      description="Encontramos um imprevisto ao carregar esta parte do sistema. Não se preocupe — seus dados estão seguros. Vamos tentar novamente?"
      primaryAction={{
        label: "Tentar novamente",
        icon: RotateCw,
        onClick: () => reset(),
      }}
      secondaryAction={{
        label: "Voltar ao início",
        icon: Home,
        href: "/",
      }}
      digest={error.digest}
      devErrorMessage={error.message}
    />
  );
}
