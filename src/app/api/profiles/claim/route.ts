import { NextRequest, NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";
import {
  getCompanyVerificationData,
  isProfileClaimed,
  verifyGitHubOwnership,
  verifyDomainOwnership,
  verifyWalletOwnership,
  claimProfile,
  VerificationType,
} from "@/lib/profile-verification";

export async function POST(request: NextRequest) {
  try {
    // Check authentication
    const user = await getCurrentUser();

    if (!user || !user.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const { companySlug, verificationType, verificationData } = body;

    if (!companySlug || !verificationType) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }

    // Check if company exists
    const companyData = await getCompanyVerificationData(companySlug);

    if (!companyData) {
      return NextResponse.json(
        { error: "Company not found" },
        { status: 404 }
      );
    }

    // Check if already claimed
    const alreadyClaimed = await isProfileClaimed(companySlug);

    if (alreadyClaimed) {
      return NextResponse.json(
        { error: "Profile already claimed by another user" },
        { status: 409 }
      );
    }

    // Verify ownership based on type
    let verificationResult;

    switch (verificationType as VerificationType) {
      case "github":
        if (!companyData.githubOrg) {
          return NextResponse.json(
            { error: "Company has no GitHub organization configured" },
            { status: 400 }
          );
        }

        if (!verificationData?.githubUsername) {
          return NextResponse.json(
            { error: "GitHub username required" },
            { status: 400 }
          );
        }

        verificationResult = await verifyGitHubOwnership(
          companyData.githubOrg,
          verificationData.githubUsername
        );
        break;

      case "domain":
        if (!companyData.domain) {
          return NextResponse.json(
            { error: "Company has no domain configured" },
            { status: 400 }
          );
        }

        verificationResult = await verifyDomainOwnership(
          companyData.domain,
          user.id
        );
        break;

      case "wallet":
        if (!verificationData?.walletAddress || !verificationData?.signature) {
          return NextResponse.json(
            { error: "Wallet address and signature required" },
            { status: 400 }
          );
        }

        const message = `I am claiming ${companySlug} on Fabrknt`;
        verificationResult = await verifyWalletOwnership(
          verificationData.walletAddress,
          verificationData.signature,
          message
        );
        break;

      default:
        return NextResponse.json(
          { error: "Invalid verification type" },
          { status: 400 }
        );
    }

    // Check verification result
    if (!verificationResult.verified) {
      return NextResponse.json(
        { error: verificationResult.error || "Verification failed" },
        { status: 400 }
      );
    }

    // Claim the profile
    const claimedProfile = await claimProfile(
      user.id,
      companySlug,
      verificationType as VerificationType,
      verificationResult.proof || ""
    );

    return NextResponse.json({
      success: true,
      claimedProfile: {
        id: claimedProfile.id,
        companySlug: claimedProfile.companySlug,
        verificationType: claimedProfile.verificationType,
        verifiedAt: claimedProfile.verifiedAt,
      },
    });
  } catch (error) {
    console.error("Profile claim error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

// Get claimed profile status
export async function GET(request: NextRequest) {
  try {
    const user = await getCurrentUser();
    const { searchParams } = new URL(request.url);
    const companySlug = searchParams.get("companySlug");

    if (!companySlug) {
      return NextResponse.json(
        { error: "Company slug required" },
        { status: 400 }
      );
    }

    const claimed = await isProfileClaimed(companySlug);

    return NextResponse.json({
      claimed,
      canClaim: !claimed && !!user,
    });
  } catch (error) {
    console.error("Profile status check error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
