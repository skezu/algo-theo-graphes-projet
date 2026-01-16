import { memo } from 'react';

/**
 * Legend component for the graph visualization.
 */
function Legend() {
    return (
        <div className="bg-[hsl(224,71%,6%,0.95)] backdrop-blur-md border border-[hsl(223,47%,14%)] p-4 rounded-2xl shadow-lg flex flex-col gap-3 min-w-[160px]">
            <h3 className="text-sm font-semibold text-white/90 mb-1">Legend</h3>

            <div className="flex items-center gap-3">
                <div className="w-8 h-1 bg-[hsl(223,47%,25%)] rounded"></div>
                <span className="text-xs text-white/70">Default Edge</span>
            </div>

            <div className="flex items-center gap-3">
                <div className="w-8 h-1 bg-[hsl(45,93%,58%)] rounded shadow-[0_0_8px_hsl(45,93%,58%,0.4)]"></div>
                <span className="text-xs text-white/70">Explored</span>
            </div>

            <div className="flex items-center gap-3">
                <div className="w-8 h-1 bg-[hsl(231,97%,66%)] rounded shadow-[0_0_8px_hsl(231,97%,66%,0.4)]"></div>
                <span className="text-xs text-white/70">Shortest Path</span>
            </div>

            <div className="flex items-center gap-3">
                <div className="w-8 h-1 bg-[hsl(158,64%,52%)] rounded shadow-[0_0_8px_hsl(158,64%,52%,0.4)]"></div>
                <span className="text-xs text-white/70">MST</span>
            </div>
        </div>
    );
}

export default memo(Legend);
