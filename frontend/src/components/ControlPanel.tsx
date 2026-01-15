/**
 * Control panel for algorithm selection and execution.
 */
import { useState } from 'react';
import { Play, Pause, RotateCcw, SkipForward, SkipBack, Loader2 } from 'lucide-react';
import { Button } from './ui/button';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
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

            setAlgorithmResult(result.steps, result.result);
        } catch (error) {
            console.error('Algorithm failed:', error);
            alert('Algorithm execution failed.');
        } finally {
            setIsRunning(false);
        }
    };

    const algorithmInfo = selectedAlgorithm ? ALGORITHM_INFO[selectedAlgorithm] : null;

    return (
        <div className="flex flex-col gap-4 p-4 h-full overflow-y-auto">
            {/* Graph Loading */}
            <Card className="glass-panel animate-fade-in" style={{ animationDelay: '0ms' }}>
                <CardHeader className="pb-3">
                    <CardTitle className="text-base font-semibold text-[hsl(213,31%,91%)] flex items-center gap-2">
                        <span className="text-lg">📊</span>
                        Graph Data
                    </CardTitle>
                </CardHeader>
                <CardContent>
                    <Button
                        onClick={handleLoadGraph}
                        disabled={isLoading}
                        className="w-full btn-glow"
                    >
                        {isLoading ? (
                            <>
                                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                Loading...
                            </>
                        ) : isGraphLoaded ? (
                            'Reload Graph'
                        ) : (
                            'Load Road Network'
                        )}
                    </Button>
                    {isGraphLoaded && (
                        <p className="text-sm text-[hsl(158,64%,52%)] mt-3 flex items-center gap-1.5">
                            <span>✓</span>
                            {availableNodes.length} nodes loaded
                        </p>
                    )}
                </CardContent>
            </Card>

            {/* Algorithm Selection */}
            <Card className="glass-panel animate-fade-in" style={{ animationDelay: '100ms' }}>
                <CardHeader className="pb-3">
                    <CardTitle className="text-base font-semibold text-[hsl(213,31%,91%)] flex items-center gap-2">
                        <span className="text-lg">⚡</span>
                        Algorithm
                    </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                    <div className="space-y-2">
                        <Label className="text-sm font-medium text-[hsl(215,20%,65%)]">Select Algorithm</Label>
                        <Select
                            value={selectedAlgorithm || ''}
                            onValueChange={(v) => setSelectedAlgorithm(v as AlgorithmName)}
                            disabled={!isGraphLoaded}
                        >
                            <SelectTrigger className="bg-[hsl(222,47%,11%)] border-[hsl(223,47%,18%)] hover:border-[hsl(231,97%,66%)]/50 transition-colors">
                                <SelectValue placeholder="Choose an algorithm" />
                            </SelectTrigger>
                            <SelectContent className="bg-[hsl(224,71%,6%)] border-[hsl(223,47%,18%)]">
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
                        <p className="text-sm text-[hsl(215,20%,65%)] leading-relaxed">
                            {algorithmInfo.description}
                        </p>
                    )}

                    <div className="space-y-2">
                        <Label className="text-sm font-medium text-[hsl(215,20%,65%)]">Start Node</Label>
                        <Select
                            value={startNode}
                            onValueChange={setStartNode}
                            disabled={!isGraphLoaded}
                        >
                            <SelectTrigger className="bg-[hsl(222,47%,11%)] border-[hsl(223,47%,18%)] hover:border-[hsl(231,97%,66%)]/50 transition-colors">
                                <SelectValue placeholder="Select start" />
                            </SelectTrigger>
                            <SelectContent className="bg-[hsl(224,71%,6%)] border-[hsl(223,47%,18%)]">
                                {availableNodes.map(node => (
                                    <SelectItem key={node} value={node}>{node}</SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>

                    {algorithmInfo?.needsEndNode && (
                        <div className="space-y-2">
                            <Label className="text-sm font-medium text-[hsl(215,20%,65%)]">End Node (optional)</Label>
                            <Select
                                value={endNode}
                                onValueChange={setEndNode}
                                disabled={!isGraphLoaded}
                            >
                                <SelectTrigger className="bg-[hsl(222,47%,11%)] border-[hsl(223,47%,18%)] hover:border-[hsl(231,97%,66%)]/50 transition-colors">
                                    <SelectValue placeholder="Select end" />
                                </SelectTrigger>
                                <SelectContent className="bg-[hsl(224,71%,6%)] border-[hsl(223,47%,18%)]">
                                    {availableNodes.filter(n => n !== startNode).map(node => (
                                        <SelectItem key={node} value={node}>{node}</SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>
                    )}

                    <Button
                        onClick={handleRunAlgorithm}
                        disabled={!selectedAlgorithm || !startNode || isRunning}
                        className="w-full btn-glow mt-2"
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
                </CardContent>
            </Card>

            {/* Playback Controls */}
            {steps.length > 0 && (
                <Card className="glass-panel animate-fade-in" style={{ animationDelay: '200ms' }}>
                    <CardHeader className="pb-3">
                        <CardTitle className="text-base font-semibold text-[hsl(213,31%,91%)] flex items-center gap-2">
                            <span className="text-lg">▶️</span>
                            Playback
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="flex items-center justify-center gap-2">
                            <Button variant="outline" size="icon" onClick={reset} className="border-[hsl(223,47%,18%)] hover:bg-[hsl(222,47%,14%)] hover:border-[hsl(231,97%,66%)]/50">
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
                            >
                                {playback.isPlaying ? (
                                    <Pause className="h-4 w-4" />
                                ) : (
                                    <Play className="h-4 w-4" />
                                )}
                            </Button>
                            <Button variant="outline" size="icon" onClick={nextStep}>
                                <SkipForward className="h-4 w-4" />
                            </Button>
                        </div>

                        <div className="space-y-2">
                            <div className="flex justify-between text-sm">
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

                        <div className="space-y-2">
                            <Label>Speed: {playback.speed}ms</Label>
                            <Slider
                                value={[playback.speed]}
                                min={100}
                                max={2000}
                                step={100}
                                onValueChange={([v]) => setSpeed(v)}
                            />
                        </div>
                    </CardContent>
                </Card>
            )}
        </div>
    );
}
