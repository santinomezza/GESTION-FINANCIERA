-- AlterTable
ALTER TABLE "invoices" ADD COLUMN     "file" BYTEA,
ADD COLUMN     "fileMimeType" TEXT;
