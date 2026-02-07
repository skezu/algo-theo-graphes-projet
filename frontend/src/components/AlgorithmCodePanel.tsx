/**
 * Algorithm Code Panel - Displays the pseudocode/code of the selected algorithm.
 */
import { useAppStore } from '../lib/store';
import { Code2 } from 'lucide-react';
import type { AlgorithmName } from '../services/api';

// Pseudocode for each algorithm
const ALGORITHM_CODE: Record<AlgorithmName, { title: string; code: string }> = {
    bfs: {
        title: 'Breadth-First Search (BFS)',
        code: `function BFS(graph, start):
    visited ← {start}
    queue ← [start]
    result ← []

    while queue is not empty:
        current ← queue.dequeue()
        result.append(current)
        
        for each neighbor of current:
            if neighbor not in visited:
                visited.add(neighbor)
                queue.enqueue(neighbor)
    
    return result`
    },
    dfs: {
        title: 'Depth-First Search (DFS)',
        code: `function DFS(graph, start):
    visited ← {}
    stack ← [start]
    result ← []

    while stack is not empty:
        current ← stack.pop()
        
        if current not in visited:
            visited.add(current)
            result.append(current)
            
            for each neighbor of current:
                if neighbor not in visited:
                    stack.push(neighbor)
    
    return result`
    },
    dijkstra: {
        title: "Dijkstra's Algorithm",
        code: `function Dijkstra(graph, start, end):
    distances ← {v: ∞ for v in graph}
    distances[start] ← 0
    predecessors ← {}
    priority_queue ← [(0, start)]

    while priority_queue is not empty:
        (dist, current) ← extract_min(priority_queue)
        
        if current == end:
            return reconstruct_path(predecessors, end)
        
        for each (neighbor, weight) of current:
            new_dist ← dist + weight
            if new_dist < distances[neighbor]:
                distances[neighbor] ← new_dist
                predecessors[neighbor] ← current
                priority_queue.insert((new_dist, neighbor))
    
    return distances`
    },
    'bellman-ford': {
        title: 'Bellman-Ford Algorithm',
        code: `function BellmanFord(graph, start):
    distances ← {v: ∞ for v in graph}
    distances[start] ← 0
    predecessors ← {}

    // Relax edges |V| - 1 times
    for i from 1 to |V| - 1:
        for each edge (u, v, weight):
            if distances[u] + weight < distances[v]:
                distances[v] ← distances[u] + weight
                predecessors[v] ← u

    // Check for negative cycles
    for each edge (u, v, weight):
        if distances[u] + weight < distances[v]:
            return "Negative cycle detected"
    
    return distances`
    },
    prim: {
        title: "Prim's Algorithm (MST)",
        code: `function Prim(graph, start):
    visited ← {start}
    mst_edges ← []
    edges ← priority_queue(edges from start)

    while |visited| < |V|:
        (weight, u, v) ← extract_min(edges)
        
        if v in visited:
            continue
        
        visited.add(v)
        mst_edges.append((u, v, weight))
        
        for each (neighbor, w) of v:
            if neighbor not in visited:
                edges.insert((w, v, neighbor))
    
    return mst_edges`
    },
    kruskal: {
        title: "Kruskal's Algorithm (MST)",
        code: `function Kruskal(graph):
    // Initialize Union-Find
    parent ← {v: v for v in graph}
    rank ← {v: 0 for v in graph}
    
    edges ← sort(graph.edges, by weight)
    mst_edges ← []

    for each (u, v, weight) in edges:
        if find(u) ≠ find(v):
            union(u, v)
            mst_edges.append((u, v, weight))
        
        if |mst_edges| == |V| - 1:
            break
    
    return mst_edges`
    }
};

export default function AlgorithmCodePanel() {
    const { selectedAlgorithm } = useAppStore();

    if (!selectedAlgorithm) {
        return (
            <div className="h-full flex flex-col">
                {/* Header */}
                <div
                    className="px-6 py-4 shrink-0"
                    style={{ borderBottom: '1px solid var(--border-subtle)' }}
                >
                    <h2
                        className="text-base font-semibold flex items-center gap-2"
                        style={{ color: 'var(--text-primary)' }}
                    >
                        <Code2 className="w-4 h-4" style={{ color: 'var(--accent-purple)' }} />
                        Algorithm
                    </h2>
                </div>

                {/* Empty State */}
                <div className="flex flex-col items-center justify-center text-center flex-1 px-6">
                    <div
                        className="w-12 h-12 rounded-xl flex items-center justify-center mb-3"
                        style={{
                            background: 'linear-gradient(135deg, var(--bg-secondary) 0%, var(--bg-tertiary) 100%)',
                            border: '1px solid var(--border-default)'
                        }}
                    >
                        <Code2 className="w-5 h-5" style={{ color: 'var(--text-tertiary)' }} />
                    </div>
                    <p
                        className="text-xs max-w-[180px] leading-relaxed"
                        style={{ color: 'var(--text-tertiary)' }}
                    >
                        Select an algorithm to view its pseudocode.
                    </p>
                </div>
            </div>
        );
    }

    const algorithmInfo = ALGORITHM_CODE[selectedAlgorithm];

    return (
        <div className="h-full flex flex-col">
            {/* Header */}
            <div
                className="px-6 py-4 flex items-center justify-between shrink-0"
                style={{ borderBottom: '1px solid var(--border-subtle)' }}
            >
                <h2
                    className="text-base font-semibold flex items-center gap-2"
                    style={{ color: 'var(--text-primary)' }}
                >
                    <Code2 className="w-4 h-4" style={{ color: 'var(--accent-purple)' }} />
                    Algorithm
                </h2>
                <span className="badge badge-purple uppercase text-[10px] font-medium tracking-wide">
                    {selectedAlgorithm}
                </span>
            </div>

            {/* Code Display */}
            <div className="flex-1 overflow-y-auto p-4">
                <div
                    className="rounded-lg p-4"
                    style={{
                        background: 'var(--bg-tertiary)',
                        border: '1px solid var(--border-subtle)'
                    }}
                >
                    <h3
                        className="text-xs font-semibold mb-3 uppercase tracking-wider"
                        style={{ color: 'var(--text-secondary)' }}
                    >
                        {algorithmInfo.title}
                    </h3>
                    <pre
                        className="text-[11px] leading-relaxed font-mono overflow-x-auto"
                        style={{ color: 'var(--text-primary)' }}
                    >
                        <code>{algorithmInfo.code}</code>
                    </pre>
                </div>
            </div>
        </div>
    );
}
