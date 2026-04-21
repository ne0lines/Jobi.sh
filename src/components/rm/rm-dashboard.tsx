"use client";

import { Dialog } from "@base-ui/react/dialog";
import { ChevronLeft, ChevronRight, LoaderCircle, RotateCcw, Search, Send, UserMinus, UserPlus, Users, Waypoints, X } from "lucide-react";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import type {
  JobStatus,
  RmConnectionIntentLookupResponse,
  RmConnectionIntentResponse,
  RmPanelData,
} from "@/app/types";
import { ConfirmDialog } from "@/components/ui/confirm-dialog";
import { StatCard } from "@/components/ui/stat-card";

type RmDashboardProps = {
  initialData: RmPanelData;
};

type EmailLookupState =
  | { status: "error"; message: string }
  | { status: "existing" }
  | { status: "idle" }
  | { status: "invalid" }
  | { status: "loading" }
  | { status: "new" };

const EMAIL_LOOKUP_DEBOUNCE_MS = 300;
const STATUS_OVERVIEW_PAGE_SIZE = 10;

const jobStatusLabel: Record<JobStatus, string> = {
  applied: "Ansökt",
  closed: "Stängd",
  interview: "Intervju",
  offer: "Erbjudande",
  saved: "Sparad",
  "in process": "Pågående",
};

type OverviewAction =
  | { kind: "create-request"; recipientEmail: string }
  | { kind: "resend-invitation"; invitationId: string }
  | { kind: "resend-request"; requestId: string }
  | null;

type OverviewArchiveAction =
  | { kind: "archive-connection"; connectionId: string }
  | { kind: "archive-invitation"; invitationId: string }
  | { kind: "archive-request"; requestId: string }
  | null;

type LinkedCandidate = RmPanelData["linkedCandidates"][number];

type OverviewRow = {
  action: OverviewAction;
  archiveAction: OverviewArchiveAction;
  detailCandidate: LinkedCandidate | null;
  emailTitle: string;
  id: string;
  name: string;
  normalizedEmail: string;
  sortOrder: number;
  status: "Förfrågan väntar" | "Inbjudan skickad" | "Kopplad" | "Kräver godkännande" | "Registrerad";
};

type OverviewArchiveCopy = {
  buttonLabel: string;
  confirmLabel: string;
  description: string;
  fallbackError: string;
  fallbackSuccess: string;
  title: string;
};

const overviewStatusClassName: Record<OverviewRow["status"], string> = {
  "Förfrågan väntar": "bg-violet-100 text-violet-800",
  "Inbjudan skickad": "bg-amber-100 text-amber-800",
  "Kopplad": "bg-emerald-100 text-emerald-800",
  "Kräver godkännande": "bg-sky-100 text-sky-800",
  Registrerad: "bg-white text-app-ink",
};

function normalizeEmailKey(email: string): string {
  return email.trim().toLowerCase();
}

function createReadyInvitationRow(invitation: RmPanelData["readyInvitations"][number]): Omit<OverviewRow, "detailCandidate"> {
  return {
    action: { kind: "create-request", recipientEmail: invitation.recipientEmail },
    archiveAction: invitation.canManage
      ? { kind: "archive-invitation", invitationId: invitation.invitationId }
      : null,
    emailTitle: invitation.recipientEmail,
    id: `ready-${invitation.invitationId}`,
    name: invitation.invitedUserName || "Registrerad användare",
    normalizedEmail: normalizeEmailKey(invitation.recipientEmail),
    sortOrder: 1,
    status: "Registrerad",
  };
}

function createPendingInvitationRow(invitation: RmPanelData["pendingInvitations"][number]): Omit<OverviewRow, "detailCandidate"> {
  return {
    action: invitation.canManage
      ? { kind: "resend-invitation", invitationId: invitation.invitationId }
      : null,
    archiveAction: invitation.canManage
      ? { kind: "archive-invitation", invitationId: invitation.invitationId }
      : null,
    emailTitle: invitation.recipientEmail,
    id: `pending-invitation-${invitation.invitationId}`,
    name: invitation.recipientEmail,
    normalizedEmail: normalizeEmailKey(invitation.recipientEmail),
    sortOrder: 2,
    status: "Inbjudan skickad",
  };
}

