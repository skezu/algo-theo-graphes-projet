/**
 * Control panel for algorithm selection and execution.
 */
import { useState } from 'react';
import { Play, Pause, RotateCcw, SkipForward, SkipBack, Loader2, Sparkles, Zap, ChevronRight } from 'lucide-react';
import { Button } from './ui/button';
import { Label } from './ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { Slider } from './ui/slider';
import { useAppStore } from '../lib/store';
import {
    loadGraph,
    getGraphData,
    runAlgorithm,
    ALGORITHM_INFO,
    type AlgorithmName
} from '../services/api';
import type { Node, Edge } from '@xyflow/react';

export default function ControlPanel() {
    const {
        isGraphLoaded,
        availableNodes,
        selectedAlgorithm,
        startNode,
        endNode,
        steps,
        playback,
        setNodes,
        setEdges,
        setAvailableNodes,
        setGraphLoaded,
        setSelectedAlgorithm,
        setStartNode,
        setEndNode,
        setAlgorithmResult,
        play,
        pause,
        reset,
        nextStep,
        setSpeed,
    } = useAppStore();

    const [isLoading, setIsLoading] = useState(false);
    const [isRunning, setIsRunning] = useState(false);

    const handleLoadGraph = async () => {
        setIsLoading(true);
        try {
            await loadGraph('road_network');
            const graphData = await getGraphData();

            // Convert to React Flow format
            const nodes: Node[] = graphData.nodes.map(n => ({
                id: n.id,
                position: n.position,
                data: n.data,
                type: 'default',
            }));

            const edges: Edge[] = graphData.edges.map(e => ({
                id: e.id,
                source: e.source,
                target: e.target,
                label: e.label,
                data: e.data,
            }));

            setNodes(nodes);
            setEdges(edges);
            setAvailableNodes(graphData.nodes.map(n => n.id));
            setGraphLoaded(true);

            if (graphData.nodes.length > 0) {
                setStartNode(graphData.nodes[0].id);
            }
        } catch (error) {
            console.error('Failed to load graph:', error);
            alert('Failed to load graph. Make sure the backend is running on http://localhost:8000');
        } finally {
            setIsLoading(false);
        }
    };

    const handleRunAlgorithm = async () => {
        if (!selectedAlgorithm || !startNode) return;

        setIsRunning(true);
        reset();

        try {
            const result = await runAlgorithm(
                selectedAlgorithm,
                startNode,
                ALGORITHM_INFO[selectedAlgorithm].needsEndNode ? endNode : undefined
            );

            if (result && result.steps) {
                setAlgorithmResult(result.steps, result.result);
            } else {
                console.warn('Algorithm returned no steps:', result);
                setAlgorithmResult([], {});
            }
        } catch (error) {
            console.error('Algorithm failed:', error);
            alert('Algorithm execution failed.');
        } finally {
            setIsRunning(false);
        }
    };

    const algorithmInfo = selectedAlgorithm ? ALGORITHM_INFO[selectedAlgorithm] : null;

    return (
        <div className="flex flex-col gap-5 p-5 flex-1 overflow-y-auto">
            {/* Section 1: Graph Data */}
            <div
                className="section-card"
                style={{ animationDelay: '50ms' }}
            >
                <div className="section-title">
                    {/* <Sparkles className="w-4 h-4" style={{ color: 'var(--accent-purple)' }} /> */}
                    <span>Graph Data</span>
                </div>

                <Button
                    onClick={handleLoadGraph}
                    disabled={isLoading}
                    className="w-full"
                    size="lg"
                >
                    {isLoading ? (
                        <>
                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                            Loading...
                        </>
                    ) : isGraphLoaded ? (
                        <>
                            <RotateCcw className="mr-2 h-4 w-4" />
                            Reload Graph
                        </>
                    ) : (
                        <>
                            <ChevronRight className="mr-2 h-4 w-4" />
                            Load Road Network
                        </>
                    )}
                </Button>

                {isGraphLoaded && (
                    <p
                        className="text-sm mt-3 flex items-center gap-2 animate-fade-in"
                        style={{ color: 'var(--accent-green)' }}
                    >
                        <span className="w-2 h-2 rounded-full" style={{ background: 'var(--accent-green)' }}></span>
                        {availableNodes.length} nodes loaded
                    </p>
                )}
            </div>

            {/* Section 2: Algorithm */}
            <div
                className="section-card"
                style={{ animationDelay: '100ms' }}
            >
                <div className="section-title">
                    {/* <Zap className="w-4 h-4" style={{ color: 'var(--accent-yellow)' }} /> */}
                    <span>Algorithm</span>
                </div>

                <div className="space-y-4">
                    <div className="space-y-2">
                        <Label className="form-label">Select Algorithm</Label>
                        <Select
                            value={selectedAlgorithm || ''}
                            onValueChange={(v) => setSelectedAlgorithm(v as AlgorithmName)}
                            disabled={!isGraphLoaded}
                        >
                            <SelectTrigger>
                                <SelectValue placeholder="Choose an algorithm" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="bfs">BFS (Breadth-First)</SelectItem>
                                <SelectItem value="dfs">DFS (Depth-First)</SelectItem>
                                <SelectItem value="dijkstra">Dijkstra</SelectItem>
                                <SelectItem value="bellman-ford">Bellman-Ford</SelectItem>
                                <SelectItem value="prim">Prim's MST</SelectItem>
                                <SelectItem value="kruskal">Kruskal's MST</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>

                    {algorithmInfo && (
                        <p
                            className="text-sm leading-relaxed"
                            style={{ color: 'var(--text-secondary)' }}
                        >
                            {algorithmInfo.description}
                        </p>
                    )}

                    <div className="space-y-2">
                        <Label className="form-label">Start Node</Label>
                        <Select
                            value={startNode}
                            onValueChange={setStartNode}
                            disabled={!isGraphLoaded}
                        >
                            <SelectTrigger>
                                <SelectValue placeholder="Select start" />
                            </SelectTrigger>
                            <SelectContent>
                                {availableNodes.map(node => (
                                    <SelectItem key={node} value={node}>{node}</SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>

                    {algorithmInfo?.needsEndNode && (
                        <div className="space-y-2">
                            <Label className="form-label">End Node (optional)</Label>
                            <Select
                                value={endNode}
                                onValueChange={setEndNode}
                                disabled={!isGraphLoaded}
                            >
                                <SelectTrigger>
                                    <SelectValue placeholder="Select end" />
                                </SelectTrigger>
                                <SelectContent>
                                    {availableNodes.filter(n => n !== startNode).map(node => (
                                        <SelectItem key={node} value={node}>{node}</SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>
                    )}

                    <Button
                        onClick={handleRunAlgorithm}
                        disabled={!selectedAlgorithm || !startNode || isRunning || (!!algorithmInfo?.needsEndNode && !endNode)}
                        className="w-full mt-2"
                        size="lg"
                    >
                        {isRunning ? (
                            <>
                                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                Running...
                            </>
                        ) : (
                            <>
                                <Play className="mr-2 h-4 w-4" />
                                Run Algorithm
                            </>
                        )}
                    </Button>
                </div>
            </div>

            {/* Section 3: Playback (conditional) */}
            {steps.length > 0 && (
                <div
                    className="section-card animate-scale-in"
                >
                    <div className="section-title">
                        <Play className="w-4 h-4" style={{ color: 'var(--accent-cyan)' }} />
                        <span>Playback</span>
                    </div>

                    <div className="flex items-center justify-center gap-2 mb-4">
                        <Button
                            variant="outline"
                            size="icon"
                            onClick={reset}
                        >
                            <RotateCcw className="h-4 w-4" />
                        </Button>
                        <Button
                            variant="outline"
                            size="icon"
                            onClick={() => {
                                reset();
                                const { goToStep } = useAppStore.getState();
                                if (playback.currentStepIndex > 0) {
                                    goToStep(playback.currentStepIndex - 1);
                                }
                            }}
                        >
                            <SkipBack className="h-4 w-4" />
                        </Button>
                        <Button
                            size="icon"
                            onClick={playback.isPlaying ? pause : play}
                            className="w-11 h-11"
                        >
                            {playback.isPlaying ? (
                                <Pause className="h-5 w-5" />
                            ) : (
                                <Play className="h-5 w-5" />
                            )}
                        </Button>
                        <Button
                            variant="outline"
                            size="icon"
                            onClick={nextStep}
                        >
                            <SkipForward className="h-4 w-4" />
                        </Button>
                    </div>

                    <div className="space-y-3">
                        <div
                            className="flex justify-between text-sm"
                            style={{ color: 'var(--text-secondary)' }}
                        >
                            <span>Step {playback.currentStepIndex + 1}</span>
                            <span>of {steps.length}</span>
                        </div>
                        <Slider
                            value={[playback.currentStepIndex + 1]}
                            min={0}
                            max={steps.length}
                            step={1}
                            onValueChange={([v]) => {
                                const { goToStep, clearVisualization } = useAppStore.getState();
                                if (v === 0) {
                                    clearVisualization();
                                } else {
                                    goToStep(v - 1);
                                }
                            }}
                        />
                    </div>

                    <div className="space-y-2 mt-4">
                        <Label className="form-label">Speed: {playback.speed}ms</Label>
                        <Slider
                            value={[playback.speed]}
                            min={100}
                            max={2000}
                            step={100}
                            onValueChange={([v]) => setSpeed(v)}
                        />
                    </div>
                </div>
            )}
        </div>
    );
}
