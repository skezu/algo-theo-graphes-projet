"""
FastAPI backend for the Graph Algorithms Visualization.

This API exposes endpoints to:
- Load graph data (road network)
- Run algorithms and get step-by-step traces
- Get graph structure for React Flow visualization
"""

from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import Dict, List, Any, Optional

from graph import Graph
from algorithms_trace import (
    traced_bfs,
    traced_dfs,
    traced_dijkstra,
    traced_prim,
    traced_kruskal,
    traced_bellman_ford
)

app = FastAPI(
    title="Graph Algorithms API",
    description="API for visualizing graph algorithms step by step",
    version="1.0.0"
)

# Enable CORS for frontend
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # In production, specify the frontend URL
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Global graph instance
current_graph: Optional[Graph] = None


# --- Pydantic Models ---

class GraphNode(BaseModel):
    id: str
    position: Dict[str, float]
    data: Dict[str, Any]
    type: str = "default"


class GraphEdge(BaseModel):
    id: str
    source: str
    target: str
    label: Optional[str] = None
    data: Optional[Dict[str, Any]] = None


class GraphData(BaseModel):
    nodes: List[GraphNode]
    edges: List[GraphEdge]


class AlgorithmRequest(BaseModel):
    startNode: str
    endNode: Optional[str] = None


class AlgorithmResponse(BaseModel):
    result: Any
    steps: List[Dict[str, Any]]


# --- Helper Functions ---

def get_node_positions(nodes: List[str]) -> Dict[str, Dict[str, float]]:
    """
    Generate positions for nodes in a circular layout.
    """
    import math
    positions = {}
    n = len(nodes)
    radius = 250
    center_x, center_y = 400, 300
    
    for i, node in enumerate(nodes):
        angle = (2 * math.pi * i) / n - math.pi / 2
        positions[node] = {
            "x": center_x + radius * math.cos(angle),
            "y": center_y + radius * math.sin(angle)
        }
    
    return positions


def graph_to_react_flow(graph: Graph) -> GraphData:
    """
    Convert internal graph representation to React Flow format.
    """
    nodes = graph.get_nodes()
    edges = graph.get_edges()
    positions = get_node_positions(nodes)
    
    rf_nodes = []
    for node in nodes:
        rf_nodes.append(GraphNode(
            id=node,
            position=positions[node],
            data={"label": node},
            type="default"
        ))
    
    rf_edges = []
    for u, v, weight in edges:
        rf_edges.append(GraphEdge(
            id=f"{u}-{v}",
            source=u,
            target=v,
            label=str(int(weight)) if weight == int(weight) else str(weight),
            data={"weight": weight}
        ))
    
    return GraphData(nodes=rf_nodes, edges=rf_edges)


# --- Endpoints ---

@app.get("/")
def root():
    """Health check endpoint."""
    return {"status": "ok", "message": "Graph Algorithms API is running"}


@app.post("/graph/load")
def load_graph(graph_type: str = "road_network"):
    """
    Load a graph into memory.
    
    Args:
        graph_type: Type of graph to load ("road_network" for now)
    """
    global current_graph
    
    if graph_type == "road_network":
        current_graph = Graph(directed=False)
        current_graph.load_data()
        return {
            "message": "Road network loaded successfully",
            "nodes": len(current_graph.get_nodes()),
            "edges": len(current_graph.get_edges())
        }
    else:
        raise HTTPException(status_code=400, detail=f"Unknown graph type: {graph_type}")


@app.get("/graph/data", response_model=GraphData)
def get_graph_data():
    """
    Get the current graph in React Flow format.
    """
    global current_graph
    
    if current_graph is None:
        raise HTTPException(status_code=400, detail="No graph loaded. Call POST /graph/load first.")
    
    return graph_to_react_flow(current_graph)


@app.get("/graph/nodes")
def get_nodes():
    """Get list of all node IDs."""
    global current_graph
    
    if current_graph is None:
        raise HTTPException(status_code=400, detail="No graph loaded.")
    
    return {"nodes": current_graph.get_nodes()}


