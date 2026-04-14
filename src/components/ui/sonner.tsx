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
            "rounded-2xl border border-white/40 bg-white/90 backdrop-blur-xl shadow-md",
          title: "text-sm font-medium text-slate-800",
          description: "text-xs text-slate-600",
        },
      }}
      {...props}
    />
  );
}
