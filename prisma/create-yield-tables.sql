-- Create all yield-related tables for Fabrknt Curate
-- Run this in Supabase SQL Editor

-- YieldWatchlist table
CREATE TABLE IF NOT EXISTS "YieldWatchlist" (
    "id" TEXT NOT NULL DEFAULT gen_random_uuid()::text,
    "poolId" TEXT NOT NULL,
    "chain" TEXT NOT NULL,
    "project" TEXT NOT NULL,
    "symbol" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "userId" TEXT NOT NULL,
    CONSTRAINT "YieldWatchlist_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX IF NOT EXISTS "YieldWatchlist_userId_poolId_key" ON "YieldWatchlist"("userId", "poolId");
CREATE INDEX IF NOT EXISTS "YieldWatchlist_userId_idx" ON "YieldWatchlist"("userId");

-- Add foreign key if User table exists
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.table_constraints
        WHERE constraint_name = 'YieldWatchlist_userId_fkey'
    ) THEN
        ALTER TABLE "YieldWatchlist"
        ADD CONSTRAINT "YieldWatchlist_userId_fkey"
        FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
    END IF;
EXCEPTION WHEN OTHERS THEN
    RAISE NOTICE 'Could not add YieldWatchlist foreign key: %', SQLERRM;
END $$;

-- UserYieldPreferences table
CREATE TABLE IF NOT EXISTS "UserYieldPreferences" (
    "id" TEXT NOT NULL DEFAULT gen_random_uuid()::text,
    "userId" TEXT NOT NULL,
    "riskTolerance" TEXT NOT NULL DEFAULT 'moderate',
    "preferredChains" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "minApy" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "maxApy" DOUBLE PRECISION NOT NULL DEFAULT 100,
    "stablecoinOnly" BOOLEAN NOT NULL DEFAULT false,
    "maxAllocationUsd" DOUBLE PRECISION,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "UserYieldPreferences_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX IF NOT EXISTS "UserYieldPreferences_userId_key" ON "UserYieldPreferences"("userId");
CREATE INDEX IF NOT EXISTS "UserYieldPreferences_userId_idx" ON "UserYieldPreferences"("userId");

-- Add foreign key if User table exists
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.table_constraints
        WHERE constraint_name = 'UserYieldPreferences_userId_fkey'
    ) THEN
        ALTER TABLE "UserYieldPreferences"
        ADD CONSTRAINT "UserYieldPreferences_userId_fkey"
        FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
    END IF;
EXCEPTION WHEN OTHERS THEN
    RAISE NOTICE 'Could not add UserYieldPreferences foreign key: %', SQLERRM;
END $$;

-- PoolInsightCache table (in case it doesn't exist)
CREATE TABLE IF NOT EXISTS "PoolInsightCache" (
    "id" TEXT NOT NULL DEFAULT gen_random_uuid()::text,
    "poolId" TEXT NOT NULL,
    "insight" JSONB NOT NULL,
    "poolSnapshot" JSONB NOT NULL,
    "generatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "expiresAt" TIMESTAMP(3) NOT NULL,
    CONSTRAINT "PoolInsightCache_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX IF NOT EXISTS "PoolInsightCache_poolId_key" ON "PoolInsightCache"("poolId");
CREATE INDEX IF NOT EXISTS "PoolInsightCache_poolId_idx" ON "PoolInsightCache"("poolId");
CREATE INDEX IF NOT EXISTS "PoolInsightCache_expiresAt_idx" ON "PoolInsightCache"("expiresAt");

-- Verify tables were created
SELECT 'Tables created successfully!' as status;
SELECT table_name FROM information_schema.tables
WHERE table_schema = 'public'
AND table_name IN ('YieldWatchlist', 'UserYieldPreferences', 'PoolInsightCache');
