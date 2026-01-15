/**
 * Main App component.
 */
import { useEffect } from 'react';
import GraphCanvas from './components/GraphCanvas';
import ControlPanel from './components/ControlPanel';
import StepsPanel from './components/StepsPanel';
import { useAppStore } from './lib/store';

export default function App() {
    const { playback, nextStep, steps } = useAppStore();

    // Auto-play effect
    useEffect(() => {
        if (!playback.isPlaying) return;

        const timer = setInterval(() => {
            const state = useAppStore.getState();
            if (state.playback.currentStepIndex < state.steps.length - 1) {
                nextStep();
            } else {
                useAppStore.getState().pause();
            }
        }, playback.speed);

        return () => clearInterval(timer);
    }, [playback.isPlaying, playback.speed, nextStep, steps.length]);

    return (
        <div className="h-screen w-screen flex dark bg-[hsl(224,71%,4%)] overflow-hidden">
            {/* Left Sidebar - Controls */}
            <aside className="w-80 min-w-80 border-r border-[hsl(223,47%,14%)] bg-[hsl(224,71%,5%)]/80 backdrop-blur-xl animate-slide-left">
                <div className="p-5 border-b border-[hsl(223,47%,14%)] sidebar-header">
                    <h1 className="text-xl font-bold text-gradient tracking-tight">
                        Graph Algorithms
                    </h1>
                    <p className="text-sm text-[hsl(215,20%,55%)] mt-0.5">Interactive Visualizer</p>
                </div>
                <ControlPanel />
            </aside>

            {/* Main Canvas */}
            <main className="flex-1 relative bg-[hsl(224,71%,4%)] animate-fade-in">
                <GraphCanvas />
            </main>

            {/* Right Sidebar - Steps */}
            <aside className="w-96 min-w-96 border-l border-[hsl(223,47%,14%)] bg-[hsl(224,71%,5%)]/80 backdrop-blur-xl p-4 animate-slide-right">
                <StepsPanel />
            </aside>
        </div>
    );
}

