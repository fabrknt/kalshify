import { NextRequest, NextResponse } from "next/server";
import { searchCompanies } from "@/lib/cindex/company-queries";

// Mark route as dynamic
export const dynamic = "force-dynamic";

/**
 * GET /api/cindex/search?q=query
 * Search companies in Index database
 */
export async function GET(request: NextRequest) {
    try {
        // Use request.nextUrl instead of new URL(request.url) to avoid dynamic server usage error
        const { searchParams } = request.nextUrl;
        const query = searchParams.get("q") || "";
        const category = searchParams.get("category") || undefined;
        const limit = parseInt(searchParams.get("limit") || "100");

        // Use shared search function
        const companies = await searchCompanies(
            query || undefined,
            category,
            limit
        );

        return NextResponse.json(companies);
    } catch (error) {
        console.error("GET /api/cindex/search error:", error);
        return NextResponse.json(
            { error: "Failed to search companies" },
            { status: 500 }
        );
    }
}
