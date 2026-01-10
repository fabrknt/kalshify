"use client";

import { useEffect, useRef, useState, useCallback, forwardRef } from "react";
import dynamic from "next/dynamic";
import { GraphLegend } from "./graph-legend";
import { GraphControls } from "./graph-controls";
import { GraphTooltip } from "./graph-tooltip";

// Dynamically import ForceGraph2D to avoid SSR issues
const ForceGraph2D = dynamic(
    () => import("react-force-graph-2d").then((mod) => mod.default),
    {
        ssr: false,
        loading: () => (
            <div className="flex items-center justify-center h-full bg-slate-950">
                <div className="text-cyan-400 animate-pulse">Loading graph...</div>
            </div>
        ),
    }
) as any;

export interface GraphNode {
    id: string;
    name: string;
    type: "project" | "sdk" | "cluster";
    category?: string;
    chain?: string;
    score?: number;
    logo?: string;
    x?: number;
    y?: number;
}

export interface GraphLink {
    source: string | GraphNode;
    target: string | GraphNode;
    type: "uses_sdk" | "shared_dependency" | "direct_import";
    weight: number;
}

interface DependencyGraphProps {
    data: { nodes: GraphNode[]; links: GraphLink[] };
    onNodeClick?: (node: GraphNode) => void;
    height?: number;
}

// Category colors matching the existing design system
const CATEGORY_COLORS: Record<string, string> = {
    defi: "#A855F7", // purple-500
    infrastructure: "#3B82F6", // blue-500
    nft: "#EC4899", // pink-500
    dao: "#22C55E", // green-500
    gaming: "#F97316", // orange-500
};

// Chain colors
const CHAIN_COLORS: Record<string, string> = {
    ethereum: "#627EEA",
    solana: "#9945FF",
    base: "#0052FF",
    arbitrum: "#28A0F0",
    optimism: "#FF0420",
    polygon: "#8247E5",
};

