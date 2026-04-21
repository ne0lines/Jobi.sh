import { UserRole } from "@/app/generated/prisma/enums";
import { getCurrentDbUser } from "@/lib/auth/current-db-user";
import { logger } from "@/lib/logger";
import prisma from "@/lib/prisma";

type RmOrganizationBillingInput = {
  billingAddressLine1: string;
  billingAddressLine2?: string;
  billingCity: string;
  billingCountry?: string;
  billingEmail: string;
  billingName: string;
  billingOrganizationNumber: string;
  billingPostalCode: string;
  billingReference?: string;
  billingVatNumber?: string;
};

type CreateRmOrganizationInput = {
  name: string;
  slug?: string;
} & RmOrganizationBillingInput;

type UpdateRmOrganizationInput = {
  name: string;
  organizationId: string;
  slug: string;
} & RmOrganizationBillingInput;

type SetRmOrganizationArchivedStateInput = {
  archivedAt: string | null;
  organizationId: string;
};

type UpdateRmUserInput = {
  rmOrganizationId?: string | null;
  role: UserRole;
  userId: string;
};

export class AdminRmError extends Error {
  status: number;

  constructor(status: number, message: string) {
    super(message);
    this.status = status;
  }
}

async function requireAdminForMutation() {
  const user = await getCurrentDbUser({
    id: true,
    role: true,
  });

  if (!user) {
    throw new AdminRmError(401, "Du måste vara inloggad.");
  }

  if (!user || user.role !== UserRole.admin) {
    throw new AdminRmError(403, "Du har inte behörighet att administrera RM-företag.");
  }

  return user;
}

function normalizeSlug(rawValue: string): string {
  return rawValue
    .trim()
    .toLowerCase()
    .normalize("NFKD")
    .replaceAll(/[\u0300-\u036f]/g, "")
    .replaceAll(/[^a-z0-9]+/g, "-")
    .replaceAll(/^-+|-+$/g, "");
}

function resolveOrganizationSlug(name: string, rawSlug?: string): string {
  const slugSource = rawSlug?.trim() ? rawSlug : name;
  const normalizedSlug = normalizeSlug(slugSource);

  if (!normalizedSlug) {
    throw new AdminRmError(400, "Ange ett giltigt namn eller slug för RM-företaget.");
  }

  return normalizedSlug;
}

function normalizeTextField(value: string | undefined): string {
  return value?.trim() ?? "";
}

function normalizeEmailAddress(value: string | undefined): string {
  return value?.trim().toLowerCase() ?? "";
}

