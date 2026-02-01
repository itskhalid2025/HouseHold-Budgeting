-- CreateEnum
CREATE TYPE "AiLogType" AS ENUM ('CHAT', 'SMART_ENTRY', 'REPORT');

-- AlterTable
ALTER TABLE "households" ADD COLUMN     "country" TEXT;

-- AlterTable
ALTER TABLE "users" ADD COLUMN     "ai_settings" JSONB,
ADD COLUMN     "country" TEXT,
ADD COLUMN     "last_ip" TEXT;

-- CreateTable
CREATE TABLE "ai_usage_logs" (
    "id" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "household_id" TEXT,
    "type" "AiLogType" NOT NULL,
    "tokens" INTEGER NOT NULL DEFAULT 0,
    "country" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ai_usage_logs_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "ai_usage_logs_user_id_type_idx" ON "ai_usage_logs"("user_id", "type");

-- CreateIndex
CREATE INDEX "ai_usage_logs_household_id_type_idx" ON "ai_usage_logs"("household_id", "type");

-- CreateIndex
CREATE INDEX "ai_usage_logs_created_at_idx" ON "ai_usage_logs"("created_at");

-- AddForeignKey
ALTER TABLE "ai_usage_logs" ADD CONSTRAINT "ai_usage_logs_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ai_usage_logs" ADD CONSTRAINT "ai_usage_logs_household_id_fkey" FOREIGN KEY ("household_id") REFERENCES "households"("id") ON DELETE SET NULL ON UPDATE CASCADE;