export function DependencyGraph({ data, onNodeClick, height = 600 }: DependencyGraphProps) {
    const graphRef = useRef<any>(null);
    const containerRef = useRef<HTMLDivElement>(null);
    const [hoveredNode, setHoveredNode] = useState<GraphNode | null>(null);
    const [dimensions, setDimensions] = useState({ width: 800, height });
    const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
    const [selectedChain, setSelectedChain] = useState<string | null>(null);

    // Update dimensions on resize
    useEffect(() => {
        const updateDimensions = () => {
            if (containerRef.current) {
                setDimensions({
                    width: containerRef.current.offsetWidth,
                    height: height,
                });
            }
        };

        updateDimensions();
        window.addEventListener("resize", updateDimensions);
        return () => window.removeEventListener("resize", updateDimensions);
    }, [height]);

    // Node color based on category
    const getNodeColor = useCallback((node: GraphNode) => {
        if (node.type === "sdk") return "#06B6D4"; // cyan-400

        // Dim nodes that don't match filter
        if (selectedCategory && node.category !== selectedCategory) {
            return "#334155"; // slate-700 (dimmed)
        }
        if (selectedChain && node.chain !== selectedChain) {
            return "#334155";
        }

        return CATEGORY_COLORS[node.category || ""] || "#64748B"; // slate-500 default
    }, [selectedCategory, selectedChain]);

    // Node size based on score
    const getNodeSize = useCallback((node: GraphNode) => {
        if (node.type === "sdk") return 4;
        const baseSize = 6;
        const scoreBonus = Math.min((node.score || 0) / 15, 8);
        return baseSize + scoreBonus;
    }, []);

    // Link color based on type
    const getLinkColor = useCallback((link: GraphLink) => {
        const sourceNode = typeof link.source === "object" ? link.source : null;
        const targetNode = typeof link.target === "object" ? link.target : null;

        // Dim links if nodes are filtered out
        if (selectedCategory || selectedChain) {
            const sourceMatch = !selectedCategory || sourceNode?.category === selectedCategory;
            const targetMatch = !selectedCategory || targetNode?.category === selectedCategory;
            const sourceChainMatch = !selectedChain || sourceNode?.chain === selectedChain;
            const targetChainMatch = !selectedChain || targetNode?.chain === selectedChain;

            if (!sourceMatch || !targetMatch || !sourceChainMatch || !targetChainMatch) {
                return "rgba(71, 85, 105, 0.2)"; // Very dim
            }
        }

        switch (link.type) {
            case "uses_sdk":
                return "#06B6D4"; // cyan-400
            case "shared_dependency":
                return "#475569"; // slate-600
            default:
                return "#334155"; // slate-700
        }
    }, [selectedCategory, selectedChain]);

    // Link width based on weight
    const getLinkWidth = useCallback((link: GraphLink) => {
        return Math.sqrt(link.weight) * 0.5;
    }, []);

    // Handle node click
    const handleNodeClick = useCallback((node: GraphNode) => {
        if (onNodeClick) {
            onNodeClick(node);
        }
    }, [onNodeClick]);

    // Zoom controls
    const handleZoomIn = useCallback(() => {
        if (graphRef.current) {
            const currentZoom = graphRef.current.zoom();
            graphRef.current.zoom(currentZoom * 1.5, 400);
        }
    }, []);

    const handleZoomOut = useCallback(() => {
        if (graphRef.current) {
            const currentZoom = graphRef.current.zoom();
            graphRef.current.zoom(currentZoom / 1.5, 400);
        }
    }, []);

    const handleResetView = useCallback(() => {
        if (graphRef.current) {
            graphRef.current.zoomToFit(400, 50);
        }
    }, []);

    // Custom node canvas rendering for better visuals
    const nodeCanvasObject = useCallback((node: GraphNode, ctx: CanvasRenderingContext2D, globalScale: number) => {
        const size = getNodeSize(node);
        const color = getNodeColor(node);
        const fontSize = 12 / globalScale;
        const isHovered = hoveredNode?.id === node.id;

        // Draw node circle
        ctx.beginPath();
        ctx.arc(node.x || 0, node.y || 0, size, 0, 2 * Math.PI);
        ctx.fillStyle = color;
        ctx.fill();

        // Draw border for hovered node
        if (isHovered) {
            ctx.strokeStyle = "#06B6D4";
            ctx.lineWidth = 2 / globalScale;
            ctx.stroke();
        }

        // Draw label if zoomed in enough or hovered
        if (globalScale > 0.8 || isHovered) {
            ctx.font = `${fontSize}px Inter, sans-serif`;
            ctx.textAlign = "center";
            ctx.textBaseline = "top";
            ctx.fillStyle = isHovered ? "#F8FAFC" : "#94A3B8";
            ctx.fillText(node.name, node.x || 0, (node.y || 0) + size + 2);
        }
    }, [getNodeColor, getNodeSize, hoveredNode]);

    return (
        <div
            ref={containerRef}
            className="relative w-full bg-slate-950 rounded-lg border border-border overflow-hidden"
            style={{ height }}
        >
            {/* Legend */}
            <GraphLegend />

            {/* Controls */}
            <GraphControls
                onZoomIn={handleZoomIn}
                onZoomOut={handleZoomOut}
                onResetView={handleResetView}
                selectedCategory={selectedCategory}
                selectedChain={selectedChain}
                onCategoryChange={setSelectedCategory}
                onChainChange={setSelectedChain}
            />

            {/* Graph */}
            <ForceGraph2D
                ref={graphRef}
                graphData={data}
                width={dimensions.width}
                height={dimensions.height}
                backgroundColor="#020617"
                nodeColor={getNodeColor}
                nodeVal={getNodeSize}
                nodeCanvasObject={nodeCanvasObject}
                nodeCanvasObjectMode={() => "replace"}
                linkColor={getLinkColor}
                linkWidth={getLinkWidth}
                linkDirectionalArrowLength={3}
                linkDirectionalArrowRelPos={1}
                onNodeClick={handleNodeClick}
                onNodeHover={setHoveredNode}
                cooldownTicks={100}
                d3AlphaDecay={0.02}
                d3VelocityDecay={0.3}
                enableNodeDrag={true}
                enableZoomInteraction={true}
                enablePanInteraction={true}
            />

            {/* Tooltip */}
            {hoveredNode && <GraphTooltip node={hoveredNode} />}
        </div>
    );
}
