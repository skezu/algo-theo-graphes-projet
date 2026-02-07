/**
 * Main App component.
 */
import { useEffect, useState } from 'react';
import GraphCanvas from './components/GraphCanvas';
import ControlPanel from './components/ControlPanel';
import StepsPanel from './components/StepsPanel';
import AlgorithmCodePanel from './components/AlgorithmCodePanel';
import { useAppStore } from './lib/store';
import { ChevronDown, ChevronUp, Code2, ListOrdered } from 'lucide-react';

export default function App() {
    const { playback, nextStep, steps } = useAppStore();
    const [isCodeCollapsed, setIsCodeCollapsed] = useState(false);
    const [isStepsCollapsed, setIsStepsCollapsed] = useState(false);

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
    }, [playback.isPlaying, playback.speed, nextStep, steps?.length]);

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

            {/* Right Sidebar - Algorithm Code + Steps */}
            <aside
                className="w-[400px] min-w-[400px] flex flex-col animate-fade-in"
                style={{
                    background: 'var(--bg-elevated)',
                    borderLeft: '1px solid var(--border-subtle)'
                }}
            >
                {/* Top Section - Algorithm Code */}
                <div
                    className="flex flex-col transition-all duration-300 ease-out"
                    style={{
                        flex: isCodeCollapsed ? '0 0 auto' : (isStepsCollapsed ? '1 1 auto' : '0 0 40%'),
                        minHeight: isCodeCollapsed ? 'auto' : '48px',
                        borderBottom: '1px solid var(--border-default)',
                        overflow: 'hidden',
                    }}
                >
                    {/* Collapsible Header */}
                    <button
                        onClick={() => setIsCodeCollapsed(!isCodeCollapsed)}
                        className="w-full px-6 py-3 flex items-center justify-between shrink-0 hover:bg-[var(--bg-secondary)] transition-colors"
                        style={{ borderBottom: isCodeCollapsed ? 'none' : '1px solid var(--border-subtle)' }}
                    >
                        <h2
                            className="text-sm font-semibold flex items-center gap-2"
                            style={{ color: 'var(--text-primary)' }}
                        >
                            <Code2 className="w-4 h-4" style={{ color: 'var(--accent-purple)' }} />
                            Algorithm
                        </h2>
                        <div className="flex items-center gap-2">
                            {isCodeCollapsed ? (
                                <ChevronDown className="w-4 h-4" style={{ color: 'var(--text-tertiary)' }} />
                            ) : (
                                <ChevronUp className="w-4 h-4" style={{ color: 'var(--text-tertiary)' }} />
                            )}
                        </div>
                    </button>

                    {/* Content */}
                    {!isCodeCollapsed && (
                        <div className="flex-1 min-h-0 overflow-hidden">
                            <AlgorithmCodePanel hideHeader />
                        </div>
                    )}
                </div>

                {/* Bottom Section - Execution Steps */}
                <div
                    className="flex flex-col transition-all duration-300 ease-out"
                    style={{
                        flex: isStepsCollapsed ? '0 0 auto' : '1 1 auto',
                        minHeight: isStepsCollapsed ? 'auto' : '48px',
                        overflow: 'hidden',
                    }}
                >
                    {/* Collapsible Header */}
                    <button
                        onClick={() => setIsStepsCollapsed(!isStepsCollapsed)}
                        className="w-full px-6 py-3 flex items-center justify-between shrink-0 hover:bg-[var(--bg-secondary)] transition-colors"
                        style={{ borderBottom: isStepsCollapsed ? 'none' : '1px solid var(--border-subtle)' }}
                    >
                        <h2
                            className="text-sm font-semibold flex items-center gap-2"
                            style={{ color: 'var(--text-primary)' }}
                        >
                            <ListOrdered className="w-4 h-4" style={{ color: 'var(--accent-cyan)' }} />
                            Execution Steps
                            {steps.length > 0 && (
                                <span
                                    className="text-[10px] font-medium px-1.5 py-0.5 rounded"
                                    style={{
                                        background: 'var(--accent-cyan-subtle)',
                                        color: 'var(--accent-cyan)'
                                    }}
                                >
                                    {steps.length}
                                </span>
                            )}
                        </h2>
                        <div className="flex items-center gap-2">
                            {isStepsCollapsed ? (
                                <ChevronDown className="w-4 h-4" style={{ color: 'var(--text-tertiary)' }} />
                            ) : (
                                <ChevronUp className="w-4 h-4" style={{ color: 'var(--text-tertiary)' }} />
                            )}
                        </div>
                    </button>

                    {/* Content */}
                    {!isStepsCollapsed && (
                        <div className="flex-1 min-h-0 overflow-hidden">
                            <StepsPanel hideHeader />
                        </div>
                    )}
                </div>
            </aside>
        </div>
    );
}

