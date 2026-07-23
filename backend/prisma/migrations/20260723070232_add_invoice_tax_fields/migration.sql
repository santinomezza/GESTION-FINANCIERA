-- AlterTable
ALTER TABLE "invoices" ADD COLUMN     "ivaAmount" DOUBLE PRECISION,
ADD COLUMN     "ivaPercentage" DOUBLE PRECISION,
ADD COLUMN     "netAmount" DOUBLE PRECISION;
