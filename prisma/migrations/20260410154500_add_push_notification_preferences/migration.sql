ALTER TABLE "User"
ADD COLUMN "todoNotificationsEnabled" BOOLEAN NOT NULL DEFAULT true,
ADD COLUMN "tipNotificationsEnabled" BOOLEAN NOT NULL DEFAULT true;