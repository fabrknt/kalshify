-- ============================================
-- COMPREHENSIVE RLS POLICY FOR EXISTING TABLES
-- Checks if tables exist before applying RLS
-- ============================================

-- ============================================
-- 1. COMPANY TABLE
-- ============================================
DO $$
BEGIN
  IF EXISTS (SELECT FROM pg_tables WHERE tablename = 'Company') THEN
    ALTER TABLE "Company" ENABLE ROW LEVEL SECURITY;

    -- Public read access
    DROP POLICY IF EXISTS "Anyone can view companies" ON "Company";
    CREATE POLICY "Anyone can view companies"
    ON "Company" FOR SELECT
    TO public
    USING (true);

    -- Authenticated users can insert
    DROP POLICY IF EXISTS "Authenticated users can create companies" ON "Company";
    CREATE POLICY "Authenticated users can create companies"
    ON "Company" FOR INSERT
    TO authenticated
    WITH CHECK (true);

    -- Company owners can update
    DROP POLICY IF EXISTS "Company owners can update their companies" ON "Company";
    CREATE POLICY "Company owners can update their companies"
    ON "Company" FOR UPDATE
    TO authenticated
    USING (
      EXISTS (
        SELECT 1 FROM "ClaimedProfile"
        WHERE "ClaimedProfile"."companySlug" = "Company"."slug"
        AND "ClaimedProfile"."userId" = auth.uid()::text
      )
    );
  END IF;
END $$;

-- ============================================
-- 2. USER TABLE
-- ============================================
DO $$
BEGIN
  IF EXISTS (SELECT FROM pg_tables WHERE tablename = 'User') THEN
    ALTER TABLE "User" ENABLE ROW LEVEL SECURITY;

    DROP POLICY IF EXISTS "Anyone can view user profiles" ON "User";
    CREATE POLICY "Anyone can view user profiles"
    ON "User" FOR SELECT
    TO public
    USING (true);

    DROP POLICY IF EXISTS "Users can update own profile" ON "User";
    CREATE POLICY "Users can update own profile"
    ON "User" FOR UPDATE
    TO authenticated
    USING (auth.uid()::text = id);

    DROP POLICY IF EXISTS "Users can create own profile" ON "User";
    CREATE POLICY "Users can create own profile"
    ON "User" FOR INSERT
    TO authenticated
    WITH CHECK (auth.uid()::text = id);
  END IF;
END $$;

-- ============================================
-- 3. ACCOUNT TABLE (NextAuth OAuth)
-- ============================================
DO $$
BEGIN
  IF EXISTS (SELECT FROM pg_tables WHERE tablename = 'Account') THEN
    ALTER TABLE "Account" ENABLE ROW LEVEL SECURITY;

    DROP POLICY IF EXISTS "Users can manage own accounts" ON "Account";
    CREATE POLICY "Users can manage own accounts"
    ON "Account" FOR ALL
    TO authenticated
    USING (auth.uid()::text = "userId");
  END IF;
END $$;

-- ============================================
-- 4. SESSION TABLE (NextAuth)
-- ============================================
DO $$
BEGIN
  IF EXISTS (SELECT FROM pg_tables WHERE tablename = 'Session') THEN
    ALTER TABLE "Session" ENABLE ROW LEVEL SECURITY;

    DROP POLICY IF EXISTS "Users can manage own sessions" ON "Session";
    CREATE POLICY "Users can manage own sessions"
    ON "Session" FOR ALL
    TO authenticated
    USING (auth.uid()::text = "userId");
  END IF;
END $$;

-- ============================================
-- 5. VERIFICATION TOKEN (NextAuth)
-- ============================================
DO $$
BEGIN
  IF EXISTS (SELECT FROM pg_tables WHERE tablename = 'VerificationToken') THEN
    ALTER TABLE "VerificationToken" ENABLE ROW LEVEL SECURITY;

    DROP POLICY IF EXISTS "Service role can manage verification tokens" ON "VerificationToken";
    CREATE POLICY "Service role can manage verification tokens"
    ON "VerificationToken" FOR ALL
    TO service_role
    USING (true);
  END IF;
END $$;

