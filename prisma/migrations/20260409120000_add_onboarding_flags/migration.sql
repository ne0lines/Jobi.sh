-- AlterTable
ALTER TABLE "User" ADD COLUMN     "onboardingDismissed" BOOLEAN NOT NULL DEFAULT false;
ALTER TABLE "User" ADD COLUMN     "onboardingPipelineExplored" BOOLEAN NOT NULL DEFAULT false;
ALTER TABLE "User" ADD COLUMN     "onboardingReportViewed" BOOLEAN NOT NULL DEFAULT false;
