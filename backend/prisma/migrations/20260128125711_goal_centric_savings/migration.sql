-- 1. Safe Drop Index
DROP INDEX IF EXISTS "reports_household_id_start_date_idx";

-- 2. Safe Alter Goals
ALTER TABLE "goals" ALTER COLUMN "target_amount" DROP NOT NULL;

-- 3. Safe Alter Reports (Only run if old columns exist or new ones are missing)
DO $$ 
BEGIN 
    -- Check if we need to migrate reports
    IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='reports' AND column_name='summary') THEN
        ALTER TABLE "reports" DROP COLUMN "end_date",
        DROP COLUMN "highlights",
        DROP COLUMN "recommendations",
        DROP COLUMN "start_date",
        DROP COLUMN "status",
        DROP COLUMN "summary",
        ADD COLUMN "content" JSONB NOT NULL,
        ADD COLUMN "date_end" DATE NOT NULL,
        ADD COLUMN "date_start" DATE NOT NULL;
    END IF;
END $$;

-- 4. Safe Alter Transactions (Add goal_id if missing)
DO $$ 
BEGIN 
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='transactions' AND column_name='goal_id') THEN
        ALTER TABLE "transactions" ADD COLUMN "goal_id" TEXT;
        ALTER TABLE "transactions" ADD CONSTRAINT "transactions_goal_id_fkey" 
        FOREIGN KEY ("goal_id") REFERENCES "goals"("id") ON DELETE SET NULL ON UPDATE CASCADE;
    END IF;
END $$;

-- 5. Safe Create Index
CREATE INDEX IF NOT EXISTS "reports_household_id_created_at_idx" ON "reports"("household_id", "created_at");
