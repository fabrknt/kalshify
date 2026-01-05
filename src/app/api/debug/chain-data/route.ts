import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";

export async function GET() {
  try {
    // Get first 5 active companies to inspect their data
    const companies = await prisma.company.findMany({
      where: {
        isActive: true,
      },
      select: {
        slug: true,
        name: true,
        indexData: true,
      },
      take: 5,
    });

    const debugInfo = companies.map((company) => {
      const indexData = company.indexData as any;
      return {
        slug: company.slug,
        name: company.name,
        hasIndexData: !!indexData,
        indexDataType: typeof indexData,
        hasOnchain: !!(indexData?.onchain),
        onchainType: typeof indexData?.onchain,
        hasChain: !!(indexData?.onchain?.chain),
        chainValue: indexData?.onchain?.chain,
        chainType: typeof indexData?.onchain?.chain,
        fullIndexData: indexData, // Full data for inspection
      };
    });

    return NextResponse.json({
      message: "Chain data debug info",
      totalCompanies: companies.length,
      debugInfo,
    });
  } catch (error) {
    return NextResponse.json(
      { error: "Failed to fetch debug data", details: String(error) },
      { status: 500 }
    );
  }
}
