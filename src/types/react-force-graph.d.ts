declare module "react-force-graph-2d" {
    import { ComponentType, MutableRefObject } from "react";

    interface GraphNode {
        id: string;
        name?: string;
        x?: number;
        y?: number;
        [key: string]: any;
    }

    interface GraphLink {
        source: string | GraphNode;
        target: string | GraphNode;
        [key: string]: any;
    }

    interface GraphData {
        nodes: GraphNode[];
        links: GraphLink[];
    }

    interface ForceGraph2DProps {
        graphData: GraphData;
        width?: number;
        height?: number;
        backgroundColor?: string;
        nodeColor?: string | ((node: GraphNode) => string);
        nodeVal?: number | ((node: GraphNode) => number);
        nodeLabel?: string | ((node: GraphNode) => string);
        nodeCanvasObject?: (node: GraphNode, ctx: CanvasRenderingContext2D, globalScale: number) => void;
        nodeCanvasObjectMode?: string | ((node: GraphNode) => string);
        linkColor?: string | ((link: GraphLink) => string);
        linkWidth?: number | ((link: GraphLink) => number);
        linkDirectionalArrowLength?: number;
        linkDirectionalArrowRelPos?: number;
        onNodeClick?: (node: GraphNode, event: MouseEvent) => void;
        onNodeHover?: (node: GraphNode | null, previousNode: GraphNode | null) => void;
        cooldownTicks?: number;
        d3AlphaDecay?: number;
        d3VelocityDecay?: number;
        enableNodeDrag?: boolean;
        enableZoomInteraction?: boolean;
        enablePanInteraction?: boolean;
    }

    interface ForceGraph2DInstance {
        zoom: (zoom?: number, duration?: number) => number;
        zoomToFit: (duration?: number, padding?: number) => void;
        centerAt: (x?: number, y?: number, duration?: number) => void;
    }

    const ForceGraph2D: ComponentType<ForceGraph2DProps & { ref?: MutableRefObject<ForceGraph2DInstance | null> }>;
    export default ForceGraph2D;
}