function createPendingRequestRow(request: RmPanelData["pendingRequests"][number]): Omit<OverviewRow, "detailCandidate"> {
  return {
    action: { kind: "resend-request", requestId: request.requestId },
    archiveAction: { kind: "archive-request", requestId: request.requestId },
    emailTitle: request.candidateEmail,
    id: `pending-request-${request.requestId}`,
    name: request.candidateName || request.candidateEmail,
    normalizedEmail: normalizeEmailKey(request.candidateEmail),
    sortOrder: 3,
    status: "Förfrågan väntar",
  };
}

function createLinkedCandidateRow(candidate: LinkedCandidate): Omit<OverviewRow, "detailCandidate"> & { detailCandidate: LinkedCandidate } {
  return {
    action: candidate.viewerCanReadProfile
      ? null
      : { kind: "create-request", recipientEmail: candidate.candidateEmail },
    archiveAction: candidate.viewerConnectionId
      ? { kind: "archive-connection", connectionId: candidate.viewerConnectionId }
      : null,
    detailCandidate: candidate,
    emailTitle: candidate.candidateEmail,
    id: `linked-${candidate.candidateUserId}`,
    name: candidate.candidateName,
    normalizedEmail: normalizeEmailKey(candidate.candidateEmail),
    sortOrder: 4,
    status: candidate.viewerCanReadProfile ? "Kopplad" : "Kräver godkännande",
  };
}

function buildOverviewRows(initialData: RmPanelData): OverviewRow[] {
  const rows: OverviewRow[] = [];
  const seenEmails = new Set<string>();
  const linkedCandidateByEmail = new Map(
    initialData.linkedCandidates.map((candidate) => [normalizeEmailKey(candidate.candidateEmail), candidate]),
  );

  function addRow(row: Omit<OverviewRow, "detailCandidate"> & { detailCandidate?: LinkedCandidate | null }) {
    if (seenEmails.has(row.normalizedEmail)) {
      return;
    }

    seenEmails.add(row.normalizedEmail);
    rows.push({
      ...row,
      detailCandidate: row.detailCandidate ?? linkedCandidateByEmail.get(row.normalizedEmail) ?? null,
    });
  }

  for (const invitation of initialData.pendingInvitations) {
    addRow(createPendingInvitationRow(invitation));
  }

  for (const request of initialData.pendingRequests) {
    addRow(createPendingRequestRow(request));
  }

  for (const invitation of initialData.readyInvitations) {
    addRow(createReadyInvitationRow(invitation));
  }

  for (const candidate of initialData.linkedCandidates) {
    addRow(createLinkedCandidateRow(candidate));
  }

  return rows.sort((firstRow, secondRow) => {
    if (firstRow.sortOrder !== secondRow.sortOrder) {
      return firstRow.sortOrder - secondRow.sortOrder;
    }

    return firstRow.name.localeCompare(secondRow.name, "sv");
  });
}

function getArchiveDialogCopy(row: OverviewRow): OverviewArchiveCopy {
  if (row.archiveAction?.kind === "archive-connection") {
    return {
      buttonLabel: "Ta bort koppling",
      confirmLabel: "Ta bort koppling",
      description: "Din koppling till användaren tas bort. Användaren är fortfarande kopplad till RM-företaget och dess sökta jobb påverkas inte.",
      fallbackError: "Det gick inte att ta bort kopplingen.",
      fallbackSuccess: "Kopplingen togs bort.",
      title: `Ta bort kopplingen till ${row.name}?`,
    };
  }

  if (row.status === "Registrerad") {
    return {
      buttonLabel: "Ta bort företagskoppling",
      confirmLabel: "Ta bort företagskoppling",
      description: "Kopplingen mellan RM-företaget och användaren tas bort. Själva användaren och dess sökta jobb finns kvar i Jobi.sh.",
      fallbackError: "Det gick inte att ta bort företagskopplingen.",
      fallbackSuccess: "Företagskopplingen togs bort.",
      title: `Ta bort företagskopplingen för ${row.name}?`,
    };
  }

  if (row.archiveAction?.kind === "archive-request") {
    return {
      buttonLabel: "Avbryt förfrågan",
      confirmLabel: "Avbryt förfrågan",
      description: "Kopplingsförfrågan tas bort från användarlistan utan att användaren eller dess jobb påverkas.",
      fallbackError: "Det gick inte att avbryta förfrågan.",
      fallbackSuccess: "Kopplingsförfrågan avbröts.",
      title: `Avbryt förfrågan för ${row.name}?`,
    };
  }

  return {
    buttonLabel: "Ta bort inbjudan",
    confirmLabel: "Ta bort inbjudan",
    description: "Inbjudan tas bort från användarlistan. Ingen användare eller några sökta jobb påverkas.",
    fallbackError: "Det gick inte att ta bort inbjudan.",
    fallbackSuccess: "Inbjudan togs bort från listan.",
    title: `Ta bort inbjudan för ${row.name}?`,
  };
}

