"""
Flask backend for the Graph Algorithms Visualization.

This API exposes endpoints to:
- Load graph data (road network)
- Run algorithms and get step-by-step traces
- Get graph structure for React Flow visualization
"""

from flask import Flask, jsonify, request
from flask_cors import CORS
import math

from graph import Graph
from algorithms_trace import (
    traced_bfs,
    traced_dfs,
    traced_dijkstra,
    traced_prim,
    traced_kruskal,
    traced_bellman_ford,
    traced_pert
)

app = Flask(__name__)
CORS(app)  # Enable CORS for all routes

# Global graph instance
current_graph = None


# --- Helper Functions ---

def get_node_positions(nodes):
    """Generate positions for nodes in a circular layout."""
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


def graph_to_react_flow(graph):
    """Convert internal graph representation to React Flow format."""
    nodes = graph.get_nodes()
    edges = graph.get_edges()
    positions = get_node_positions(nodes)
    
    rf_nodes = []
    for node in nodes:
        rf_nodes.append({
            "id": node,
            "position": positions[node],
            "data": {"label": node},
            "type": "default"
        })
    
    rf_edges = []
    for u, v, weight in edges:
        rf_edges.append({
            "id": f"{u}-{v}",
            "source": u,
            "target": v,
            "label": str(int(weight)) if weight == int(weight) else str(weight),
            "data": {"weight": weight}
        })
    
    return {"nodes": rf_nodes, "edges": rf_edges}


# --- Routes ---

@app.route("/")
def root():
    """Health check endpoint."""
    return jsonify({"status": "ok", "message": "Graph Algorithms API is running"})


@app.route("/graph/load", methods=["POST"])
def load_graph():
    """Load a graph into memory."""
    global current_graph
    
    graph_type = request.args.get("graph_type", "road_network")
    
    if graph_type == "road_network":
        current_graph = Graph(directed=False)
        current_graph.load_data()
        return jsonify({
            "message": "Road network loaded successfully",
            "nodes": len(current_graph.get_nodes()),
            "edges": len(current_graph.get_edges())
        })
    elif graph_type == "negative_weights":
        current_graph = Graph(directed=True)
        current_graph.load_negative_weights_data()
        return jsonify({
            "message": "Graph with negative weights loaded",
            "nodes": len(current_graph.get_nodes()),
            "edges": len(current_graph.get_edges())
        })
    elif graph_type == "negative_no_cycle":
        current_graph = Graph(directed=True)
        current_graph.load_negative_weights_no_cycle_data()
        return jsonify({
            "message": "Graph with negative weights (no cycle) loaded",
            "nodes": len(current_graph.get_nodes()),
            "edges": len(current_graph.get_edges())
        })
    else:
        return jsonify({"error": f"Unknown graph type: {graph_type}"}), 400


@app.route("/graph/data")
def get_graph_data():
    """Get the current graph in React Flow format."""
    global current_graph
    
    if current_graph is None:
        return jsonify({"error": "No graph loaded. Call POST /graph/load first."}), 400
    
    return jsonify(graph_to_react_flow(current_graph))


@app.route("/graph/nodes")
def get_nodes():
    """Get list of all node IDs."""
    global current_graph
    
    if current_graph is None:
        return jsonify({"error": "No graph loaded."}), 400
    
    return jsonify({"nodes": current_graph.get_nodes()})


@app.route("/algorithm/bfs", methods=["POST"])
def run_bfs():
    """Run BFS algorithm and return trace."""
    global current_graph
    
    if current_graph is None:
        return jsonify({"error": "No graph loaded."}), 400
    
    data = request.get_json()
    start_node = data.get("startNode")
    
    if not start_node:
        return jsonify({"error": "startNode is required"}), 400
    
    try:
        visit_order, steps = traced_bfs(current_graph, start_node)
        return jsonify({
            "result": {"visitOrder": visit_order},
            "steps": steps
        })
    except KeyError as e:
        return jsonify({"error": str(e)}), 404


@app.route("/algorithm/dfs", methods=["POST"])
def run_dfs():
    """Run DFS algorithm and return trace."""
    global current_graph
    
    if current_graph is None:
        return jsonify({"error": "No graph loaded."}), 400
    
    data = request.get_json()
    start_node = data.get("startNode")
    
    if not start_node:
        return jsonify({"error": "startNode is required"}), 400
    
    try:
        visit_order, steps = traced_dfs(current_graph, start_node)
        return jsonify({
            "result": {"visitOrder": visit_order},
            "steps": steps
        })
    except KeyError as e:
        return jsonify({"error": str(e)}), 404


