-- AlterTable
ALTER TABLE "invitations" ADD COLUMN     "displayName" TEXT;

-- AlterTable
ALTER TABLE "transactions" ADD COLUMN     "createdById" TEXT;

-- AlterTable
ALTER TABLE "workspace_members" ADD COLUMN     "displayName" TEXT;

-- CreateIndex
CREATE INDEX "transactions_workspaceId_createdById_idx" ON "transactions"("workspaceId", "createdById");

-- AddForeignKey
ALTER TABLE "transactions" ADD CONSTRAINT "transactions_createdById_fkey" FOREIGN KEY ("createdById") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;
