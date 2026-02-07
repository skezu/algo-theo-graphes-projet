/**
 * Custom React Flow Node for PERT Chart.
 * Displays ES, EF, LS, LF, Duration, and Float.
 */
import { Handle, Position, type NodeProps } from '@xyflow/react';

interface PertNodeData extends Record<string, unknown> {
    label: string; // Event Name / Number
    eet?: number;  // Earliest Event Time
    let?: number;  // Latest Event Time
    // Legacy support (optional, can be removed if sure)
    es?: number;
    ls?: number;
    description?: string;
    isCritical?: boolean;
}

export default function PertNode({ data, selected }: NodeProps) {
    const pertData = data as unknown as PertNodeData;
    const { label, eet, let: latestEventTime, es, ls, isCritical } = pertData;

    // Fallback for compatibility during transition (if needed)
    const displayEET = eet !== undefined ? eet : es;
    const displayLET = latestEventTime !== undefined ? latestEventTime : ls;

    // Determine border color based on criticality (or just blue by default for events?)
    // In AoA, Critical Path is edges (tasks) and Nodes (Events) where EET=LET.
    // So if EET=LET, the event is on critical path.
    const onCriticalPath = isCritical || (displayEET !== undefined && displayEET === displayLET);

    // User requested "ignore white theme" -> focusing on structure.
    // Critical nodes often red or highlighted.
    const borderColor = onCriticalPath ? '#ef4444' : '#3b82f6';

    const bgColor = 'var(--bg-elevated)';

    return (
        <div
            className={`pert-node-circle relative flex flex-col rounded-full overflow-hidden transition-all duration-300 ${selected ? 'ring-2 ring-offset-2 ring-offset-[var(--bg-base)]' : ''}`}
            style={{
                background: bgColor,
                border: `2px solid ${borderColor}`,
                width: '90px',
                height: '90px',
                boxShadow: selected ? `0 0 0 2px ${borderColor}` : isCritical ? '0 0 10px rgba(239, 68, 68, 0.2)' : '0 4px 6px rgba(0, 0, 0, 0.1)',
                color: 'var(--text-primary)',
            }}
        >
            <Handle
                type="target"
                position={Position.Left}
                style={{ background: borderColor, width: 6, height: 6, opacity: 0.8 }}
            />

            {/* Top Half: Event Label (Number) */}
            <div className="h-1/2 flex flex-col items-center justify-center border-b border-[var(--border-subtle)] bg-white/5 w-full">
                <span className="font-bold text-lg leading-none" title={label}>
                    {label}
                </span>
            </div>

            {/* Bottom Half: EET | LET */}
            <div className="h-1/2 flex w-full">
                {/* Left: EET (Green) */}
                <div className="w-1/2 flex items-center justify-center border-r border-[var(--border-subtle)]">
                    <span className="font-bold text-xs" style={{ color: 'var(--accent-green)' }}>
                        {displayEET !== undefined ? displayEET : '?'}
                    </span>
                </div>
                {/* Right: LET (Red) */}
                <div className="w-1/2 flex items-center justify-center">
                    <span className="font-bold text-xs" style={{ color: 'var(--accent-red)' }}>
                        {displayLET !== undefined ? displayLET : '?'}
                    </span>
                </div>
            </div>

            <Handle
                type="source"
                position={Position.Right}
                style={{ background: borderColor, width: 6, height: 6, opacity: 0.8 }}
            />
        </div>
    );
}
