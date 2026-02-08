
import { useState } from 'react';
import { createPortal } from 'react-dom';
import { X, Maximize2, Table as TableIcon, ArrowRight, CheckCircle2, AlertTriangle, Clock } from 'lucide-react';
import { Button } from './ui/button';
import { motion } from 'framer-motion';
import { cn } from '../lib/utils';

interface ResultDisplayProps {
    result: any;
    algorithm: string | null;
}

export default function ResultDisplay({ result, algorithm }: ResultDisplayProps) {
    const [isFullScreen, setIsFullScreen] = useState(false);

    if (!result) return null;

    const renderContent = (fullScreen: boolean) => {
        if (!algorithm) return <pre className="text-xs">{JSON.stringify(result, null, 2)}</pre>;

        switch (algorithm) {
            case 'pert':
                return <PertResultView result={result} fullScreen={fullScreen} />;
            case 'dijkstra':
            case 'bellman-ford':
                return <PathResultView result={result} fullScreen={fullScreen} />;
            case 'prim':
            case 'kruskal':
                return <MSTResultView result={result} fullScreen={fullScreen} />;
            case 'bfs':
            case 'dfs':
                return <TraversalResultView result={result} fullScreen={fullScreen} />;
            default:
                return (
                    <div className="text-xs font-mono overflow-auto max-h-[300px]">
                        <pre>{JSON.stringify(result, null, 2)}</pre>
                    </div>
                );
        }
    };

    return (
        <>
            <div className="mt-4 animate-scale-in">
                <div className="flex items-center justify-between mb-2">
                    <h4 className="text-sm font-semibold flex items-center gap-2" style={{ color: 'var(--text-primary)' }}>
                        <CheckCircle2 className="w-4 h-4 text-[var(--accent-green)]" />
                        Execution Result
                    </h4>
                    <Button
                        variant="ghost"
                        size="icon"
                        className="h-6 w-6 text-[var(--text-tertiary)] hover:text-[var(--text-primary)]"
                        onClick={() => setIsFullScreen(true)}
                        title="View Full Calculation"
                    >
                        <Maximize2 className="w-3.5 h-3.5" />
                    </Button>
                </div>

                <div className="rounded-lg border border-[var(--border-subtle)] bg-[var(--bg-tertiary)]/30 overflow-hidden">
                    {renderContent(false)}
                </div>
            </div>

            {/* Full Screen Modal */}
            {isFullScreen && createPortal(
                <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/60 backdrop-blur-sm animate-fade-in p-4">
                    <motion.div
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.95 }}
                        className="w-full max-w-5xl bg-[var(--bg-elevated)] border border-[var(--border-default)] rounded-xl shadow-2xl flex flex-col max-h-[90vh]"
                    >
                        <div className="flex items-center justify-between px-6 py-4 border-b border-[var(--border-subtle)]">
                            <h2 className="text-lg font-semibold text-[var(--text-primary)] flex items-center gap-2">
                                <TableIcon className="w-5 h-5 text-[var(--accent-blue)]" />
                                {algorithm?.toUpperCase()} Results
                            </h2>
                            <Button variant="ghost" size="icon" onClick={() => setIsFullScreen(false)}>
                                <X className="w-5 h-5" />
                            </Button>
                        </div>
                        <div className="flex-1 overflow-auto p-6 bg-[var(--bg-base)]">
                            {renderContent(true)}
                        </div>
                    </motion.div>
                </div>,
                document.body
            )}
        </>
    );
}

// Sub-components for specific algorithms

