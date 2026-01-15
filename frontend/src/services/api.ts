/**
 * API Service for communicating with the FastAPI backend.
 */
import axios from 'axios';

const API_BASE_URL = 'http://localhost:8000';

const api = axios.create({
    baseURL: API_BASE_URL,
    headers: {
        'Content-Type': 'application/json',
    },
});

export interface GraphNode {
    id: string;
    position: { x: number; y: number };
    data: { label: string;[key: string]: unknown };
    type?: string;
}

export interface GraphEdge {
    id: string;
    source: string;
    target: string;
    label?: string;
    data?: { weight?: number;[key: string]: unknown };
}

export interface GraphData {
    nodes: GraphNode[];
    edges: GraphEdge[];
}

export interface AlgorithmStep {
    type: string;
    targetId: string;
    description: string;
    data?: Record<string, unknown>;
}

export interface AlgorithmResponse {
    result: Record<string, unknown>;
    steps: AlgorithmStep[];
}

/**
 * Load a graph into the backend.
 */
export async function loadGraph(graphType: string = 'road_network'): Promise<{ message: string; nodes: number; edges: number }> {
    const response = await api.post(`/graph/load?graph_type=${graphType}`);
    return response.data;
}

/**
 * Get the current graph data in React Flow format.
 */
export async function getGraphData(): Promise<GraphData> {
    const response = await api.get('/graph/data');
    return response.data;
}

/**
 * Get list of all node IDs.
 */
export async function getNodes(): Promise<{ nodes: string[] }> {
    const response = await api.get('/graph/nodes');
    return response.data;
}

/**
 * Run BFS algorithm.
 */
export async function runBFS(startNode: string): Promise<AlgorithmResponse> {
    const response = await api.post('/algorithm/bfs', { startNode });
    return response.data;
}

/**
 * Run DFS algorithm.
 */
export async function runDFS(startNode: string): Promise<AlgorithmResponse> {
    const response = await api.post('/algorithm/dfs', { startNode });
    return response.data;
}

/**
 * Run Dijkstra algorithm.
 */
export async function runDijkstra(startNode: string, endNode?: string): Promise<AlgorithmResponse> {
    const response = await api.post('/algorithm/dijkstra', { startNode, endNode });
    return response.data;
}

/**
 * Run Bellman-Ford algorithm.
 */
export async function runBellmanFord(startNode: string): Promise<AlgorithmResponse> {
    const response = await api.post('/algorithm/bellman-ford', { startNode });
    return response.data;
}

/**
 * Run Prim's MST algorithm.
 */
export async function runPrim(startNode: string): Promise<AlgorithmResponse> {
    const response = await api.post('/algorithm/prim', { startNode });
    return response.data;
}

/**
 * Run Kruskal's MST algorithm.
 */
export async function runKruskal(): Promise<AlgorithmResponse> {
    const response = await api.post('/algorithm/kruskal', { startNode: '' });
    return response.data;
}

export type AlgorithmName = 'bfs' | 'dfs' | 'dijkstra' | 'bellman-ford' | 'prim' | 'kruskal';

export const ALGORITHM_INFO: Record<AlgorithmName, {
    name: string;
    description: string;
    needsEndNode: boolean;
    category: 'traversal' | 'pathfinding' | 'mst';
}> = {
    bfs: {
        name: 'BFS (Breadth-First Search)',
        description: 'Explores the graph level by level, visiting all neighbors before moving to the next level.',
        needsEndNode: false,
        category: 'traversal',
    },
    dfs: {
        name: 'DFS (Depth-First Search)',
        description: 'Explores as far as possible along each branch before backtracking.',
        needsEndNode: false,
        category: 'traversal',
    },
    dijkstra: {
        name: 'Dijkstra',
        description: 'Finds the shortest path from a source node to all other nodes (or a specific target).',
        needsEndNode: true,
        category: 'pathfinding',
    },
    'bellman-ford': {
        name: 'Bellman-Ford',
        description: 'Finds shortest paths from a source, can handle negative weights.',
        needsEndNode: false,
        category: 'pathfinding',
    },
    prim: {
        name: "Prim's Algorithm",
        description: 'Builds a Minimum Spanning Tree starting from a given node.',
        needsEndNode: false,
        category: 'mst',
    },
    kruskal: {
        name: "Kruskal's Algorithm",
        description: 'Builds a Minimum Spanning Tree by adding edges in order of weight.',
        needsEndNode: false,
        category: 'mst',
    },
};

/**
 * Run any algorithm by name.
 */
export async function runAlgorithm(
    algorithm: AlgorithmName,
    startNode: string,
    endNode?: string
): Promise<AlgorithmResponse> {
    switch (algorithm) {
        case 'bfs':
            return runBFS(startNode);
        case 'dfs':
            return runDFS(startNode);
        case 'dijkstra':
            return runDijkstra(startNode, endNode);
        case 'bellman-ford':
            return runBellmanFord(startNode);
        case 'prim':
            return runPrim(startNode);
        case 'kruskal':
            return runKruskal();
        default:
            throw new Error(`Unknown algorithm: ${algorithm}`);
    }
}
