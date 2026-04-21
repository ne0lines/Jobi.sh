import { notFound, redirect } from "next/navigation";
import type { RmRequestDecision } from "@/app/types";
import { RmRequestDecisionCard } from "@/components/rm/rm-request-decision-card";
import { getRmRequestDecisionPageData, RmError } from "@/lib/rm";

export const dynamic = "force-dynamic";

export default async function RmRequestPage({
  params,
  searchParams,
}: Readonly<{
  params: Promise<{ token: string }>;
  searchParams: Promise<{ decision?: string }>;
}>) {
  const { token } = await params;
  const resolvedSearchParams = await searchParams;
  const initialDecision: RmRequestDecision | null =
    resolvedSearchParams.decision === "accept" || resolvedSearchParams.decision === "decline"
      ? resolvedSearchParams.decision
      : null;

  let data;

  try {
    data = await getRmRequestDecisionPageData(token);
  } catch (error) {
    if (error instanceof RmError && error.status === 404) {
      notFound();
    }

    throw error;
  }

  const nextParams = new URLSearchParams();

  if (initialDecision) {
    nextParams.set("decision", initialDecision);
  }

  const nextPath = nextParams.size > 0
    ? `/rm/request/${token}?${nextParams.toString()}`
    : `/rm/request/${token}`;

  if (data.viewerState === "anonymous") {
    const authParams = new URLSearchParams({
      email: data.candidateEmail,
      next: nextPath,
    });

    redirect(`/auth?${authParams.toString()}`);
  }

  if (data.viewerState === "needs-profile") {
    const createProfileParams = new URLSearchParams({
      next: nextPath,
    });

    if (data.candidateName) {
      createProfileParams.set("name", data.candidateName);
    }

    redirect(`/account/create-profile?${createProfileParams.toString()}`);
  }

  return (
    <main className="min-h-svh bg-app-bg px-4 py-8 pb-24 md:px-8 md:pb-8">
      <RmRequestDecisionCard initialData={data} initialDecision={initialDecision} />
    </main>
  );
}