"use client";

import { LoaderCircle } from "lucide-react";
import { useCallback, useEffect, useRef, useState } from "react";
import type { RmRequestDecision, RmRequestDecisionPageData } from "@/app/types";

type RmRequestDecisionCardProps = {
  initialData: RmRequestDecisionPageData;
  initialDecision: RmRequestDecision | null;
};

const statusMessage: Record<string, string> = {
  accepted: "Förfrågan är redan accepterad.",
  cancelled: "Förfrågan är inte längre aktiv.",
  declined: "Förfrågan är redan avslagen.",
  pending: "Välj om du vill acceptera eller avslå kopplingen.",
};

export function RmRequestDecisionCard({
  initialData,
  initialDecision,
}: Readonly<RmRequestDecisionCardProps>) {
  const [message, setMessage] = useState(statusMessage[initialData.status]);
  const [status, setStatus] = useState(initialData.status);
  const [pendingDecision, setPendingDecision] = useState<RmRequestDecision | null>(null);
  const hasAutoSubmitted = useRef(false);

  const respond = useCallback(async (decision: RmRequestDecision) => {
    setPendingDecision(decision);

    try {
      const response = await fetch(`/api/rm/requests/${initialData.token}/respond`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ decision }),
      });

      const payload = (await response.json()) as { error?: string; message?: string; status?: string };

      if (!response.ok) {
        throw new Error(payload.error || "Det gick inte att svara på förfrågan.");
      }

      const nextStatus =
        (payload.status as typeof status | undefined) ||
        (decision === "accept" ? "accepted" : "declined");

      setMessage(payload.message || statusMessage[nextStatus]);
      setStatus(nextStatus);
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "Det gick inte att svara på förfrågan.");
    } finally {
      setPendingDecision(null);
    }
  }, [initialData.token]);

  useEffect(() => {
    if (
      !initialDecision ||
      hasAutoSubmitted.current ||
      !initialData.canRespond ||
      status !== "pending"
    ) {
      return;
    }

    hasAutoSubmitted.current = true;
    void respond(initialDecision);
  }, [initialData.canRespond, initialDecision, respond, status]);

  return (
    <article className="mx-auto max-w-2xl rounded-[2rem] border border-app-stroke bg-app-card p-6 md:p-8">
      <p className="text-sm font-semibold uppercase tracking-[0.18em] text-app-primary">
        Jobi.sh RM
      </p>
      <h1 className="mt-3 font-display text-4xl leading-none text-app-ink">
        Kopplingsförfrågan
      </h1>
      <p className="mt-4 text-base leading-7 text-app-muted">
        {initialData.advisorName} vill koppla ditt konto till {initialData.organizationName}.
      </p>

      <div className="mt-6 rounded-3xl bg-app-surface p-5">
        <dl className="space-y-3 text-sm">
          <div>
            <dt className="font-semibold text-app-muted">Konto</dt>
            <dd className="mt-1 text-app-ink">{initialData.candidateName || initialData.candidateEmail}</dd>
          </div>
          <div>
            <dt className="font-semibold text-app-muted">E-post</dt>
            <dd className="mt-1 text-app-ink">{initialData.candidateEmail}</dd>
          </div>
          <div>
            <dt className="font-semibold text-app-muted">Status</dt>
            <dd className="mt-1 text-app-ink">{message}</dd>
          </div>
        </dl>
      </div>

      {!initialData.canRespond ? (
        <p className="mt-6 rounded-2xl border border-app-stroke bg-app-surface px-4 py-3 text-sm text-app-muted">
          Den här länken hör inte till ditt konto. Logga in med den e-postadress som förfrågan skickades till.
        </p>
      ) : null}

      {initialData.canRespond && status === "pending" ? (
        <div className="mt-6 flex flex-col gap-3 sm:flex-row">
          <button
            type="button"
            disabled={pendingDecision !== null}
            onClick={() => {
              void respond("accept");
            }}
            className="inline-flex min-h-12 items-center justify-center gap-2 rounded-2xl bg-app-primary px-5 text-sm font-semibold text-white transition hover:opacity-95 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {pendingDecision === "accept" ? (
              <LoaderCircle className="size-4 animate-spin" />
            ) : null}
            Acceptera
          </button>
          <button
            type="button"
            disabled={pendingDecision !== null}
            onClick={() => {
              void respond("decline");
            }}
            className="inline-flex min-h-12 items-center justify-center gap-2 rounded-2xl border border-app-stroke bg-white px-5 text-sm font-semibold text-app-ink transition hover:border-app-primary/35 hover:text-app-primary disabled:cursor-not-allowed disabled:opacity-60"
          >
            {pendingDecision === "decline" ? (
              <LoaderCircle className="size-4 animate-spin" />
            ) : null}
            Avslå
          </button>
        </div>
      ) : null}
    </article>
  );
}