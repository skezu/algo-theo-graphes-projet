import { type Node, type Edge, Position } from '@xyflow/react';

/**
 * layoutUtils.ts
 * Utilities for automatic graph layout.
 * Uses a custom BFS-based layered layout to avoid external dependencies.
 */

export const applyAutoLayout = (nodes: Node[], edges: Edge[], direction = 'TB') => {
    const isHorizontal = direction === 'LR';

    // 1. Build adjacency list and find roots
    const adj: Record<string, string[]> = {};
    const inDegree: Record<string, number> = {};

    nodes.forEach(n => {
        adj[n.id] = [];
        inDegree[n.id] = 0;
    });

    edges.forEach(e => {
        if (adj[e.source]) {
            adj[e.source].push(e.target);
            inDegree[e.target] = (inDegree[e.target] || 0) + 1;
        }
    });

    // 2. Assign levels (layers) using BFS
    const levels: Record<string, number> = {};
    const maxPerLevel: Record<number, number> = {};
    const queue: string[] = [];

    // Start with nodes having 0 in-degree (roots), or the first node if cycle/no roots
    nodes.forEach(n => {
        if (inDegree[n.id] === 0) {
            queue.push(n.id);
            levels[n.id] = 0;
        }
    });

    if (queue.length === 0 && nodes.length > 0) {
        // Handle cyclic graphs with no clear root
        queue.push(nodes[0].id);
        levels[nodes[0].id] = 0;
    }

    const visited = new Set<string>(queue);

    while (queue.length > 0) {
        const u = queue.shift()!;
        const level = levels[u];

        // Count nodes per level for X positioning
        maxPerLevel[level] = (maxPerLevel[level] || 0) + 1;

        if (adj[u]) {
            adj[u].forEach(v => {
                if (!visited.has(v)) {
                    visited.add(v);
                    levels[v] = level + 1;
                    queue.push(v);
                }
            });
        }
    }

    // Handle disconnected components
    nodes.forEach(n => {
        if (!visited.has(n.id)) {
            levels[n.id] = 0;
            maxPerLevel[0] = (maxPerLevel[0] || 0) + 1;
        }
    });

    // 3. Assign positions
    // Constants for spacing
    const nodeWidth = 180;
    const nodeHeight = 80;
    const xGap = 50;
    const yGap = 100;

    // Track current index in each level during positioning
    const levelCurrentIndex: Record<number, number> = {};

    const layoutedNodes = nodes.map((node) => {
        const level = levels[node.id] || 0;
        const indexInLevel = levelCurrentIndex[level] || 0;
        levelCurrentIndex[level] = indexInLevel + 1;

        // Center the layer
        const layerWidth = maxPerLevel[level] * (nodeWidth + xGap) - xGap;
        const xOffset = -layerWidth / 2;

        let x = xOffset + indexInLevel * (nodeWidth + xGap);
        let y = level * (nodeHeight + yGap);

        if (isHorizontal) {
            // Swap X and Y for horizontal
            [x, y] = [y, x];
        }

        return {
            ...node,
            targetPosition: isHorizontal ? Position.Left : Position.Top,
            sourcePosition: isHorizontal ? Position.Right : Position.Bottom,
            position: { x, y },
        };
    });

    return { nodes: layoutedNodes, edges };
};
