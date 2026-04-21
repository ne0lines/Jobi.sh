"use client";

import { Dialog } from "@base-ui/react/dialog";
import { Archive, LoaderCircle, Plus, RotateCcw, X } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { toast } from "sonner";
import type { AdminRmOrganizationSummary, AdminRmUserSummary } from "@/app/types";
import { UserRole } from "@/app/types";
import { Btn } from "@/components/ui/btn";
import { ConfirmDialog } from "@/components/ui/confirm-dialog";
import { Input } from "@/components/ui/input";

type AdminRmManagerProps = {
  initialOrganizations: AdminRmOrganizationSummary[];
  initialUsers: AdminRmUserSummary[];
};

type OrganizationDraft = {
  billingAddressLine1: string;
  billingAddressLine2: string;
  billingCity: string;
  billingCountry: string;
  billingEmail: string;
  billingName: string;
  billingOrganizationNumber: string;
  billingPostalCode: string;
  billingReference: string;
  billingVatNumber: string;
  name: string;
  slug: string;
};

type OrganizationModalState =
  | ({ mode: "create" } & OrganizationDraft)
  | ({ mode: "edit"; organizationId: string } & OrganizationDraft);

type UserDraft = {
  rmOrganizationId: string;
  role: UserRole;
};

type UserModalState = UserDraft & {
  userId: string;
};

type OrganizationFilter = "active" | "all" | "archived";
type RoleFilter = "admin" | "all" | "rm";

type ArchiveDialogState = {
  archivedAt: string | null;
  id: string;
  name: string;
} | null;

type SearchMatchResult<T> = {
  hasQuery: boolean;
  results: T[];
  totalMatches: number;
};

const MIN_SEARCH_LENGTH = 2;
const MAX_DEFAULT_RESULTS = 5;
const MAX_SEARCH_RESULTS = 8;

const roleLabel: Record<UserRole, string> = {
  [UserRole.USER]: "User",
  [UserRole.ADMIN]: "Admin",
  [UserRole.RM]: "RM",
};

const roleBadgeClassName: Record<UserRole, string> = {
  [UserRole.USER]: "rounded-full bg-app-muted-surface px-2.5 py-1 text-xs font-medium text-app-muted-ink",
  [UserRole.ADMIN]: "rounded-full bg-app-primary px-2.5 py-1 text-xs font-medium text-white",
  [UserRole.RM]: "rounded-full bg-emerald-100 px-2.5 py-1 text-xs font-medium text-emerald-800",
};

const selectClassName =
  "h-12 w-full rounded-2xl border border-app-stroke bg-white px-4 text-sm text-app-ink outline-none transition focus:border-app-primary focus:ring-2 focus:ring-app-primary/20 disabled:cursor-not-allowed disabled:opacity-60";

const organizationDraftFieldKeys = [
  "billingAddressLine1",
  "billingAddressLine2",
  "billingCity",
  "billingCountry",
  "billingEmail",
  "billingName",
  "billingOrganizationNumber",
  "billingPostalCode",
  "billingReference",
  "billingVatNumber",
  "name",
  "slug",
] as const;

function createEmptyOrganizationDraft(): OrganizationDraft {
  return {
    billingAddressLine1: "",
    billingAddressLine2: "",
    billingCity: "",
    billingCountry: "Sverige",
    billingEmail: "",
    billingName: "",
    billingOrganizationNumber: "",
    billingPostalCode: "",
    billingReference: "",
    billingVatNumber: "",
    name: "",
    slug: "",
  };
}

function createOrganizationDraftFromSummary(organization: AdminRmOrganizationSummary): OrganizationDraft {
  return {
    billingAddressLine1: organization.billingAddressLine1,
    billingAddressLine2: organization.billingAddressLine2,
    billingCity: organization.billingCity,
    billingCountry: organization.billingCountry,
    billingEmail: organization.billingEmail,
    billingName: organization.billingName,
    billingOrganizationNumber: organization.billingOrganizationNumber,
    billingPostalCode: organization.billingPostalCode,
    billingReference: organization.billingReference,
    billingVatNumber: organization.billingVatNumber,
    name: organization.name,
    slug: organization.slug,
  };
}

function isValidEmail(email: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim());
}

function hasRequiredOrganizationFields(draft: OrganizationDraft | OrganizationModalState | null): boolean {
  if (!draft) {
    return false;
  }

  const requiredValues = [
    draft.name,
    draft.billingName,
    draft.billingOrganizationNumber,
    draft.billingEmail,
    draft.billingAddressLine1,
    draft.billingPostalCode,
    draft.billingCity,
    draft.billingCountry,
  ];

  return requiredValues.every((value) => value.trim().length > 0) && isValidEmail(draft.billingEmail);
}

function hasOrganizationDraftChanges(
  editingOrganization: AdminRmOrganizationSummary,
  modalState: OrganizationModalState,
): boolean {
  return organizationDraftFieldKeys.some((field) => editingOrganization[field] !== modalState[field]);
}

