/**
 * GET /api/curate/dependencies
 * Returns shared dependencies across projects
 */

import { NextRequest, NextResponse } from "next/server";
import { getSharedDependencies } from "@/lib/curate/queries";

export const dynamic = "force-dynamic";

export async function GET(request: NextRequest) {
    try {
        const { searchParams } = new URL(request.url);

        const search = searchParams.get("q") || undefined;
        const category = searchParams.get("category") as any || undefined;
        const minProjects = parseInt(searchParams.get("minProjects") || "2");
        const limit = parseInt(searchParams.get("limit") || "100");

        const dependencies = await getSharedDependencies({
            search,
            category,
            minProjects,
            limit,
        });

        return NextResponse.json({
            dependencies,
            count: dependencies.length,
        });
    } catch (error) {
        console.error("GET /api/curate/dependencies error:", error);
        return NextResponse.json(
            { error: "Failed to fetch dependencies" },
            { status: 500 }
        );
    }
}