-- ============================================
-- 6. CLAIMED PROFILE
-- ============================================
DO $$
BEGIN
  IF EXISTS (SELECT FROM pg_tables WHERE tablename = 'ClaimedProfile') THEN
    ALTER TABLE "ClaimedProfile" ENABLE ROW LEVEL SECURITY;

    DROP POLICY IF EXISTS "Anyone can view claimed profiles" ON "ClaimedProfile";
    CREATE POLICY "Anyone can view claimed profiles"
    ON "ClaimedProfile" FOR SELECT
    TO public
    USING (true);

    DROP POLICY IF EXISTS "Users can create own claims" ON "ClaimedProfile";
    CREATE POLICY "Users can create own claims"
    ON "ClaimedProfile" FOR INSERT
    TO authenticated
    WITH CHECK (auth.uid()::text = "userId");

    DROP POLICY IF EXISTS "Users can update own claims" ON "ClaimedProfile";
    CREATE POLICY "Users can update own claims"
    ON "ClaimedProfile" FOR UPDATE
    TO authenticated
    USING (auth.uid()::text = "userId");

    DROP POLICY IF EXISTS "Users can delete own claims" ON "ClaimedProfile";
    CREATE POLICY "Users can delete own claims"
    ON "ClaimedProfile" FOR DELETE
    TO authenticated
    USING (auth.uid()::text = "userId");
  END IF;
END $$;

-- ============================================
-- 7. SWIPE TABLE (Private)
-- ============================================
DO $$
BEGIN
  IF EXISTS (SELECT FROM pg_tables WHERE tablename = 'Swipe') THEN
    ALTER TABLE "Swipe" ENABLE ROW LEVEL SECURITY;

    DROP POLICY IF EXISTS "Users can manage own swipes" ON "Swipe";
    CREATE POLICY "Users can manage own swipes"
    ON "Swipe" FOR ALL
    TO authenticated
    USING (auth.uid()::text = "userId");
  END IF;
END $$;

-- ============================================
-- 8. MATCH TABLE
-- ============================================
DO $$
BEGIN
  IF EXISTS (SELECT FROM pg_tables WHERE tablename = 'Match') THEN
    ALTER TABLE "Match" ENABLE ROW LEVEL SECURITY;

    DROP POLICY IF EXISTS "Users can view their matches" ON "Match";
    CREATE POLICY "Users can view their matches"
    ON "Match" FOR SELECT
    TO authenticated
    USING (
      EXISTS (
        SELECT 1 FROM "ClaimedProfile"
        WHERE (
          "ClaimedProfile"."companySlug" = "Match"."companyASlug"
          OR "ClaimedProfile"."companySlug" = "Match"."companyBSlug"
        )
        AND "ClaimedProfile"."userId" = auth.uid()::text
      )
    );

    DROP POLICY IF EXISTS "Users can update their matches" ON "Match";
    CREATE POLICY "Users can update their matches"
    ON "Match" FOR UPDATE
    TO authenticated
    USING (
      EXISTS (
        SELECT 1 FROM "ClaimedProfile"
        WHERE (
          "ClaimedProfile"."companySlug" = "Match"."companyASlug"
          OR "ClaimedProfile"."companySlug" = "Match"."companyBSlug"
        )
        AND "ClaimedProfile"."userId" = auth.uid()::text
      )
    );
  END IF;
END $$;

-- ============================================
-- 9. CONVERSATION TABLE (may not exist yet)
-- ============================================
DO $$
BEGIN
  IF EXISTS (SELECT FROM pg_tables WHERE tablename = 'Conversation') THEN
    ALTER TABLE "Conversation" ENABLE ROW LEVEL SECURITY;

    DROP POLICY IF EXISTS "Users can view their conversations" ON "Conversation";
    CREATE POLICY "Users can view their conversations"
    ON "Conversation" FOR SELECT
    TO authenticated
    USING (
      EXISTS (
        SELECT 1 FROM "Match"
        JOIN "ClaimedProfile" ON (
          "ClaimedProfile"."companySlug" = "Match"."companyASlug"
          OR "ClaimedProfile"."companySlug" = "Match"."companyBSlug"
        )
        WHERE "Match"."id" = "Conversation"."matchId"
        AND "ClaimedProfile"."userId" = auth.uid()::text
      )
    );

    DROP POLICY IF EXISTS "Users can create conversations for their matches" ON "Conversation";
    CREATE POLICY "Users can create conversations for their matches"
    ON "Conversation" FOR INSERT
    TO authenticated
    WITH CHECK (
      EXISTS (
        SELECT 1 FROM "Match"
        JOIN "ClaimedProfile" ON (
          "ClaimedProfile"."companySlug" = "Match"."companyASlug"
          OR "ClaimedProfile"."companySlug" = "Match"."companyBSlug"
        )
        WHERE "Match"."id" = "matchId"
        AND "ClaimedProfile"."userId" = auth.uid()::text
      )
    );
  END IF;
