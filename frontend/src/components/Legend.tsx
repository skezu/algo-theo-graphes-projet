import { memo } from 'react';

/**
 * Legend component for the graph visualization.
 */
function Legend() {
    const items = [
        { color: 'var(--edge-default)', label: 'Default Edge' },
        { color: 'var(--edge-explored)', label: 'Explored' },
        { color: 'var(--edge-path)', label: 'Shortest Path' },
        { color: 'var(--edge-mst)', label: 'MST' },
    ];

    return (
        <div
            className="glass-panel-thick p-4 min-w-[160px] animate-fade-in"
            style={{ boxShadow: 'var(--shadow-lg)' }}
        >
            <h3
                className="text-xs font-semibold uppercase tracking-wider mb-3"
                style={{ color: 'var(--text-secondary)' }}
            >
                Legend
            </h3>

            <div className="flex flex-col gap-2.5">
                {items.map((item) => (
                    <div key={item.label} className="flex items-center gap-3">
                        <div
                            className="w-6 h-1 rounded-full"
                            style={{ background: item.color }}
                        />
                        <span
                            className="text-xs font-medium"
                            style={{ color: 'var(--text-primary)' }}
                        >
                            {item.label}
                        </span>
                    </div>
                ))}
            </div>
        </div>
    );
}

export default memo(Legend);
