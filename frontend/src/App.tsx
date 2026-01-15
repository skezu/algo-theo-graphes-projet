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
        <div className="h-screen w-screen flex bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 overflow-hidden">
            {/* Left Sidebar - Controls */}
            <aside className="w-80 min-w-80 border-r border-slate-700 bg-slate-900/50 backdrop-blur-sm">
                <div className="p-4 border-b border-slate-700">
                    <h1 className="text-xl font-bold text-white">
                        Graph Algorithms
                    </h1>
                    <p className="text-sm text-slate-400">Visualizer</p>
                </div>
                <ControlPanel />
            </aside>

            {/* Main Canvas */}
            <main className="flex-1 relative">
                <GraphCanvas />
            </main>

            {/* Right Sidebar - Steps */}
            <aside className="w-96 min-w-96 border-l border-slate-700 bg-slate-900/50 backdrop-blur-sm p-4">
                <StepsPanel />
            </aside>
        </div>
    );
}