function formatDate(value: string | null): string {
  if (!value) {
    return "Inte satt";
  }

  return new Intl.DateTimeFormat("sv-SE", { dateStyle: "medium" }).format(new Date(value));
}

function FilterChip({
  active,
  count,
  label,
  onClick,
}: Readonly<{ active: boolean; count: number; label: string; onClick: () => void }>) {
  return (
    <button
      type="button"
      className={
        active
          ? "inline-flex min-h-11 items-center gap-2 rounded-full bg-app-primary px-4 text-sm font-semibold text-white"
          : "inline-flex min-h-11 items-center gap-2 rounded-full border border-app-stroke bg-app-card px-4 text-sm font-semibold text-app-ink transition hover:border-app-primary/35 hover:text-app-primary"
      }
      onClick={onClick}
    >
      <span>{label}</span>
      <span className={active ? "text-white/80" : "text-app-muted"}>{count}</span>
    </button>
  );
}

function MetricTile({ label, value }: Readonly<{ label: string; value: number }>) {
  return (
    <div className="rounded-2xl border border-app-stroke bg-app-card px-4 py-3">
      <p className="text-xs font-semibold uppercase tracking-[0.12em] text-app-muted">{label}</p>
      <p className="mt-2 text-2xl font-semibold text-app-ink">{value}</p>
    </div>
  );
}

function SearchStateCard({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <div className="rounded-3xl border border-dashed border-app-stroke bg-app-surface px-5 py-8 text-center text-app-muted">
      {children}
    </div>
  );
}

async function getErrorMessage(response: Response, fallbackMessage: string): Promise<string> {
  try {
    const payload = (await response.json()) as { error?: string };
    return payload.error || fallbackMessage;
  } catch {
    return fallbackMessage;
  }
}

async function submitOrganizationRequest(modalState: OrganizationModalState): Promise<string> {
  const fallbackMessage = getOrganizationFallbackMessage(modalState.mode);
  const response = await fetch(
    modalState.mode === "create"
      ? "/api/admin/rm/organizations"
      : `/api/admin/rm/organizations/${modalState.organizationId}`,
    {
      method: modalState.mode === "create" ? "POST" : "PATCH",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        billingAddressLine1: modalState.billingAddressLine1,
        billingAddressLine2: modalState.billingAddressLine2,
        billingCity: modalState.billingCity,
        billingCountry: modalState.billingCountry,
        billingEmail: modalState.billingEmail,
        billingName: modalState.billingName,
        billingOrganizationNumber: modalState.billingOrganizationNumber,
        billingPostalCode: modalState.billingPostalCode,
        billingReference: modalState.billingReference,
        billingVatNumber: modalState.billingVatNumber,
        name: modalState.name,
        slug: modalState.slug,
      }),
    },
  );

  if (!response.ok) {
    throw new Error(await getErrorMessage(response, fallbackMessage));
  }

  const payload = (await response.json()) as { message: string };
  return payload.message;
}

async function submitUserRequest(modalState: UserModalState): Promise<string> {
  const response = await fetch(`/api/admin/rm/users/${modalState.userId}`, {
    method: "PATCH",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      rmOrganizationId: modalState.rmOrganizationId || null,
      role: modalState.role,
    }),
  });

  if (!response.ok) {
    throw new Error(await getErrorMessage(response, "Det gick inte att uppdatera användaren."));
  }

  const payload = (await response.json()) as { message: string };
  return payload.message;
}

async function submitArchiveRequest(state: NonNullable<ArchiveDialogState>): Promise<string> {
  const response = await fetch(`/api/admin/rm/organizations/${state.id}`, {
    method: "PATCH",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      archivedAt: state.archivedAt ? null : new Date().toISOString(),
    }),
  });

  if (!response.ok) {
    throw new Error(await getErrorMessage(response, "Det gick inte att uppdatera arkiveringen."));
  }

  const payload = (await response.json()) as { message: string };
  return payload.message;
}

function AdminFormDialog({
  children,
  description,
  footer,
  maxWidthClassName = "max-w-xl",
  onOpenChange,
  open,
  title,
}: Readonly<{
  children: React.ReactNode;
  description: string;
  footer: React.ReactNode;
  maxWidthClassName?: string;
  onOpenChange: (open: boolean) => void;
  open: boolean;
  title: string;
}>) {
  return (
    <Dialog.Root open={open} onOpenChange={onOpenChange}>
      <Dialog.Portal>
        <Dialog.Backdrop className="fixed inset-0 z-9998 bg-black/45 backdrop-blur-sm data-open:animate-in data-open:fade-in-0 data-closed:animate-out data-closed:fade-out-0" />
        <Dialog.Popup className="fixed inset-0 z-9999 flex items-center justify-center p-4">
          <div className={`w-full ${maxWidthClassName} rounded-3xl border border-app-stroke bg-white p-6 shadow-xl data-open:animate-in data-open:fade-in-0 data-open:zoom-in-95 data-closed:animate-out data-closed:fade-out-0 data-closed:zoom-out-95`}>
            <div className="flex items-start justify-between gap-4">
              <div className="app-heading-stack-tight min-w-0">
                <Dialog.Title className="font-display text-2xl text-app-ink">{title}</Dialog.Title>
                <Dialog.Description className="text-base leading-7 text-app-muted">{description}</Dialog.Description>
              </div>

              <Dialog.Close
                render={
                  <button
                    type="button"
                    aria-label="Stäng dialog"
                    className="inline-flex size-11 items-center justify-center rounded-2xl border border-app-stroke bg-white text-app-muted transition hover:text-app-ink"
                  >
                    <X aria-hidden="true" size={18} strokeWidth={2.1} />
                  </button>
                }
              />
            </div>

            <div className="mt-6">{children}</div>
            <div className="mt-6 flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">{footer}</div>
          </div>
        </Dialog.Popup>
      </Dialog.Portal>
    </Dialog.Root>
  );
}

