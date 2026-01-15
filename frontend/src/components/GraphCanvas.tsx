/**
 * Graph canvas component using React Flow.
 */
import { useCallback, useEffect } from 'react';
import {
    ReactFlow,
    Background,
    Controls,
    MiniMap,
    useNodesState,
    useEdgesState,
    type Node,
    type Edge,
    ConnectionMode,
} from '@xyflow/react';
import '@xyflow/react/dist/style.css';
import { useAppStore } from '@/lib/store';
import GraphNode from './GraphNode';

const nodeTypes = {
    default: GraphNode,
};

interface GraphNodeData extends Record<string, unknown> {
    label: string;
}

export default function GraphCanvas() {
    const {
        nodes: storeNodes,
        edges: storeEdges,
        exploredEdges,
        pathEdges,
        mstEdges,
        isGraphLoaded,
    } = useAppStore();

    const [nodes, setNodes, onNodesChange] = useNodesState<Node<GraphNodeData>>([]);
    const [edges, setEdges, onEdgesChange] = useEdgesState<Edge>([]);

    // Update nodes from store
    useEffect(() => {
        if (storeNodes.length > 0) {
            const updatedNodes = storeNodes.map(node => ({
                ...node,
                type: 'default' as const,
                data: node.data as GraphNodeData,
            }));
            setNodes(updatedNodes);
        }
    }, [storeNodes, setNodes]);

    // Update edges with styling based on algorithm state
    useEffect(() => {
        if (storeEdges.length > 0) {
            const updatedEdges: Edge[] = storeEdges.map(edge => {
                let className = '';
                let style: React.CSSProperties = {
                    stroke: 'hsl(217 19% 27%)',
                    strokeWidth: 2,
                    transition: 'stroke 0.3s ease, stroke-width 0.3s ease',
                };

                // Check if edge is in MST
                if (mstEdges.has(edge.id) || mstEdges.has(`${edge.target}-${edge.source}`)) {
                    className = 'edge-mst';
                    style = { ...style, stroke: 'hsl(142 76% 36%)', strokeWidth: 4 };
                }
                // Check if edge is in final path
                else if (pathEdges.has(edge.id) || pathEdges.has(`${edge.target}-${edge.source}`)) {
                    className = 'edge-path';
                    style = { ...style, stroke: 'hsl(231 97% 66%)', strokeWidth: 4 };
                }
                // Check if edge was explored
                else if (exploredEdges.has(edge.id) || exploredEdges.has(`${edge.target}-${edge.source}`)) {
                    className = 'edge-explored';
                    style = { ...style, stroke: 'hsl(43 96% 56%)', strokeWidth: 3 };
                }

                return {
                    ...edge,
                    className,
                    style,
                    label: edge.label,
                    labelStyle: { fill: 'hsl(var(--foreground))', fontWeight: 500, fontSize: 12 },
                    labelBgStyle: { fill: 'hsl(var(--background))', fillOpacity: 0.8 },
                    labelBgPadding: [4, 8] as [number, number],
                    labelBgBorderRadius: 4,
                };
            });
            setEdges(updatedEdges);
        }
    }, [storeEdges, exploredEdges, pathEdges, mstEdges, setEdges]);

    const onInit = useCallback(() => {
        console.log('React Flow initialized');
    }, []);

    if (!isGraphLoaded) {
        return (
            <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-slate-900 to-slate-800">
                <div className="text-center">
                    <div className="text-6xl mb-4">📊</div>
                    <h2 className="text-2xl font-bold text-white mb-2">Graph Algorithms Visualizer</h2>
                    <p className="text-slate-400">Load a graph to begin visualization</p>
                </div>
            </div>
        );
    }

    return (
        <div className="w-full h-full">
            <ReactFlow
                nodes={nodes}
                edges={edges}
                onNodesChange={onNodesChange}
                onEdgesChange={onEdgesChange}
                onInit={onInit}
                nodeTypes={nodeTypes}
                connectionMode={ConnectionMode.Loose}
                fitView
                fitViewOptions={{ padding: 0.2 }}
                minZoom={0.1}
                maxZoom={2}
                proOptions={{ hideAttribution: true }}
            >
                <Background color="hsl(var(--muted-foreground))" gap={20} size={1} />
                <Controls className="!bg-slate-800 !border-slate-700 !rounded-lg" />
                <MiniMap
                    className="!bg-slate-800 !border-slate-700 !rounded-lg"
                    nodeColor="hsl(var(--primary))"
                    maskColor="hsl(var(--background) / 0.8)"
                />
            </ReactFlow>
        </div>
    );
}
