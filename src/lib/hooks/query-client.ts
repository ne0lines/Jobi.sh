import { MutationCache, QueryCache, QueryClient } from "@tanstack/react-query";
import * as Sentry from "@sentry/nextjs";

export function makeQueryClient() {
  return new QueryClient({
    defaultOptions: {
      queries: {
        staleTime: 60_000,
        gcTime: 300_000,
      },
    },
    queryCache: new QueryCache({
      onError: (error, query) => {
        Sentry.withScope((scope) => {
          scope.setTag("source", "tanstack-query");
          scope.setContext("query", {
            queryKey: JSON.stringify(query.queryKey),
          });
          Sentry.captureException(error);
        });
      },
    }),
    mutationCache: new MutationCache({
      onError: (error, _variables, _context, mutation) => {
        Sentry.withScope((scope) => {
          scope.setTag("source", "tanstack-mutation");
          scope.setContext("mutation", {
            mutationKey: mutation.options.mutationKey
              ? JSON.stringify(mutation.options.mutationKey)
              : "anonymous",
          });
          Sentry.captureException(error);
        });
      },
    }),
  });
}
