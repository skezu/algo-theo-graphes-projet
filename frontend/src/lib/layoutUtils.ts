/**
 * layoutUtils.ts
 * Utilities for automatic graph layout using Dagre (Sugiyama algorithm).
 * Dagre minimizes edge crossings and produces clean hierarchical layouts.
 */
import { type Node, type Edge, Position } from '@xyflow/react';
import dagre from '@dagrejs/dagre';

// Create a new dagre graph instance
const dagreGraph = new dagre.graphlib.Graph().setDefaultEdgeLabel(() => ({}));

// Node dimensions for layout calculation
const DEFAULT_NODE_WIDTH = 140;
const DEFAULT_NODE_HEIGHT = 50;
const PERT_NODE_SIZE = 100; // 90px + buffer

/**
 * Apply automatic layout using Dagre's Sugiyama algorithm.
 * This algorithm minimizes edge crossings and produces clean hierarchical layouts.
 *
 * @param nodes - React Flow nodes
 * @param edges - React Flow edges
 * @param direction - Layout direction: 'TB' (top-bottom) or 'LR' (left-right)
 * @returns Layouted nodes and edges
 */
export const applyAutoLayout = (
    nodes: Node[],
    edges: Edge[],
    direction: 'TB' | 'LR' = 'TB'
): { nodes: Node[]; edges: Edge[] } => {
    if (nodes.length === 0) {
        return { nodes, edges };
    }

    const isHorizontal = direction === 'LR';

    // Configure the graph
    // Create a new graph if needed or reset existing one. 
    // Dagre graph is stateful, so creating new instance inside function or resetting is safer.
    // The global 'dagreGraph' constant might accumulate state if reused without clearing.
    // The existing code clears nodes, but let's be safe.
    dagreGraph.setGraph({
        rankdir: direction,
        nodesep: 80,    // Horizontal separation between nodes
        ranksep: 100,   // Vertical separation between ranks (layers)
        edgesep: 40,    // Separation between edges
        marginx: 20,
        marginy: 20,
    });

    // Clear previous graph data - critical!
    dagreGraph.nodes().forEach((n) => dagreGraph.removeNode(n));

    // Add nodes to dagre graph with dynamic sizes
    nodes.forEach((node) => {
        const isPert = node.type === 'pert';
        const width = isPert ? PERT_NODE_SIZE : DEFAULT_NODE_WIDTH;
        const height = isPert ? PERT_NODE_SIZE : DEFAULT_NODE_HEIGHT;
        dagreGraph.setNode(node.id, { width, height });
    });

    // Add edges to dagre graph
    edges.forEach((edge) => {
        dagreGraph.setEdge(edge.source, edge.target);
    });

    // Run the layout algorithm
    dagre.layout(dagreGraph);

    // Apply calculated positions to nodes
    const layoutedNodes = nodes.map((node) => {
        const nodeWithPosition = dagreGraph.node(node.id);
        const isPert = node.type === 'pert';
        const width = isPert ? PERT_NODE_SIZE : DEFAULT_NODE_WIDTH;
        const height = isPert ? PERT_NODE_SIZE : DEFAULT_NODE_HEIGHT;

        // Dagre uses center-center anchor, React Flow uses top-left
        // So we need to shift the position
        const newNode: Node = {
            ...node,
            targetPosition: isHorizontal ? Position.Left : Position.Top,
            sourcePosition: isHorizontal ? Position.Right : Position.Bottom,
            position: {
                x: nodeWithPosition.x - width / 2,
                y: nodeWithPosition.y - height / 2,
            },
        };

        return newNode;
    });

    return { nodes: layoutedNodes, edges };
};
