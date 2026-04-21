"use client";

import { useQuery } from "@tanstack/react-query";
import { getUser } from "@/app/services/services";
import { userKeys } from "@/lib/hooks/job-query-keys";

export function useUser() {
  return useQuery({
    queryKey: userKeys.profile,
    queryFn: getUser,
    staleTime: 300_000,
    refetchOnReconnect: false,
    refetchOnWindowFocus: false,
  });
}
