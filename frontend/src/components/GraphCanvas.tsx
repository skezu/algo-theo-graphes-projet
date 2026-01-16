/**
 * Graph canvas component using React Flow.
 */
import { useCallback, useEffect } from 'react';
import {
    ReactFlow,
    Background,
    Controls,
    Panel,
    useNodesState,
    useEdgesState,
    type Node,
    type Edge,
    ConnectionMode,
} from '@xyflow/react';
import '@xyflow/react/dist/style.css';
import { useAppStore } from '@/lib/store';
import GraphNode from './GraphNode';
import Legend from './Legend';

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
                    stroke: 'hsl(223 47% 25%)',
                    strokeWidth: 2.5,
                    transition: 'stroke 0.35s ease, stroke-width 0.35s ease',
                };

                // Dynamic label background color based on state
                let labelBgColor = 'hsl(224 71% 6%)';
                let labelColor = 'hsl(213 31% 91%)';

                // Check if edge is in MST
                if (mstEdges.has(edge.id) || mstEdges.has(`${edge.target}-${edge.source}`)) {
                    className = 'edge-mst';
                    style = { ...style, stroke: 'hsl(158 64% 52%)', strokeWidth: 4.5 };
                    labelBgColor = 'hsl(158 50% 10%)'; // Dark green background
                    labelColor = 'hsl(158 80% 90%)';
                }
                // Check if edge is in final path
                else if (pathEdges.has(edge.id) || pathEdges.has(`${edge.target}-${edge.source}`)) {
                    className = 'edge-path';
                    style = { ...style, stroke: 'hsl(231 97% 66%)', strokeWidth: 4.5 };
                    labelBgColor = 'hsl(231 60% 12%)'; // Dark blue background
                    labelColor = 'hsl(231 90% 90%)';
                }
                // Check if edge was explored
                else if (exploredEdges.has(edge.id) || exploredEdges.has(`${edge.target}-${edge.source}`)) {
                    className = 'edge-explored';
                    style = { ...style, stroke: 'hsl(45 93% 58%)', strokeWidth: 3.5 };
                    labelBgColor = 'hsl(35 60% 12%)'; // Dark amber background
                    labelColor = 'hsl(45 90% 90%)';
                }

                return {
                    ...edge,
                    type: 'smoothstep', // Consistent curve
                    className,
                    style,
                    label: edge.label,
                    labelStyle: {
                        fill: labelColor,
                        fontWeight: 600,
                        fontSize: 12,
                        fontFamily: 'Inter, system-ui, sans-serif',
                        textShadow: '0 1px 2px rgba(0,0,0,0.8)'
                    },
                    labelBgStyle: {
                        fill: labelBgColor,
                        fillOpacity: 1,
                        stroke: style.stroke,
                        strokeWidth: 1,
                    },
                    labelBgPadding: [8, 4] as [number, number],
                    labelBgBorderRadius: 6,
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
            <div className="w-full h-full flex items-center justify-center bg-[hsl(224,71%,4%)]">
                <div className="empty-state animate-fade-in">
                    <div className="empty-state-icon">📊</div>
                    <h2 className="empty-state-title">Graph Algorithms Visualizer</h2>
                    <p className="empty-state-description">
                        Load a graph from the control panel to begin visualization
                    </p>
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
                defaultEdgeOptions={{ type: 'smoothstep' }}
            >
                <Background
                    color="hsl(223 47% 20%)"
                    gap={24}
                    size={1.5}
                />
                <Controls />
                <Panel position="bottom-left">
                    <Legend />
                </Panel>
            </ReactFlow>
        </div>
    );
}

