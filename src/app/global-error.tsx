"use client";

import { useEffect } from "react";
import { ShieldAlert, RotateCw } from "lucide-react";
import { ErrorScreen } from "@/components/feedback/error-screen";

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error("[global:error-boundary]", {
      message: error.message,
      digest: error.digest,
      stack: error.stack,
      at: new Date().toISOString(),
    });
  }, [error]);

  return (
    <html lang="pt-BR">
      <body className="font-sans antialiased">
        <ErrorScreen
          variant="fullscreen"
          icon={ShieldAlert}
          title="O sistema encontrou um problema inesperado"
          description="Tivemos um imprevisto ao carregar o Célula Mais. Seus dados estão seguros. Tente recarregar a página — se o problema continuar, avise sua equipe de TI."
          primaryAction={{
            label: "Recarregar a página",
            icon: RotateCw,
            onClick: () => reset(),
          }}
          digest={error.digest}
          devErrorMessage={error.message}
        />
      </body>
    </html>
  );
}
