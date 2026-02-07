/**
 * Algorithm Code Panel - Displays the pseudocode of the selected algorithm
 * with real-time line highlighting during execution.
 */
import { useMemo } from 'react';
import { useAppStore } from '../lib/store';
import { Code2 } from 'lucide-react';
import type { AlgorithmName } from '../services/api';

// Each algorithm has lines of code and a mapping from step types to line numbers
interface AlgorithmCodeData {
    title: string;
    lines: string[];
    stepToLines: Record<string, number[]>;
}

const ALGORITHM_CODE: Record<AlgorithmName, AlgorithmCodeData> = {
    bfs: {
        title: 'Breadth-First Search (BFS)',
        lines: [
            'function BFS(graph, start):',
            '    visited ← {start}',
            '    queue ← [start]',
            '    result ← []',
            '',
            '    while queue is not empty:',
            '        current ← queue.dequeue()',
            '        result.append(current)',
            '',
            '        for each neighbor of current:',
            '            if neighbor not in visited:',
            '                visited.add(neighbor)',
            '                queue.enqueue(neighbor)',
            '',
            '    return result',
        ],
        stepToLines: {
            'init': [0, 1, 2, 3],
            'visit_node': [6, 7],
            'explore_edge': [9, 10],
            'enqueue': [11, 12],
            'complete': [14],
        }
    },
    dfs: {
        title: 'Depth-First Search (DFS)',
        lines: [
            'function DFS(graph, start):',
            '    visited ← {}',
            '    stack ← [start]',
            '    result ← []',
            '',
            '    while stack is not empty:',
            '        current ← stack.pop()',
            '',
            '        if current not in visited:',
            '            visited.add(current)',
            '            result.append(current)',
            '',
            '            for each neighbor of current:',
            '                if neighbor not in visited:',
            '                    stack.push(neighbor)',
            '',
            '    return result',
        ],
        stepToLines: {
            'init': [0, 1, 2, 3],
            'visit_node': [6, 8, 9, 10],
            'explore_edge': [12, 13],
            'push_stack': [14],
            'complete': [16],
        }
    },
    dijkstra: {
        title: "Dijkstra's Algorithm",
        lines: [
            'function Dijkstra(graph, start, end):',
            '    distances ← {v: ∞ for v in graph}',
            '    distances[start] ← 0',
            '    predecessors ← {}',
            '    priority_queue ← [(0, start)]',
            '',
            '    while priority_queue is not empty:',
            '        (dist, current) ← extract_min(pq)',
            '',
            '        if current == end:',
            '            return reconstruct_path()',
            '',
            '        for each (neighbor, weight) of current:',
            '            new_dist ← dist + weight',
            '            if new_dist < distances[neighbor]:',
            '                distances[neighbor] ← new_dist',
            '                predecessors[neighbor] ← current',
            '                pq.insert((new_dist, neighbor))',
            '',
            '    return distances',
        ],
        stepToLines: {
            'init': [0, 1, 2, 3, 4],
            'visit_node': [7],
            'explore_edge': [12, 13, 14],
            'update_distance': [15, 16, 17],
            'found_path': [9, 10],
            'complete': [19],
        }
    },
    'bellman-ford': {
        title: 'Bellman-Ford Algorithm',
        lines: [
            'function BellmanFord(graph, start):',
            '    distances ← {v: ∞ for v in graph}',
            '    distances[start] ← 0',
            '    predecessors ← {}',
            '',
            '    // Relax edges |V| - 1 times',
            '    for i from 1 to |V| - 1:',
            '        for each edge (u, v, weight):',
            '            if dist[u] + weight < dist[v]:',
            '                distances[v] ← dist[u] + weight',
            '                predecessors[v] ← u',
            '',
            '    // Check for negative cycles',
            '    for each edge (u, v, weight):',
            '        if dist[u] + weight < dist[v]:',
            '            return "Negative cycle!"',
            '',
            '    return distances',
        ],
        stepToLines: {
            'init': [0, 1, 2, 3],
            'iteration': [6],
            'update_distance': [7, 8, 9, 10],
            'early_stop': [6],
            'negative_cycle': [13, 14, 15],
            'complete': [17],
        }
    },
    prim: {
        title: "Prim's Algorithm (MST)",
        lines: [
            'function Prim(graph, start):',
            '    visited ← {start}',
            '    mst_edges ← []',
            '    edges ← priority_queue(from start)',
            '',
            '    while |visited| < |V|:',
            '        (weight, u, v) ← extract_min(edges)',
            '',
            '        if v in visited:',
            '            continue',
            '',
            '        visited.add(v)',
            '        mst_edges.append((u, v, weight))',
            '',
            '        for each (neighbor, w) of v:',
            '            if neighbor not in visited:',
            '                edges.insert((w, v, neighbor))',
            '',
            '    return mst_edges',
        ],
        stepToLines: {
            'init': [0, 1, 2, 3],
            'skip_edge': [8, 9],
            'add_edge': [11, 12],
            'visit_node': [11],
            'complete': [18],
        }
    },
    kruskal: {
        title: "Kruskal's Algorithm (MST)",
        lines: [
            'function Kruskal(graph):',
            '    // Initialize Union-Find',
            '    parent ← {v: v for v in graph}',
            '    rank ← {v: 0 for v in graph}',
            '',
            '    edges ← sort(graph.edges, by weight)',
            '    mst_edges ← []',
            '',
            '    for each (u, v, weight) in edges:',
            '        if find(u) ≠ find(v):',
            '            union(u, v)',
            '            mst_edges.append((u, v, weight))',
            '',
            '        if |mst_edges| == |V| - 1:',
            '            break',
            '',
            '    return mst_edges',
        ],
        stepToLines: {
            'init': [0, 1, 2, 3, 5, 6],
            'explore_edge': [8],
            'add_edge': [9, 10, 11],
            'skip_edge': [9],
            'complete': [16],
        }
    }
};

