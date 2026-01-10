"use client";

export function GraphLegend() {
    return (
        <div className="absolute top-4 left-4 z-10 bg-slate-900/90 backdrop-blur-sm rounded-lg border border-slate-700 p-3">
            <div className="text-xs font-medium text-slate-400 mb-2">Legend</div>

            {/* Node types */}
            <div className="space-y-1.5 mb-3">
                <div className="text-xs text-slate-500 font-medium">Categories</div>
                <div className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded-full bg-purple-500" />
                    <span className="text-xs text-slate-300">DeFi</span>
                </div>
                <div className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded-full bg-blue-500" />
                    <span className="text-xs text-slate-300">Infrastructure</span>
                </div>
                <div className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded-full bg-pink-500" />
                    <span className="text-xs text-slate-300">NFT</span>
                </div>
                <div className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded-full bg-green-500" />
                    <span className="text-xs text-slate-300">DAO</span>
                </div>
                <div className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded-full bg-orange-500" />
                    <span className="text-xs text-slate-300">Gaming</span>
                </div>
            </div>

            {/* Edge types */}
            <div className="space-y-1.5 pt-2 border-t border-slate-700">
                <div className="text-xs text-slate-500 font-medium">Connections</div>
                <div className="flex items-center gap-2">
                    <div className="w-6 h-0.5 bg-cyan-400" />
                    <span className="text-xs text-slate-300">Uses SDK</span>
                </div>
                <div className="flex items-center gap-2">
                    <div className="w-6 h-0.5 bg-slate-600" />
                    <span className="text-xs text-slate-300">Shared Deps</span>
                </div>
            </div>
        </div>
    );
}
