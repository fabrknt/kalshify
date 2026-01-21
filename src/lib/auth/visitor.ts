import { cookies } from 'next/headers';
import { auth } from '@/lib/auth/config';
import { prisma } from '@/lib/db';

// Generate display name from visitor ID
function generateDisplayName(visitorId: string): string {
  const adjectives = ['Swift', 'Bold', 'Wise', 'Lucky', 'Sharp', 'Keen', 'Quick', 'Smart'];
  const nouns = ['Trader', 'Prophet', 'Oracle', 'Analyst', 'Predictor', 'Sage', 'Maven', 'Guru'];

  const hash = visitorId.split('').reduce((a, b) => a + b.charCodeAt(0), 0);
  const adj = adjectives[hash % adjectives.length];
  const noun = nouns[(hash * 7) % nouns.length];
  const num = (hash % 999) + 1;

  return `${adj}${noun}${num}`;
}

// Generate a unique visitor ID
function generateVisitorId(): string {
  return `visitor_${Date.now()}_${Math.random().toString(36).substring(2, 11)}`;
}

/**
 * Resolve the current user ID from session or visitor cookie.
 * Auto-creates an anonymous User record and sets visitor_id cookie if needed.
 * Always returns a user ID (creates anonymous user if necessary).
 */
export async function resolveUserId(): Promise<string> {
  // Check authenticated session first
  const session = await auth();
  if (session?.user?.id) {
    return session.user.id;
  }

  // Fall back to visitor_id cookie
  const cookieStore = await cookies();
  let visitorId = cookieStore.get('visitor_id')?.value;

  // Generate new visitor ID if none exists
  if (!visitorId) {
    visitorId = generateVisitorId();
    // Set the cookie for future requests (1 year expiry)
    cookieStore.set('visitor_id', visitorId, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 60 * 60 * 24 * 365, // 1 year
      path: '/',
    });
  }

  // Check if a User record exists for this visitor
  let user = await prisma.user.findUnique({
    where: { visitorId },
  });

  // Auto-create anonymous User if not exists
  if (!user) {
    user = await prisma.user.create({
      data: {
        visitorId,
        displayName: generateDisplayName(visitorId),
      },
    });
  }

  return user.id;
}

/**
 * Get visitor ID from cookie (without creating a user record).
 * Useful for read-only operations that don't require persistence.
 */
export async function getVisitorId(): Promise<string | null> {
  const session = await auth();
  if (session?.user?.id) {
    // For authenticated users, get their visitorId from the database
    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: { visitorId: true },
    });
    return user?.visitorId || session.user.id;
  }

  const cookieStore = await cookies();
  return cookieStore.get('visitor_id')?.value || null;
}

/**
 * Get user with their trader stats, creating records if needed.
 */
export async function getUserWithStats(userId: string) {
  return prisma.user.findUnique({
    where: { id: userId },
    include: { traderStats: true },
  });
}