END $$;

-- ============================================
-- 10. MESSAGE TABLE (may not exist yet)
-- ============================================
DO $$
BEGIN
  IF EXISTS (SELECT FROM pg_tables WHERE tablename = 'Message') THEN
    ALTER TABLE "Message" ENABLE ROW LEVEL SECURITY;

    DROP POLICY IF EXISTS "Users can view messages in their conversations" ON "Message";
    CREATE POLICY "Users can view messages in their conversations"
    ON "Message" FOR SELECT
    TO authenticated
    USING (
      EXISTS (
        SELECT 1 FROM "Conversation"
        JOIN "Match" ON "Match"."id" = "Conversation"."matchId"
        JOIN "ClaimedProfile" ON (
          "ClaimedProfile"."companySlug" = "Match"."companyASlug"
          OR "ClaimedProfile"."companySlug" = "Match"."companyBSlug"
        )
        WHERE "Conversation"."id" = "Message"."conversationId"
        AND "ClaimedProfile"."userId" = auth.uid()::text
      )
    );

    DROP POLICY IF EXISTS "Users can send messages in their conversations" ON "Message";
    CREATE POLICY "Users can send messages in their conversations"
    ON "Message" FOR INSERT
    TO authenticated
    WITH CHECK (
      EXISTS (
        SELECT 1 FROM "Conversation"
        JOIN "Match" ON "Match"."id" = "Conversation"."matchId"
        JOIN "ClaimedProfile" ON "ClaimedProfile"."companySlug" = "senderSlug"
        WHERE "Conversation"."id" = "conversationId"
        AND "ClaimedProfile"."userId" = auth.uid()::text
      )
    );

    DROP POLICY IF EXISTS "Users can update messages in their conversations" ON "Message";
    CREATE POLICY "Users can update messages in their conversations"
    ON "Message" FOR UPDATE
    TO authenticated
    USING (
      EXISTS (
        SELECT 1 FROM "Conversation"
        JOIN "Match" ON "Match"."id" = "Conversation"."matchId"
        JOIN "ClaimedProfile" ON (
          "ClaimedProfile"."companySlug" = "Match"."companyASlug"
          OR "ClaimedProfile"."companySlug" = "Match"."companyBSlug"
        )
        WHERE "Conversation"."id" = "Message"."conversationId"
        AND "ClaimedProfile"."userId" = auth.uid()::text
      )
    );
  END IF;
END $$;

-- ============================================
-- 11. LISTING TABLE
-- ============================================
DO $$
BEGIN
  IF EXISTS (SELECT FROM pg_tables WHERE tablename = 'Listing') THEN
    ALTER TABLE "Listing" ENABLE ROW LEVEL SECURITY;

    DROP POLICY IF EXISTS "Anyone can view active listings" ON "Listing";
    CREATE POLICY "Anyone can view active listings"
    ON "Listing" FOR SELECT
    TO public
    USING (status = 'active' OR status = 'under_offer');

    DROP POLICY IF EXISTS "Sellers can view own listings" ON "Listing";
    CREATE POLICY "Sellers can view own listings"
    ON "Listing" FOR SELECT
    TO authenticated
    USING (auth.uid()::text = "sellerId");

    DROP POLICY IF EXISTS "Users can create listings" ON "Listing";
    CREATE POLICY "Users can create listings"
    ON "Listing" FOR INSERT
    TO authenticated
    WITH CHECK (auth.uid()::text = "sellerId");

    DROP POLICY IF EXISTS "Sellers can update own listings" ON "Listing";
    CREATE POLICY "Sellers can update own listings"
    ON "Listing" FOR UPDATE
    TO authenticated
    USING (auth.uid()::text = "sellerId");

    DROP POLICY IF EXISTS "Sellers can delete own listings" ON "Listing";
    CREATE POLICY "Sellers can delete own listings"
    ON "Listing" FOR DELETE
    TO authenticated
    USING (auth.uid()::text = "sellerId");
  END IF;