function getOrganizationFallbackMessage(mode: OrganizationModalState["mode"]): string {
  return mode === "create"
    ? "Det gick inte att skapa RM-företaget."
    : "Det gick inte att uppdatera RM-företaget.";
}

function getOrganizationModalDescription(mode: OrganizationModalState["mode"] | undefined): string {
  return mode === "edit"
    ? "Uppdatera företags- och faktureringsuppgifter för det valda RM-företaget. Arkivering görs också härifrån."
    : "Ange företags- och faktureringsuppgifter. Om slug lämnas tom genereras den automatiskt från namnet.";
}

function getOrganizationModalTitle(mode: OrganizationModalState["mode"] | undefined): string {
  return mode === "edit" ? "RM-företag" : "Lägg till RM-företag";
}

function getOrganizationSubmitLabel(mode: OrganizationModalState["mode"] | undefined): string {
  return mode === "edit" ? "Spara ändringar" : "Skapa företag";
}

function getArchiveDialogCopy(state: ArchiveDialogState): {
  confirmLabel: string;
  description: string;
  title: string;
} {
  if (state?.archivedAt) {
    return {
      confirmLabel: "Återställ företag",
      description:
        "Företaget blir aktivt igen och kan åter väljas för nya kontokopplingar. Befintlig historik påverkas inte.",
      title: `Återställ ${state.name}?`,
    };
  }

  return {
    confirmLabel: "Arkivera företag",
    description:
      "Företaget döljs från standardvyn och kan inte längre väljas för nya kontokopplingar. Befintlig historik sparas.",
    title: state ? `Arkivera ${state.name}?` : "Arkivera företag?",
  };
}

function getOrganizationMatches(
  organizations: AdminRmOrganizationSummary[],
  filter: OrganizationFilter,
  query: string,
): SearchMatchResult<AdminRmOrganizationSummary> {
  const normalizedQuery = query.trim().toLowerCase();
  const filteredOrganizations = organizations.filter((organization) => {
    if (filter === "all") {
      return true;
    }

    return filter === "active" ? !organization.archivedAt : Boolean(organization.archivedAt);
  });

  if (normalizedQuery.length < MIN_SEARCH_LENGTH) {
    return {
      hasQuery: false,
      results: filteredOrganizations.slice(0, MAX_DEFAULT_RESULTS),
      totalMatches: filteredOrganizations.length,
    };
  }

  const matches = filteredOrganizations
    .filter((organization) =>
      [organization.name, organization.slug].join(" ").toLowerCase().includes(normalizedQuery),
    );

  return {
    hasQuery: true,
    results: matches.slice(0, MAX_SEARCH_RESULTS),
    totalMatches: matches.length,
  };
}

function getUserMatches(
  users: AdminRmUserSummary[],
  roleFilter: RoleFilter,
  query: string,
): SearchMatchResult<AdminRmUserSummary> {
  const normalizedQuery = query.trim().toLowerCase();
  const filteredUsers = users.filter((user) => {
    if (roleFilter === "all") {
      return true;
    }

    return roleFilter === "admin" ? user.role === UserRole.ADMIN : user.role === UserRole.RM;
  });

  if (normalizedQuery.length < MIN_SEARCH_LENGTH) {
    return {
      hasQuery: false,
      results: filteredUsers.slice(0, MAX_DEFAULT_RESULTS),
      totalMatches: filteredUsers.length,
    };
  }

  const matches = filteredUsers
    .filter((user) => [user.name, user.email].join(" ").toLowerCase().includes(normalizedQuery));

  return {
    hasQuery: true,
    results: matches.slice(0, MAX_SEARCH_RESULTS),
    totalMatches: matches.length,
  };
}

function canSubmitOrganizationChange(
  modalState: OrganizationModalState | null,
  editingOrganization: AdminRmOrganizationSummary | null,
): boolean {
  if (!modalState) {
    return false;
  }

  if (!hasRequiredOrganizationFields(modalState)) {
    return false;
  }

  if (modalState.mode === "create") {
    return true;
  }

  if (!editingOrganization) {
    return false;
  }

  return hasOrganizationDraftChanges(editingOrganization, modalState);
}