interface AlgorithmCodePanelProps {
    hideHeader?: boolean;
}

export default function AlgorithmCodePanel({ hideHeader = false }: AlgorithmCodePanelProps) {
    const { selectedAlgorithm, steps, playback } = useAppStore();

    // Determine which lines to highlight based on current step
    const highlightedLines = useMemo(() => {
        if (!selectedAlgorithm || !steps.length || playback.currentStepIndex < 0) {
            return new Set<number>();
        }

        const currentStep = steps[playback.currentStepIndex];
        if (!currentStep) return new Set<number>();

        const algorithmData = ALGORITHM_CODE[selectedAlgorithm];
        const lineNumbers = algorithmData.stepToLines[currentStep.type] || [];

        return new Set(lineNumbers);
    }, [selectedAlgorithm, steps, playback.currentStepIndex]);

    if (!selectedAlgorithm) {
        return (
            <div className="h-full flex flex-col">
                {/* Header */}
                {!hideHeader && (
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
                )}

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
    const isRunning = steps.length > 0 && playback.currentStepIndex >= 0;

    return (
        <div className="h-full flex flex-col">
            {/* Header */}
            {!hideHeader && (
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
                    <div className="flex items-center gap-2">
                        {isRunning && (
                            <span className="flex items-center gap-1.5 text-[10px] font-medium px-2 py-1 rounded"
                                style={{
                                    background: 'var(--accent-green-subtle)',
                                    color: 'var(--accent-green)'
                                }}
                            >
                                <span className="w-1.5 h-1.5 rounded-full bg-current animate-pulse" />
                                RUNNING
                            </span>
                        )}
                        <span className="badge badge-purple uppercase text-[10px] font-medium tracking-wide">
                            {selectedAlgorithm}
                        </span>
                    </div>
                </div>
            )}

            {/* Code Display */}
            <div className="flex-1 overflow-y-auto p-4">
                <div
                    className="rounded-lg overflow-hidden"
                    style={{
                        background: 'var(--bg-tertiary)',
                        border: '1px solid var(--border-subtle)'
                    }}
                >
                    {/* Title bar */}
                    <div
                        className="px-4 py-2 flex items-center gap-2"
                        style={{
                            background: 'var(--bg-secondary)',
                            borderBottom: '1px solid var(--border-subtle)'
                        }}
                    >
                        <div className="flex gap-1.5">
                            <span className="w-3 h-3 rounded-full" style={{ background: '#ff5f57' }} />
                            <span className="w-3 h-3 rounded-full" style={{ background: '#febc2e' }} />
                            <span className="w-3 h-3 rounded-full" style={{ background: '#28c840' }} />
                        </div>
                        <span
                            className="text-[10px] font-medium uppercase tracking-wider ml-2"
                            style={{ color: 'var(--text-tertiary)' }}
                        >
                            {algorithmInfo.title}
                        </span>
                    </div>

                    {/* Code lines */}
                    <div className="py-2">
                        {algorithmInfo.lines.map((line, index) => {
                            const isHighlighted = highlightedLines.has(index);

                            return (
                                <div
                                    key={index}
                                    className="code-line"
                                    style={{
                                        display: 'flex',
                                        alignItems: 'stretch',
                                        minHeight: '1.5rem',
                                        background: isHighlighted
                                            ? 'var(--accent-yellow-subtle)'
                                            : 'transparent',
                                        borderLeft: isHighlighted
                                            ? '3px solid var(--accent-yellow)'
                                            : '3px solid transparent',
                                        transition: 'all 150ms ease-out',
                                    }}
                                >
                                    {/* Line number */}
                                    <span
                                        className="shrink-0 text-right px-3 py-0.5 select-none text-[11px] font-mono"
                                        style={{
                                            color: isHighlighted
                                                ? 'var(--accent-yellow)'
                                                : 'var(--text-quaternary)',
                                            minWidth: '2.5rem',
                                            background: isHighlighted
                                                ? 'rgba(255, 214, 10, 0.08)'
                                                : 'transparent',
                                        }}
                                    >
                                        {index + 1}
                                    </span>

                                    {/* Code content */}
                                    <code
                                        className="flex-1 text-[11px] font-mono py-0.5 pr-4"
                                        style={{
                                            color: isHighlighted
                                                ? 'var(--text-primary)'
                                                : 'var(--text-secondary)',
                                            fontWeight: isHighlighted ? 500 : 400,
                                            whiteSpace: 'pre',
                                        }}
                                    >
                                        {line || ' '}
                                    </code>
                                </div>
                            );
                        })}
                    </div>
                </div>
            </div>
        </div>
    );
}
