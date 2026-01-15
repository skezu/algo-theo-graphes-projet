export interface GraphNode {
    id: string;
    label: string;
    x: number;
    y: number;
}

export interface GraphEdge {
    source: string;
    target: string;
    weight: number;
    id: string;
}

export interface GraphData {
    nodes: GraphNode[];
    edges: GraphEdge[];
}

export interface TraceStep {
    type: string;
    nodeId?: string;
    source?: string;
    target?: string;
    description?: string;
    currentDist?: number;
    newDist?: number;
    previous?: string;
    path?: string[];
    // Allow random extra props
    [key: string]: any;
}
