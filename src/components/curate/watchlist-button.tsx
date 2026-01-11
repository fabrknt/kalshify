"use client";

import { useState } from "react";
import { Bookmark } from "lucide-react";

interface WatchlistButtonProps {
    poolId: string;
    chain: string;
    project: string;
    symbol: string;
    isInWatchlist: boolean;
    onToggle: (poolId: string, isAdding: boolean) => void;
    disabled?: boolean;
}

export function WatchlistButton({
    poolId,
    chain,
    project,
    symbol,
    isInWatchlist,
    onToggle,
    disabled = false,
}: WatchlistButtonProps) {
    const [isLoading, setIsLoading] = useState(false);
    const [optimisticState, setOptimisticState] = useState(isInWatchlist);

    const handleClick = async (e: React.MouseEvent) => {
        e.stopPropagation(); // Prevent row expansion

        if (isLoading || disabled) return;

        const isAdding = !optimisticState;

        // Optimistic update
        setOptimisticState(isAdding);
        setIsLoading(true);

        try {
            if (isAdding) {
                const response = await fetch("/api/watchlist/yields", {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({ poolId, chain, project, symbol }),
                });

                if (!response.ok) {
                    throw new Error("Failed to add to watchlist");
                }
            } else {
                const response = await fetch(`/api/watchlist/yields/${encodeURIComponent(poolId)}`, {
                    method: "DELETE",
                });

                if (!response.ok) {
                    throw new Error("Failed to remove from watchlist");
                }
            }

            onToggle(poolId, isAdding);
        } catch (error) {
            // Revert optimistic update on error
            setOptimisticState(!isAdding);
            console.error("Watchlist toggle error:", error);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <button
            onClick={handleClick}
            disabled={isLoading || disabled}
            className={`p-1.5 rounded-md transition-colors ${
                optimisticState
                    ? "text-yellow-400 hover:text-yellow-300 hover:bg-yellow-400/10"
                    : "text-slate-500 hover:text-slate-300 hover:bg-slate-700/50"
            } ${isLoading ? "opacity-50 cursor-wait" : ""} ${disabled ? "opacity-30 cursor-not-allowed" : ""}`}
            title={optimisticState ? "Remove from watchlist" : "Add to watchlist"}
        >
            <Bookmark
                className={`w-4 h-4 ${optimisticState ? "fill-current" : ""}`}
            />
        </button>
    );
}