function isValidEmail(email: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

function normalizeBillingDetails(input: RmOrganizationBillingInput) {
  const billingName = normalizeTextField(input.billingName);
  const billingOrganizationNumber = normalizeTextField(input.billingOrganizationNumber);
  const billingVatNumber = normalizeTextField(input.billingVatNumber);
  const billingEmail = normalizeEmailAddress(input.billingEmail);
  const billingReference = normalizeTextField(input.billingReference);
  const billingAddressLine1 = normalizeTextField(input.billingAddressLine1);
  const billingAddressLine2 = normalizeTextField(input.billingAddressLine2);
  const billingPostalCode = normalizeTextField(input.billingPostalCode);
  const billingCity = normalizeTextField(input.billingCity);
  const billingCountry = normalizeTextField(input.billingCountry) || "Sverige";

  if (!billingName) {
    throw new AdminRmError(400, "Fakturanamn måste anges.");
  }

  if (!billingOrganizationNumber) {
    throw new AdminRmError(400, "Organisationsnummer måste anges.");
  }

  if (!billingEmail) {
    throw new AdminRmError(400, "Fakturamejl måste anges.");
  }

  if (!isValidEmail(billingEmail)) {
    throw new AdminRmError(400, "Ange ett giltigt fakturamejl.");
  }

  if (!billingAddressLine1) {
    throw new AdminRmError(400, "Fakturaadress måste anges.");
  }

  if (!billingPostalCode) {
    throw new AdminRmError(400, "Postnummer måste anges.");
  }

  if (!billingCity) {
    throw new AdminRmError(400, "Ort måste anges.");
  }

  return {
    billingAddressLine1,
    billingAddressLine2,
    billingCity,
    billingCountry,
    billingEmail,
    billingName,
    billingOrganizationNumber,
    billingPostalCode,
    billingReference,
    billingVatNumber,
  };
}

function normalizeOrganizationId(value: string | null | undefined): string | null {
  const trimmedValue = value?.trim();
  return trimmedValue || null;
}

function normalizeArchivedAt(value: string | null): string | null {
  if (value === null) {
    return null;
  }

  const parsedTimestamp = Date.parse(value);

  if (Number.isNaN(parsedTimestamp)) {
    throw new AdminRmError(400, "Ogiltigt arkivdatum.");
  }

  return new Date(parsedTimestamp).toISOString();
}

function hasAdvisorActivity(counts: {
  advisorConnections: number;
  sentRmConnectionRequests: number;
  sentRmInvitations: number;
}): boolean {
  return counts.advisorConnections > 0 || counts.sentRmInvitations > 0 || counts.sentRmConnectionRequests > 0;
}

function getUnknownErrorMessage(error: unknown): string {
  if (error instanceof Error) {
    return error.message;
  }

  if (typeof error === "string") {
    return error;
  }

  try {
    return JSON.stringify(error);
  } catch {
    return "Unknown error";
  }
}

function assertSupportedUserRole(role: UserRole) {
  if (role !== UserRole.user && role !== UserRole.admin && role !== UserRole.rm) {
    throw new AdminRmError(400, "Ogiltig användarroll.");
  }
}

function assertRoleOrganizationCombination(role: UserRole, rmOrganizationId: string | null) {
  if (role === UserRole.user && rmOrganizationId) {
    throw new AdminRmError(400, "Ett konto med rollen user kan inte kopplas till ett RM-företag.");
  }

  if (role === UserRole.rm && !rmOrganizationId) {
    throw new AdminRmError(400, "Konton med rollen rm måste kopplas till ett RM-företag.");
  }
}

function assertOwnAdminRolePreserved(adminUserId: string, targetUserId: string, role: UserRole) {
  if (adminUserId === targetUserId && role !== UserRole.admin) {
    throw new AdminRmError(400, "Du kan inte ta bort adminrollen från ditt eget konto via /admin.");
  }
}

async function assertOrganizationCanBeAssigned(organizationId: string | null, currentOrganizationId: string | null) {
  if (!organizationId) {
    return;
  }

  const organization = await prisma.rmOrganization.findUnique({
    where: { id: organizationId },
    select: {
      archivedAt: true,
      id: true,
    },
  });

  if (!organization) {
    throw new AdminRmError(404, "Det valda RM-företaget kunde inte hittas.");
  }

  if (organization.archivedAt && organizationId !== currentOrganizationId) {
    throw new AdminRmError(409, "Arkiverade RM-företag kan inte väljas för nya kontokopplingar.");
  }
}

function assertMembershipChangeAllowed(
  targetUser: {
    _count: {
      advisorConnections: number;
      sentRmConnectionRequests: number;
      sentRmInvitations: number;
    };
    rmOrganizationId: string | null;
  },
  nextOrganizationId: string | null,
  role: UserRole,
) {
  const organizationChanged = nextOrganizationId !== targetUser.rmOrganizationId;
  const removesRmAccess = role === UserRole.user;

  if ((organizationChanged || removesRmAccess) && hasAdvisorActivity(targetUser._count)) {
    throw new AdminRmError(
      409,
      "Kontot har redan RM-aktivitet och kan inte flyttas eller avkopplas här utan manuell migrering av befintliga RM-kopplingar.",
    );
  }
}

export async function createRmOrganization({
  billingAddressLine1,
  billingAddressLine2,
  billingCity,
  billingCountry,
  billingEmail,
  billingName,
  billingOrganizationNumber,
  billingPostalCode,
  billingReference,
  billingVatNumber,
  name,
  slug,
}: CreateRmOrganizationInput) {
  await requireAdminForMutation();

  const trimmedName = name.trim();

  if (!trimmedName) {
    throw new AdminRmError(400, "RM-företagets namn måste anges.");
  }

  const normalizedSlug = resolveOrganizationSlug(trimmedName, slug);
  const billingDetails = normalizeBillingDetails({
    billingAddressLine1,
    billingAddressLine2,
    billingCity,
    billingCountry,
    billingEmail,
    billingName,
    billingOrganizationNumber,
    billingPostalCode,
    billingReference,
    billingVatNumber,
  });
  const existingOrganization = await prisma.rmOrganization.findUnique({
    where: { slug: normalizedSlug },
    select: { id: true },
  });

  if (existingOrganization) {
    throw new AdminRmError(409, "Det finns redan ett RM-företag med den sluggen.");
  }

  await prisma.rmOrganization.create({
    data: {
      ...billingDetails,
      name: trimmedName,
      slug: normalizedSlug,
    },
  });

  return {
    message: `RM-företaget ${trimmedName} skapades.`,
  };
}

export async function updateRmOrganization({
  billingAddressLine1,
  billingAddressLine2,
  billingCity,
  billingCountry,
  billingEmail,
  billingName,
  billingOrganizationNumber,
  billingPostalCode,
  billingReference,
  billingVatNumber,
  name,
  organizationId,
  slug,
}: UpdateRmOrganizationInput) {
  await requireAdminForMutation();

  const trimmedName = name.trim();

  if (!trimmedName) {
    throw new AdminRmError(400, "RM-företagets namn måste anges.");
  }

  const normalizedSlug = resolveOrganizationSlug(trimmedName, slug);
  const billingDetails = normalizeBillingDetails({
    billingAddressLine1,
    billingAddressLine2,
    billingCity,
    billingCountry,
    billingEmail,
    billingName,
    billingOrganizationNumber,
    billingPostalCode,
    billingReference,
    billingVatNumber,
  });
  const organization = await prisma.rmOrganization.findUnique({
    where: { id: organizationId },
    select: { id: true },
  });

  if (!organization) {
    throw new AdminRmError(404, "RM-företaget kunde inte hittas.");
  }

  const conflictingOrganization = await prisma.rmOrganization.findUnique({
    where: { slug: normalizedSlug },
    select: { id: true },
  });

  if (conflictingOrganization && conflictingOrganization.id !== organizationId) {
    throw new AdminRmError(409, "Det finns redan ett RM-företag med den sluggen.");
  }

  await prisma.rmOrganization.update({
    where: { id: organizationId },
    data: {
      ...billingDetails,
      name: trimmedName,
      slug: normalizedSlug,
    },
  });

  return {
    message: `RM-företaget ${trimmedName} uppdaterades.`,
  };
}

export async function setRmOrganizationArchivedState({ archivedAt, organizationId }: SetRmOrganizationArchivedStateInput) {
  await requireAdminForMutation();

  const organization = await prisma.rmOrganization.findUnique({
    where: { id: organizationId },
    select: {
      archivedAt: true,
      id: true,
      name: true,
    },
  });

  if (!organization) {
    throw new AdminRmError(404, "RM-företaget kunde inte hittas.");
  }

  const nextArchivedAt = normalizeArchivedAt(archivedAt);

  await prisma.rmOrganization.update({
    where: { id: organizationId },
    data: {
      archivedAt: nextArchivedAt,
    },
  });

  const isArchiving = nextArchivedAt !== null;

  if (isArchiving && organization.archivedAt) {
    return {
      message: `RM-företaget ${organization.name} är redan arkiverat.`,
    };
  }

  if (!isArchiving && !organization.archivedAt) {
    return {
      message: `RM-företaget ${organization.name} är redan aktivt.`,
    };
  }

  return {
    message: isArchiving
      ? `RM-företaget ${organization.name} arkiverades.`
      : `RM-företaget ${organization.name} återställdes.`,
  };
}

export async function updateRmUserMembership({ rmOrganizationId, role, userId }: UpdateRmUserInput) {
  const adminUser = await requireAdminForMutation();

  const normalizedOrganizationId = normalizeOrganizationId(rmOrganizationId);
  assertSupportedUserRole(role);
  assertRoleOrganizationCombination(role, normalizedOrganizationId);

  const targetUser = await prisma.user.findUnique({
    where: { id: userId },
    select: {
      email: true,
      id: true,
      name: true,
      rmOrganizationId: true,
      role: true,
      _count: {
        select: {
          advisorConnections: true,
          sentRmConnectionRequests: true,
          sentRmInvitations: true,
        },
      },
    },
  });

  if (!targetUser) {
    throw new AdminRmError(404, "Användaren kunde inte hittas.");
  }

  assertOwnAdminRolePreserved(adminUser.id, targetUser.id, role);
  await assertOrganizationCanBeAssigned(normalizedOrganizationId, targetUser.rmOrganizationId);
  assertMembershipChangeAllowed(targetUser, normalizedOrganizationId, role);

  await prisma.user.update({
    where: { id: userId },
    data: {
      role,
      rmOrganizationId: role === UserRole.user ? null : normalizedOrganizationId,
    },
  });

  const displayName = targetUser.name.trim() || targetUser.email;

  return {
    message: `RM-inställningarna för ${displayName} uppdaterades.`,
  };
}

export function getAdminRmErrorResponse(error: unknown): { message: string; status: number } {
  if (error instanceof AdminRmError) {
    return {
      message: error.message,
      status: error.status,
    };
  }

  logger.error("Unhandled admin RM error", {
    error: getUnknownErrorMessage(error),
  });

  return {
    message: "Det gick inte att uppdatera RM-administrationen.",
    status: 500,
  };
}