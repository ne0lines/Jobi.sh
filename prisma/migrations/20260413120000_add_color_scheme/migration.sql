-- CreateEnum
CREATE TYPE "ColorScheme" AS ENUM ('dark', 'light');

-- AlterTable
ALTER TABLE "User" ADD COLUMN "colorScheme" "ColorScheme" NOT NULL DEFAULT 'light';
