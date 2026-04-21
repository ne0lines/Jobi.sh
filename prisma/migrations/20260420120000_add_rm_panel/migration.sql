ALTER TYPE "UserRole" ADD VALUE 'rm';

CREATE TYPE "RmInvitationStatus" AS ENUM ('pending', 'registered', 'cancelled');
CREATE TYPE "RmConnectionRequestStatus" AS ENUM ('pending', 'accepted', 'declined', 'cancelled');

ALTER TABLE "User"
ADD COLUMN "rmOrganizationId" TEXT;

CREATE TABLE "RmOrganization" (
  "id" TEXT NOT NULL,
  "name" TEXT NOT NULL,
  "slug" TEXT NOT NULL,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,

  CONSTRAINT "RmOrganization_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "RmConnection" (
  "id" TEXT NOT NULL,
  "organizationId" TEXT NOT NULL,
  "advisorUserId" TEXT NOT NULL,
  "candidateUserId" TEXT NOT NULL,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

  CONSTRAINT "RmConnection_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "RmInvitation" (
  "id" TEXT NOT NULL,
  "token" TEXT NOT NULL,
  "organizationId" TEXT NOT NULL,
  "inviterUserId" TEXT NOT NULL,
  "invitedUserId" TEXT,
  "recipientEmail" TEXT NOT NULL,
  "status" "RmInvitationStatus" NOT NULL DEFAULT 'pending',
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "registeredAt" TIMESTAMP(3),
  "updatedAt" TIMESTAMP(3) NOT NULL,

  CONSTRAINT "RmInvitation_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "RmConnectionRequest" (
  "id" TEXT NOT NULL,
  "token" TEXT NOT NULL,
  "organizationId" TEXT NOT NULL,
  "advisorUserId" TEXT NOT NULL,
  "candidateUserId" TEXT,
  "invitationId" TEXT,
  "recipientEmail" TEXT NOT NULL,
  "status" "RmConnectionRequestStatus" NOT NULL DEFAULT 'pending',
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "respondedAt" TIMESTAMP(3),
  "updatedAt" TIMESTAMP(3) NOT NULL,

  CONSTRAINT "RmConnectionRequest_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "RmOrganization_slug_key" ON "RmOrganization"("slug");
CREATE UNIQUE INDEX "RmConnection_organizationId_candidateUserId_key" ON "RmConnection"("organizationId", "candidateUserId");
CREATE UNIQUE INDEX "RmInvitation_token_key" ON "RmInvitation"("token");
CREATE UNIQUE INDEX "RmConnectionRequest_token_key" ON "RmConnectionRequest"("token");

CREATE INDEX "RmConnection_organizationId_advisorUserId_idx" ON "RmConnection"("organizationId", "advisorUserId");
CREATE INDEX "RmConnection_candidateUserId_idx" ON "RmConnection"("candidateUserId");
CREATE INDEX "RmInvitation_organizationId_status_idx" ON "RmInvitation"("organizationId", "status");
CREATE INDEX "RmInvitation_inviterUserId_status_idx" ON "RmInvitation"("inviterUserId", "status");
CREATE INDEX "RmInvitation_recipientEmail_status_idx" ON "RmInvitation"("recipientEmail", "status");
CREATE INDEX "RmConnectionRequest_organizationId_status_idx" ON "RmConnectionRequest"("organizationId", "status");
CREATE INDEX "RmConnectionRequest_advisorUserId_status_idx" ON "RmConnectionRequest"("advisorUserId", "status");
CREATE INDEX "RmConnectionRequest_candidateUserId_status_idx" ON "RmConnectionRequest"("candidateUserId", "status");
CREATE INDEX "RmConnectionRequest_recipientEmail_status_idx" ON "RmConnectionRequest"("recipientEmail", "status");

ALTER TABLE "User"
ADD CONSTRAINT "User_rmOrganizationId_fkey"
FOREIGN KEY ("rmOrganizationId") REFERENCES "RmOrganization"("id")
ON DELETE SET NULL ON UPDATE CASCADE;

ALTER TABLE "RmConnection"
ADD CONSTRAINT "RmConnection_organizationId_fkey"
FOREIGN KEY ("organizationId") REFERENCES "RmOrganization"("id")
ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "RmConnection"
ADD CONSTRAINT "RmConnection_advisorUserId_fkey"
FOREIGN KEY ("advisorUserId") REFERENCES "User"("id")
ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "RmConnection"
ADD CONSTRAINT "RmConnection_candidateUserId_fkey"
FOREIGN KEY ("candidateUserId") REFERENCES "User"("id")
ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "RmInvitation"
ADD CONSTRAINT "RmInvitation_organizationId_fkey"
FOREIGN KEY ("organizationId") REFERENCES "RmOrganization"("id")
ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "RmInvitation"
ADD CONSTRAINT "RmInvitation_inviterUserId_fkey"
FOREIGN KEY ("inviterUserId") REFERENCES "User"("id")
ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "RmInvitation"
ADD CONSTRAINT "RmInvitation_invitedUserId_fkey"
FOREIGN KEY ("invitedUserId") REFERENCES "User"("id")
ON DELETE SET NULL ON UPDATE CASCADE;

ALTER TABLE "RmConnectionRequest"
ADD CONSTRAINT "RmConnectionRequest_organizationId_fkey"
FOREIGN KEY ("organizationId") REFERENCES "RmOrganization"("id")
ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "RmConnectionRequest"
ADD CONSTRAINT "RmConnectionRequest_advisorUserId_fkey"
FOREIGN KEY ("advisorUserId") REFERENCES "User"("id")
ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "RmConnectionRequest"
ADD CONSTRAINT "RmConnectionRequest_candidateUserId_fkey"
FOREIGN KEY ("candidateUserId") REFERENCES "User"("id")
ON DELETE SET NULL ON UPDATE CASCADE;

ALTER TABLE "RmConnectionRequest"
ADD CONSTRAINT "RmConnectionRequest_invitationId_fkey"
FOREIGN KEY ("invitationId") REFERENCES "RmInvitation"("id")
ON DELETE SET NULL ON UPDATE CASCADE;