function hasUserChanges(
  editingUser: AdminRmUserSummary | null,
  modalState: UserModalState | null,
): boolean {
  if (!editingUser || !modalState) {
    return false;
  }

  return (
    editingUser.role !== modalState.role ||
    (editingUser.rmOrganizationId ?? "") !== modalState.rmOrganizationId
  );
}

function SearchResultList({
  children,
  result,
}: Readonly<{
  children: React.ReactNode;
  result: SearchMatchResult<unknown>;
}>) {
  return (
    <div className="overflow-hidden rounded-3xl border border-app-stroke bg-white">
      {result.totalMatches > result.results.length ? (
        <div className="border-b border-app-stroke/70 px-5 py-3 text-sm text-app-muted">
          {result.hasQuery
            ? `Visar ${result.results.length} av ${result.totalMatches} träffar. Fortsätt skriva för att smalna av.`
            : `Visar ${result.results.length} av ${result.totalMatches} som standard. Sök för att smalna av.`}
        </div>
      ) : null}
      <div className="divide-y divide-app-stroke/70">{children}</div>
    </div>
  );
}

function OrganizationSearchResults({
  onOpen,
  result,
}: Readonly<{
  onOpen: (organization: AdminRmOrganizationSummary) => void;
  result: SearchMatchResult<AdminRmOrganizationSummary>;
}>) {
  if (result.results.length === 0) {
    return <SearchStateCard>{result.hasQuery ? "Inga RM-företag matchar din sökning." : "Inga RM-företag matchar det valda filtret."}</SearchStateCard>;
  }

  return (
    <SearchResultList result={result}>
      {result.results.map((organization) => {
        const isArchived = Boolean(organization.archivedAt);

        return (
          <button
            key={organization.id}
            type="button"
            className="flex w-full items-start justify-between gap-4 px-5 py-4 text-left transition hover:bg-app-surface"
            onClick={() => {
              onOpen(organization);
            }}
          >
            <div className="min-w-0">
              <p className="font-semibold text-app-ink">{organization.name}</p>
              <p className="mt-1 text-sm text-app-muted">/{organization.slug}</p>
            </div>

            <div className="flex shrink-0 items-center gap-3">
              <span className={isArchived ? "rounded-full bg-app-muted-surface px-3 py-1 text-xs font-medium text-app-muted-ink" : "rounded-full bg-emerald-100 px-3 py-1 text-xs font-medium text-emerald-800"}>
                {isArchived ? "Arkiverat" : "Aktivt"}
              </span>
              <span className="text-sm font-semibold text-app-primary">Öppna</span>
            </div>
          </button>
        );
      })}
    </SearchResultList>
  );
}

function UserSearchResults({
  onOpen,
  result,
}: Readonly<{
  onOpen: (user: AdminRmUserSummary) => void;
  result: SearchMatchResult<AdminRmUserSummary>;
}>) {
  if (result.results.length === 0) {
    return <SearchStateCard>{result.hasQuery ? "Inga konton matchar din sökning." : "Inga konton matchar det valda filtret."}</SearchStateCard>;
  }

  return (
    <SearchResultList result={result}>
      {result.results.map((user) => (
        <button
          key={user.id}
          type="button"
          className="flex w-full items-start justify-between gap-4 px-5 py-4 text-left transition hover:bg-app-surface"
          onClick={() => {
            onOpen(user);
          }}
        >
          <div className="min-w-0">
            <p className="font-semibold text-app-ink">{user.name || user.email}</p>
            <p className="mt-1 text-sm text-app-muted">{user.email}</p>
            {user.rmOrganizationName ? (
              <p className="mt-1 text-xs text-app-muted">{user.rmOrganizationName}</p>
            ) : null}
          </div>

          <div className="flex shrink-0 items-center gap-3">
            <span className={roleBadgeClassName[user.role]}>{roleLabel[user.role]}</span>
            <span className="text-sm font-semibold text-app-primary">Öppna</span>
          </div>
        </button>
      ))}
    </SearchResultList>
  );
}

