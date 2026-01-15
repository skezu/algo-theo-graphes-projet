/**
 * Zustand store for application state management.
 */
import { create } from 'zustand';
import type { Node, Edge } from '@xyflow/react';
import type { AlgorithmStep, AlgorithmName } from '../services/api';

interface PlaybackState {
    isPlaying: boolean;
    currentStepIndex: number;
    speed: number; // ms per step
}

interface AppState {
    // Graph data
    nodes: Node[];
    edges: Edge[];
    availableNodes: string[];
    isGraphLoaded: boolean;

    // Algorithm state
    selectedAlgorithm: AlgorithmName | null;
    startNode: string;
    endNode: string;
    steps: AlgorithmStep[];
    result: Record<string, unknown> | null;

    // Playback
    playback: PlaybackState;

    // Visualization state
    visitedNodes: Set<string>;
    currentNode: string | null;
    exploredEdges: Set<string>;
    pathEdges: Set<string>;
    mstEdges: Set<string>;

    // Actions
    setNodes: (nodes: Node[]) => void;
    setEdges: (edges: Edge[]) => void;
    setAvailableNodes: (nodes: string[]) => void;
    setGraphLoaded: (loaded: boolean) => void;
    setSelectedAlgorithm: (algo: AlgorithmName | null) => void;
    setStartNode: (node: string) => void;
    setEndNode: (node: string) => void;
    setAlgorithmResult: (steps: AlgorithmStep[], result: Record<string, unknown>) => void;

    // Playback actions
    play: () => void;
    pause: () => void;
    reset: () => void;
    nextStep: () => void;
    prevStep: () => void;
    goToStep: (index: number) => void;
    setSpeed: (speed: number) => void;

    // Visualization actions
    applyStep: (step: AlgorithmStep) => void;
    clearVisualization: () => void;
}

export const useAppStore = create<AppState>((set, get) => ({
    // Initial state
    nodes: [],
    edges: [],
    availableNodes: [],
    isGraphLoaded: false,

    selectedAlgorithm: null,
    startNode: '',
    endNode: '',
    steps: [],
    result: null,

    playback: {
        isPlaying: false,
        currentStepIndex: -1,
        speed: 500,
    },

    visitedNodes: new Set(),
    currentNode: null,
    exploredEdges: new Set(),
    pathEdges: new Set(),
    mstEdges: new Set(),

    // Actions
    setNodes: (nodes) => set({ nodes }),
    setEdges: (edges) => set({ edges }),
    setAvailableNodes: (availableNodes) => set({ availableNodes }),
    setGraphLoaded: (isGraphLoaded) => set({ isGraphLoaded }),
    setSelectedAlgorithm: (selectedAlgorithm) => set({ selectedAlgorithm }),
    setStartNode: (startNode) => set({ startNode }),
    setEndNode: (endNode) => set({ endNode }),

    setAlgorithmResult: (steps, result) => set({
        steps,
        result,
        playback: { ...get().playback, currentStepIndex: -1 },
    }),

    // Playback actions
    play: () => set((state) => ({
        playback: { ...state.playback, isPlaying: true }
    })),

    pause: () => set((state) => ({
        playback: { ...state.playback, isPlaying: false }
    })),

    reset: () => {
        get().clearVisualization();
        set((state) => ({
            playback: { ...state.playback, currentStepIndex: -1, isPlaying: false }
        }));
    },

    nextStep: () => {
        const { steps, playback } = get();
        if (playback.currentStepIndex < steps.length - 1) {
            const nextIndex = playback.currentStepIndex + 1;
            const step = steps[nextIndex];
            get().applyStep(step);
            set({ playback: { ...playback, currentStepIndex: nextIndex } });
        } else {
            set({ playback: { ...playback, isPlaying: false } });
        }
    },

    prevStep: () => {
        const { playback } = get();
        if (playback.currentStepIndex > 0) {
            // Re-apply all steps up to the previous one
            get().clearVisualization();
            const { steps } = get();
            for (let i = 0; i < playback.currentStepIndex - 1; i++) {
                get().applyStep(steps[i]);
            }
            if (playback.currentStepIndex > 1) {
                get().applyStep(steps[playback.currentStepIndex - 2]);
            }
            set({ playback: { ...playback, currentStepIndex: playback.currentStepIndex - 1 } });
        }
    },

    goToStep: (index) => {
        get().clearVisualization();
        const { steps } = get();
        for (let i = 0; i <= index; i++) {
            get().applyStep(steps[i]);
        }
        set((state) => ({
            playback: { ...state.playback, currentStepIndex: index, isPlaying: false }
        }));
    },

    setSpeed: (speed) => set((state) => ({
        playback: { ...state.playback, speed }
    })),

    // Visualization actions
    applyStep: (step) => {
        set((state) => {
            const newState = { ...state };

            switch (step.type) {
                case 'visit_node':
                    newState.visitedNodes = new Set(state.visitedNodes).add(step.targetId);
                    newState.currentNode = step.targetId;
                    break;

                case 'explore_edge':
                    newState.exploredEdges = new Set(state.exploredEdges).add(step.targetId);
                    // Also add reverse edge for undirected graphs
                    const [source, target] = step.targetId.split('-');
                    newState.exploredEdges.add(`${target}-${source}`);
                    break;

                case 'update_distance':
                    newState.visitedNodes = new Set(state.visitedNodes).add(step.targetId);
                    break;

                case 'found_path':
                    if (step.data?.path && Array.isArray(step.data.path)) {
                        const path = step.data.path as string[];
                        for (let i = 0; i < path.length - 1; i++) {
                            newState.pathEdges = new Set(state.pathEdges);
                            newState.pathEdges.add(`${path[i]}-${path[i + 1]}`);
                            newState.pathEdges.add(`${path[i + 1]}-${path[i]}`);
                        }
                    }
                    break;

                case 'add_edge':
                    newState.mstEdges = new Set(state.mstEdges).add(step.targetId);
                    // Also add reverse edge for undirected graphs
                    const [u, v] = step.targetId.split('-');
                    newState.mstEdges.add(`${v}-${u}`);
                    break;
            }

            return newState;
        });
    },

    clearVisualization: () => set({
        visitedNodes: new Set(),
        currentNode: null,
        exploredEdges: new Set(),
        pathEdges: new Set(),
        mstEdges: new Set(),
    }),
}));