function getOverviewActionState(
  row: OverviewRow,
  pendingEmail: string | null,
  pendingInvitationId: string | null,
  pendingRequestId: string | null,
): {
  icon: React.ReactNode;
  isPending: boolean;
  label: string;
} {
  if (row.action?.kind === "create-request") {
    return {
      icon: <UserPlus className="size-4" />,
      isPending: pendingEmail === row.action.recipientEmail,
      label: "Skicka kopplingsförfrågan",
    };
  }

  if (row.action?.kind === "resend-invitation") {
    return {
      icon: <RotateCcw className="size-4" />,
      isPending: pendingInvitationId === row.action.invitationId,
      label: "Skicka om inbjudan",
    };
  }

  if (row.action?.kind === "resend-request") {
    return {
      icon: <RotateCcw className="size-4" />,
      isPending: pendingRequestId === row.action.requestId,
      label: "Skicka om kopplingsförfrågan",
    };
  }

  return {
    icon: <RotateCcw className="size-4" />,
    isPending: false,
    label: "",
  };
}

function getArchiveEndpoint(action: NonNullable<OverviewArchiveAction>): string {
  if (action.kind === "archive-connection") {
    return `/api/rm/connections/${action.connectionId}/archive`;
  }

  if (action.kind === "archive-invitation") {
    return `/api/rm/invitations/${action.invitationId}/archive`;
  }

  return `/api/rm/requests/by-id/${action.requestId}/archive`;
}

