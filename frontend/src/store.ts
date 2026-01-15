import { create } from 'zustand';
import { Node, Edge } from '@xyflow/react';
import { api } from './services/api';
import { TraceStep } from './types';

interface AppState {
    nodes: Node[];
    edges: Edge[];
    trace: TraceStep[];
    currentStepIndex: number;
    algorithmState: 'idle' | 'running' | 'paused' | 'completed';
    logs: string[];

    fetchGraph: () => Promise<void>;
    runAlgorithm: (algo: string, start: string, end?: string) => Promise<void>;
    nextStep: () => void;
    prevStep: () => void;
    jumpToStep: (index: number) => void;
    reset: () => void;
    setAlgorithmState: (state: 'idle' | 'running' | 'paused' | 'completed') => void;
}

export const useStore = create<AppState>((set, get) => ({
    nodes: [],
    edges: [],
    trace: [],
    currentStepIndex: -1,
    algorithmState: 'idle',
    logs: [],

    fetchGraph: async () => {
        try {
            const data = await api.getGraph();
            const nodes: Node[] = data.nodes.map(n => ({
                id: n.id,
                position: { x: n.x, y: n.y },
                data: { label: n.label },
                type: 'default', // Using default node type for now
            }));
            const edges: Edge[] = data.edges.map(e => ({
                id: e.id,
                source: e.source,
                target: e.target,
                label: e.weight.toString(),
            }));
            set({ nodes, edges, trace: [], logs: [], currentStepIndex: -1, algorithmState: 'idle' });
        } catch (err) {
            console.error("Failed to fetch graph", err);
        }
    },

    runAlgorithm: async (algo, start, end) => {
        // Reset execution state but keep graph
        set({ algorithmState: 'running', trace: [], currentStepIndex: -1, logs: [] });
        try {
            const trace = await api.runAlgorithm(algo, start, end);
            set({ trace, algorithmState: 'paused' }); // Start paused so user can play
        } catch (e) {
            console.error(e);
            set({ algorithmState: 'idle' });
        }
    },

    nextStep: () => {
        const { trace, currentStepIndex } = get();
        if (currentStepIndex < trace.length - 1) {
            set({ currentStepIndex: currentStepIndex + 1 });
        } else {
            set({ algorithmState: 'completed' });
        }
    },

    prevStep: () => {
        const { currentStepIndex } = get();
        if (currentStepIndex > -1) {
            set({ currentStepIndex: currentStepIndex - 1 });
        }
    },

    jumpToStep: (index) => {
        set({ currentStepIndex: index });
    },

    reset: () => {
        set({ currentStepIndex: -1, algorithmState: 'idle' });
    },

    setAlgorithmState: (state) => set({ algorithmState: state }),
}));
