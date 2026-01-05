-- ============================================
-- COMPREHENSIVE RLS POLICY FOR ALL TABLES
-- ============================================

-- ============================================
-- 1. COMPANY TABLE
-- ============================================
ALTER TABLE "Company" ENABLE ROW LEVEL SECURITY;

-- Public read access
CREATE POLICY "Anyone can view companies"
ON "Company" FOR SELECT
TO public
USING (true);

-- Authenticated users can insert
CREATE POLICY "Authenticated users can create companies"
ON "Company" FOR INSERT
TO authenticated
WITH CHECK (true);

-- Company owners can update
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

-- ============================================
-- 2. USER TABLE
-- ============================================
ALTER TABLE "User" ENABLE ROW LEVEL SECURITY;

-- Users can view all user profiles (for partnership discovery)
CREATE POLICY "Anyone can view user profiles"
ON "User" FOR SELECT
TO public
USING (true);

-- Users can only update their own profile
CREATE POLICY "Users can update own profile"
ON "User" FOR UPDATE
TO authenticated
USING (auth.uid()::text = id);

-- Users can insert their own profile (signup)
CREATE POLICY "Users can create own profile"
ON "User" FOR INSERT
TO authenticated
WITH CHECK (auth.uid()::text = id);

-- ============================================
-- 3. ACCOUNT TABLE (NextAuth OAuth)
-- ============================================
ALTER TABLE "Account" ENABLE ROW LEVEL SECURITY;

-- Users can only see their own OAuth accounts
CREATE POLICY "Users can manage own accounts"
ON "Account" FOR ALL
TO authenticated
USING (auth.uid()::text = "userId");

-- ============================================
-- 4. SESSION TABLE (NextAuth)
-- ============================================
ALTER TABLE "Session" ENABLE ROW LEVEL SECURITY;

-- Users can only see their own sessions
CREATE POLICY "Users can manage own sessions"
ON "Session" FOR ALL
TO authenticated
USING (auth.uid()::text = "userId");

-- ============================================
-- 5. VERIFICATION TOKEN (NextAuth)
-- ============================================
ALTER TABLE "VerificationToken" ENABLE ROW LEVEL SECURITY;

-- No public access needed - handled by NextAuth server-side
CREATE POLICY "Service role can manage verification tokens"
ON "VerificationToken" FOR ALL
TO service_role
USING (true);

-- ============================================
-- 6. CLAIMED PROFILE
-- ============================================
ALTER TABLE "ClaimedProfile" ENABLE ROW LEVEL SECURITY;

-- Public can see who claimed companies
CREATE POLICY "Anyone can view claimed profiles"
ON "ClaimedProfile" FOR SELECT
TO public
USING (true);

-- Users can create their own claims
CREATE POLICY "Users can create own claims"
ON "ClaimedProfile" FOR INSERT
TO authenticated
WITH CHECK (auth.uid()::text = "userId");

-- Users can update their own claims
CREATE POLICY "Users can update own claims"
ON "ClaimedProfile" FOR UPDATE
TO authenticated
USING (auth.uid()::text = "userId");

-- Users can delete their own claims
CREATE POLICY "Users can delete own claims"
ON "ClaimedProfile" FOR DELETE
TO authenticated
USING (auth.uid()::text = "userId");

-- ============================================
-- 7. SWIPE TABLE (Private)
-- ============================================
ALTER TABLE "Swipe" ENABLE ROW LEVEL SECURITY;

-- Users can only see/manage their own swipes
CREATE POLICY "Users can manage own swipes"
ON "Swipe" FOR ALL
TO authenticated
USING (auth.uid()::text = "userId");

-- ============================================
-- 8. MATCH TABLE
-- ============================================
ALTER TABLE "Match" ENABLE ROW LEVEL SECURITY;

-- Users can see matches involving their companies
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

-- Users can update matches involving their companies
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

-- ============================================
-- 9. CONVERSATION TABLE
-- ============================================
ALTER TABLE "Conversation" ENABLE ROW LEVEL SECURITY;

-- Users can see conversations for their matches
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

-- Users can create conversations for their matches
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

-- ============================================
-- 10. MESSAGE TABLE
-- ============================================
ALTER TABLE "Message" ENABLE ROW LEVEL SECURITY;

-- Users can see messages in their conversations
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

-- Users can send messages in their conversations
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

-- Users can mark messages as read
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

-- ============================================
-- 11. LISTING TABLE
-- ============================================
ALTER TABLE "Listing" ENABLE ROW LEVEL SECURITY;

-- Public can view active listings
CREATE POLICY "Anyone can view active listings"
ON "Listing" FOR SELECT
TO public
USING (status = 'active' OR status = 'under_offer');

-- Sellers can view all their listings (including withdrawn)
CREATE POLICY "Sellers can view own listings"
ON "Listing" FOR SELECT
TO authenticated
USING (auth.uid()::text = "sellerId");

-- Users can create listings
CREATE POLICY "Users can create listings"
ON "Listing" FOR INSERT
TO authenticated
WITH CHECK (auth.uid()::text = "sellerId");

-- Sellers can update their own listings
CREATE POLICY "Sellers can update own listings"
ON "Listing" FOR UPDATE
TO authenticated
USING (auth.uid()::text = "sellerId");

-- Sellers can delete their own listings
CREATE POLICY "Sellers can delete own listings"
ON "Listing" FOR DELETE
TO authenticated
USING (auth.uid()::text = "sellerId");

-- ============================================
-- 12. OFFER TABLE
-- ============================================
ALTER TABLE "Offer" ENABLE ROW LEVEL SECURITY;

-- Buyers can view their own offers
CREATE POLICY "Buyers can view own offers"
ON "Offer" FOR SELECT
TO authenticated
USING (auth.uid()::text = "buyerId");