function formatDate(value: string | null): string {
  if (!value) {
    return "Ingen aktivitet ännu";
  }

  return new Intl.DateTimeFormat("sv-SE", {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(new Date(value));
}

function isValidEmail(email: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

export function RmDashboard({ initialData }: Readonly<RmDashboardProps>) {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [fullName, setFullName] = useState("");
  const [emailLookupState, setEmailLookupState] = useState<EmailLookupState>({ status: "idle" });
  const [overviewQuery, setOverviewQuery] = useState("");
  const [overviewPage, setOverviewPage] = useState(1);
  const [selectedOverviewRow, setSelectedOverviewRow] = useState<OverviewRow | null>(null);
  const [archiveDialogRow, setArchiveDialogRow] = useState<OverviewRow | null>(null);
  const [pendingArchiveRowId, setPendingArchiveRowId] = useState<string | null>(null);
  const [pendingEmail, setPendingEmail] = useState<string | null>(null);
  const [pendingInvitationId, setPendingInvitationId] = useState<string | null>(null);
  const [pendingRequestId, setPendingRequestId] = useState<string | null>(null);

  const normalizedEmail = email.trim().toLowerCase();
  const requiresFullName = emailLookupState.status === "new";
  const isCheckingEmail = emailLookupState.status === "loading";
  const canSubmitEmail =
    normalizedEmail.length > 0 &&
    isValidEmail(normalizedEmail) &&
    (emailLookupState.status === "existing" || emailLookupState.status === "new") &&
    (!requiresFullName || fullName.trim().length > 0) &&
    pendingEmail !== email;
  const overviewRows = buildOverviewRows(initialData);
  const filteredOverviewRows = overviewRows.filter((row) => {
    const searchQuery = overviewQuery.trim().toLowerCase();

    if (!searchQuery) {
      return true;
    }

    return [row.name, row.emailTitle, row.status]
      .join(" ")
      .toLowerCase()
      .includes(searchQuery);
  });
  const totalOverviewPages = Math.max(1, Math.ceil(filteredOverviewRows.length / STATUS_OVERVIEW_PAGE_SIZE));
  const overviewStartIndex = (overviewPage - 1) * STATUS_OVERVIEW_PAGE_SIZE;
  const paginatedOverviewRows = filteredOverviewRows.slice(
    overviewStartIndex,
    overviewStartIndex + STATUS_OVERVIEW_PAGE_SIZE,
  );
  let submitButtonIcon: React.ReactNode = <Send className="size-4" />;

  if (pendingEmail === email || isCheckingEmail) {
    submitButtonIcon = <LoaderCircle className="size-4 animate-spin" />;
  }

  useEffect(() => {
    if (!normalizedEmail) {
      setEmailLookupState({ status: "idle" });
      return;
    }

    if (!isValidEmail(normalizedEmail)) {
      setEmailLookupState({ status: "invalid" });
      return;
    }

    let isCurrent = true;
    setEmailLookupState({ status: "loading" });

    const timeoutId = globalThis.setTimeout(async () => {
      try {
        const response = await fetch("/api/rm/connection-intents/lookup", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ email: normalizedEmail }),
        });

        const payload = (await response.json()) as
          | RmConnectionIntentLookupResponse
          | { error?: string };

        if (!response.ok) {
          throw new Error(
            ("error" in payload ? payload.error : undefined) ||
              "Det gick inte att kontrollera e-postadressen.",
          );
        }

        if (!isCurrent) {
          return;
        }

        setEmailLookupState({
          status: (payload as RmConnectionIntentLookupResponse).exists ? "existing" : "new",
        });
      } catch (error) {
        if (!isCurrent) {
          return;
        }

        setEmailLookupState({
          message:
            error instanceof Error
              ? error.message
              : "Det gick inte att kontrollera e-postadressen.",
          status: "error",
        });
      }
    }, EMAIL_LOOKUP_DEBOUNCE_MS);

    return () => {
      isCurrent = false;
      globalThis.clearTimeout(timeoutId);
    };
  }, [normalizedEmail]);

  useEffect(() => {
    setOverviewPage(1);
  }, [overviewQuery]);

  useEffect(() => {
    if (overviewPage > totalOverviewPages) {
      setOverviewPage(totalOverviewPages);
    }
  }, [overviewPage, totalOverviewPages]);

  async function submitEmail(targetEmail: string, targetName?: string) {
    setPendingEmail(targetEmail);

    try {
      const response = await fetch("/api/rm/connection-intents", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email: targetEmail,
          name: targetName,
        }),
      });

      const payload = (await response.json()) as
        | RmConnectionIntentResponse
        | { error?: string };

      if (!response.ok) {
        throw new Error(
          ("error" in payload ? payload.error : undefined) ||
            "Det gick inte att skicka RM-begäran.",
        );
      }

      toast.success((payload as RmConnectionIntentResponse).message);
      setEmail("");
      setFullName("");
      router.refresh();
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Det gick inte att skicka RM-begäran.");
    } finally {
      setPendingEmail(null);
    }
  }

  async function resendInvitation(invitationId: string) {
    setPendingInvitationId(invitationId);

    try {
      const response = await fetch(`/api/rm/invitations/${invitationId}/resend`, {
        method: "POST",
      });

      const payload = (await response.json()) as { error?: string; message?: string };

      if (!response.ok) {
        throw new Error(payload.error || "Det gick inte att skicka om inbjudan.");
      }

      toast.success(payload.message || "Inbjudan skickades om.");
      router.refresh();
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Det gick inte att skicka om inbjudan.");
    } finally {
      setPendingInvitationId(null);
    }
  }

  async function resendRequest(requestId: string) {
    setPendingRequestId(requestId);

    try {
      const response = await fetch(`/api/rm/requests/by-id/${requestId}/resend`, {
        method: "POST",
      });

      const payload = (await response.json()) as { error?: string; message?: string };

      if (!response.ok) {
        throw new Error(payload.error || "Det gick inte att skicka om kopplingsförfrågan.");
      }

      toast.success(payload.message || "Kopplingsförfrågan skickades om.");
      router.refresh();
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Det gick inte att skicka om kopplingsförfrågan.");
    } finally {
      setPendingRequestId(null);
    }
  }

  async function archiveOverviewRow(row: OverviewRow) {
    if (!row.archiveAction) {
      return;
    }

    const archiveCopy = getArchiveDialogCopy(row);

    setPendingArchiveRowId(row.id);

    try {
      const response = await fetch(getArchiveEndpoint(row.archiveAction), {
        method: "POST",
      });
      const payload = (await response.json()) as { error?: string; message?: string };

      if (!response.ok) {
        throw new Error(payload.error || archiveCopy.fallbackError);
      }

      toast.success(payload.message || archiveCopy.fallbackSuccess);
      setArchiveDialogRow(null);
      setSelectedOverviewRow((currentRow) => (currentRow?.id === row.id ? null : currentRow));
      router.refresh();
    } catch (error) {
      toast.error(error instanceof Error ? error.message : archiveCopy.fallbackError);
    } finally {
      setPendingArchiveRowId(null);
    }
  }

  let overviewContent: React.ReactNode;

  if (overviewRows.length === 0) {
    overviewContent = (
      <p className="mt-4 text-sm leading-6 text-app-muted">
        Inga användare, inbjudningar eller förfrågningar ännu.
      </p>
    );
  } else if (filteredOverviewRows.length === 0) {
    overviewContent = (
      <p className="mt-4 text-sm leading-6 text-app-muted">
        Inga användare matchar din sökning.
      </p>
    );
  } else {
    overviewContent = (
      <div className="mt-4 overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-app-stroke text-left text-app-muted">
              <th className="px-3 py-3 font-medium whitespace-nowrap">Namn</th>
              <th className="px-3 py-3 font-medium whitespace-nowrap">Status</th>
              <th className="px-3 py-3 font-medium text-right whitespace-nowrap">Åtgärd</th>
            </tr>
          </thead>
          <tbody>
            {paginatedOverviewRows.map((row) => {
              const actionState = getOverviewActionState(
                row,
                pendingEmail,
                pendingInvitationId,
                pendingRequestId,
              );
              const archiveCopy = row.archiveAction ? getArchiveDialogCopy(row) : null;
              const isArchivePending = pendingArchiveRowId === row.id;
              let archiveActionIcon: React.ReactNode = null;

              if (row.archiveAction) {
                archiveActionIcon = row.archiveAction.kind === "archive-connection"
                  ? <UserMinus className="size-4" />
                  : <X className="size-4" />;
              }

              return (
                <tr key={row.id} className="border-b border-app-stroke/70 last:border-b-0">
                  <td className="px-3 py-3 text-app-ink whitespace-nowrap">
                    <button
                      type="button"
                      className="w-full rounded-xl text-left outline-none transition hover:text-app-primary focus-visible:ring-2 focus-visible:ring-app-primary/30"
                      title={row.emailTitle}
                      onClick={() => {
                        setSelectedOverviewRow(row);
                      }}
                    >
                      <span className="block font-medium whitespace-nowrap">{row.name}</span>
                    </button>
                  </td>
                  <td className="px-3 py-3 whitespace-nowrap">
                    <span className={`rounded-full px-3 py-1 text-xs font-medium whitespace-nowrap ${overviewStatusClassName[row.status]}`}>
                      {row.status}
                    </span>
                  </td>
                  <td className="px-3 py-3 text-right">
                    <div className="flex justify-end gap-2">
                      {row.action ? (
                        <button
                          type="button"
                          aria-label={actionState.label}
                          disabled={actionState.isPending}
                          onClick={() => {
                            if (row.action?.kind === "create-request") {
                              void submitEmail(row.action.recipientEmail);
                            } else if (row.action?.kind === "resend-invitation") {
                              void resendInvitation(row.action.invitationId);
                            } else if (row.action?.kind === "resend-request") {
                              void resendRequest(row.action.requestId);
                            }
                          }}
                          title={actionState.label}
                          className="inline-flex size-11 items-center justify-center rounded-2xl bg-app-primary text-white transition hover:opacity-95 disabled:cursor-not-allowed disabled:opacity-60"
                        >
                          {actionState.isPending ? <LoaderCircle className="size-4 animate-spin" /> : actionState.icon}
                        </button>
                      ) : null}

                      {row.archiveAction ? (
                        <button
                          type="button"
                          aria-label={archiveCopy?.buttonLabel}
                          disabled={isArchivePending}
                          onClick={() => {
                            setArchiveDialogRow(row);
                          }}
                          title={archiveCopy?.buttonLabel}
                          className="inline-flex size-11 items-center justify-center rounded-2xl border border-app-stroke bg-white text-app-muted transition hover:border-app-primary/30 hover:text-app-ink disabled:cursor-not-allowed disabled:opacity-60"
                        >
                          {isArchivePending ? <LoaderCircle className="size-4 animate-spin" /> : archiveActionIcon}
                        </button>
                      ) : null}
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>

        <div className="mt-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <p className="text-sm text-app-muted">
            Visar {overviewStartIndex + 1}-{Math.min(overviewStartIndex + STATUS_OVERVIEW_PAGE_SIZE, filteredOverviewRows.length)} av {filteredOverviewRows.length}
          </p>

          <div className="flex items-center justify-end gap-2">
            <button
              type="button"
              aria-label="Föregående sida"
              className="inline-flex size-10 items-center justify-center rounded-2xl border border-app-stroke bg-white text-app-muted transition hover:text-app-ink disabled:cursor-not-allowed disabled:opacity-50"
              disabled={overviewPage === 1}
              onClick={() => setOverviewPage((page) => Math.max(1, page - 1))}
            >
              <ChevronLeft className="size-4" />
            </button>

            <span className="min-w-28 text-center text-sm font-medium text-app-ink">
              Sida {overviewPage} av {totalOverviewPages}
            </span>

            <button
              type="button"
              aria-label="Nästa sida"
              className="inline-flex size-10 items-center justify-center rounded-2xl border border-app-stroke bg-white text-app-muted transition hover:text-app-ink disabled:cursor-not-allowed disabled:opacity-50"
              disabled={overviewPage === totalOverviewPages}
              onClick={() => setOverviewPage((page) => Math.min(totalOverviewPages, page + 1))}
            >
              <ChevronRight className="size-4" />
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <form
        className="w-full rounded-3xl border border-app-stroke bg-app-surface p-4"
        onSubmit={(event) => {
          event.preventDefault();
          void submitEmail(email, fullName);
        }}
      >
        <label className="block text-sm font-semibold text-app-ink" htmlFor="rm-email">
          Bjud in eller koppla via e-post
        </label>
        <p className="mt-2 text-sm leading-6 text-app-muted">
          Om adressen redan finns skickas en kopplingsförfrågan. Om den saknas skickas en registreringsinbjudan i stället, och då krävs fullständigt namn.
        </p>
        <div className="mt-4 flex flex-col gap-3 sm:flex-row">
          <input
            autoComplete="email"
            id="rm-email"
            className="min-h-12 flex-1 rounded-2xl border border-app-stroke bg-white px-4 text-base text-app-ink outline-none transition focus:border-app-primary focus:ring-2 focus:ring-app-primary/20"
            placeholder="namn@exempel.se"
            type="email"
            value={email}
            onChange={(event) => setEmail(event.target.value)}
          />
          <button
            type="submit"
            disabled={!canSubmitEmail}
            className="inline-flex min-h-12 items-center justify-center gap-2 rounded-2xl bg-app-primary px-5 text-sm font-semibold text-white transition hover:opacity-95 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {submitButtonIcon}
            Skicka
          </button>
        </div>

        {emailLookupState.status === "invalid" ? (
          <p className="mt-3 text-sm text-app-muted">Ange en giltig e-postadress för att fortsätta.</p>
        ) : null}

        {emailLookupState.status === "loading" ? (
          <p className="mt-3 text-sm text-app-muted">Kontrollerar om adressen redan finns i Jobi.sh...</p>
        ) : null}

        {emailLookupState.status === "existing" ? (
          <p className="mt-3 text-sm text-app-muted">Adressen finns redan. Du kan skicka direkt.</p>
        ) : null}

        {emailLookupState.status === "error" ? (
          <p className="mt-3 text-sm text-red-500">{emailLookupState.message}</p>
        ) : null}

        {requiresFullName ? (
          <div className="mt-3 space-y-3">
            <p className="text-sm text-app-muted">Ingen användare hittades. Ange fullständigt namn för att kunna skicka inbjudan.</p>
            <input
              aria-label="Fullständigt namn"
              autoComplete="name"
              className="min-h-12 w-full rounded-2xl border border-app-stroke bg-white px-4 text-base text-app-ink outline-none transition focus:border-app-primary focus:ring-2 focus:ring-app-primary/20"
              placeholder="Fullständigt namn"
              type="text"
              value={fullName}
              onChange={(event) => setFullName(event.target.value)}
            />
          </div>
        ) : null}
      </form>

      {initialData.viewerRole === "admin" && initialData.advisorSummary.length > 0 ? (
        <section className="rounded-3xl border border-app-stroke bg-app-card p-5">
          <div className="flex items-center gap-3">
            <Users className="size-5 text-app-primary" />
            <h2 className="text-xl font-semibold text-app-ink">Handledaröversikt</h2>
          </div>
          <div className="mt-4 overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-app-stroke text-left text-app-muted">
                  <th className="px-3 py-3 font-medium">Handledare</th>
                  <th className="px-3 py-3 font-medium text-right">Kopplade användare</th>
                  <th className="px-3 py-3 font-medium text-right">Väntande förfrågningar</th>
                </tr>
              </thead>
              <tbody>
                {initialData.advisorSummary.map((advisor) => (
                  <tr key={advisor.advisorUserId} className="border-b border-app-stroke/70 last:border-b-0">
                    <td className="px-3 py-3 font-medium text-app-ink">{advisor.advisorName}</td>
                    <td className="px-3 py-3 text-right text-app-ink">{advisor.linkedUsers}</td>
                    <td className="px-3 py-3 text-right text-app-muted">{advisor.pendingRequests}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>
      ) : null}

      <section className="rounded-3xl border border-app-stroke bg-app-card p-5">
        <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
          <div className="flex items-center gap-3">
            <Waypoints className="size-5 text-app-primary" />
            <h2 className="text-xl font-semibold text-app-ink">Användare</h2>
          </div>

          <label className="relative block w-full lg:max-w-xs">
            <Search aria-hidden="true" className="pointer-events-none absolute left-4 top-1/2 size-4 -translate-y-1/2 text-app-muted" />
            <input
              aria-label="Sök bland användare"
              className="min-h-11 w-full rounded-2xl border border-app-stroke bg-white pl-11 pr-4 text-sm text-app-ink outline-none transition focus:border-app-primary focus:ring-2 focus:ring-app-primary/20"
              placeholder="Sök användare"
              type="search"
              value={overviewQuery}
              onChange={(event) => setOverviewQuery(event.target.value)}
            />
          </label>
        </div>

        {overviewContent}
      </section>

      <section className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3">
        <StatCard label="Användare i RM-företaget" value={initialData.summary.linkedUsers} />
        <StatCard label="Totalt jobb" value={initialData.summary.totalJobs} />
        <StatCard label="Ansökta" value={initialData.summary.appliedJobs} />
        <StatCard label="Intervjuer" value={initialData.summary.interviewJobs} />
        <StatCard label="Erbjudanden" value={initialData.summary.offers} />
        <StatCard label="Väntande förfrågningar" value={initialData.summary.pendingRequests} />
      </section>

      <OverviewDetailDialog
        row={selectedOverviewRow}
        onOpenChange={(open) => {
          if (!open) {
            setSelectedOverviewRow(null);
          }
        }}
      />

      {archiveDialogRow ? (
        <ConfirmDialog
          confirmLabel={getArchiveDialogCopy(archiveDialogRow).confirmLabel}
          description={getArchiveDialogCopy(archiveDialogRow).description}
          isLoading={pendingArchiveRowId === archiveDialogRow.id}
          open={Boolean(archiveDialogRow)}
          title={getArchiveDialogCopy(archiveDialogRow).title}
          onConfirm={() => {
            void archiveOverviewRow(archiveDialogRow);
          }}
          onOpenChange={(open) => {
            if (!open && pendingArchiveRowId !== archiveDialogRow.id) {
              setArchiveDialogRow(null);
            }
          }}
        />
      ) : null}
    </div>
  );
}

function OverviewDetailDialog({
  row,
  onOpenChange,
}: Readonly<{
  row: OverviewRow | null;
  onOpenChange: (open: boolean) => void;
}>) {
  let detailContent: React.ReactNode = null;

  if (row?.detailCandidate?.viewerCanReadProfile) {
    detailContent = (
      <div className="mt-6 space-y-6">
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-3">
          <DetailCard label="Handläggare med åtkomst" value={row.detailCandidate.advisorNames.join(", ")} />
          <DetailCard label="Kopplad till RM-företaget sedan" value={formatDate(row.detailCandidate.organizationLinkedAt)} />
          <DetailCard label="Senaste aktivitet" value={formatDate(row.detailCandidate.lastJobUpdateAt)} />
          <DetailCard label="Totalt jobb" value={String(row.detailCandidate.totalJobs)} />
          <DetailCard label="Ansökta" value={String(row.detailCandidate.appliedJobs)} />
          <DetailCard label="Intervjuer" value={String(row.detailCandidate.interviewJobs)} />
          <DetailCard label="Erbjudanden" value={String(row.detailCandidate.offerJobs)} />
          <DetailCard label="Avslutade" value={String(row.detailCandidate.closedJobs)} />
        </div>

        <div>
          <h3 className="text-lg font-semibold text-app-ink">Sökta jobb</h3>

          {row.detailCandidate.recentJobs.length === 0 ? (
            <p className="mt-3 text-sm leading-6 text-app-muted">
              Inga jobb finns att visa ännu.
            </p>
          ) : (
            <div className="mt-3 space-y-3">
              {row.detailCandidate.recentJobs.map((job) => (
                <article key={job.id} className="rounded-2xl border border-app-stroke bg-app-surface p-4">
                  <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                    <div className="min-w-0">
                      <p className="font-semibold text-app-ink">{job.title}</p>
                      <p className="text-sm text-app-muted">{job.company}</p>
                    </div>

                    <div className="flex flex-wrap items-center gap-2">
                      <span className="rounded-full bg-app-card px-3 py-1 text-xs font-medium text-app-muted-ink">
                        {jobStatusLabel[job.status] ?? job.status}
                      </span>
                      <span className="text-xs text-app-muted">
                        Uppdaterad {formatDate(job.updatedAt)}
                      </span>
                    </div>
                  </div>
                </article>
              ))}
            </div>
          )}
        </div>
      </div>
    );
  } else if (row?.detailCandidate) {
    detailContent = (
      <div className="mt-6 rounded-2xl border border-app-stroke bg-app-surface p-5">
        <p className="text-sm leading-6 text-app-muted">
          Den här användaren är kopplad till RM-företaget men du saknar en godkänd kopplingsförfrågan. Skicka en kopplingsförfrågan från användarlistan för att få läsa profil och jobbhistorik.
        </p>
        <p className="mt-3 text-sm leading-6 text-app-muted">
          Handläggare med åtkomst: {row.detailCandidate.advisorNames.join(", ")}
        </p>
      </div>
    );
  } else if (row) {
    detailContent = (
      <div className="mt-6 rounded-2xl border border-app-stroke bg-app-surface p-5">
        <p className="text-sm leading-6 text-app-muted">
          Ingen jobbhistorik visas ännu. När användaren är kopplad till en handledare kommer sökta jobb och aktivitet att visas här.
        </p>
      </div>
    );
  }

  return (
    <Dialog.Root open={Boolean(row)} onOpenChange={onOpenChange}>
      <Dialog.Portal>
        <Dialog.Backdrop className="fixed inset-0 z-9998 bg-black/40 backdrop-blur-sm data-open:animate-in data-open:fade-in-0 data-closed:animate-out data-closed:fade-out-0" />
        <Dialog.Popup className="fixed inset-0 z-9999 flex items-center justify-center p-4">
          <div className="w-full max-w-3xl rounded-3xl border border-app-stroke bg-white p-6 shadow-xl data-open:animate-in data-open:fade-in-0 data-open:zoom-in-95 data-closed:animate-out data-closed:fade-out-0 data-closed:zoom-out-95">
            <div className="flex items-start justify-between gap-4">
              <div className="min-w-0 space-y-2">
                <Dialog.Title className="font-display text-3xl text-app-ink">
                  {row?.name ?? "Användare"}
                </Dialog.Title>
                <Dialog.Description className="text-sm leading-6 text-app-muted">
                  {row?.emailTitle ?? ""}
                </Dialog.Description>
                {row ? (
                  <span className={`inline-flex rounded-full px-3 py-1 text-xs font-medium ${overviewStatusClassName[row.status]}`}>
                    {row.status}
                  </span>
                ) : null}
              </div>

              <Dialog.Close
                render={
                  <button
                    type="button"
                    aria-label="Stäng användardetaljer"
                    className="inline-flex size-11 items-center justify-center rounded-2xl border border-app-stroke bg-white text-app-muted transition hover:text-app-ink"
                  >
                    <X className="size-4" />
                  </button>
                }
              />
            </div>

            {detailContent}
          </div>
        </Dialog.Popup>
      </Dialog.Portal>
    </Dialog.Root>
  );
}

function DetailCard({ label, value }: Readonly<{ label: string; value: string }>) {
  return (
    <article className="rounded-2xl border border-app-stroke bg-app-surface p-4">
      <p className="text-xs font-medium uppercase tracking-[0.14em] text-app-muted">{label}</p>
      <p className="mt-2 text-base font-semibold text-app-ink">{value}</p>
    </article>
  );
}