/**
 * Steps panel showing algorithm execution steps.
 */
import { useEffect, useRef } from 'react';
import { useAppStore } from '../lib/store';
import { cn } from '../lib/utils';
import { ListOrdered, Search } from 'lucide-react';

export default function StepsPanel() {
    const { steps, playback, result, selectedAlgorithm } = useAppStore();
    const activeStepRef = useRef<HTMLDivElement>(null);

    // Auto-scroll to active step
    useEffect(() => {
        if (activeStepRef.current) {
            activeStepRef.current.scrollIntoView({ behavior: 'smooth', block: 'center' });
        }
    }, [playback.currentStepIndex]);

    if (!steps || steps.length === 0) {
        return (
            <div className="h-full flex flex-col">
                {/* Header */}
                <div
                    className="px-6 py-5"
                    style={{ borderBottom: '1px solid var(--border-subtle)' }}
                >
                    <h2
                        className="text-lg font-semibold flex items-center gap-2"
                        style={{ color: 'var(--text-primary)' }}
                    >
                        <ListOrdered className="w-5 h-5" style={{ color: 'var(--accent-cyan)' }} />
                        Algorithm Steps
                    </h2>
                </div>

                {/* Empty State */}
                <div className="flex flex-col items-center justify-center text-center flex-1 px-6">
                    <div
                        className="w-16 h-16 rounded-2xl flex items-center justify-center mb-4 animate-float"
                        style={{
                            background: 'linear-gradient(135deg, var(--bg-secondary) 0%, var(--bg-tertiary) 100%)',
                            border: '1px solid var(--border-default)'
                        }}
                    >
                        <Search className="w-7 h-7" style={{ color: 'var(--text-tertiary)' }} />
                    </div>
                    <p
                        className="text-sm max-w-[220px] leading-relaxed"
                        style={{ color: 'var(--text-tertiary)' }}
                    >
                        Run an algorithm to see the execution steps here.
                    </p>
                </div>
            </div>
        );
    }

    const getStepIcon = (type: string) => {
        switch (type) {
            case 'init': return '🚀';
            case 'visit_node': return '📍';
            case 'explore_edge': return '🔗';
            case 'update_distance': return '📏';
            case 'found_path': return '🎯';
            case 'add_edge': return '✅';
            case 'skip_edge': return '⏭️';
            case 'enqueue': return '📥';
            case 'push_stack': return '📚';
            case 'iteration': return '🔄';
            case 'complete': return '🏁';
            default: return '•';
        }
    };

    return (
        <div className="h-full flex flex-col">
            {/* Header */}
            <div
                className="px-6 py-5 flex items-center justify-between"
                style={{ borderBottom: '1px solid var(--border-subtle)' }}
            >
                <h2
                    className="text-lg font-semibold flex items-center gap-2"
                    style={{ color: 'var(--text-primary)' }}
                >
                    <ListOrdered className="w-5 h-5" style={{ color: 'var(--accent-cyan)' }} />
                    Algorithm Steps
                </h2>
                {selectedAlgorithm && (
                    <span className="badge badge-cyan uppercase text-xs font-medium tracking-wide">
                        {selectedAlgorithm}
                    </span>
                )}
            </div>

            {/* Steps list */}
            <div className="flex-1 overflow-y-auto px-4 py-4 space-y-2">
                {steps.map((step, index) => {
                    const isActive = index === playback.currentStepIndex;
                    const isPast = index < playback.currentStepIndex;

                    return (
                        <div
                            key={index}
                            ref={isActive ? activeStepRef : null}
                            className={cn(
                                'step-item',
                                isActive && 'active',
                                isPast && 'past',
                                !isActive && !isPast && 'opacity-40 hover:opacity-60'
                            )}
                            style={{
                                animationDelay: `${index * 20}ms`
                            }}
                        >
                            <div className="flex items-start gap-3">
                                <span className="text-base shrink-0">{getStepIcon(step.type)}</span>
                                <div className="flex-1 min-w-0">
                                    <div
                                        className="text-sm font-medium leading-snug"
                                        style={{ color: 'var(--text-primary)' }}
                                    >
                                        {step.description}
                                    </div>
                                    {step.data && Object.keys(step.data).length > 0 && (
                                        <div
                                            className="text-xs mt-1.5 flex flex-wrap gap-x-2 gap-y-1"
                                            style={{ color: 'var(--text-secondary)' }}
                                        >
                                            {Object.entries(step.data).map(([key, value]) => (
                                                <span key={key} className="inline-flex items-center gap-1">
                                                    <span style={{ color: 'var(--text-tertiary)' }}>{key}:</span>
                                                    <span className="font-mono">{JSON.stringify(value)}</span>
                                                </span>
                                            ))}
                                        </div>
                                    )}
                                </div>
                                <span
                                    className="text-[10px] font-medium tabular-nums shrink-0 px-1.5 py-0.5 rounded"
                                    style={{
                                        color: 'var(--text-quaternary)',
                                        background: isActive ? 'var(--accent-cyan-subtle)' : 'transparent'
                                    }}
                                >
                                    #{index + 1}
                                </span>
                            </div>
                        </div>
                    );
                })}

                {/* Result summary */}
                {result && playback.currentStepIndex >= steps.length - 1 && (
                    <div className="result-card mt-4 animate-scale-in">
                        <h4 className="result-card-title">
                            <span>✨</span>
                            <span>Result</span>
                        </h4>
                        <pre
                            className="text-xs overflow-x-auto font-mono leading-relaxed"
                            style={{ color: 'var(--text-primary)' }}
                        >
                            {JSON.stringify(result, null, 2)}
                        </pre>
                    </div>
                )}
            </div>
        </div>
    );
}
