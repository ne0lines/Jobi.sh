"use client";

import { QueryClientProvider } from "@tanstack/react-query";
import { useRef } from "react";
import { makeQueryClient } from "@/lib/hooks/query-client";

export function QueryProvider({ children }: { children: React.ReactNode }) {
  const ref = useRef<ReturnType<typeof makeQueryClient> | null>(null);
  if (ref.current === null) ref.current = makeQueryClient();

  return (
    <QueryClientProvider client={ref.current}>{children}</QueryClientProvider>
  );
}
