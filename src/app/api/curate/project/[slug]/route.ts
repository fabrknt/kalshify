/**
 * GET /api/curate/project/[slug]
 * Returns dependency details for a specific project
 */

import { NextRequest, NextResponse } from "next/server";
import { getProjectDependencies } from "@/lib/curate/queries";

export const dynamic = "force-dynamic";

export async function GET(
    request: NextRequest,
    { params }: { params: Promise<{ slug: string }> }
) {
    try {
        const { slug } = await params;

        const projectData = await getProjectDependencies(slug);

        if (!projectData) {
            return NextResponse.json(
                { error: "Project not found" },
                { status: 404 }
            );
        }

        return NextResponse.json(projectData);
    } catch (error) {
        console.error("GET /api/curate/project/[slug] error:", error);
        return NextResponse.json(
            { error: "Failed to fetch project dependencies" },
            { status: 500 }
        );
    }
}
