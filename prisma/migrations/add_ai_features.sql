-- AI Features Migration for CURATE
-- Run this on Supabase SQL Editor

-- Create UserYieldPreferences table
CREATE TABLE IF NOT EXISTS "UserYieldPreferences" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "riskTolerance" TEXT NOT NULL DEFAULT 'moderate',
    "preferredChains" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "minApy" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "maxApy" DOUBLE PRECISION NOT NULL DEFAULT 100,
    "stablecoinOnly" BOOLEAN NOT NULL DEFAULT false,
    "maxAllocationUsd" DOUBLE PRECISION,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "UserYieldPreferences_pkey" PRIMARY KEY ("id")
);

-- Create PoolInsightCache table
CREATE TABLE IF NOT EXISTS "PoolInsightCache" (
    "id" TEXT NOT NULL,
    "poolId" TEXT NOT NULL,
    "insight" JSONB NOT NULL,
    "poolSnapshot" JSONB NOT NULL,
    "generatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "expiresAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "PoolInsightCache_pkey" PRIMARY KEY ("id")
);

-- Create unique constraints
ALTER TABLE "UserYieldPreferences" ADD CONSTRAINT "UserYieldPreferences_userId_key" UNIQUE ("userId");
ALTER TABLE "PoolInsightCache" ADD CONSTRAINT "PoolInsightCache_poolId_key" UNIQUE ("poolId");

-- Create indexes
CREATE INDEX IF NOT EXISTS "UserYieldPreferences_userId_idx" ON "UserYieldPreferences"("userId");
CREATE INDEX IF NOT EXISTS "PoolInsightCache_poolId_idx" ON "PoolInsightCache"("poolId");
CREATE INDEX IF NOT EXISTS "PoolInsightCache_expiresAt_idx" ON "PoolInsightCache"("expiresAt");

-- Add foreign key constraint to User table
ALTER TABLE "UserYieldPreferences"
ADD CONSTRAINT "UserYieldPreferences_userId_fkey"
FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- Create trigger for updatedAt on UserYieldPreferences
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW."updatedAt" = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ language 'plpgsql';

DROP TRIGGER IF EXISTS update_user_yield_preferences_updated_at ON "UserYieldPreferences";
CREATE TRIGGER update_user_yield_preferences_updated_at
    BEFORE UPDATE ON "UserYieldPreferences"
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();
