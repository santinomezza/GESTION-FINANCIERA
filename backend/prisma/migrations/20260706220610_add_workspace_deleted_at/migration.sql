/*
  Warnings:

  - Added the required column `updatedAt` to the `workspace_members` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "workspace_members" ADD COLUMN     "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
ADD COLUMN     "deletedAt" TIMESTAMP(3),
ADD COLUMN     "updatedAt" TIMESTAMP(3) NOT NULL;

-- AlterTable
ALTER TABLE "workspaces" ADD COLUMN     "deletedAt" TIMESTAMP(3);

-- CreateIndex
CREATE INDEX "workspace_members_deletedAt_idx" ON "workspace_members"("deletedAt");

-- CreateIndex
CREATE INDEX "workspaces_deletedAt_idx" ON "workspaces"("deletedAt");
