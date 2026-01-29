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
        <div className="h-screen w-screen flex bg-[var(--bg-base)] overflow-hidden">
            {/* Left Sidebar - Controls */}
            <aside
                className="w-80 min-w-80 flex flex-col animate-fade-in"
                style={{
                    background: 'var(--bg-elevated)',
                    borderRight: '1px solid var(--border-subtle)'
                }}
            >
                {/* Header */}
                <div
                    className="px-6 py-5"
                // style={{ borderBottom: '1px solid var(--border-subtle)' }}
                >
                    <h1
                        className="text-xl font-bold tracking-tight"
                        style={{
                            background: 'linear-gradient(135deg, var(--text-primary) 0%, var(--text-secondary) 100%)',
                            WebkitBackgroundClip: 'text',
                            WebkitTextFillColor: 'transparent',
                            backgroundClip: 'text'
                        }}
                    >
                        Graph Algorithms
                    </h1>
                    <p
                        className="text-sm mt-0.5"
                        style={{ color: 'var(--text-tertiary)' }}
                    >
                        Interactive Visualizer
                    </p>
                </div>
                <ControlPanel />
            </aside>

            {/* Main Canvas */}
            <main
                className="flex-1 relative animate-fade-in"
                style={{ background: 'var(--bg-base)' }}
            >
                <GraphCanvas />
            </main>

            {/* Right Sidebar - Steps */}
            <aside
                className="w-[400px] min-w-[400px] flex flex-col animate-fade-in"
                style={{
                    background: 'var(--bg-elevated)',
                    borderLeft: '1px solid var(--border-subtle)'
                }}
            >
                <StepsPanel />
            </aside>
        </div>
    );
}
