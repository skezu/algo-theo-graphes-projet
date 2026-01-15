/**
 * Steps panel showing algorithm execution steps.
 */
import { useEffect, useRef } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
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
            <Card className="glass-panel h-full">
                <CardHeader className="pb-4">
                    <CardTitle className="text-lg font-semibold text-[hsl(213,31%,91%)]">
                        Algorithm Steps
                    </CardTitle>
                </CardHeader>
                <CardContent className="flex flex-col items-center justify-center text-center py-12">
                    <div className="text-4xl mb-4 animate-float">🔍</div>
                    <p className="text-[hsl(215,20%,65%)] text-sm max-w-[200px]">
                        Run an algorithm to see the execution steps here.
                    </p>
                </CardContent>
            </Card>
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
        <Card className="glass-panel h-full flex flex-col">
            <CardHeader className="pb-3 shrink-0">
                <CardTitle className="text-lg font-semibold text-[hsl(213,31%,91%)] flex items-center gap-2">
                    <span>Algorithm Steps</span>
                    {selectedAlgorithm && (
                        <span className="text-xs font-medium px-2 py-0.5 rounded-full bg-[hsl(231,97%,66%)]/20 text-[hsl(231,97%,76%)] border border-[hsl(231,97%,66%)]/30">
                            {selectedAlgorithm.toUpperCase()}
                        </span>
                    )}
                </CardTitle>
            </CardHeader>
            <CardContent className="flex-1 overflow-y-auto space-y-2 pr-2">
                {steps.map((step, index) => {
                    const isActive = index === playback.currentStepIndex;
                    const isPast = index < playback.currentStepIndex;

                    return (
                        <div
                            key={index}
                            ref={isActive ? activeStepRef : null}
                            className={cn(
                                'step-item p-3 rounded-xl border transition-all duration-300',
                                isActive && 'active bg-[hsl(231,97%,66%)]/15 border-[hsl(231,97%,66%)]/40 shadow-lg',
                                isPast && 'opacity-50 bg-[hsl(223,47%,11%)]/50 border-transparent',
                                !isActive && !isPast && 'opacity-30 border-transparent hover:opacity-50'
                            )}
                            style={{
                                animationDelay: `${index * 30}ms`
                            }}
                        >
                            <div className="flex items-start gap-3">
                                <span className="text-lg shrink-0">{getStepIcon(step.type)}</span>
                                <div className="flex-1 min-w-0">
                                    <div className="text-sm font-medium text-[hsl(213,31%,91%)] leading-snug">
                                        {step.description}
                                    </div>
                                    {step.data && Object.keys(step.data).length > 0 && (
                                        <div className="text-xs text-[hsl(215,20%,55%)] mt-1.5 flex flex-wrap gap-x-2 gap-y-1">
                                            {Object.entries(step.data).map(([key, value]) => (
                                                <span key={key} className="inline-flex items-center gap-1">
                                                    <span className="text-[hsl(215,20%,45%)]">{key}:</span>
                                                    <span className="font-mono">{JSON.stringify(value)}</span>
                                                </span>
                                            ))}
                                        </div>
                                    )}
                                </div>
                                <span className="text-[10px] font-medium text-[hsl(215,20%,45%)] tabular-nums shrink-0">
                                    #{index + 1}
                                </span>
                            </div>
                        </div>
                    );
                })}

                {/* Result summary */}
                {result && playback.currentStepIndex >= steps.length - 1 && (
                    <div className="mt-4 p-4 rounded-xl bg-[hsl(158,64%,52%)]/10 border border-[hsl(158,64%,52%)]/30 animate-scale-in">
                        <h4 className="font-semibold text-sm text-[hsl(158,64%,72%)] mb-2 flex items-center gap-2">
                            <span>✨</span>
                            <span>Result</span>
                        </h4>
                        <pre className="text-xs text-[hsl(213,31%,91%)] overflow-x-auto font-mono leading-relaxed">
                            {JSON.stringify(result, null, 2)}
                        </pre>
                    </div>
                )}
            </CardContent>
        </Card>
    );
}

