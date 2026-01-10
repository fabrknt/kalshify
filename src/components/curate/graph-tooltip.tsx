"use client";

import { GraphNode } from "./dependency-graph";

interface GraphTooltipProps {
    node: GraphNode;
}

const CATEGORY_LABELS: Record<string, string> = {
    defi: "DeFi",
    infrastructure: "Infrastructure",
    nft: "NFT",
    dao: "DAO",
    gaming: "Gaming",
};

const CHAIN_LABELS: Record<string, string> = {
    ethereum: "Ethereum",
    solana: "Solana",
    base: "Base",
    arbitrum: "Arbitrum",
    optimism: "Optimism",
    polygon: "Polygon",
};

export function GraphTooltip({ node }: GraphTooltipProps) {
    return (
        <div className="absolute bottom-4 left-4 z-20 bg-slate-900/95 backdrop-blur-sm rounded-lg border border-slate-700 p-3 min-w-[200px] shadow-xl">
            <div className="flex items-center gap-2 mb-2">
                {node.logo && (
                    <span className="text-xl">{node.logo}</span>
                )}
                <div>
                    <div className="font-medium text-white">{node.name}</div>
                    <div className="text-xs text-slate-400">{node.id}</div>
                </div>
            </div>

            <div className="grid grid-cols-2 gap-2 text-xs">
                {node.category && (
                    <div>
                        <div className="text-slate-500">Category</div>
                        <div className="text-slate-300">{CATEGORY_LABELS[node.category] || node.category}</div>
                    </div>
                )}
                {node.chain && (
                    <div>
                        <div className="text-slate-500">Chain</div>
                        <div className="text-slate-300">{CHAIN_LABELS[node.chain] || node.chain}</div>
                    </div>
                )}
                {node.score !== undefined && (
                    <div>
                        <div className="text-slate-500">Score</div>
                        <div className="text-cyan-400 font-medium">{node.score}</div>
                    </div>
                )}
            </div>

            <div className="mt-2 pt-2 border-t border-slate-700 text-[10px] text-slate-500">
                Click to view details
            </div>
        </div>
    );
}
