-- Fix security issues flagged by Supabase
-- Run this on Supabase SQL Editor

-- Fix function search_path issues
ALTER FUNCTION public.update_updated_at_column() SET search_path = '';
ALTER FUNCTION public.generate_cuid() SET search_path = '';

-- Drop overly permissive policies and replace with service_role-only policies
-- This ensures only the application (via Prisma service role) can access data

-- ProjectDependency
DROP POLICY IF EXISTS "Service role full access" ON "ProjectDependency";
CREATE POLICY "Service role only" ON "ProjectDependency"
    FOR ALL TO service_role USING (true) WITH CHECK (true);

-- ProjectRelationship
DROP POLICY IF EXISTS "Service role full access" ON "ProjectRelationship";
CREATE POLICY "Service role only" ON "ProjectRelationship"
    FOR ALL TO service_role USING (true) WITH CHECK (true);

-- YieldWatchlist
DROP POLICY IF EXISTS "Service role full access" ON "YieldWatchlist";
CREATE POLICY "Service role only" ON "YieldWatchlist"
    FOR ALL TO service_role USING (true) WITH CHECK (true);

-- PoolInsightCache
DROP POLICY IF EXISTS "Service role full access" ON "PoolInsightCache";
CREATE POLICY "Service role only" ON "PoolInsightCache"
    FOR ALL TO service_role USING (true) WITH CHECK (true);

-- UserYieldPreferences
DROP POLICY IF EXISTS "Service role full access" ON "UserYieldPreferences";
CREATE POLICY "Service role only" ON "UserYieldPreferences"
    FOR ALL TO service_role USING (true) WITH CHECK (true);

-- DataRoomRequest
DROP POLICY IF EXISTS "Service role full access" ON "DataRoomRequest";
CREATE POLICY "Service role only" ON "DataRoomRequest"
    FOR ALL TO service_role USING (true) WITH CHECK (true);

-- Document
DROP POLICY IF EXISTS "Service role full access" ON "Document";
CREATE POLICY "Service role only" ON "Document"
    FOR ALL TO service_role USING (true) WITH CHECK (true);

-- Conversation
DROP POLICY IF EXISTS "Service role full access" ON "Conversation";
CREATE POLICY "Service role only" ON "Conversation"
    FOR ALL TO service_role USING (true) WITH CHECK (true);

-- Message
DROP POLICY IF EXISTS "Service role full access" ON "Message";
CREATE POLICY "Service role only" ON "Message"
    FOR ALL TO service_role USING (true) WITH CHECK (true);

-- Fix the pre-existing Company policy
DROP POLICY IF EXISTS "Authenticated users can create companies" ON "Company";
CREATE POLICY "Service role only insert" ON "Company"
    FOR INSERT TO service_role WITH CHECK (true);
