from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import List, Dict, Any, Optional
import graph as g_module
import algorithms_trace as trace

app = FastAPI()

# Enable CORS for frontend
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Global graph instance
current_graph = g_module.Graph(directed=False)
current_graph.load_data() # Load road network by default

class Node(BaseModel):
    id: str
    label: str
    x: Optional[float] = 0
    y: Optional[float] = 0

class Edge(BaseModel):
    source: str
    target: str
    weight: float
    id: str

class GraphData(BaseModel):
    nodes: List[Node]
    edges: List[Edge]

class AlgorithmRequest(BaseModel):
    algorithm: str
    startNode: str
    endNode: Optional[str] = None

# Manual layout for French cities to look good
CITY_COORDINATES = {
    "Paris": (300, 150),
    "Lille": (300, 0),
    "Caen": (100, 100),
    "Rennes": (0, 180),
    "Nantes": (0, 280),
    "Bordeaux": (100, 450),
    "Lyon": (400, 350),
    "Dijon": (400, 200),
    "Nancy": (500, 100),
    "Grenoble": (450, 450),
}

@app.get("/graph", response_model=GraphData)
def get_graph():
    nodes = []
    for n in current_graph.get_nodes():
        x, y = CITY_COORDINATES.get(n, (0, 0))
        nodes.append(Node(id=n, label=n, x=x, y=y))
    
    edges = []
    raw_edges = current_graph.get_edges()
    for idx, (src, dst, w) in enumerate(raw_edges):
        edges.append(Edge(source=src, target=dst, weight=w, id=f"e{idx}"))

    return GraphData(nodes=nodes, edges=edges)

@app.post("/algorithms/run")
def run_algorithm(req: AlgorithmRequest):
    if req.algorithm == "bfs":
        return trace.trace_bfs(current_graph, req.startNode)
    elif req.algorithm == "dfs":
        return trace.trace_dfs(current_graph, req.startNode)
    elif req.algorithm == "dijkstra":
        if not req.endNode:
            raise HTTPException(400, "endNode required for Dijkstra")
        return trace.trace_dijkstra(current_graph, req.startNode, req.endNode)
    else:
        raise HTTPException(404, "Algorithm not found")

@app.post("/graph/reset")
def reset_graph():
    global current_graph
    current_graph = g_module.Graph(directed=False)
    current_graph.load_data()
    return {"status": "reset"}