export function AdminRmManager({ initialOrganizations, initialUsers }: Readonly<AdminRmManagerProps>) {
  const router = useRouter();
  const [organizationModalState, setOrganizationModalState] = useState<OrganizationModalState | null>(null);
  const [userModalState, setUserModalState] = useState<UserModalState | null>(null);
  const [archiveDialogState, setArchiveDialogState] = useState<ArchiveDialogState>(null);
  const [organizationQuery, setOrganizationQuery] = useState("");
  const [userQuery, setUserQuery] = useState("");
  const [organizationFilter, setOrganizationFilter] = useState<OrganizationFilter>("active");
  const [roleFilter, setRoleFilter] = useState<RoleFilter>("all");
  const [isSavingOrganizationModal, setIsSavingOrganizationModal] = useState(false);
  const [isSavingUserModal, setIsSavingUserModal] = useState(false);
  const [isUpdatingArchiveState, setIsUpdatingArchiveState] = useState(false);

  const organizationCounts = {
    active: initialOrganizations.filter((organization) => !organization.archivedAt).length,
    all: initialOrganizations.length,
    archived: initialOrganizations.filter((organization) => Boolean(organization.archivedAt)).length,
  };

  const roleCounts = {
    admin: initialUsers.filter((user) => user.role === UserRole.ADMIN).length,
    all: initialUsers.length,
    rm: initialUsers.filter((user) => user.role === UserRole.RM).length,
  };

  const linkedAccountCount = initialUsers.filter((user) => user.rmOrganizationId !== null).length;
  const availableOrganizations = initialOrganizations.filter((organization) => !organization.archivedAt);
  const organizationMatches = getOrganizationMatches(initialOrganizations, organizationFilter, organizationQuery);
  const userMatches = getUserMatches(initialUsers, roleFilter, userQuery);

  const editingOrganization =
    organizationModalState?.mode === "edit"
      ? initialOrganizations.find((organization) => organization.id === organizationModalState.organizationId) ?? null
      : null;

  const editingUser = userModalState
    ? initialUsers.find((user) => user.id === userModalState.userId) ?? null
    : null;

  const selectedUserOrganization = userModalState
    ? initialOrganizations.find((organization) => organization.id === userModalState.rmOrganizationId) ?? null
    : null;

  const archivedSelectedOrganization = selectedUserOrganization?.archivedAt
    ? selectedUserOrganization
    : null;

  const canSubmitOrganizationModal = canSubmitOrganizationChange(
    organizationModalState,
    editingOrganization,
  );
  const canSaveUserModal = hasUserChanges(editingUser, userModalState);
  const archiveDialogCopy = getArchiveDialogCopy(archiveDialogState);

  function openCreateOrganizationModal() {
    setOrganizationModalState({
      mode: "create",
      ...createEmptyOrganizationDraft(),
    });
  }

  function openEditOrganizationModal(organization: AdminRmOrganizationSummary) {
    setOrganizationModalState({
      mode: "edit",
      organizationId: organization.id,
      ...createOrganizationDraftFromSummary(organization),
    });
  }

  function updateOrganizationModal(patch: Partial<OrganizationDraft>) {
    setOrganizationModalState((currentState) => {
      if (!currentState) {
        return currentState;
      }

      return {
        ...currentState,
        ...patch,
      };
    });
  }

  function openUserModal(user: AdminRmUserSummary) {
    setUserModalState({
      rmOrganizationId: user.rmOrganizationId ?? "",
      role: user.role,
      userId: user.id,
    });
  }

  function updateUserModal(patch: Partial<UserDraft>) {
    setUserModalState((currentState) => {
      if (!currentState) {
        return currentState;
      }

      const nextState = {
        ...currentState,
        ...patch,
      };

      if (patch.role === UserRole.USER) {
        nextState.rmOrganizationId = "";
      }

      return nextState;
    });
  }

  async function handleSubmitOrganizationModal() {
    if (!organizationModalState) {
      return;
    }

    setIsSavingOrganizationModal(true);

    try {
      const message = await submitOrganizationRequest(organizationModalState);
      toast.success(message);
      setOrganizationModalState(null);
      router.refresh();
    } catch (error) {
      toast.error(error instanceof Error ? error.message : getOrganizationFallbackMessage(organizationModalState.mode));
    } finally {
      setIsSavingOrganizationModal(false);
    }
  }

  async function handleSaveUserModal() {
    if (!userModalState) {
      return;
    }

    setIsSavingUserModal(true);

    try {
      const message = await submitUserRequest(userModalState);
      toast.success(message);
      setUserModalState(null);
      router.refresh();
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Det gick inte att uppdatera användaren.");
    } finally {
      setIsSavingUserModal(false);
    }
  }

  async function handleToggleArchiveState() {
    if (!archiveDialogState) {
      return;
    }

    setIsUpdatingArchiveState(true);

    try {
      const message = await submitArchiveRequest(archiveDialogState);
      toast.success(message);
      setArchiveDialogState(null);
      setOrganizationModalState(null);
      router.refresh();
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Det gick inte att uppdatera arkiveringen.");
    } finally {
      setIsUpdatingArchiveState(false);
    }
  }

  return (
    <div className="space-y-8">
      <section className="app-card-elevated app-card-stack">
        <div className="app-heading-stack-tight w-full">
          <div className="flex items-center justify-between gap-4">
            <h2 className="min-w-0 flex-1 text-2xl text-app-ink sm:text-3xl">RM Företag</h2>

            <Btn
              className="min-h-11 shrink-0 whitespace-nowrap px-4 text-sm"
              icon={{ component: Plus, size: 16 }}
              onClick={openCreateOrganizationModal}
              variant="primary"
            >
              Lägg till företag
            </Btn>
          </div>

          <p className="max-w-3xl text-base leading-7 text-app-muted">
            Sök fram ett RM-företag och öppna det i en modal när du ska ändra namn, slug eller arkivering. Vi visar inte längre hela företagslistan i adminvyn.
          </p>
        </div>

        <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
          <MetricTile label="Aktiva företag" value={organizationCounts.active} />
          <MetricTile label="Arkiverade företag" value={organizationCounts.archived} />
          <MetricTile label="Alla företag" value={organizationCounts.all} />
        </div>

        <div className="grid gap-4 lg:grid-cols-[auto_minmax(0,1fr)] lg:items-end">
          <div className="flex flex-wrap gap-2">
            <FilterChip active={organizationFilter === "active"} count={organizationCounts.active} label="Aktiva" onClick={() => setOrganizationFilter("active")} />
            <FilterChip active={organizationFilter === "archived"} count={organizationCounts.archived} label="Arkiverade" onClick={() => setOrganizationFilter("archived")} />
            <FilterChip active={organizationFilter === "all"} count={organizationCounts.all} label="Alla" onClick={() => setOrganizationFilter("all")} />
          </div>

          <label className="app-form-field text-sm font-semibold text-app-muted">
            <span className="sr-only">Sök företag</span>
            <Input
              className="h-12"
              placeholder="Sök på företagsnamn eller slug"
              value={organizationQuery}
              onChange={(event) => {
                setOrganizationQuery(event.target.value);
              }}
            />
          </label>
        </div>

        <OrganizationSearchResults onOpen={openEditOrganizationModal} result={organizationMatches} />
      </section>

      <section className="app-card-elevated app-card-stack">
        <div className="flex flex-col gap-4 xl:flex-row xl:items-end xl:justify-between">
          <div className="app-heading-stack-tight max-w-3xl">
            <h2 className="text-2xl text-app-ink sm:text-3xl">Konton</h2>
            <p className="text-base leading-7 text-app-muted">
              Sök på namn eller e-post för att öppna ett konto i modal och uppdatera roll eller RM-företag. Vi visar inte längre hela listan över admins och handledare.
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 gap-3 sm:grid-cols-3 xl:grid-cols-4">
          <MetricTile label="Admins" value={roleCounts.admin} />
          <MetricTile label="RM" value={roleCounts.rm} />
          <MetricTile label="Alla konton" value={roleCounts.all} />
          <MetricTile label="Kopplade" value={linkedAccountCount} />
        </div>

        <div className="grid gap-4 lg:grid-cols-[auto_minmax(0,1fr)] lg:items-end">
          <div className="flex flex-wrap gap-2">
            <FilterChip active={roleFilter === "all"} count={roleCounts.all} label="Alla" onClick={() => setRoleFilter("all")} />
            <FilterChip active={roleFilter === "admin"} count={roleCounts.admin} label="Admins" onClick={() => setRoleFilter("admin")} />
            <FilterChip active={roleFilter === "rm"} count={roleCounts.rm} label="RM" onClick={() => setRoleFilter("rm")} />
          </div>

          <label className="app-form-field text-sm font-semibold text-app-muted">
            <span className="sr-only">Sök konto</span>
            <Input
              className="h-12"
              placeholder="Sök på namn eller e-post"
              value={userQuery}
              onChange={(event) => {
                setUserQuery(event.target.value);
              }}
            />
          </label>
        </div>

        <UserSearchResults onOpen={openUserModal} result={userMatches} />
      </section>

      <AdminFormDialog
        description={getOrganizationModalDescription(organizationModalState?.mode)}
        footer={
          <>
            <Dialog.Close
              render={
                <Btn className="min-h-11 px-4 text-sm" disabled={isSavingOrganizationModal} type="button" variant="secondary">
                  Avbryt
                </Btn>
              }
            />
            {editingOrganization ? (
              <Btn
                className="min-h-11 px-4 text-sm"
                disabled={isUpdatingArchiveState}
                icon={{ component: editingOrganization.archivedAt ? RotateCcw : Archive, size: 16 }}
                onClick={() => {
                  setArchiveDialogState({
                    archivedAt: editingOrganization.archivedAt,
                    id: editingOrganization.id,
                    name: editingOrganization.name,
                  });
                }}
                type="button"
                variant={editingOrganization.archivedAt ? "tertiary" : "red"}
              >
                {editingOrganization.archivedAt ? "Återställ" : "Arkivera"}
              </Btn>
            ) : null}
            <Btn
              className="min-h-11 px-4 text-sm"
              disabled={!canSubmitOrganizationModal || isSavingOrganizationModal}
              onClick={() => {
                void handleSubmitOrganizationModal();
              }}
              type="button"
            >
              {isSavingOrganizationModal ? <LoaderCircle className="size-4 animate-spin" /> : null}
              {getOrganizationSubmitLabel(organizationModalState?.mode)}
            </Btn>
          </>
        }
        onOpenChange={(open) => {
          if (!open && !isSavingOrganizationModal) {
            setOrganizationModalState(null);
          }
        }}
        maxWidthClassName="max-w-4xl"
        open={organizationModalState !== null}
        title={getOrganizationModalTitle(organizationModalState?.mode)}
      >
        <div className="app-form-stack">
          {editingOrganization ? (
            <div className="app-feedback-card">
              <p className="font-medium text-app-ink">
                {editingOrganization.archivedAt ? "Arkiverat" : "Aktivt"}
              </p>
              <p className="mt-1 text-app-muted">
                {editingOrganization.archivedAt
                  ? `Arkiverad ${formatDate(editingOrganization.archivedAt)}`
                  : "Företaget är aktivt och kan väljas för nya RM-kopplingar."}
              </p>
            </div>
          ) : null}

          <div className="app-card-dense app-card-stack bg-app-surface">
            <div className="app-heading-stack-tight">
              <h3 className="text-lg text-app-ink">Företagsuppgifter</h3>
              <p className="text-sm leading-6 text-app-muted">
                Grunduppgifter för företaget i RM-admin. Slug används i interna länkar och identifikation.
              </p>
            </div>

            <div className="grid gap-4 md:grid-cols-2">
              <label className="app-form-field text-sm font-semibold text-app-muted">
                <span>Företagsnamn</span>
                <Input
                  className="h-12"
                  placeholder="Exempel AB"
                  value={organizationModalState?.name ?? ""}
                  onChange={(event) => {
                    updateOrganizationModal({ name: event.target.value });
                  }}
                />
              </label>

              <label className="app-form-field text-sm font-semibold text-app-muted">
                <span>Slug</span>
                <Input
                  className="h-12"
                  placeholder="exempel-ab"
                  value={organizationModalState?.slug ?? ""}
                  onChange={(event) => {
                    updateOrganizationModal({ slug: event.target.value });
                  }}
                />
              </label>
            </div>
          </div>

          <div className="app-card-dense app-card-stack bg-app-surface">
            <div className="app-heading-stack-tight">
              <h3 className="text-lg text-app-ink">Faktureringsuppgifter</h3>
              <p className="text-sm leading-6 text-app-muted">
                Fyll i uppgifterna som behövs när företaget ska faktureras. Fält markerade med * krävs.
              </p>
            </div>

            <div className="grid gap-4 md:grid-cols-2">
              <label className="app-form-field text-sm font-semibold text-app-muted">
                <span>Fakturanamn / juridiskt namn *</span>
                <Input
                  className="h-12"
                  placeholder="Exempel AB"
                  value={organizationModalState?.billingName ?? ""}
                  onChange={(event) => {
                    updateOrganizationModal({ billingName: event.target.value });
                  }}
                />
              </label>

              <label className="app-form-field text-sm font-semibold text-app-muted">
                <span>Organisationsnummer *</span>
                <Input
                  className="h-12"
                  placeholder="556123-4567"
                  value={organizationModalState?.billingOrganizationNumber ?? ""}
                  onChange={(event) => {
                    updateOrganizationModal({ billingOrganizationNumber: event.target.value });
                  }}
                />
              </label>

              <label className="app-form-field text-sm font-semibold text-app-muted">
                <span>Momsregistreringsnummer</span>
                <Input
                  className="h-12"
                  placeholder="SE556123456701"
                  value={organizationModalState?.billingVatNumber ?? ""}
                  onChange={(event) => {
                    updateOrganizationModal({ billingVatNumber: event.target.value });
                  }}
                />
              </label>

              <label className="app-form-field text-sm font-semibold text-app-muted">
                <span>Fakturamejl *</span>
                <Input
                  className="h-12"
                  placeholder="faktura@exempel.se"
                  type="email"
                  value={organizationModalState?.billingEmail ?? ""}
                  onChange={(event) => {
                    updateOrganizationModal({ billingEmail: event.target.value });
                  }}
                />
              </label>

              <label className="app-form-field text-sm font-semibold text-app-muted md:col-span-2">
                <span>Fakturaadress *</span>
                <Input
                  className="h-12"
                  placeholder="Storgatan 1"
                  value={organizationModalState?.billingAddressLine1 ?? ""}
                  onChange={(event) => {
                    updateOrganizationModal({ billingAddressLine1: event.target.value });
                  }}
                />
              </label>

              <label className="app-form-field text-sm font-semibold text-app-muted md:col-span-2">
                <span>Adressrad 2</span>
                <Input
                  className="h-12"
                  placeholder="C/O, avdelning eller box"
                  value={organizationModalState?.billingAddressLine2 ?? ""}
                  onChange={(event) => {
                    updateOrganizationModal({ billingAddressLine2: event.target.value });
                  }}
                />
              </label>

              <label className="app-form-field text-sm font-semibold text-app-muted">
                <span>Postnummer *</span>
                <Input
                  className="h-12"
                  placeholder="111 22"
                  value={organizationModalState?.billingPostalCode ?? ""}
                  onChange={(event) => {
                    updateOrganizationModal({ billingPostalCode: event.target.value });
                  }}
                />
              </label>

              <label className="app-form-field text-sm font-semibold text-app-muted">
                <span>Ort *</span>
                <Input
                  className="h-12"
                  placeholder="Stockholm"
                  value={organizationModalState?.billingCity ?? ""}
                  onChange={(event) => {
                    updateOrganizationModal({ billingCity: event.target.value });
                  }}
                />
              </label>

              <label className="app-form-field text-sm font-semibold text-app-muted">
                <span>Land *</span>
                <Input
                  className="h-12"
                  placeholder="Sverige"
                  value={organizationModalState?.billingCountry ?? ""}
                  onChange={(event) => {
                    updateOrganizationModal({ billingCountry: event.target.value });
                  }}
                />
              </label>

              <label className="app-form-field text-sm font-semibold text-app-muted">
                <span>Referens / märkning</span>
                <Input
                  className="h-12"
                  placeholder="Att: Ekonomi eller kostnadsställe"
                  value={organizationModalState?.billingReference ?? ""}
                  onChange={(event) => {
                    updateOrganizationModal({ billingReference: event.target.value });
                  }}
                />
              </label>
            </div>
          </div>
        </div>
      </AdminFormDialog>

      <AdminFormDialog
        description="Ändra roll och koppla kontot till ett aktivt RM-företag. Öppna först rätt användare via sökfältet."
        footer={
          <>
            <Dialog.Close
              render={
                <Btn className="min-h-11 px-4 text-sm" disabled={isSavingUserModal} type="button" variant="secondary">
                  Avbryt
                </Btn>
              }
            />
            <Btn
              className="min-h-11 px-4 text-sm"
              disabled={!canSaveUserModal || isSavingUserModal}
              onClick={() => {
                void handleSaveUserModal();
              }}
              type="button"
            >
              {isSavingUserModal ? <LoaderCircle className="size-4 animate-spin" /> : null}
              Spara ändringar
            </Btn>
          </>
        }
        onOpenChange={(open) => {
          if (!open && !isSavingUserModal) {
            setUserModalState(null);
          }
        }}
        open={userModalState !== null}
        title={editingUser ? `${editingUser.name || editingUser.email}` : "Konto"}
      >
        <div className="app-form-stack">
          <div className="app-feedback-card">
            <p className="font-medium text-app-ink">{editingUser?.email}</p>
            <p className="mt-1 text-app-muted">
              Konton med befintliga RM-kopplingar kan inte alltid flyttas mellan företag, eftersom gamla RM-förfrågningar och kopplingar annars kan hamna i fel scope.
            </p>
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            <label className="app-form-field text-sm font-semibold text-app-muted">
              <span>Roll</span>
              <select
                className={selectClassName}
                value={userModalState?.role ?? UserRole.USER}
                onChange={(event) => {
                  updateUserModal({ role: event.target.value as UserRole });
                }}
              >
                <option value={UserRole.USER}>{roleLabel[UserRole.USER]}</option>
                <option value={UserRole.ADMIN}>{roleLabel[UserRole.ADMIN]}</option>
                <option value={UserRole.RM}>{roleLabel[UserRole.RM]}</option>
              </select>
            </label>

            <label className="app-form-field text-sm font-semibold text-app-muted">
              <span>RM-företag</span>
              <select
                className={selectClassName}
                disabled={userModalState?.role === UserRole.USER}
                value={userModalState?.rmOrganizationId ?? ""}
                onChange={(event) => {
                  updateUserModal({ rmOrganizationId: event.target.value });
                }}
              >
                <option value="">Inget RM-företag</option>
                {archivedSelectedOrganization ? (
                  <option value={archivedSelectedOrganization.id}>{archivedSelectedOrganization.name} (arkiverat)</option>
                ) : null}
                {availableOrganizations
                  .filter((organization) => organization.id !== archivedSelectedOrganization?.id)
                  .map((organization) => (
                    <option key={organization.id} value={organization.id}>
                      {organization.name}
                    </option>
                  ))}
              </select>
            </label>
          </div>

          {archivedSelectedOrganization ? (
            <div className="app-feedback-card">
              Kontot är redan kopplat till ett arkiverat RM-företag. Lämna kopplingen orörd eller flytta kontot till ett aktivt företag om användaren inte har RM-historik som blockerar flytten.
            </div>
          ) : null}
        </div>
      </AdminFormDialog>

      <ConfirmDialog
        confirmLabel={archiveDialogCopy.confirmLabel}
        description={archiveDialogCopy.description}
        isLoading={isUpdatingArchiveState}
        onConfirm={() => {
          void handleToggleArchiveState();
        }}
        onOpenChange={(open) => {
          if (!open) {
            setArchiveDialogState(null);
          }
        }}
        open={archiveDialogState !== null}
        title={archiveDialogCopy.title}
      />
    </div>
  );
}