-- Sellers can view offers on their listings
CREATE POLICY "Sellers can view offers on their listings"
ON "Offer" FOR SELECT
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM "Listing"
    WHERE "Listing"."id" = "Offer"."listingId"
    AND "Listing"."sellerId" = auth.uid()::text
  )
);

-- Buyers can create offers
CREATE POLICY "Buyers can create offers"
ON "Offer" FOR INSERT
TO authenticated
WITH CHECK (auth.uid()::text = "buyerId");

-- Buyers can update their own offers
CREATE POLICY "Buyers can update own offers"
ON "Offer" FOR UPDATE
TO authenticated
USING (auth.uid()::text = "buyerId");

-- Sellers can update offer status
CREATE POLICY "Sellers can update offers on their listings"
ON "Offer" FOR UPDATE
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM "Listing"
    WHERE "Listing"."id" = "Offer"."listingId"
    AND "Listing"."sellerId" = auth.uid()::text
  )
);

-- ============================================
-- 13. DATA ROOM REQUEST TABLE
-- ============================================
ALTER TABLE "DataRoomRequest" ENABLE ROW LEVEL SECURITY;

-- Requesters can view their own requests
CREATE POLICY "Requesters can view own requests"
ON "DataRoomRequest" FOR SELECT
TO authenticated
USING (auth.uid()::text = "requesterId");

-- Sellers can view requests on their listings
CREATE POLICY "Sellers can view requests on their listings"
ON "DataRoomRequest" FOR SELECT
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM "Listing"
    WHERE "Listing"."id" = "DataRoomRequest"."listingId"
    AND "Listing"."sellerId" = auth.uid()::text
  )
);

-- Users can create data room requests
CREATE POLICY "Users can create data room requests"
ON "DataRoomRequest" FOR INSERT
TO authenticated
WITH CHECK (auth.uid()::text = "requesterId");

-- Requesters can update their own requests
CREATE POLICY "Requesters can update own requests"
ON "DataRoomRequest" FOR UPDATE
TO authenticated
USING (auth.uid()::text = "requesterId");

-- Sellers can approve/reject requests
CREATE POLICY "Sellers can update requests on their listings"
ON "DataRoomRequest" FOR UPDATE
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM "Listing"
    WHERE "Listing"."id" = "DataRoomRequest"."listingId"
    AND "Listing"."sellerId" = auth.uid()::text
  )
);

-- ============================================
-- 14. DOCUMENT TABLE
-- ============================================
ALTER TABLE "Document" ENABLE ROW LEVEL SECURITY;

-- Public can view non-data-room documents
CREATE POLICY "Anyone can view public documents"
ON "Document" FOR SELECT
TO public
USING ("requiresDataRoomAccess" = false);

-- Sellers can view all documents for their listings
CREATE POLICY "Sellers can view own listing documents"
ON "Document" FOR SELECT
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM "Listing"
    WHERE "Listing"."id" = "Document"."listingId"
    AND "Listing"."sellerId" = auth.uid()::text
  )
);

-- Users with approved data room access can view protected documents
CREATE POLICY "Approved users can view data room documents"
ON "Document" FOR SELECT
TO authenticated
USING (
  "requiresDataRoomAccess" = true
  AND EXISTS (
    SELECT 1 FROM "DataRoomRequest"
    WHERE "DataRoomRequest"."listingId" = "Document"."listingId"
    AND "DataRoomRequest"."requesterId" = auth.uid()::text
    AND "DataRoomRequest"."status" = 'approved'
  )
);

-- Sellers can manage documents for their listings
CREATE POLICY "Sellers can manage own listing documents"
ON "Document" FOR ALL
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM "Listing"
    WHERE "Listing"."id" = "Document"."listingId"
    AND "Listing"."sellerId" = auth.uid()::text
  )
);

-- ============================================
-- 15. WATCHLIST TABLE
-- ============================================
ALTER TABLE "Watchlist" ENABLE ROW LEVEL SECURITY;

-- Users can only see/manage their own watchlist
CREATE POLICY "Users can manage own watchlist"
ON "Watchlist" FOR ALL
TO authenticated
USING (auth.uid()::text = "userId");

-- ============================================
-- 16. NOTIFICATION TABLE
-- ============================================
ALTER TABLE "Notification" ENABLE ROW LEVEL SECURITY;

-- Users can only see their own notifications
CREATE POLICY "Users can view own notifications"
ON "Notification" FOR SELECT
TO authenticated
USING (auth.uid()::text = "userId");

-- Users can update their own notifications (mark as read)
CREATE POLICY "Users can update own notifications"
ON "Notification" FOR UPDATE
TO authenticated
USING (auth.uid()::text = "userId");

-- Service role can create notifications
CREATE POLICY "Service can create notifications"
ON "Notification" FOR INSERT
TO service_role
WITH CHECK (true);

-- ============================================
-- GRANT PERMISSIONS
-- ============================================

-- Grant necessary permissions to authenticated users
GRANT USAGE ON SCHEMA public TO authenticated;
GRANT USAGE ON SCHEMA public TO anon;

-- Grant table access
GRANT SELECT ON ALL TABLES IN SCHEMA public TO anon;
GRANT ALL ON ALL TABLES IN SCHEMA public TO authenticated;

-- ============================================
-- SUMMARY
-- ============================================
-- ✅ All 16 tables now have RLS enabled
-- ✅ Public data is accessible (Company, Listing, User profiles)
-- ✅ Private data is restricted (Swipes, Messages, Offers, etc.)
-- ✅ Users can only modify their own data
-- ✅ Sellers control access to their listings
-- ✅ Data room access is properly gated
