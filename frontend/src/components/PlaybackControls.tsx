import { useEffect } from 'react';
import { useStore } from '../store';
import { Button } from '@/components/ui/button';
import { Slider } from '@/components/ui/slider';
import { Play, Pause, SkipBack, SkipForward, RotateCcw } from 'lucide-react';

export const PlaybackControls = () => {
    const {
        trace, currentStepIndex, algorithmState,
        nextStep, prevStep, setAlgorithmState, jumpToStep, reset
    } = useStore();

    // Auto-play logic
    useEffect(() => {
        let interval: ReturnType<typeof setInterval>;
        if (algorithmState === 'running') {
            interval = setInterval(() => {
                nextStep();
            }, 800); // 800ms per step
        }
        return () => clearInterval(interval);
    }, [algorithmState, nextStep]);

    // If we reach end, pause
    useEffect(() => {
        if (trace.length > 0 && currentStepIndex >= trace.length - 1 && algorithmState === 'running') {
            setAlgorithmState('completed');
        }
    }, [currentStepIndex, trace.length, algorithmState, setAlgorithmState]);

    if (trace.length === 0) return null;

    const togglePlay = () => {
        if (algorithmState === 'running') setAlgorithmState('paused');
        else if (algorithmState === 'completed') {
            jumpToStep(0);
            setAlgorithmState('running');
        } else {
            setAlgorithmState('running');
        }
    };

    return (
        <div className="fixed bottom-8 left-1/2 -translate-x-1/2 bg-white/90 dark:bg-slate-900/90 backdrop-blur border p-4 rounded-xl shadow-xl flex flex-col gap-4 w-[500px] max-w-[90vw] z-30">
            <div className="flex items-center gap-2 justify-center">
                <Button variant="outline" size="icon" onClick={() => { reset(); jumpToStep(-1); }}><RotateCcw className="w-4 h-4" /></Button>
                <Button variant="outline" size="icon" onClick={prevStep} disabled={currentStepIndex <= -1}><SkipBack className="w-4 h-4" /></Button>
                <Button size="icon" onClick={togglePlay}>
                    {algorithmState === 'running' ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
                </Button>
                <Button variant="outline" size="icon" onClick={nextStep} disabled={currentStepIndex >= trace.length - 1}><SkipForward className="w-4 h-4" /></Button>
            </div>

            <div className="flex items-center gap-2 px-2">
                <span className="text-xs text-muted-foreground w-12 text-right">{currentStepIndex + 1}</span>
                <Slider
                    value={[currentStepIndex]}
                    max={trace.length - 1}
                    min={-1}
                    step={1}
                    onValueChange={(vals: number[]) => jumpToStep(vals[0])}
                    className="flex-1"
                />
                <span className="text-xs text-muted-foreground w-12 text-left">{trace.length}</span>
            </div>

            {/* Current action log */}
            <div className="text-center text-sm font-medium text-slate-700 dark:text-slate-300 h-6 overflow-hidden text-ellipsis whitespace-nowrap">
                {trace[currentStepIndex]?.description || "Ready"}
            </div>
        </div>
    );
}
