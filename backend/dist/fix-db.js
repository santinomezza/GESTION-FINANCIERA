"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const client_1 = require("@prisma/client");
const prisma = new client_1.PrismaClient();
async function main() {
    console.log('Fixing database via raw SQL...');
    await prisma.$executeRaw `
    CREATE TABLE IF NOT EXISTS "goals" (
        "id" TEXT NOT NULL,
        "workspaceId" TEXT NOT NULL,
        "name" TEXT NOT NULL,
        "description" TEXT,
        "targetAmount" DECIMAL(15,2) NOT NULL,
        "currentAmount" DECIMAL(15,2) NOT NULL DEFAULT 0,
        "category" TEXT,
        "targetDate" TIMESTAMP(3),
        "isCompleted" BOOLEAN NOT NULL DEFAULT false,
        "isActive" BOOLEAN NOT NULL DEFAULT true,
        "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
        "updatedAt" TIMESTAMP(3) NOT NULL,
        "deletedAt" TIMESTAMP(3),
        CONSTRAINT "goals_pkey" PRIMARY KEY ("id")
    );
  `;
    await prisma.$executeRaw `
    CREATE INDEX IF NOT EXISTS "goals_workspaceId_isActive_idx" ON "goals"("workspaceId", "isActive");
  `;
    await prisma.$executeRaw `
    CREATE INDEX IF NOT EXISTS "goals_deletedAt_idx" ON "goals"("deletedAt");
  `;
    const result = await prisma.$queryRaw `ALTER TABLE "transactions" ADD COLUMN IF NOT EXISTS "goalId" TEXT;`;
    console.log('goalId column result:', result);
    await prisma.$executeRaw `
    ALTER TABLE "transactions" ADD CONSTRAINT IF NOT EXISTS "transactions_goalId_fkey" FOREIGN KEY ("goalId") REFERENCES "goals"("id") ON DELETE SET NULL ON UPDATE CASCADE;
  `;
    await prisma.$executeRaw `
    ALTER TABLE "goals" ADD CONSTRAINT IF NOT EXISTS "goals_workspaceId_fkey" FOREIGN KEY ("workspaceId") REFERENCES "workspaces"("id") ON DELETE CASCADE ON UPDATE CASCADE;
  `;
    const columns = await prisma.$queryRaw `
    SELECT column_name FROM information_schema.columns WHERE table_name = 'transactions' AND column_name = 'existe';
  `;
    console.log('existe columns found:', columns.length);
    if (columns.length > 0) {
        await prisma.$executeRaw `ALTER TABLE "transactions" DROP COLUMN "existe";`;
        console.log('Dropped existe column');
    }
    else {
        console.log('existe column not found, no action needed');
    }
    console.log('Done!');
}
main()
    .catch(console.error)
    .finally(() => prisma.$disconnect());
//# sourceMappingURL=fix-db.js.map