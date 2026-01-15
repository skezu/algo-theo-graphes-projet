/**
 * Custom node component for the graph visualization.
 */
import { memo } from 'react';
import { Handle, Position, type NodeProps, type Node } from '@xyflow/react';
import { useAppStore } from '@/lib/store';
import { cn } from '@/lib/utils';

interface GraphNodeData extends Record<string, unknown> {
    label: string;
    distance?: number;
}

type GraphNodeType = Node<GraphNodeData>;

function GraphNode({ id, data }: NodeProps<GraphNodeType>) {
    const { visitedNodes, currentNode, pathEdges } = useAppStore();

    const isVisited = visitedNodes.has(id);
    const isCurrent = currentNode === id;

    // Check if this node is part of the final path
    const isInPath = Array.from(pathEdges).some((edge: string) => {
        const [source, target] = edge.split('-');
        return source === id || target === id;
    });

    return (
        <>
            <Handle type="target" position={Position.Top} className="!bg-transparent !border-0" />
            <div
                className={cn(
                    'graph-node',
                    isVisited && 'visited',
                    isCurrent && 'current',
                    isInPath && !isCurrent && 'in-path'
                )}
            >
                <div className="font-semibold text-sm">{data.label}</div>
                {data.distance !== undefined && (
                    <div className="text-xs opacity-70 mt-1">d: {data.distance}</div>
                )}
            </div>
            <Handle type="source" position={Position.Bottom} className="!bg-transparent !border-0" />
        </>
    );
}

export default memo(GraphNode);
