/**
 * Steps panel showing algorithm execution steps.
 */
import { useEffect, useRef } from 'react';
import { useAppStore } from '../lib/store';
import { cn } from '../lib/utils';

export default function StepsPanel() {
    const { steps, playback, result, selectedAlgorithm } = useAppStore();
    const activeStepRef = useRef<HTMLDivElement>(null);

    // Auto-scroll to active step
    useEffect(() => {
        if (activeStepRef.current) {
            activeStepRef.current.scrollIntoView({ behavior: 'smooth', block: 'center' });
        }
    }, [playback.currentStepIndex]);

    if (steps.length === 0) {
        return (
            <div className="h-full flex flex-col p-6">
                <div className="pb-6 border-b border-[rgba(240,240,240,0.15)]">
                    <h2 className="text-xl font-bold text-[#f0f0f0]">
                        Algorithm Steps
                    </h2>
                </div>
                <div className="flex flex-col items-center justify-center text-center py-12 flex-1">
                    <div className="text-4xl mb-4">🔍</div>
                    <p className="text-[rgba(240,240,240,0.5)] text-sm max-w-[200px]">
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
        <div className="h-full flex flex-col p-6">
            {/* Header */}
            <div className="pb-6 border-b border-[rgba(240,240,240,0.15)]">
                <h2 className="text-xl font-bold text-[#f0f0f0] flex items-center gap-3">
                    <span>Algorithm Steps</span>
                    {selectedAlgorithm && (
                        <span className="text-sm font-medium px-3 py-1 rounded-md bg-[rgba(120,180,212,0.15)] text-[#78b4d4] border border-[rgba(120,180,212,0.3)]">
                            {selectedAlgorithm.toUpperCase()}
                        </span>
                    )}
                </h2>
            </div>

            {/* Steps list */}
            <div className="flex-1 overflow-y-auto space-y-3 pt-6">
                {steps.map((step, index) => {
                    const isActive = index === playback.currentStepIndex;
                    const isPast = index < playback.currentStepIndex;

                    return (
                        <div
                            key={index}
                            ref={isActive ? activeStepRef : null}
                            className={cn(
                                'step-item p-3 rounded-xl border transition-all duration-300',
                                isActive && 'active bg-[rgba(120,180,212,0.12)] border-[rgba(120,180,212,0.4)] shadow-lg',
                                isPast && 'opacity-50 bg-[rgba(240,240,240,0.03)] border-transparent',
                                !isActive && !isPast && 'opacity-30 border-transparent hover:opacity-50'
                            )}
                            style={{
                                animationDelay: `${index * 30}ms`
                            }}
                        >
                            <div className="flex items-start gap-3">
                                <span className="text-lg shrink-0">{getStepIcon(step.type)}</span>
                                <div className="flex-1 min-w-0">
                                    <div className="text-sm font-medium text-[#f0f0f0] leading-snug">
                                        {step.description}
                                    </div>
                                    {step.data && Object.keys(step.data).length > 0 && (
                                        <div className="text-xs text-[rgba(240,240,240,0.7)] mt-1.5 flex flex-wrap gap-x-2 gap-y-1">
                                            {Object.entries(step.data).map(([key, value]) => (
                                                <span key={key} className="inline-flex items-center gap-1">
                                                    <span className="text-[rgba(240,240,240,0.5)]">{key}:</span>
                                                    <span className="font-mono">{JSON.stringify(value)}</span>
                                                </span>
                                            ))}
                                        </div>
                                    )}
                                </div>
                                <span className="text-[10px] font-medium text-[rgba(240,240,240,0.5)] tabular-nums shrink-0">
                                    #{index + 1}
                                </span>
                            </div>
                        </div>
                    );
                })}

                {/* Result summary */}
                {result && playback.currentStepIndex >= steps.length - 1 && (
                    <div className="mt-4 p-4 rounded-xl bg-[rgba(155,206,143,0.12)] border border-[rgba(155,206,143,0.3)] animate-scale-in">
                        <h4 className="font-semibold text-sm text-[#9bce8f] mb-2 flex items-center gap-2">
                            <span>✨</span>
                            <span>Result</span>
                        </h4>
                        <pre className="text-xs text-[#f0f0f0] overflow-x-auto font-mono leading-relaxed">
                            {JSON.stringify(result, null, 2)}
                        </pre>
                    </div>
                )}
            </div>
        </div>
    );
}

