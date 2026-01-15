import { useMemo } from 'react';
import { ReactFlow, Background, Controls, MiniMap, type Node, type Edge } from '@xyflow/react';
import '@xyflow/react/dist/style.css';
import { useStore } from '../store';

const GraphCanvas = () => {
    const { nodes, edges, trace, currentStepIndex } = useStore();

    const { derivedNodes, derivedEdges } = useMemo(() => {
        // Deep copy to avoid mutating store state directly in the view logic
        const dNodes: Node[] = nodes.map(n => ({
            ...n,
            style: {
                background: '#fff',
                border: '1px solid #777',
                width: 50,
                height: 50,
                borderRadius: '50%',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontWeight: 'bold',
                zIndex: 1
            }
        }));

        const dEdges: Edge[] = edges.map(e => ({
            ...e,
            animated: false,
            style: { stroke: '#b1b1b7', strokeWidth: 2 },
            labelStyle: { fill: '#b1b1b7', fontWeight: 700 }
        }));

        const visitedNodes = new Set<string>();
        let processingNode: string | null = null;
        let processingEdge: string | null = null;

        // Replay trace up to current step
        for (let i = 0; i <= currentStepIndex; i++) {
            const step = trace[i];
            if (!step) break;

            if (step.type === 'visit_node' && step.nodeId) {
                visitedNodes.add(step.nodeId);
                processingNode = step.nodeId; // Highlights current
            }
            if (step.type === 'check_neighbor' || step.type === 'check_edge') {
                if (step.source && step.target) {
                    processingEdge = `${step.source}-${step.target}`;
                }
            }
            if (step.type === 'path_found' && step.path) {
                // Highlight final path
                step.path.forEach(n => visitedNodes.add(n));
            }
        }

        // Apply styles
        dNodes.forEach(n => {
            if (processingNode === n.id) {
                n.style = { ...n.style, background: '#ffeb3b', borderColor: '#f59e0b', transform: 'scale(1.2)', zIndex: 10 };
            } else if (visitedNodes.has(n.id)) {
                n.style = { ...n.style, background: '#4ade80', borderColor: '#16a34a' };
            }

            // Show distance if available in trace (expensive to find last distance update)
            // For now, simple highlighting.
        });

        dEdges.forEach(e => {
            const isForward = e.source + '-' + e.target === processingEdge;
            const isReverse = e.target + '-' + e.source === processingEdge;

            if (isForward || isReverse) {
                e.style = { ...e.style, stroke: '#f59e0b', strokeWidth: 4 };
                e.animated = true;
                e.zIndex = 10;
            }
            // Logic for visited edges could be added here
        });

        return { derivedNodes: dNodes, derivedEdges: dEdges };
    }, [nodes, edges, trace, currentStepIndex]);

    return (
        <div className="w-full h-full bg-slate-50 dark:bg-slate-950">
            <ReactFlow
                nodes={derivedNodes}
                edges={derivedEdges}
                fitView
            >
                <Background />
                <Controls />
                <MiniMap />
            </ReactFlow>
        </div>
    );
};

export default GraphCanvas;
