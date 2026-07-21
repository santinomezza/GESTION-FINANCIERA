-- AlterTable
ALTER TABLE "workspaces" ADD COLUMN     "enabledFeatures" TEXT[] DEFAULT ARRAY['transactions', 'categories', 'clients', 'invoices']::TEXT[];
