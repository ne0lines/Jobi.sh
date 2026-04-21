ALTER TABLE "RmOrganization"
ADD COLUMN "archivedAt" TIMESTAMP(3);

CREATE INDEX "RmOrganization_archivedAt_idx" ON "RmOrganization"("archivedAt");