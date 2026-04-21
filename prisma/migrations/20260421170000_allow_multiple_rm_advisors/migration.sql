DROP INDEX "RmConnection_organizationId_candidateUserId_key";

CREATE UNIQUE INDEX "RmConnection_organizationId_advisorUserId_candidateUserId_key"
ON "RmConnection" ("organizationId", "advisorUserId", "candidateUserId");
