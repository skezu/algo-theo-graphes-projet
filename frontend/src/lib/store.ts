/**
 * Zustand store for application state management.
 */
import { create } from 'zustand';
import type { Node, Edge } from '@xyflow/react';
import type { AlgorithmStep, AlgorithmName } from '../services/api';
import { applyAutoLayout } from './layoutUtils';

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

    // PERT state
    pertTasks: PertTask[];
    setPertTasks: (tasks: PertTask[]) => void;
}

export interface PertTask {
    id: string;
    name: string;
    duration: number;
    predecessors: string[];
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


    // ... (imports remain)

    setGraphLoaded: (isGraphLoaded) => {
        if (isGraphLoaded) {
            const { nodes, edges } = get();
            const { nodes: layoutedNodes, edges: layoutedEdges } = applyAutoLayout(nodes, edges);
            set({ isGraphLoaded, nodes: layoutedNodes, edges: layoutedEdges });
        } else {
            set({ isGraphLoaded });
        }
    },
    setSelectedAlgorithm: (selectedAlgorithm) => set({ selectedAlgorithm }),
    setStartNode: (startNode) => set({ startNode }),
    setEndNode: (endNode) => set({ endNode }),

    setAlgorithmResult: (steps, result) => set({
        steps: steps || [],
        result: result || {},
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
                        const newPathEdges = new Set(state.pathEdges);
                        for (let i = 0; i < path.length - 1; i++) {
                            newPathEdges.add(`${path[i]}-${path[i + 1]}`);
                            newPathEdges.add(`${path[i + 1]}-${path[i]}`);
                        }
                        newState.pathEdges = newPathEdges;
                    }
                    break;

                case 'add_edge':
                    newState.mstEdges = new Set(state.mstEdges).add(step.targetId);
                    // Also add reverse edge for undirected graphs
                    const [u, v] = step.targetId.split('-');
                    newState.mstEdges.add(`${v}-${u}`);
                    break;

                // PERT Specific Steps
                case 'visit_node':
                    // Reuse visit_node for highlighting current event being evaluated
                    const { eet: visitEet } = step.data || {};
                    if (visitEet !== undefined) {
                        newState.nodes = state.nodes.map(n =>
                            n.id === step.targetId
                                ? { ...n, data: { ...n.data, eet: visitEet } }
                                : n
                        );
                    }
                    newState.visitedNodes = new Set(state.visitedNodes).add(step.targetId);
                    newState.currentNode = step.targetId;
                    break;

                case 'visit_node_back':
                    const { let: visitLet } = step.data || {};
                    if (visitLet !== undefined) {
                        newState.nodes = state.nodes.map(n =>
                            n.id === step.targetId
                                ? { ...n, data: { ...n.data, let: visitLet } }
                                : n
                        );
                    }
                    newState.visitedNodes = new Set(state.visitedNodes).add(step.targetId);
                    newState.currentNode = step.targetId;
                    break;

                case 'update_event':
                    // Update node data (eet/let)
                    const { eet, let: letVal } = step.data || {};
                    console.log('Applying update_event', step.targetId, step.data);
                    newState.nodes = state.nodes.map(n => {
                        if (n.id === step.targetId) {
                            console.log('Updating node match', n.id, { eet, letVal });
                            return { ...n, data: { ...n.data, ...(eet !== undefined && { eet }), ...(letVal !== undefined && { let: letVal }) } };
                        }
                        return n;
                    });
                    // Also highlight as visited
                    newState.visitedNodes = new Set(state.visitedNodes).add(step.targetId);
                    newState.currentNode = step.targetId;
                    break;

                case 'mark_critical_node':
                    newState.nodes = state.nodes.map(n =>
                        n.id === step.targetId
                            ? { ...n, data: { ...n.data, isCritical: true } }
                            : n
                    );
                    break;

                case 'mark_critical_edge':
                    // Map to pathEdges for highlighting (red)
                    const newPath = new Set(state.pathEdges);
                    newPath.add(step.targetId);
                    newState.pathEdges = newPath;
                    break;

                case 'check_successor':
                    // Just highlight the edge being checked
                    const newExplored = new Set(state.exploredEdges);
                    newExplored.add(step.targetId);
                    newState.exploredEdges = newExplored;
                    break;
            }

            return newState;
        });
    },

    clearVisualization: () => set((state) => ({
        visitedNodes: new Set(),
        currentNode: null,
        exploredEdges: new Set(),
        pathEdges: new Set(),
        mstEdges: new Set(),
        // Reset PERT data for playback
        nodes: state.nodes.map((n: Node) =>
            n.type === 'pert'
                ? { ...n, data: { ...n.data, eet: undefined, let: undefined, isCritical: false } }
                : n
        ),
    })),

    // PERT state
    pertTasks: [
        { id: 'A', name: 'Task A', duration: 3, predecessors: [] },
        { id: 'B', name: 'Task B', duration: 5, predecessors: ['A'] },
        { id: 'C', name: 'Task C', duration: 4, predecessors: ['B'] },
        { id: 'D', name: 'Task D', duration: 3, predecessors: ['C'] },
    ],
    setPertTasks: (pertTasks) => set({ pertTasks }),
}));
