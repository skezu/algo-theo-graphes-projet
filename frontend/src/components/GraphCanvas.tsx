/**
 * Graph canvas component using React Flow.
 */
import { useCallback, useEffect } from 'react';
import {
    ReactFlow,
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
                    stroke: 'rgba(240,240,240,0.3)',
                    strokeWidth: 2,
                    transition: 'stroke 0.3s ease, stroke-width 0.3s ease',
                };

                // Default labels
                let labelColor = '#f0f0f0';

                // Check if edge is in MST
                if (mstEdges.has(edge.id) || mstEdges.has(`${edge.target}-${edge.source}`)) {
                    className = 'edge-mst';
                    style = { ...style, stroke: '#9bce8f', strokeWidth: 4 };
                    labelColor = '#9bce8f';
                }
                // Check if edge is in final path
                else if (pathEdges.has(edge.id) || pathEdges.has(`${edge.target}-${edge.source}`)) {
                    className = 'edge-path';
                    style = { ...style, stroke: '#78b4d4', strokeWidth: 4 };
                    labelColor = '#78b4d4';
                }
                // Check if edge was explored
                else if (exploredEdges.has(edge.id) || exploredEdges.has(`${edge.target}-${edge.source}`)) {
                    className = 'edge-explored';
                    style = { ...style, stroke: '#f4d47c', strokeWidth: 3 };
                    labelColor = '#f4d47c';
                }

                return {
                    ...edge,
                    type: 'smoothstep',
                    className,
                    style,
                    label: edge.label,
                    labelStyle: {
                        fill: labelColor,
                        fontSize: 12,
                        stroke: 'none',
                        strokeWidth: 0,
                    },
                    labelBgStyle: {
                        fill: '#1a1a1a',
                        fillOpacity: 0.9,
                    },
                    labelBgPadding: [6, 3] as [number, number],
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
            <div className="w-full h-full flex items-center justify-center bg-[#1a1a1a]">
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
                <Controls />
                <Panel position="bottom-left">
                    <Legend />
                </Panel>
            </ReactFlow>
        </div>
    );
}

