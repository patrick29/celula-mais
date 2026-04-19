"use client";

import { Toaster as SonnerToaster } from "sonner";

type ToasterProps = React.ComponentProps<typeof SonnerToaster>;

export function Toaster(props: ToasterProps) {
  return (
    <SonnerToaster
      theme="light"
      richColors
      closeButton
      position="bottom-right"
      toastOptions={{
        classNames: {
          toast:
            "rounded-lg border border-border bg-card shadow-md",
          title: "text-sm font-medium text-foreground",
          description: "text-xs text-muted-foreground",
        },
      }}
      {...props}
    />
  );
}