@app.route("/algorithm/dijkstra", methods=["POST"])
def run_dijkstra():
    """Run Dijkstra algorithm and return trace."""
    global current_graph
    
    if current_graph is None:
        return jsonify({"error": "No graph loaded."}), 400
    
    data = request.get_json()
    start_node = data.get("startNode")
    end_node = data.get("endNode")
    
    if not start_node:
        return jsonify({"error": "startNode is required"}), 400
    
    try:
        distances, predecessors, steps = traced_dijkstra(
            current_graph,
            start_node,
            end_node
        )
        
        # Build path if end node specified
        path = None
        if end_node and end_node in distances:
            path = []
            node = end_node
            while node:
                path.append(node)
                node = predecessors[node]
            path.reverse()
        
        # Filter out infinity values for JSON serialization
        finite_distances = {k: v for k, v in distances.items() if v != float('inf')}
        
        # Helper to safely serialize path distance
        path_distance = distances.get(end_node) if end_node else None
        if path_distance == float('inf'):
            path_distance = "Infinity"
            
        return jsonify({
            "result": {
                "distances": finite_distances,
                "path": path,
                "pathDistance": path_distance
            },
            "steps": steps
        })
    except KeyError as e:
        return jsonify({"error": str(e)}), 404


@app.route("/algorithm/bellman-ford", methods=["POST"])
def run_bellman_ford():
    """Run Bellman-Ford algorithm and return trace."""
    global current_graph
    
    if current_graph is None:
        return jsonify({"error": "No graph loaded."}), 400
    
    data = request.get_json()
    start_node = data.get("startNode")
    
    if not start_node:
        return jsonify({"error": "startNode is required"}), 400
    
    try:
        distances, predecessors, has_negative_cycle, steps = traced_bellman_ford(
            current_graph,
            start_node
        )
        
        finite_distances = {k: v for k, v in distances.items() if v != float('inf')}
        
        return jsonify({
            "result": {
                "distances": finite_distances,
                "hasNegativeCycle": has_negative_cycle
            },
            "steps": steps
        })
    except KeyError as e:
        return jsonify({"error": str(e)}), 404


@app.route("/algorithm/prim", methods=["POST"])
def run_prim():
    """Run Prim's MST algorithm and return trace."""
    global current_graph
    
    if current_graph is None:
        return jsonify({"error": "No graph loaded."}), 400
    
    data = request.get_json()
    start_node = data.get("startNode")
    
    if not start_node:
        return jsonify({"error": "startNode is required"}), 400
    
    try:
        mst_edges, steps = traced_prim(current_graph, start_node)
        total_weight = sum(e[2] for e in mst_edges)
        
        return jsonify({
            "result": {
                "mstEdges": [{"from": e[0], "to": e[1], "weight": e[2]} for e in mst_edges],
                "totalWeight": total_weight
            },
            "steps": steps
        })
    except KeyError as e:
        return jsonify({"error": str(e)}), 404


@app.route("/algorithm/kruskal", methods=["POST"])
def run_kruskal():
    """Run Kruskal's MST algorithm and return trace."""
    global current_graph
    
    if current_graph is None:
        return jsonify({"error": "No graph loaded."}), 400
    
    try:
        mst_edges, steps = traced_kruskal(current_graph)
        total_weight = sum(e[2] for e in mst_edges)
        
        return jsonify({
            "result": {
                "mstEdges": [{"from": e[0], "to": e[1], "weight": e[2]} for e in mst_edges],
                "totalWeight": total_weight
            },
            "steps": steps
        })
    except Exception as e:
        return jsonify({"error": str(e)}), 500


@app.route("/algorithm/pert", methods=["POST"])
def run_pert():
    """Run PERT analysis and return schedule + trace."""
    data = request.get_json()
    tasks_data = data.get("tasks")
    
    if not tasks_data or not isinstance(tasks_data, list):
        return jsonify({"error": "List of tasks is required"}), 400
    
    try:
        schedule, critical_path, aoa, steps = traced_pert(tasks_data)
        
        # Calculate project duration
        project_duration = 0
        if schedule:
            project_duration = max(item["earliestFinish"] for item in schedule)
            
        return jsonify({
            "result": {
                "schedule": schedule,
                "criticalPath": critical_path,
                "projectDuration": project_duration,
                "aoa": aoa
            },
            "steps": steps
        })
    except Exception as e:
        return jsonify({"error": str(e)}), 500


# Run with: python api.py
if __name__ == "__main__":
    app.run(host="0.0.0.0", port=8000, debug=True)
