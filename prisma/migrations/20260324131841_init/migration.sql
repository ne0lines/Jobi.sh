/*
  Warnings:

  - You are about to drop the column `professionalRole` on the `User` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "User" DROP COLUMN "professionalRole",
ADD COLUMN     "complete" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "profession" TEXT NOT NULL DEFAULT '';
