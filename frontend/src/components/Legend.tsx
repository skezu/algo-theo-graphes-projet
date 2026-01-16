import { memo } from 'react';

/**
 * Legend component for the graph visualization.
 */
function Legend() {
    return (
        <div className="bg-[rgba(26,26,26,0.85)] border border-[rgba(240,240,240,0.2)] p-4 rounded-lg shadow-lg flex flex-col gap-3 min-w-[160px]">
            <h3 className="text-sm font-semibold text-[#f0f0f0] mb-1">Legend</h3>

            <div className="flex items-center gap-3">
                <div className="w-8 h-1 bg-[rgba(240,240,240,0.3)] rounded"></div>
                <span className="text-xs text-[#f0f0f0]">Default Edge</span>
            </div>

            <div className="flex items-center gap-3">
                <div className="w-8 h-1 bg-[#f4d47c] rounded"></div>
                <span className="text-xs text-[#f0f0f0]">Explored</span>
            </div>

            <div className="flex items-center gap-3">
                <div className="w-8 h-1 bg-[#78b4d4] rounded"></div>
                <span className="text-xs text-[#f0f0f0]">Shortest Path</span>
            </div>

            <div className="flex items-center gap-3">
                <div className="w-8 h-1 bg-[#9bce8f] rounded"></div>
                <span className="text-xs text-[#f0f0f0]">MST</span>
            </div>
        </div>
    );
}

export default memo(Legend);
