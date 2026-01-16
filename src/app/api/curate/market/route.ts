import { NextResponse } from "next/server";
import { getWeeklyMarketContext } from "@/lib/curate/market-context";

export async function GET() {
    try {
        const context = getWeeklyMarketContext();

        return NextResponse.json({
            success: true,
            data: context,
        });
    } catch (error) {
        console.error("Error fetching market context:", error);
        return NextResponse.json(
            { success: false, error: "Failed to fetch market context" },
            { status: 500 }
        );
    }
}
