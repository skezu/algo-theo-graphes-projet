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
import PertNode from './PertNode';
import Legend from './Legend';
import { Network } from 'lucide-react';

const nodeTypes = {
    default: GraphNode,
    pert: PertNode,
};



export default function GraphCanvas() {
    const {
        nodes: storeNodes,
        edges: storeEdges,
        exploredEdges,
        pathEdges,
        mstEdges,
        isGraphLoaded,
    } = useAppStore();

    const [nodes, setNodes, onNodesChange] = useNodesState<Node>([]);
    const [edges, setEdges, onEdgesChange] = useEdgesState<Edge>([]);

    // Update nodes from store
    useEffect(() => {
        if (storeNodes.length > 0) {
            const updatedNodes = storeNodes.map(node => ({
                ...node,
                type: node.type || 'default',
                data: node.data as Record<string, unknown>,
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
                    stroke: 'var(--edge-default)',
                    strokeWidth: 2,
                    transition: 'stroke 0.3s ease, stroke-width 0.3s ease',
                };

                // Default labels
                let labelColor = 'var(--text-primary)';

                // Check if edge is in MST
                if (mstEdges.has(edge.id) || mstEdges.has(`${edge.target}-${edge.source}`)) {
                    className = 'edge-mst';
                    style = { ...style, stroke: 'var(--edge-mst)', strokeWidth: 3 };
                    labelColor = 'var(--accent-green)';
                }
                // Check if edge is in final path
                else if (pathEdges.has(edge.id) || pathEdges.has(`${edge.target}-${edge.source}`)) {
                    className = 'edge-path';
                    style = { ...style, stroke: 'var(--edge-path)', strokeWidth: 3 };
                    labelColor = 'var(--accent-cyan)';
                }
                // Check if edge was explored
                else if (exploredEdges.has(edge.id) || exploredEdges.has(`${edge.target}-${edge.source}`)) {
                    className = 'edge-explored';
                    style = { ...style, stroke: 'var(--edge-explored)', strokeWidth: 2.5 };
                    labelColor = 'var(--accent-yellow)';
                }

                return {
                    ...edge,
                    type: 'smoothstep',
                    className,
                    style,
                    label: edge.label,
                    labelStyle: {
                        fill: labelColor,
                        fontSize: 11,
                        fontWeight: 500,
                        stroke: 'none',
                        strokeWidth: 0,
                    },
                    labelBgStyle: {
                        fill: 'var(--bg-secondary)',
                        fillOpacity: 0.95,
                    },
                    labelBgPadding: [6, 4] as [number, number],
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
            <div
                className="w-full h-full flex items-center justify-center"
                style={{ background: 'var(--bg-base)' }}
            >
                <div className="empty-state animate-fade-in">
                    <div
                        className="w-24 h-24 rounded-3xl flex items-center justify-center mb-6 animate-float"
                        style={{
                            background: 'linear-gradient(135deg, var(--bg-secondary) 0%, var(--bg-tertiary) 100%)',
                            border: '1px solid var(--border-default)',
                            boxShadow: 'var(--shadow-lg)'
                        }}
                    >
                        <Network className="w-10 h-10" style={{ color: 'var(--accent-blue)' }} />
                    </div>
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
