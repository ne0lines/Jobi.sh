import { randomUUID } from "node:crypto";
import {
  RmConnectionRequestStatus,
  RmInvitationStatus,
  UserRole,
} from "@/app/generated/prisma/enums";
import {
  RmConnectionIntentLookupResponse,
  RmConnectionIntentResponse,
  RmPanelData,
  RmRequestDecision,
  RmRequestDecisionPageData,
  UserRole as AppUserRole,
} from "@/app/types";
import { getCurrentClerkIdentity, getCurrentDbUser } from "@/lib/auth/current-db-user";
import { logger } from "@/lib/logger";
import prisma from "@/lib/prisma";
import {
  sendRmConnectionRequestEmail,
  sendRmInvitationEmail,
  sendRmInvitationRegisteredEmail,
} from "@/lib/rm-mail";

type CurrentDbUser = {
  email: string;
  id: string;
  name: string;
  rmOrganizationId: string | null;
  role: UserRole;
};

type RmPanelScope = {
  organizationId: string;
  ownOnly: boolean;
  viewer: CurrentDbUser;
};

type RmOrganizationIdentity = {
  name: string;
  slug: string;
};

export class RmError extends Error {
  code: string;
  status: number;

  constructor(status: number, code: string, message: string) {
    super(message);
    this.status = status;
    this.code = code;
  }
}

function normalizeEmail(email: string): string {
  return email.trim().toLowerCase();
}

function normalizeName(name: string | undefined): string {
  return name?.trim().replaceAll(/\s+/g, " ") ?? "";
}

function createInvitationToken(invitedName: string): string {
  return Buffer.from(
    JSON.stringify({
      id: randomUUID(),
      invitedName,
    }),
    "utf8",
  ).toString("base64url");
}

function getInvitationNameFromToken(token: string): string {
  try {
    const parsedToken = JSON.parse(Buffer.from(token, "base64url").toString("utf8")) as {
      invitedName?: string;
    };

    return normalizeName(parsedToken.invitedName);
  } catch {
    return "";
  }
}

