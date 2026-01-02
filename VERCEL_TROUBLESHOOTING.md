# Vercel Deployment Troubleshooting Guide

Common errors and solutions for deploying Fabrknt Suite to Vercel.

## 🔴 Common Errors

### 1. Prisma Client Not Generated

**Error:**

```
Module '"@prisma/client"' has no exported member 'PrismaClient'
```

**Solution:**
✅ Already fixed! The `postinstall` script in `package.json` runs `prisma generate`

**Verify:**

-   Check `package.json` has: `"postinstall": "prisma generate"`
-   Ensure `prisma/schema.prisma` exists in repository root
-   Check build logs show "Generated Prisma Client"

---

### 2. Missing Environment Variables

**Error:**

```
Error: Environment variable DATABASE_URL is not set
```

**Solution:**

1. Go to Vercel Dashboard → Project → Settings → Environment Variables
2. Add all required variables (see `VERCEL_ENV_VARS.md`)
3. **Important**: Set for Production, Preview, AND Development
4. Redeploy after adding variables

**Required Variables:**

-   `DATABASE_URL`
-   `NEXT_PUBLIC_SUPABASE_URL`
-   `NEXT_PUBLIC_SUPABASE_ANON_KEY`
-   `SUPABASE_SERVICE_ROLE_KEY`
-   `NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID`

---

### 3. Build Command Fails

**Error:**

```
Command "pnpm build" exited with 1
```

**Common Causes:**

#### A. TypeScript Errors

**Solution:** Fix TypeScript errors locally first:

```bash
pnpm type-check
```

#### B. Missing Dependencies

**Solution:** Ensure all dependencies are in `package.json`, not just `devDependencies`

#### C. Import Errors (like Handshake icon)

**Solution:** ✅ Already fixed! Replaced `Handshake` with `UserPlus` in `type-selection-step.tsx`

**Make sure to commit and push the fix:**

```bash
git add .
git commit -m "Fix Handshake icon import"
git push
```

---

### 4. Database Connection Errors

**Error:**

```
Can't reach database server
```

**Solution:**

1. Verify `DATABASE_URL` is correct in Vercel environment variables
2. Check Supabase connection pooling settings
3. Ensure Supabase allows connections from Vercel IPs:
    - Go to Supabase Dashboard → Settings → Database
    - Check "Connection Pooling" settings
    - Or disable IP restrictions for Vercel

---

### 5. pnpm Not Found

**Error:**

```
pnpm: command not found
```

**Solution:**
✅ Already configured! `vercel.json` has:

```json
"installCommand": "corepack enable && corepack prepare pnpm@latest --activate && pnpm install"
```

If still failing, add to `package.json`:

```json
{
    "packageManager": "pnpm@8.15.0"
}
```

---

### 6. Module Not Found Errors

**Error:**

```
Module not found: Can't resolve '...'
```

**Solution:**

1. Check if package is in `dependencies` (not `devDependencies`)
2. Run `pnpm install` locally to verify
3. Check for case-sensitive imports
4. Ensure all files are committed to git

---

### 7. Build Timeout

**Error:**

```
Build exceeded maximum build time
```

**Solution:**

-   Vercel free tier: 45 minutes max
-   Check build logs for slow steps
-   Optimize Prisma queries
-   Consider upgrading Vercel plan if needed

---

### 8. Function Timeout

**Error:**

```
Function exceeded maximum duration
```

**Solution:**
✅ Already configured! `vercel.json` sets:

```json
"functions": {
  "src/app/api/**/*.ts": {
    "maxDuration": 30
  }
}
```

For longer operations, increase timeout or optimize code.

---

## 🔍 Debugging Steps

### Step 1: Check Build Logs

1. Go to Vercel Dashboard → Your Project → Deployments
2. Click on failed deployment
3. Check "Build Logs" tab
4. Look for error messages (usually near the end)

### Step 2: Test Locally

Before deploying, test locally:

```bash
# Install dependencies
pnpm install

# Generate Prisma client
pnpm prisma generate

# Type check
pnpm type-check

# Build
pnpm build
```

If local build fails, fix errors before deploying.

### Step 3: Verify Configuration

Check these files exist and are correct:

-   ✅ `vercel.json` - Build configuration
-   ✅ `package.json` - Has `postinstall` script
-   ✅ `prisma/schema.prisma` - Prisma schema exists
-   ✅ `.gitignore` - Doesn't exclude necessary files

### Step 4: Check Environment Variables

1. Go to Vercel Dashboard → Settings → Environment Variables
2. Verify all required variables are set
3. Check they're set for correct environment (Production/Preview)
4. Verify values are correct (no typos)

---

## 🚀 Quick Fixes

### Fix 1: Regenerate Prisma Client

If Prisma errors persist:

```bash
# Locally
pnpm prisma generate

# Commit and push
git add .
git commit -m "Regenerate Prisma client"
git push
```

### Fix 2: Clear Build Cache

In Vercel Dashboard:

1. Go to Project Settings → General
2. Scroll to "Clear Build Cache"
3. Click "Clear Build Cache"
4. Redeploy

### Fix 3: Force Rebuild

```bash
# Via CLI
vercel --force

# Or push empty commit
git commit --allow-empty -m "Force rebuild"
git push
```

---

## 📋 Pre-Deployment Checklist

Before deploying, ensure:

-   [ ] All TypeScript errors fixed (`pnpm type-check`)
-   [ ] Local build succeeds (`pnpm build`)
-   [ ] All environment variables set in Vercel
-   [ ] `postinstall` script in `package.json`
-   [ ] `vercel.json` exists and is correct
-   [ ] All fixes committed and pushed to git
-   [ ] Prisma schema is in repository root
-   [ ] No import errors (like Handshake icon)

---

## 🆘 Still Stuck?

1. **Share the exact error message** from Vercel build logs
2. **Check build logs** - Look for the first error (usually the root cause)
3. **Compare with local build** - If local works but Vercel doesn't, it's usually:
    - Missing environment variables
    - Different Node.js version
    - Build cache issues

---

## 📞 Get Help

-   **Vercel Docs**: https://vercel.com/docs
-   **Next.js Docs**: https://nextjs.org/docs
-   **Prisma Docs**: https://www.prisma.io/docs
-   **Vercel Support**: https://vercel.com/support

---

**Last Updated**: After fixing Handshake icon and Prisma client issues