function PertResultView({ result, fullScreen }: { result: any, fullScreen: boolean }) {
    const { schedule, projectDuration, criticalPath } = result;

    if (!schedule) return <div className="p-4 text-red-400">Invalid PERT result</div>;

    return (
        <div className="flex flex-col gap-4">
            {/* Summary Metrics */}
            <div className={cn("grid gap-4 p-4 bg-[var(--bg-secondary)] border-b border-[var(--border-subtle)]", fullScreen ? "grid-cols-3" : "grid-cols-1")}>
                <div className="flex flex-col">
                    <span className="text-xs text-[var(--text-tertiary)]">Project Duration</span>
                    <span className="text-xl font-bold text-[var(--accent-blue)] flex items-center gap-2">
                        <Clock className="w-4 h-4" />
                        {projectDuration} days
                    </span>
                </div>
                <div className="flex flex-col">
                    <span className="text-xs text-[var(--text-tertiary)]">Critical Tasks</span>
                    <span className="text-sm font-medium text-[var(--accent-red)]">
                        {criticalPath?.join(' → ') || 'None'}
                    </span>
                </div>
                <div className="flex flex-col">
                    <span className="text-xs text-[var(--text-tertiary)]">Total Tasks</span>
                    <span className="text-sm font-medium text-[var(--text-primary)]">
                        {schedule.length}
                    </span>
                </div>
            </div>

            {/* Detailed Table */}
            <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                    <thead className="bg-[var(--bg-tertiary)] text-[var(--text-secondary)] text-xs uppercase tracking-wider sticky top-0">
                        <tr>
                            <th className="p-3 font-medium border-b border-[var(--border-subtle)] text-center w-12">ID</th>
                            <th className="p-3 font-medium border-b border-[var(--border-subtle)]">Task Name</th>
                            <th className="p-3 font-medium border-b border-[var(--border-subtle)] text-right">Dur.</th>
                            <th className="p-3 font-medium border-b border-[var(--border-subtle)] text-right text-[var(--accent-blue)]">ES</th>
                            <th className="p-3 font-medium border-b border-[var(--border-subtle)] text-right text-[var(--accent-blue)]">EF</th>
                            <th className="p-3 font-medium border-b border-[var(--border-subtle)] text-right text-[var(--accent-purple)]">LS</th>
                            <th className="p-3 font-medium border-b border-[var(--border-subtle)] text-right text-[var(--accent-purple)]">LF</th>
                            <th className="p-3 font-medium border-b border-[var(--border-subtle)] text-right text-[var(--accent-yellow)]">Slack</th>
                            <th className="p-3 font-medium border-b border-[var(--border-subtle)] text-center">Status</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-[var(--border-subtle)] text-sm">
                        {schedule.map((task: any) => (
                            <tr
                                key={task.id}
                                className={cn(
                                    "hover:bg-[var(--bg-tertiary)]/50 transition-colors",
                                    task.isCritical ? "bg-[var(--accent-red-subtle)]/10" : ""
                                )}
                            >
                                <td className="p-3 text-center font-mono font-bold">{task.id}</td>
                                <td className="p-3 text-[var(--text-secondary)]">{task.name}</td>
                                <td className="p-3 text-right font-mono">{task.duration}</td>
                                <td className="p-3 text-right font-mono text-[var(--accent-blue)]">{task.earliestStart}</td>
                                <td className="p-3 text-right font-mono text-[var(--accent-blue)]">{task.earliestFinish}</td>
                                <td className="p-3 text-right font-mono text-[var(--accent-purple)]">{task.latestStart}</td>
                                <td className="p-3 text-right font-mono text-[var(--accent-purple)]">{task.latestFinish}</td>
                                <td className="p-3 text-right font-mono text-[var(--accent-yellow)]">{task.slack}</td>
                                <td className="p-3 text-center">
                                    {task.isCritical ? (
                                        <span className="inline-flex items-center px-2 py-0.5 rounded textxs font-medium bg-[var(--accent-red)]/20 text-[var(--accent-red)] border border-[var(--accent-red)]/30">
                                            Critical
                                        </span>
                                    ) : (
                                        <span className="text-[var(--text-quaternary)] text-xs">–</span>
                                    )}
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
}

function PathResultView({ result, fullScreen }: { result: any, fullScreen: boolean }) {
    const { distances, path, pathDistance, hasNegativeCycle } = result;

    if (hasNegativeCycle) {
        return (
            <div className="p-4 flex flex-col items-center justify-center text-[var(--accent-red)] bg-red-500/10 h-full">
                <AlertTriangle className="w-8 h-8 mb-2" />
                <h3 className="font-bold">Negative Cycle Detected</h3>
                <p className="text-sm opacity-80 mt-1">Shortest path cannot be determined.</p>
            </div>
        );
    }

    // Convert distances object to array for sorting
    const distArray = Object.entries(distances || {}).map(([node, dist]) => ({
        node,
        dist
    })).sort((a: any, b: any) => {
        if (a.dist === b.dist) return a.node.localeCompare(b.node);
        return (a.dist as number) - (b.dist as number);
    });

    return (
        <div className="flex flex-col gap-4">
            {path && (
                <div className="p-4 bg-[var(--accent-cyan-subtle)] border-b border-[var(--accent-cyan)]/20">
                    <span className="text-xs text-[var(--text-secondary)] uppercase tracking-wide">Found Path</span>
                    <div className="flex items-center flex-wrap gap-2 mt-2">
                        {path.map((node: string, i: number) => (
                            <div key={i} className="flex items-center">
                                <span className={cn(
                                    "px-2 py-1 rounded font-mono font-bold text-sm",
                                    i === 0 ? "bg-[var(--accent-green)] text-black" :
                                        i === path.length - 1 ? "bg-[var(--accent-red)] text-white" :
                                            "bg-[var(--bg-base)] border border-[var(--accent-cyan)] text-[var(--accent-cyan)]"
                                )}>
                                    {node}
                                </span>
                                {i < path.length - 1 && <ArrowRight className="w-4 h-4 mx-1 text-[var(--text-tertiary)]" />}
                            </div>
                        ))}
                        <div className="ml-auto pl-4 border-l border-[var(--border-default)] flex flex-col items-end">
                            <span className="text-[10px] text-[var(--text-secondary)]">Total Distance</span>
                            <span className="font-mono text-lg font-bold text-[var(--accent-cyan)]">{pathDistance}</span>
                        </div>
                    </div>
                </div>
            )}

            <div className={cn("overflow-x-auto", fullScreen ? "h-full" : "max-h-[60vh]")}>
                <table className="w-full text-left border-collapse">
                    <thead className="bg-[var(--bg-tertiary)] text-[var(--text-secondary)] text-xs uppercase tracking-wider sticky top-0">
                        <tr>
                            <th className="p-3 font-medium border-b border-[var(--border-subtle)]">Node</th>
                            <th className="p-3 font-medium border-b border-[var(--border-subtle)] text-right">Distance</th>
                            <th className="p-3 font-medium border-b border-[var(--border-subtle)] text-center">Status</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-[var(--border-subtle)] text-sm">
                        {distArray.map(({ node, dist }: any) => {
                            const isMetric = path?.includes(node);
                            return (
                                <tr key={node} className={cn("hover:bg-[var(--bg-tertiary)]/50", isMetric && "bg-[var(--accent-cyan-subtle)]/10")}>
                                    <td className="p-3 font-mono font-semibold">{node}</td>
                                    <td className="p-3 text-right font-mono">{dist === 'Infinity' ? '∞' : dist}</td>
                                    <td className="p-3 text-center">
                                        {isMetric ? (
                                            <span className="inline-flex items-center gap-1 text-[var(--accent-cyan)] text-xs font-medium">
                                                <CheckCircle2 className="w-3 h-3" /> In Path
                                            </span>
                                        ) : (
                                            <span className="text-[var(--text-quaternary)] text-xs">-</span>
                                        )}
                                    </td>
                                </tr>
                            );
                        })}
                    </tbody>
                </table>
            </div>
        </div>
    );
}

function MSTResultView({ result, fullScreen }: { result: any, fullScreen: boolean }) {
    const { mstEdges, totalWeight } = result;

    if (!mstEdges) return <div>No MST data</div>;

    return (
        <div className="flex flex-col gap-4">
            <div className="p-4 bg-[var(--bg-secondary)] border-b border-[var(--border-subtle)] flex justify-between items-center">
                <span className="text-sm text-[var(--text-secondary)]">Total MST Weight</span>
                <span className="text-xl font-bold text-[var(--accent-green)] font-mono">{totalWeight}</span>
            </div>

            <div className={cn("overflow-x-auto", fullScreen ? "h-full" : "max-h-[60vh]")}>
                <table className="w-full text-left border-collapse">
                    <thead className="bg-[var(--bg-tertiary)] text-[var(--text-secondary)] text-xs uppercase tracking-wider sticky top-0">
                        <tr>
                            <th className="p-3 font-medium border-b border-[var(--border-subtle)]">From</th>
                            <th className="p-3 font-medium border-b border-[var(--border-subtle)]">To</th>
                            <th className="p-3 font-medium border-b border-[var(--border-subtle)] text-right">Weight</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-[var(--border-subtle)] text-sm">
                        {mstEdges.map((edge: any, i: number) => (
                            <tr key={i} className="hover:bg-[var(--bg-tertiary)]/50">
                                <td className="p-3 font-mono font-medium">{edge.from}</td>
                                <td className="p-3 font-mono font-medium">{edge.to}</td>
                                <td className="p-3 text-right font-mono text-[var(--accent-green)]">{edge.weight}</td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
}

function TraversalResultView({ result, fullScreen }: { result: any, fullScreen: boolean }) {
    const { visitOrder } = result;

    if (!visitOrder) return <div>No visit order data</div>;

    return (
        <div className={cn("p-4 flex flex-col gap-4", fullScreen ? "h-full overflow-auto" : "")}>
            <div className="text-sm text-[var(--text-secondary)] mb-2">Visit Order Sequence</div>
            <div className="flex flex-wrap items-center gap-3">
                {visitOrder.map((node: string, i: number) => (
                    <div key={i} className="flex items-center animate-fade-in" style={{ animationDelay: `${i * 50}ms` }}>
                        <div className="flex flex-col items-center">
                            <span className="w-8 h-8 rounded-full bg-[var(--bg-elevated)] border border-[var(--border-default)] flex items-center justify-center font-mono text-sm font-bold shadow-sm">
                                {node}
                            </span>
                            <span className="text-[10px] text-[var(--text-quaternary)] mt-1">#{i + 1}</span>
                        </div>
                        {i < visitOrder.length - 1 && (
                            <ArrowRight className="w-4 h-4 text-[var(--text-tertiary)] mx-1" />
                        )}
                    </div>
                ))}
            </div>
        </div>
    );
}
