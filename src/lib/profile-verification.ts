/**
 * Profile Verification Utilities
 * Handles verification of company profile ownership via domain, GitHub, or wallet
 */

import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export type VerificationType = "domain" | "github" | "wallet";

export interface VerificationResult {
  verified: boolean;
  error?: string;
  proof?: string;
}

/**
 * Verify domain ownership via DNS TXT record
 * User adds TXT record: fabrknt-verify=<userId>
 */
export async function verifyDomainOwnership(
  domain: string,
  userId: string
): Promise<VerificationResult> {
  try {
    // In production, you would use dns.resolveTxt() to check TXT records
    // For now, this is a placeholder that you can implement with node:dns

    // Example implementation:
    // const records = await dns.promises.resolveTxt(domain);
    // const fabrkntRecord = records.flat().find(r => r.startsWith('fabrknt-verify='));
    // const recordUserId = fabrkntRecord?.split('=')[1];

    // if (recordUserId === userId) {
    //   return { verified: true, proof: `TXT record verified at ${domain}` };
    // }

    return {
      verified: false,
      error: "Domain verification not yet implemented. Use GitHub or wallet verification.",
    };
  } catch (error) {
    return {
      verified: false,
      error: `Failed to verify domain: ${error}`,
    };
  }
}

/**
 * Verify GitHub organization ownership
 * User must be a member/owner of the GitHub organization
 */
export async function verifyGitHubOwnership(
  githubOrg: string,
  githubUsername: string
): Promise<VerificationResult> {
  try {
    const GITHUB_TOKEN = process.env.GITHUB_TOKEN;

    if (!GITHUB_TOKEN) {
      return {
        verified: false,
        error: "GitHub token not configured",
      };
    }

    // Check if user is a member of the organization
    const response = await fetch(
      `https://api.github.com/orgs/${githubOrg}/members/${githubUsername}`,
      {
        headers: {
          Authorization: `Bearer ${GITHUB_TOKEN}`,
          Accept: "application/vnd.github.v3+json",
        },
      }
    );

    if (response.status === 204) {
      // User is a member
      return {
        verified: true,
        proof: `GitHub user ${githubUsername} is a member of ${githubOrg}`,
      };
    } else if (response.status === 404) {
      return {
        verified: false,
        error: `User ${githubUsername} is not a member of ${githubOrg}`,
      };
    } else {
      return {
        verified: false,
        error: `GitHub API error: ${response.statusText}`,
      };
    }
  } catch (error) {
    return {
      verified: false,
      error: `Failed to verify GitHub ownership: ${error}`,
    };
  }
}

/**
 * Verify wallet ownership via signature
 * User signs a message with their wallet to prove ownership
 */
export async function verifyWalletOwnership(
  walletAddress: string,
  signature: string,
  message: string
): Promise<VerificationResult> {
  try {
    // In production, you would verify the signature using viem or ethers
    // Example with viem:
    // import { verifyMessage } from 'viem';
    // const valid = await verifyMessage({
    //   address: walletAddress,
    //   message,
    //   signature,
    // });

    return {
      verified: false,
      error: "Wallet verification not yet implemented. Use GitHub verification.",
    };
  } catch (error) {
    return {
      verified: false,
      error: `Failed to verify wallet signature: ${error}`,
    };
  }
}

/**
 * Get company data from config to verify against
 */
export async function getCompanyVerificationData(companySlug: string) {
  try {
    // Read company data from JSON file
    const fs = await import("fs");
    const path = await import("path");

    const dataPath = path.join(process.cwd(), "data", "companies", `${companySlug}.json`);

    if (!fs.existsSync(dataPath)) {
      return null;
    }

    const data = JSON.parse(fs.readFileSync(dataPath, "utf-8"));

    return {
      slug: companySlug,
      name: data.name,
      website: data.website,
      githubOrg: data.github?.org,
      // Extract domain from website
      domain: data.website ? new URL(data.website).hostname : null,
    };
  } catch (error) {
    console.error("Error loading company data:", error);
    return null;
  }
}

/**
 * Check if a profile is already claimed
 */
export async function isProfileClaimed(companySlug: string): Promise<boolean> {
  const claimed = await prisma.claimedProfile.findUnique({
    where: { companySlug },
  });

  return !!claimed;
}

/**
 * Claim a profile
 */
export async function claimProfile(
  userId: string,
  companySlug: string,
  verificationType: VerificationType,
  verificationProof: string
) {
  return await prisma.claimedProfile.create({
    data: {
      userId,
      companySlug,
      verificationType,
      verificationProof,
      verified: true,
      verifiedAt: new Date(),
    },
  });
}
