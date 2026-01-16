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
        <div className="h-screen w-screen flex bg-[#1a1a1a] overflow-hidden">
            {/* Left Sidebar - Controls */}
            <aside className="w-80 min-w-80 border-r border-[rgba(240,240,240,0.1)] bg-[#1a1a1a] animate-fade-in">
                <div className="p-5 border-b border-[rgba(240,240,240,0.15)]">
                    <h1 className="text-xl font-bold text-[#f0f0f0] tracking-tight">
                        Graph Algorithms
                    </h1>
                    <p className="text-sm text-[rgba(240,240,240,0.6)] mt-0.5">Interactive Visualizer</p>
                </div>
                <ControlPanel />
            </aside>

            {/* Main Canvas */}
            <main className="flex-1 relative bg-[#1a1a1a] animate-fade-in">
                <GraphCanvas />
            </main>

            {/* Right Sidebar - Steps */}
            <aside className="w-96 min-w-96 border-l border-[rgba(240,240,240,0.1)] bg-[#1a1a1a] p-4 animate-fade-in">
                <StepsPanel />
            </aside>
        </div>
    );
}

