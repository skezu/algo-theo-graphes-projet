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
                <CardHeader>
                    <CardTitle className="text-lg">Algorithm Steps</CardTitle>
                </CardHeader>
                <CardContent className="text-center text-muted-foreground">
                    <p>Run an algorithm to see the execution steps here.</p>
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
            <CardHeader className="pb-3">
                <CardTitle className="text-lg">
                    Algorithm Steps ({selectedAlgorithm?.toUpperCase()})
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
                                'p-3 rounded-lg border transition-all duration-300',
                                isActive && 'bg-primary/20 border-primary shadow-lg scale-[1.02]',
                                isPast && 'opacity-60 bg-muted/50',
                                !isActive && !isPast && 'opacity-40 border-transparent'
                            )}
                        >
                            <div className="flex items-start gap-2">
                                <span className="text-lg">{getStepIcon(step.type)}</span>
                                <div className="flex-1 min-w-0">
                                    <div className="text-sm font-medium">{step.description}</div>
                                    {step.data && Object.keys(step.data).length > 0 && (
                                        <div className="text-xs text-muted-foreground mt-1">
                                            {Object.entries(step.data).map(([key, value]) => (
                                                <span key={key} className="mr-2">
                                                    {key}: {JSON.stringify(value)}
                                                </span>
                                            ))}
                                        </div>
                                    )}
                                </div>
                                <span className="text-xs text-muted-foreground">#{index + 1}</span>
                            </div>
                        </div>
                    );
                })}

                {/* Result summary */}
                {result && playback.currentStepIndex >= steps.length - 1 && (
                    <div className="mt-4 p-4 rounded-lg bg-primary/10 border border-primary">
                        <h4 className="font-semibold mb-2">Result</h4>
                        <pre className="text-xs overflow-x-auto">
                            {JSON.stringify(result, null, 2)}
                        </pre>
                    </div>
                )}
            </CardContent>
        </Card>
    );
}