END $$;

-- ============================================
-- 12-16. OTHER TABLES (Offer, DataRoomRequest, Document, Watchlist, Notification)
-- ============================================
DO $$
BEGIN
  -- OFFER TABLE
  IF EXISTS (SELECT FROM pg_tables WHERE tablename = 'Offer') THEN
    ALTER TABLE "Offer" ENABLE ROW LEVEL SECURITY;
    DROP POLICY IF EXISTS "Buyers can view own offers" ON "Offer";
    CREATE POLICY "Buyers can view own offers" ON "Offer" FOR SELECT TO authenticated USING (auth.uid()::text = "buyerId");
    DROP POLICY IF EXISTS "Sellers can view offers on their listings" ON "Offer";
    CREATE POLICY "Sellers can view offers on their listings" ON "Offer" FOR SELECT TO authenticated USING (EXISTS (SELECT 1 FROM "Listing" WHERE "Listing"."id" = "Offer"."listingId" AND "Listing"."sellerId" = auth.uid()::text));
    DROP POLICY IF EXISTS "Buyers can create offers" ON "Offer";
    CREATE POLICY "Buyers can create offers" ON "Offer" FOR INSERT TO authenticated WITH CHECK (auth.uid()::text = "buyerId");
    DROP POLICY IF EXISTS "Buyers can update own offers" ON "Offer";
    CREATE POLICY "Buyers can update own offers" ON "Offer" FOR UPDATE TO authenticated USING (auth.uid()::text = "buyerId");
    DROP POLICY IF EXISTS "Sellers can update offers on their listings" ON "Offer";
    CREATE POLICY "Sellers can update offers on their listings" ON "Offer" FOR UPDATE TO authenticated USING (EXISTS (SELECT 1 FROM "Listing" WHERE "Listing"."id" = "Offer"."listingId" AND "Listing"."sellerId" = auth.uid()::text));
  END IF;

  -- WATCHLIST TABLE
  IF EXISTS (SELECT FROM pg_tables WHERE tablename = 'Watchlist') THEN
    ALTER TABLE "Watchlist" ENABLE ROW LEVEL SECURITY;
    DROP POLICY IF EXISTS "Users can manage own watchlist" ON "Watchlist";
    CREATE POLICY "Users can manage own watchlist" ON "Watchlist" FOR ALL TO authenticated USING (auth.uid()::text = "userId");
  END IF;

  -- NOTIFICATION TABLE
  IF EXISTS (SELECT FROM pg_tables WHERE tablename = 'Notification') THEN
    ALTER TABLE "Notification" ENABLE ROW LEVEL SECURITY;
    DROP POLICY IF EXISTS "Users can view own notifications" ON "Notification";
    CREATE POLICY "Users can view own notifications" ON "Notification" FOR SELECT TO authenticated USING (auth.uid()::text = "userId");
    DROP POLICY IF EXISTS "Users can update own notifications" ON "Notification";
    CREATE POLICY "Users can update own notifications" ON "Notification" FOR UPDATE TO authenticated USING (auth.uid()::text = "userId");
    DROP POLICY IF EXISTS "Service can create notifications" ON "Notification";
    CREATE POLICY "Service can create notifications" ON "Notification" FOR INSERT TO service_role WITH CHECK (true);
  END IF;
END $$;

-- ============================================
-- GRANT PERMISSIONS
-- ============================================
GRANT USAGE ON SCHEMA public TO authenticated;
GRANT USAGE ON SCHEMA public TO anon;
GRANT SELECT ON ALL TABLES IN SCHEMA public TO anon;
GRANT ALL ON ALL TABLES IN SCHEMA public TO authenticated;