@app.post("/algorithm/bfs", response_model=AlgorithmResponse)
def run_bfs(request: AlgorithmRequest):
    """Run BFS algorithm and return trace."""
    global current_graph
    
    if current_graph is None:
        raise HTTPException(status_code=400, detail="No graph loaded.")
    
    try:
        visit_order, steps = traced_bfs(current_graph, request.startNode)
        return AlgorithmResponse(
            result={"visitOrder": visit_order},
            steps=steps
        )
    except KeyError as e:
        raise HTTPException(status_code=404, detail=str(e))


@app.post("/algorithm/dfs", response_model=AlgorithmResponse)
def run_dfs(request: AlgorithmRequest):
    """Run DFS algorithm and return trace."""
    global current_graph
    
    if current_graph is None:
        raise HTTPException(status_code=400, detail="No graph loaded.")
    
    try:
        visit_order, steps = traced_dfs(current_graph, request.startNode)
        return AlgorithmResponse(
            result={"visitOrder": visit_order},
            steps=steps
        )
    except KeyError as e:
        raise HTTPException(status_code=404, detail=str(e))


@app.post("/algorithm/dijkstra", response_model=AlgorithmResponse)
def run_dijkstra(request: AlgorithmRequest):
    """Run Dijkstra algorithm and return trace."""
    global current_graph
    
    if current_graph is None:
        raise HTTPException(status_code=400, detail="No graph loaded.")
    
    try:
        distances, predecessors, steps = traced_dijkstra(
            current_graph,
            request.startNode,
            request.endNode
        )
        
        # Build path if end node specified
        path = None
        if request.endNode and request.endNode in distances:
            path = []
            node = request.endNode
            while node:
                path.append(node)
                node = predecessors[node]
            path.reverse()
        
        return AlgorithmResponse(
            result={
                "distances": {k: v for k, v in distances.items() if v != float('inf')},
                "path": path,
                "pathDistance": distances.get(request.endNode) if request.endNode else None
            },
            steps=steps
        )
    except KeyError as e:
        raise HTTPException(status_code=404, detail=str(e))


@app.post("/algorithm/bellman-ford", response_model=AlgorithmResponse)
def run_bellman_ford(request: AlgorithmRequest):
    """Run Bellman-Ford algorithm and return trace."""
    global current_graph
    
    if current_graph is None:
        raise HTTPException(status_code=400, detail="No graph loaded.")
    
    try:
        distances, predecessors, has_negative_cycle, steps = traced_bellman_ford(
            current_graph,
            request.startNode
        )
        
        return AlgorithmResponse(
            result={
                "distances": {k: v for k, v in distances.items() if v != float('inf')},
                "hasNegativeCycle": has_negative_cycle
            },
            steps=steps
        )
    except KeyError as e:
        raise HTTPException(status_code=404, detail=str(e))


@app.post("/algorithm/prim", response_model=AlgorithmResponse)
def run_prim(request: AlgorithmRequest):
    """Run Prim's MST algorithm and return trace."""
    global current_graph
    
    if current_graph is None:
        raise HTTPException(status_code=400, detail="No graph loaded.")
    
    try:
        mst_edges, steps = traced_prim(current_graph, request.startNode)
        total_weight = sum(e[2] for e in mst_edges)
        
        return AlgorithmResponse(
            result={
                "mstEdges": [{"from": e[0], "to": e[1], "weight": e[2]} for e in mst_edges],
                "totalWeight": total_weight
            },
            steps=steps
        )
    except KeyError as e:
        raise HTTPException(status_code=404, detail=str(e))


@app.post("/algorithm/kruskal", response_model=AlgorithmResponse)
def run_kruskal(request: AlgorithmRequest):
    """Run Kruskal's MST algorithm and return trace."""
    global current_graph
    
    if current_graph is None:
        raise HTTPException(status_code=400, detail="No graph loaded.")
    
    try:
        mst_edges, steps = traced_kruskal(current_graph)
        total_weight = sum(e[2] for e in mst_edges)
        
        return AlgorithmResponse(
            result={
                "mstEdges": [{"from": e[0], "to": e[1], "weight": e[2]} for e in mst_edges],
                "totalWeight": total_weight
            },
            steps=steps
        )
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


# Run with: uvicorn api:app --reload
if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
