"use client";

import { QueryClientProvider } from "@tanstack/react-query";
import { ReactNode, useState } from "react";
import { makeQueryClient } from "@/lib/hooks/query-client";

type QueryProviderProps = Readonly<{
  children: ReactNode;
}>;

export function QueryProvider({ children }: QueryProviderProps) {
  const [client] = useState(makeQueryClient);

  return (
    <QueryClientProvider client={client}>{children}</QueryClientProvider>
  );
}
