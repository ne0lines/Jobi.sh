ALTER TABLE "RmConnection"
ADD COLUMN "archivedAt" TIMESTAMP(3);

CREATE INDEX "RmConnection_archivedAt_idx" ON "RmConnection"("archivedAt");