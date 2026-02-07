/**
 * Custom React Flow Node for PERT Chart.
 * Displays ES, EF, LS, LF, Duration, and Float.
 */
import { Handle, Position, type NodeProps } from '@xyflow/react';

interface PertNodeData extends Record<string, unknown> {
    label: string; // Task Name
    duration: number;
    es?: number;
    ef?: number;
    ls?: number;
    lf?: number;
    float?: number;
    isCritical?: boolean;
}

export default function PertNode({ data, selected }: NodeProps) {
    const pertData = data as unknown as PertNodeData;
    const { label, duration, es, ef, ls, lf, float, isCritical } = pertData;

    const baseColor = isCritical ? 'var(--accent-red)' : 'var(--accent-blue)';
    const bgColor = isCritical ? 'rgba(239, 68, 68, 0.1)' : 'rgba(59, 130, 246, 0.1)';

    return (
        <div
            className={`pert-node shadow-md rounded-md overflow-hidden transition-all duration-300 ${selected ? 'ring-2 ring-offset-2 ring-offset-[var(--bg-base)]' : ''}`}
            style={{
                background: 'var(--bg-elevated)',
                border: `1px solid ${isCritical ? 'var(--accent-red)' : 'var(--border-default)'}`,
                minWidth: '180px',
                color: 'var(--text-primary)',
                boxShadow: selected ? `0 0 0 2px ${baseColor}` : 'none',
            }}
        >
            <Handle
                type="target"
                position={Position.Left}
                style={{ background: baseColor, width: 8, height: 8 }}
            />

            {/* Top Row: ES | Duration | EF */}
            <div className="grid grid-cols-3 text-xs border-b" style={{ borderColor: 'var(--border-subtle)' }}>
                <div className="p-1 text-center border-r" style={{ borderColor: 'var(--border-subtle)' }}>
                    <span className="block text-[10px] text-[var(--text-tertiary)]">ES</span>
                    {es !== undefined ? es : '-'}
                </div>
                <div className="p-1 text-center border-r" style={{ borderColor: 'var(--border-subtle)' }}>
                    <span className="block text-[10px] text-[var(--text-tertiary)]">Dur</span>
                    {duration}
                </div>
                <div className="p-1 text-center">
                    <span className="block text-[10px] text-[var(--text-tertiary)]">EF</span>
                    {ef !== undefined ? ef : '-'}
                </div>
            </div>

            {/* Middle Row: Task Name */}
            <div
                className="p-2 text-center font-bold text-sm truncate"
                style={{ background: bgColor }}
                title={label}
            >
                {label}
            </div>

            {/* Bottom Row: LS | Float | LF */}
            <div className="grid grid-cols-3 text-xs border-t" style={{ borderColor: 'var(--border-subtle)' }}>
                <div className="p-1 text-center border-r" style={{ borderColor: 'var(--border-subtle)' }}>
                    <span className="block text-[10px] text-[var(--text-tertiary)]">LS</span>
                    {ls !== undefined ? ls : '-'}
                </div>
                <div className="p-1 text-center border-r" style={{ borderColor: 'var(--border-subtle)' }}>
                    <span className="block text-[10px] text-[var(--text-tertiary)]">Float</span>
                    <span style={{ color: float === 0 ? 'var(--accent-red)' : 'inherit' }}>
                        {float !== undefined ? float : '-'}
                    </span>
                </div>
                <div className="p-1 text-center">
                    <span className="block text-[10px] text-[var(--text-tertiary)]">LF</span>
                    {lf !== undefined ? lf : '-'}
                </div>
            </div>

            <Handle
                type="source"
                position={Position.Right}
                style={{ background: baseColor, width: 8, height: 8 }}
            />
        </div>
    );
}