function isValidEmail(email: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

function getDisplayName(user: { email: string; name: string }): string {
  return user.name.trim() || user.email;
}

function getUniqueDisplayNames(users: ReadonlyArray<{ email: string; name: string }>): string[] {
  return [...new Set(users.map((user) => getDisplayName(user)))];
}

function getNormalizedEmailSet(values: ReadonlyArray<string>): Set<string> {
  return new Set(values.map((value) => normalizeEmail(value)));
}

function isRegisteredInvitation(invitation: {
  invitedUserId: string | null;
  registeredAt: Date | null;
  status: RmInvitationStatus;
}): boolean {
  return (
    invitation.status === RmInvitationStatus.registered ||
    invitation.registeredAt !== null ||
    invitation.invitedUserId !== null
  );
}

function getRequestStatusMessage(status: RmConnectionRequestStatus): string {
  if (status === RmConnectionRequestStatus.accepted) {
    return "Förfrågan är redan accepterad.";
  }

  if (status === RmConnectionRequestStatus.declined) {
    return "Förfrågan är redan avslagen.";
  }

  return "Förfrågan är inte längre aktiv.";
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

async function getAuthenticatedRmDbUser(): Promise<CurrentDbUser> {
  const user = await getCurrentDbUser({
    email: true,
    id: true,
    name: true,
    rmOrganizationId: true,
    role: true,
  });

  if (!user) {
    throw new RmError(404, "PROFILE_REQUIRED", "Skapa din profil innan du använder RM-panelen.");
  }

  return user;
}

async function getCurrentRmScope(): Promise<RmPanelScope> {
  const viewer = await getAuthenticatedRmDbUser();

  if (viewer.role !== UserRole.admin && viewer.role !== UserRole.rm) {
    throw new RmError(403, "FORBIDDEN", "Du har inte behörighet till RM-panelen.");
  }

  if (!viewer.rmOrganizationId) {
    throw new RmError(
      400,
      "ORGANIZATION_REQUIRED",
      "Ditt konto är inte kopplat till något RM-företag ännu.",
    );
  }

  return {
    organizationId: viewer.rmOrganizationId,
    ownOnly: viewer.role === UserRole.rm,
    viewer,
  };
}

async function getOrganizationIdentity(organizationId: string): Promise<RmOrganizationIdentity> {
  const organization = await prisma.rmOrganization.findUnique({
    where: { id: organizationId },
    select: {
      name: true,
      slug: true,
    },
  });

  if (!organization) {
    throw new RmError(404, "ORGANIZATION_NOT_FOUND", "RM-företaget kunde inte hittas.");
  }

  return organization;
}

async function reconcileRegisteredInvitations(scope: RmPanelScope): Promise<void> {
  const pendingInvitations = await prisma.rmInvitation.findMany({
    where: {
      organizationId: scope.organizationId,
      status: RmInvitationStatus.pending,
    },
    select: {
      id: true,
      invitedUserId: true,
      recipientEmail: true,
      registeredAt: true,
    },
  });

  if (pendingInvitations.length === 0) {
    return;
  }

  const normalizedEmails = [...new Set(
    pendingInvitations.map((invitation) => normalizeEmail(invitation.recipientEmail)),
  )];

  const matchingUsers = normalizedEmails.length
    ? await prisma.user.findMany({
        where: {
          OR: normalizedEmails.map((email) => ({
            email: {
              equals: email,
              mode: "insensitive",
            },
          })),
        },
        select: {
          email: true,
          id: true,
        },
      })
    : [];

  if (matchingUsers.length === 0) {
    return;
  }

  const userByNormalizedEmail = new Map(
    matchingUsers.map((user) => [normalizeEmail(user.email), user]),
  );
  const invitationsToUpdate = pendingInvitations.flatMap((invitation) => {
    const matchingUser = userByNormalizedEmail.get(normalizeEmail(invitation.recipientEmail));

    if (!matchingUser) {
      return [];
    }

    return [{ invitation, matchingUser }];
  });

  if (invitationsToUpdate.length === 0) {
    return;
  }

  await prisma.$transaction(
    invitationsToUpdate.map(({ invitation, matchingUser }) =>
      prisma.rmInvitation.update({
        where: { id: invitation.id },
        data: {
          invitedUserId: matchingUser.id,
          recipientEmail: normalizeEmail(invitation.recipientEmail),
          registeredAt: invitation.registeredAt ?? new Date(),
          status: RmInvitationStatus.registered,
        },
      }),
    ),
  );
}

async function findUserByEmailInsensitive(email: string) {
  return prisma.user.findFirst({
    where: {
      email: {
        equals: email,
        mode: "insensitive",
      },
    },
    select: {
      email: true,
      id: true,
      name: true,
    },
  });
}

export async function lookupRmConnectionIntentEmail(
  rawEmail: string,
): Promise<RmConnectionIntentLookupResponse> {
  await getCurrentRmScope();
  const email = normalizeEmail(rawEmail);

  if (!isValidEmail(email)) {
    throw new RmError(400, "INVALID_EMAIL", "Ange en giltig e-postadress.");
  }

  const existingUser = await findUserByEmailInsensitive(email);

  return {
    exists: Boolean(existingUser),
  };
}

async function cleanupFailedRequest(requestId: string) {
  try {
    await prisma.rmConnectionRequest.delete({ where: { id: requestId } });
  } catch (error) {
    logger.warn("Failed to cleanup RM connection request after email failure", {
      error: error instanceof Error ? error.message : String(error),
      requestId,
    });
  }
}

async function cleanupFailedInvitation(invitationId: string) {
  try {
    await prisma.rmInvitation.delete({ where: { id: invitationId } });
  } catch (error) {
    logger.warn("Failed to cleanup RM invitation after email failure", {
      error: error instanceof Error ? error.message : String(error),
      invitationId,
    });
  }
}

export async function getRmPanelData(): Promise<RmPanelData> {
  const scope = await getCurrentRmScope();
  await reconcileRegisteredInvitations(scope);
  const organization = await getOrganizationIdentity(scope.organizationId);
  const requestWhere = scope.ownOnly
    ? {
        organizationId: scope.organizationId,
        advisorUserId: scope.viewer.id,
      }
    : { organizationId: scope.organizationId };

  const [connections, pendingRequests, pendingInvitations, registeredInvitations, allPendingRequestsInOrg] = await Promise.all([
    prisma.rmConnection.findMany({
      where: {
        archivedAt: null,
        organizationId: scope.organizationId,
      },
      orderBy: { createdAt: "desc" },
      include: {
        advisor: {
          select: {
            email: true,
            id: true,
            name: true,
          },
        },
        candidateUser: {
          select: {
            email: true,
            id: true,
            name: true,
            jobs: {
              orderBy: { updatedAt: "desc" },
              select: {
                company: true,
                id: true,
                status: true,
                title: true,
                updatedAt: true,
              },
            },
          },
        },
      },
    }),
    prisma.rmConnectionRequest.findMany({
      where: {
        ...requestWhere,
        status: RmConnectionRequestStatus.pending,
      },
      orderBy: { createdAt: "desc" },
      include: {
        advisor: {
          select: {
            email: true,
            id: true,
            name: true,
          },
        },
        candidateUser: {
          select: {
            name: true,
          },
        },
        invitation: {
          select: {
            id: true,
          },
        },
      },
    }),
    prisma.rmInvitation.findMany({
      where: {
        organizationId: scope.organizationId,
        status: RmInvitationStatus.pending,
        ...(scope.ownOnly ? { inviterUserId: scope.viewer.id } : {}),
      },
      orderBy: { createdAt: "desc" },
      select: {
        createdAt: true,
        id: true,
        invitedUserId: true,
        inviterUserId: true,
        recipientEmail: true,
        registeredAt: true,
      },
    }),
    prisma.rmInvitation.findMany({
      where: {
        organizationId: scope.organizationId,
        status: RmInvitationStatus.registered,
      },
      orderBy: [{ registeredAt: "desc" }, { createdAt: "desc" }],
      select: {
        createdAt: true,
        id: true,
        invitedUser: {
          select: {
            id: true,
            name: true,
          },
        },
        invitedUserId: true,
        inviterUserId: true,
        recipientEmail: true,
        registeredAt: true,
      },
    }),
    prisma.rmConnectionRequest.findMany({
      where: {
        organizationId: scope.organizationId,
        status: RmConnectionRequestStatus.pending,
      },
      select: {
        advisor: {
          select: {
            email: true,
            id: true,
            name: true,
          },
        },
        advisorUserId: true,
      },
    }),
  ]);

  const connectedCandidateIds = new Set(
    connections.map((connection) => connection.candidateUserId),
  );
  const connectedCandidateEmails = getNormalizedEmailSet(
    connections.map((connection) => connection.candidateUser.email),
  );
  const connectionsByCandidateUserId = new Map<string, typeof connections>();

  for (const connection of connections) {
    const existingConnections = connectionsByCandidateUserId.get(connection.candidateUserId) ?? [];
    existingConnections.push(connection);
    connectionsByCandidateUserId.set(connection.candidateUserId, existingConnections);
  }

  const linkedCandidates = [...connectionsByCandidateUserId.values()].map((candidateConnections) => {
    const primaryConnection = candidateConnections[0];
    const viewerConnection = candidateConnections.find(
      (connection) => connection.advisorUserId === scope.viewer.id,
    ) ?? null;
    const viewerCanReadProfile =
      scope.viewer.role === UserRole.admin || viewerConnection !== null;
    const visibleJobs = viewerCanReadProfile ? primaryConnection.candidateUser.jobs : [];
    const appliedJobs = visibleJobs.filter((job) => job.status === "applied").length;
    const interviewJobs = visibleJobs.filter((job) => job.status === "interview").length;
    const offerJobs = visibleJobs.filter((job) => job.status === "offer").length;
    const closedJobs = visibleJobs.filter((job) => job.status === "closed").length;
    const organizationLinkedAt = new Date(
      Math.min(...candidateConnections.map((connection) => connection.createdAt.getTime())),
    ).toISOString();

    return {
      advisorNames: getUniqueDisplayNames(
        candidateConnections.map((connection) => connection.advisor),
      ),
      appliedJobs,
      candidateEmail: primaryConnection.candidateUser.email,
      candidateName: getDisplayName(primaryConnection.candidateUser),
      candidateUserId: primaryConnection.candidateUser.id,
      closedJobs,
      interviewJobs,
      lastJobUpdateAt: visibleJobs[0]?.updatedAt.toISOString() ?? null,
      offerJobs,
      organizationLinkedAt,
      recentJobs: visibleJobs.slice(0, 4).map((job) => ({
        company: job.company,
        id: job.id,
        status: job.status as never,
        title: job.title,
        updatedAt: job.updatedAt.toISOString(),
      })),
      totalJobs: visibleJobs.length,
      viewerCanReadProfile,
      viewerConnectionId: viewerConnection?.id ?? null,
    };
  });

  const pendingInvitationItems = pendingInvitations.map((invitation) => ({
    canManage: scope.viewer.role === UserRole.admin || invitation.inviterUserId === scope.viewer.id,
    createdAt: invitation.createdAt.toISOString(),
    hasActiveConnection: false,
    invitationId: invitation.id,
    invitedUserId: null,
    invitedUserName: null,
    recipientEmail: invitation.recipientEmail,
    registeredAt: null,
  }));

  const readyInvitations = registeredInvitations
    .filter((invitation) => {
      if (invitation.invitedUserId && connectedCandidateIds.has(invitation.invitedUserId)) {
        return false;
      }

      return !connectedCandidateEmails.has(normalizeEmail(invitation.recipientEmail));
    })
    .map((invitation) => ({
      canManage: scope.viewer.role === UserRole.admin || invitation.inviterUserId === scope.viewer.id,
      createdAt: invitation.createdAt.toISOString(),
      hasActiveConnection: false,
      invitationId: invitation.id,
      invitedUserId: invitation.invitedUser?.id ?? invitation.invitedUserId ?? null,
      invitedUserName: invitation.invitedUser?.name?.trim() || null,
      recipientEmail: invitation.recipientEmail,
      registeredAt: invitation.registeredAt?.toISOString() ?? null,
    }));

  const advisorSummaryMap = new Map<string, { advisorName: string; linkedUsers: number; pendingRequests: number }>();

  for (const connection of connections) {
    const advisorName = getDisplayName(connection.advisor);
    const current = advisorSummaryMap.get(connection.advisor.id);
    advisorSummaryMap.set(connection.advisor.id, {
      advisorName,
      linkedUsers: (current?.linkedUsers ?? 0) + 1,
      pendingRequests: current?.pendingRequests ?? 0,
    });
  }

  for (const pendingRequest of allPendingRequestsInOrg) {
    const current = advisorSummaryMap.get(pendingRequest.advisorUserId);
    const advisorName = getDisplayName(pendingRequest.advisor);

    if (!current) {
      advisorSummaryMap.set(pendingRequest.advisorUserId, {
        advisorName,
        linkedUsers: 0,
        pendingRequests: 1,
      });
      continue;
    }

    advisorSummaryMap.set(pendingRequest.advisorUserId, {
      ...current,
      pendingRequests: current.pendingRequests + 1,
    });
  }

  return {
    advisorSummary: [...advisorSummaryMap.entries()].map(([advisorUserId, summary]) => ({
      advisorName: summary.advisorName,
      advisorUserId,
      linkedUsers: summary.linkedUsers,
      pendingRequests: summary.pendingRequests,
    })),
    linkedCandidates,
    organizationName: organization.name,
    pendingInvitations: pendingInvitationItems,
    pendingRequests: pendingRequests.map((request) => ({
      advisorName: getDisplayName(request.advisor),
      candidateEmail: request.recipientEmail,
      candidateName: request.candidateUser?.name?.trim() || null,
      createdAt: request.createdAt.toISOString(),
      invitationId: request.invitation?.id ?? null,
      invitationSource: Boolean(request.invitation?.id),
      requestId: request.id,
      token: request.token,
    })),
    readyInvitations,
    summary: {
      appliedJobs: linkedCandidates.reduce((sum, candidate) => sum + candidate.appliedJobs, 0),
      interviewJobs: linkedCandidates.reduce((sum, candidate) => sum + candidate.interviewJobs, 0),
      linkedUsers: linkedCandidates.length + readyInvitations.length,
      offers: linkedCandidates.reduce((sum, candidate) => sum + candidate.offerJobs, 0),
      pendingInvitations: pendingInvitationItems.length,
      pendingRequests: pendingRequests.length,
      totalJobs: linkedCandidates.reduce((sum, candidate) => sum + candidate.totalJobs, 0),
    },
    viewerRole:
      scope.viewer.role === UserRole.admin
        ? AppUserRole.ADMIN
        : AppUserRole.RM,
  };
}

export async function createRmConnectionIntent(
  rawEmail: string,
  rawName?: string,
): Promise<RmConnectionIntentResponse> {
  const scope = await getCurrentRmScope();
  const email = normalizeEmail(rawEmail);
  const fullName = normalizeName(rawName);

  if (!isValidEmail(email)) {
    throw new RmError(400, "INVALID_EMAIL", "Ange en giltig e-postadress.");
  }

  if (normalizeEmail(scope.viewer.email) === email) {
    throw new RmError(400, "SELF_LINK", "Du kan inte bjuda in eller koppla dig själv.");
  }

  const organization = await getOrganizationIdentity(scope.organizationId);
  const existingUser = await findUserByEmailInsensitive(email);

  if (existingUser) {
    const relatedInvitation = await prisma.rmInvitation.findFirst({
      where: {
        inviterUserId: scope.viewer.id,
        organizationId: scope.organizationId,
        recipientEmail: email,
        status: RmInvitationStatus.registered,
      },
      select: {
        id: true,
      },
    });

    const existingConnection = await prisma.rmConnection.findFirst({
      where: {
        archivedAt: null,
        advisorUserId: scope.viewer.id,
        candidateUserId: existingUser.id,
        organizationId: scope.organizationId,
      },
      select: {
        id: true,
      },
    });

    if (existingConnection) {
      throw new RmError(409, "ALREADY_CONNECTED", "Användaren är redan kopplad till dig.");
    }

    const pendingRequest = await prisma.rmConnectionRequest.findFirst({
      where: {
        advisorUserId: scope.viewer.id,
        candidateUserId: existingUser.id,
        organizationId: scope.organizationId,
        status: RmConnectionRequestStatus.pending,
      },
      select: {
        id: true,
      },
    });

    if (pendingRequest) {
      throw new RmError(409, "REQUEST_ALREADY_PENDING", "Det finns redan en väntande kopplingsförfrågan för den här e-postadressen.");
    }

    const createdRequest = await prisma.rmConnectionRequest.create({
      data: {
        advisorUserId: scope.viewer.id,
        candidateUserId: existingUser.id,
        invitationId: relatedInvitation?.id,
        organizationId: scope.organizationId,
        recipientEmail: email,
        token: randomUUID(),
      },
      select: {
        id: true,
        token: true,
      },
    });

    try {
      await sendRmConnectionRequestEmail({
        advisorEmail: scope.viewer.email,
        advisorName: getDisplayName(scope.viewer),
        organizationName: organization.name,
        organizationSlug: organization.slug,
        recipientEmail: existingUser.email,
        token: createdRequest.token,
      });
    } catch (error) {
      await cleanupFailedRequest(createdRequest.id);
      throw error;
    }

    return {
      message: `Kopplingsförfrågan skickades till ${existingUser.email}.`,
      mode: "request_sent",
    };
  }

  const pendingInvitation = await prisma.rmInvitation.findFirst({
    where: {
      organizationId: scope.organizationId,
      recipientEmail: email,
      status: RmInvitationStatus.pending,
    },
    include: {
      inviter: {
        select: {
          email: true,
          id: true,
          name: true,
        },
      },
    },
  });

  if (pendingInvitation) {
    if (pendingInvitation.inviterUserId === scope.viewer.id) {
      throw new RmError(409, "INVITATION_ALREADY_PENDING", "Det finns redan en väntande inbjudan för den här e-postadressen.");
    }

    throw new RmError(
      409,
      "INVITATION_PENDING_FOR_OTHER_ADVISOR",
      `Det finns redan en väntande inbjudan från ${getDisplayName(pendingInvitation.inviter)}.`,
    );
  }

  if (!fullName) {
    throw new RmError(
      400,
      "NAME_REQUIRED",
      "Fullständigt namn krävs när du bjuder in en ny användare.",
    );
  }

  const createdInvitation = await prisma.rmInvitation.create({
    data: {
      inviterUserId: scope.viewer.id,
      organizationId: scope.organizationId,
      recipientEmail: email,
      token: createInvitationToken(fullName),
    },
    select: {
      id: true,
    },
  });

  try {
    await sendRmInvitationEmail({
      advisorEmail: scope.viewer.email,
      advisorName: getDisplayName(scope.viewer),
      invitedName: fullName,
      organizationName: organization.name,
      organizationSlug: organization.slug,
      recipientEmail: email,
    });
  } catch (error) {
    await cleanupFailedInvitation(createdInvitation.id);
    throw error;
  }

  return {
    message: `Inbjudan skickades till ${email}.`,
    mode: "invitation_sent",
  };
}

export async function resendRmInvitation(invitationId: string): Promise<{ message: string }> {
  const scope = await getCurrentRmScope();
  const invitation = await prisma.rmInvitation.findFirst({
    where: {
      id: invitationId,
      organizationId: scope.organizationId,
      status: RmInvitationStatus.pending,
      ...(scope.ownOnly ? { inviterUserId: scope.viewer.id } : {}),
    },
    include: {
      inviter: {
        select: {
          email: true,
          name: true,
        },
      },
      organization: {
        select: {
          name: true,
          slug: true,
        },
      },
    },
  });

  if (!invitation) {
    throw new RmError(404, "INVITATION_NOT_FOUND", "Inbjudan kunde inte hittas eller kan inte skickas om.");
  }

  await sendRmInvitationEmail({
    advisorEmail: invitation.inviter.email,
    advisorName: getDisplayName(invitation.inviter),
    invitedName: getInvitationNameFromToken(invitation.token) || undefined,
    organizationName: invitation.organization.name,
    organizationSlug: invitation.organization.slug,
    recipientEmail: invitation.recipientEmail,
  });

  await prisma.rmInvitation.update({
    where: { id: invitation.id },
    data: {
      updatedAt: new Date(),
    },
  });

  return {
    message: `Inbjudan skickades igen till ${invitation.recipientEmail}.`,
  };
}

export async function resendRmConnectionRequest(requestId: string): Promise<{ message: string }> {
  const scope = await getCurrentRmScope();
  const request = await prisma.rmConnectionRequest.findFirst({
    where: {
      id: requestId,
      organizationId: scope.organizationId,
      status: RmConnectionRequestStatus.pending,
      ...(scope.ownOnly ? { advisorUserId: scope.viewer.id } : {}),
    },
    include: {
      advisor: {
        select: {
          email: true,
          name: true,
        },
      },
      organization: {
        select: {
          name: true,
          slug: true,
        },
      },
    },
  });

  if (!request) {
    throw new RmError(404, "REQUEST_NOT_FOUND", "Kopplingsförfrågan kunde inte hittas eller kan inte skickas om.");
  }

  await sendRmConnectionRequestEmail({
    advisorEmail: request.advisor.email,
    advisorName: getDisplayName(request.advisor),
    organizationName: request.organization.name,
    organizationSlug: request.organization.slug,
    recipientEmail: request.recipientEmail,
    token: request.token,
  });

  await prisma.rmConnectionRequest.update({
    where: { id: request.id },
    data: {
      updatedAt: new Date(),
    },
  });

  return {
    message: `Kopplingsförfrågan skickades igen till ${request.recipientEmail}.`,
  };
}

export async function archiveRmInvitation(invitationId: string): Promise<{ message: string }> {
  const scope = await getCurrentRmScope();
  const invitation = await prisma.rmInvitation.findFirst({
    where: {
      id: invitationId,
      organizationId: scope.organizationId,
      status: {
        in: [RmInvitationStatus.pending, RmInvitationStatus.registered],
      },
      ...(scope.ownOnly ? { inviterUserId: scope.viewer.id } : {}),
    },
    select: {
      id: true,
      status: true,
    },
  });

  if (!invitation) {
    throw new RmError(404, "INVITATION_NOT_FOUND", "Inbjudan kunde inte hittas eller kan inte tas bort.");
  }

  await prisma.rmInvitation.update({
    where: { id: invitation.id },
    data: {
      status: RmInvitationStatus.cancelled,
      updatedAt: new Date(),
    },
  });

  return {
    message:
      invitation.status === RmInvitationStatus.registered
        ? "Kopplingen mellan RM-företaget och användaren togs bort. Själva användaren och dess sökta jobb finns kvar."
        : "Inbjudan togs bort från listan.",
  };
}

export async function archiveRmConnectionRequest(requestId: string): Promise<{ message: string }> {
  const scope = await getCurrentRmScope();
  const request = await prisma.rmConnectionRequest.findFirst({
    where: {
      id: requestId,
      organizationId: scope.organizationId,
      status: RmConnectionRequestStatus.pending,
      ...(scope.ownOnly ? { advisorUserId: scope.viewer.id } : {}),
    },
    select: {
      id: true,
    },
  });

  if (!request) {
    throw new RmError(404, "REQUEST_NOT_FOUND", "Kopplingsförfrågan kunde inte hittas eller kan inte avbrytas.");
  }

  await prisma.rmConnectionRequest.update({
    where: { id: request.id },
    data: {
      respondedAt: new Date(),
      status: RmConnectionRequestStatus.cancelled,
    },
  });

  return {
    message: "Kopplingsförfrågan avbröts.",
  };
}

export async function archiveRmConnection(connectionId: string): Promise<{ message: string }> {
  const scope = await getCurrentRmScope();
  const connection = await prisma.rmConnection.findFirst({
    where: {
      id: connectionId,
      organizationId: scope.organizationId,
      archivedAt: null,
      ...(scope.ownOnly ? { advisorUserId: scope.viewer.id } : {}),
    },
    select: {
      id: true,
    },
  });

  if (!connection) {
    throw new RmError(404, "CONNECTION_NOT_FOUND", "Kopplingen kunde inte hittas eller kan inte tas bort.");
  }

  await prisma.rmConnection.update({
    where: { id: connection.id },
    data: {
      archivedAt: new Date(),
    },
  });

  return {
    message: "Kopplingen togs bort. Användaren och dess sökta jobb finns kvar.",
  };
}

export async function syncRmInvitationsForRegisteredUser(user: { email: string; id: string; name: string }): Promise<void> {
  const normalizedEmail = normalizeEmail(user.email);
  const pendingInvitations = await prisma.rmInvitation.findMany({
    where: {
      status: RmInvitationStatus.pending,
      OR: [
        {
          invitedUserId: user.id,
        },
        {
          recipientEmail: {
            equals: normalizedEmail,
            mode: "insensitive",
          },
        },
      ],
    },
    include: {
      inviter: {
        select: {
          email: true,
          name: true,
        },
      },
      organization: {
        select: {
          name: true,
          slug: true,
        },
      },
    },
  });

  if (pendingInvitations.length === 0) {
    return;
  }

  for (const invitation of pendingInvitations) {
    await prisma.rmInvitation.update({
      where: { id: invitation.id },
      data: {
        invitedUserId: user.id,
        recipientEmail: normalizedEmail,
        registeredAt: invitation.registeredAt ?? new Date(),
        status: RmInvitationStatus.registered,
      },
    });

    try {
      await sendRmInvitationRegisteredEmail({
        advisorEmail: invitation.inviter.email,
        advisorName: getDisplayName(invitation.inviter),
        invitedEmail: user.email,
        invitedName: user.name,
        organizationName: invitation.organization.name,
        organizationSlug: invitation.organization.slug,
      });
    } catch (error) {
      logger.warn("Failed to send RM registration notification email", {
        error: error instanceof Error ? error.message : String(error),
        invitationId: invitation.id,
      });
    }
  }
}

export async function getRmRequestDecisionPageData(token: string): Promise<RmRequestDecisionPageData> {
  const request = await prisma.rmConnectionRequest.findUnique({
    where: { token },
    include: {
      advisor: {
        select: {
          email: true,
          name: true,
        },
      },
      candidateUser: {
        select: {
          email: true,
          name: true,
        },
      },
      organization: {
        select: {
          name: true,
        },
      },
    },
  });

  if (!request) {
    throw new RmError(404, "REQUEST_NOT_FOUND", "Kopplingsförfrågan kunde inte hittas.");
  }

  const identity = await getCurrentClerkIdentity();

  if (!identity) {
    return {
      advisorName: getDisplayName(request.advisor),
      candidateEmail: request.candidateUser?.email ?? request.recipientEmail,
      candidateName: request.candidateUser?.name?.trim() || null,
      canRespond: false,
      organizationName: request.organization.name,
      status: request.status,
      token: request.token,
      viewerState: "anonymous",
    };
  }

  const viewer = await getCurrentDbUser({
    email: true,
    id: true,
  });
  const viewerEmail = viewer?.email ? normalizeEmail(viewer.email) : null;
  const clerkEmail = identity.email ? normalizeEmail(identity.email) : null;
  const recipientEmail = normalizeEmail(request.recipientEmail);
  const canRespond =
    (viewerEmail !== null && viewerEmail === recipientEmail) ||
    (clerkEmail !== null && clerkEmail === recipientEmail && viewer !== null) ||
    (request.candidateUserId !== null && request.candidateUserId === viewer?.id);
  let viewerState: RmRequestDecisionPageData["viewerState"] = "ready";

  if (!canRespond) {
    viewerState = clerkEmail === recipientEmail && viewer === null
      ? "needs-profile"
      : "wrong-account";
  }

  return {
    advisorName: getDisplayName(request.advisor),
    candidateEmail: request.candidateUser?.email ?? request.recipientEmail,
    candidateName: request.candidateUser?.name?.trim() || null,
    canRespond,
    organizationName: request.organization.name,
    status: request.status,
    token: request.token,
    viewerState,
  };
}

export async function respondToRmConnectionRequest(token: string, decision: RmRequestDecision) {
  const viewer = await getAuthenticatedRmDbUser();
  const request = await prisma.rmConnectionRequest.findUnique({
    where: { token },
    include: {
      advisor: {
        select: {
          email: true,
          id: true,
          name: true,
        },
      },
    },
  });

  if (!request) {
    throw new RmError(404, "REQUEST_NOT_FOUND", "Kopplingsförfrågan kunde inte hittas.");
  }

  const viewerEmail = normalizeEmail(viewer.email);

  if (viewerEmail !== request.recipientEmail && request.candidateUserId !== viewer.id) {
    throw new RmError(403, "FORBIDDEN", "Du kan inte svara på den här förfrågan.");
  }

  if (request.status !== RmConnectionRequestStatus.pending) {
    return {
      message: getRequestStatusMessage(request.status),
      status: request.status,
    };
  }

  if (decision === "decline") {
    await prisma.rmConnectionRequest.update({
      where: { id: request.id },
      data: {
        respondedAt: new Date(),
        status: RmConnectionRequestStatus.declined,
      },
    });

    return {
      message: "Kopplingsförfrågan har avslagits.",
      status: RmConnectionRequestStatus.declined,
    };
  }

  const existingConnection = await prisma.rmConnection.findFirst({
    where: {
      archivedAt: null,
      advisorUserId: request.advisorUserId,
      candidateUserId: viewer.id,
      organizationId: request.organizationId,
    },
    select: {
      id: true,
    },
  });

  let archivedConnection: { id: string } | null = null;

  if (existingConnection === null) {
    archivedConnection = await prisma.rmConnection.findFirst({
      where: {
        advisorUserId: request.advisorUserId,
        archivedAt: {
          not: null,
        },
        candidateUserId: viewer.id,
        organizationId: request.organizationId,
      },
      select: {
        id: true,
      },
    });
  }

  await prisma.$transaction(async (tx) => {
    await tx.rmConnectionRequest.update({
      where: { id: request.id },
      data: {
        candidateUserId: viewer.id,
        respondedAt: new Date(),
        status: RmConnectionRequestStatus.accepted,
      },
    });

    if (!existingConnection && !archivedConnection) {
      await tx.rmConnection.create({
        data: {
          advisorUserId: request.advisorUserId,
          candidateUserId: viewer.id,
          organizationId: request.organizationId,
        },
      });
    }

    if (archivedConnection) {
      await tx.rmConnection.update({
        where: { id: archivedConnection.id },
        data: {
          advisorUserId: request.advisorUserId,
          archivedAt: null,
        },
      });
    }

    await tx.rmConnectionRequest.updateMany({
      where: {
        advisorUserId: request.advisorUserId,
        candidateUserId: viewer.id,
        id: { not: request.id },
        organizationId: request.organizationId,
        status: RmConnectionRequestStatus.pending,
      },
      data: {
        respondedAt: new Date(),
        status: RmConnectionRequestStatus.cancelled,
      },
    });
  });

  return {
    message: `Du är nu kopplad till ${getDisplayName(request.advisor)}.`,
    status: RmConnectionRequestStatus.accepted,
  };
}

export function getRmErrorResponse(error: unknown): { message: string; status: number } {
  if (error instanceof RmError) {
    return {
      message: error.message,
      status: error.status,
    };
  }

  logger.error("Unhandled RM error", {
    error: getUnknownErrorMessage(error),
  });

  return {
    message: "Det gick inte att slutföra RM-begäran.",
    status: 500,
  };
}

export type RmRouteError = ReturnType<typeof getRmErrorResponse>;