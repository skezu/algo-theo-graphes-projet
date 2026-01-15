import { useState, useEffect } from 'react';
import { useStore } from '../store';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Loader2 } from 'lucide-react';

export const ControlPanel = () => {
    const { nodes, fetchGraph, runAlgorithm } = useStore();
    const [algo, setAlgo] = useState('bfs');
    const [startNode, setStartNode] = useState('');
    const [endNode, setEndNode] = useState('');
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        setLoading(true);
        fetchGraph().finally(() => setLoading(false));
    }, [fetchGraph]);

    useEffect(() => {
        if (nodes.length > 0 && !startNode) {
            setStartNode(nodes[0].data.label as string); // Default to first node
            setEndNode(nodes[nodes.length - 1].data.label as string);
        }
    }, [nodes, startNode]);

    const handleRun = async () => {
        if (!startNode) return;
        await runAlgorithm(algo, startNode, endNode);
    };

    return (
        <Card className="absolute top-4 left-4 w-80 shadow-2xl z-20 opacity-90 hover:opacity-100 transition-opacity backdrop-blur">
            <CardHeader className="pb-3">
                <CardTitle>Graph Algorithms</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
                <div className="space-y-2">
                    <label className="text-xs font-medium">Algorithm</label>
                    <Select value={algo} onValueChange={setAlgo}>
                        <SelectTrigger>
                            <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="bfs">BFS (Breadth First)</SelectItem>
                            <SelectItem value="dfs">DFS (Depth First)</SelectItem>
                            <SelectItem value="dijkstra">Dijkstra</SelectItem>
                        </SelectContent>
                    </Select>
                </div>

                <div className="space-y-2">
                    <label className="text-xs font-medium">Start Node</label>
                    <Select value={startNode} onValueChange={setStartNode}>
                        <SelectTrigger><SelectValue placeholder="Select start" /></SelectTrigger>
                        <SelectContent>
                            {nodes.map(n => (
                                <SelectItem key={n.id} value={n.id}>{n.data.label as string}</SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                </div>

                {algo === 'dijkstra' && (
                    <div className="space-y-2">
                        <label className="text-xs font-medium">End Node</label>
                        <Select value={endNode} onValueChange={setEndNode}>
                            <SelectTrigger><SelectValue placeholder="Select end" /></SelectTrigger>
                            <SelectContent>
                                {nodes.map(n => (
                                    <SelectItem key={n.id} value={n.id}>{n.data.label as string}</SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>
                )}

                <Button className="w-full" onClick={handleRun} disabled={loading || (algo === 'dijkstra' && !endNode)}>
                    {loading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : "Run Algorithm"}
                </Button>

                <div className="text-xs text-muted-foreground pt-2">
                    {nodes.length} Nodes loaded.
                </div>
            </CardContent>
        </Card>
    );
};
