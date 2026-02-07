-- DropIndex
DROP INDEX "users_phone_key";

-- AlterTable
ALTER TABLE "households" ADD COLUMN     "ai_settings" JSONB;

-- AlterTable
ALTER TABLE "users" ADD COLUMN     "city" TEXT,
ADD COLUMN     "current_streak" INTEGER NOT NULL DEFAULT 0,
ADD COLUMN     "last_log_date" TIMESTAMP(3),
ADD COLUMN     "longest_streak" INTEGER NOT NULL DEFAULT 0,
ADD COLUMN     "rank_progress" INTEGER NOT NULL DEFAULT 0,
ADD COLUMN     "rank_tier" TEXT NOT NULL DEFAULT 'NOVICE',
ADD COLUMN     "state" TEXT,
ADD COLUMN     "total_points" INTEGER NOT NULL DEFAULT 0,
ADD COLUMN     "weekly_activity_log" JSONB NOT NULL DEFAULT '[]';

-- CreateTable
CREATE TABLE "achievements" (
    "id" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "achievements_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "daily_insights" (
    "id" TEXT NOT NULL,
    "date" DATE NOT NULL,
    "news" JSONB NOT NULL,
    "quotes" JSONB NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "daily_insights_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "achievements_user_id_idx" ON "achievements"("user_id");

-- CreateIndex
CREATE UNIQUE INDEX "daily_insights_date_key" ON "daily_insights"("date");

-- AddForeignKey
ALTER TABLE "achievements" ADD CONSTRAINT "achievements_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
