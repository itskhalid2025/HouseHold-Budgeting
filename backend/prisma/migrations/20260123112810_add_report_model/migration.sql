-- AlterEnum
ALTER TYPE "TransactionType" ADD VALUE 'SAVINGS';

-- CreateTable
CREATE TABLE "reports" (
    "id" TEXT NOT NULL,
    "household_id" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "start_date" DATE NOT NULL,
    "end_date" DATE NOT NULL,
    "summary" JSONB NOT NULL,
    "highlights" TEXT[],
    "recommendations" JSONB NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'GENERATED',
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "reports_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "reports_household_id_start_date_idx" ON "reports"("household_id", "start_date");

-- AddForeignKey
ALTER TABLE "reports" ADD CONSTRAINT "reports_household_id_fkey" FOREIGN KEY ("household_id") REFERENCES "households"("id") ON DELETE CASCADE ON UPDATE CASCADE;
