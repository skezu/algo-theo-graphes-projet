
import json
import math
from algorithms_trace import traced_dijkstra
from graph import Graph

# Mock Flask jsonify (simplified)
def jsonify(data):
    return json.dumps(data, default=str)

def test_dijkstra():
    g = Graph(directed=False)
    g.load_data()
    
    start_node = "Paris"
    end_node = "Lyon"
    
    # 1. Run traced_dijkstra with End Node
    print(f"Running Dijkstra {start_node} -> {end_node}")
    distances, predecessors, steps = traced_dijkstra(g, start_node, end_node)
    
    # Check for infinity in distances
    finite_distances = {k: v for k, v in distances.items() if v != float('inf')}
    
    # Simulate API response construction
    path = None
    if end_node and end_node in distances:
        path = []
        node = end_node
        while node:
            path.append(node)
            node = predecessors[node]
        path.reverse()
        
    response = {
        "result": {
            "distances": finite_distances,
            "path": path,
            "pathDistance": distances.get(end_node) if end_node else None
        },
        "steps": steps
    }
    
    # Try to serialize
    try:
        json_output = json.dumps(response)
        print("Serialization Successful (with End Node)")
    except Exception as e:
        print(f"Serialization Failed: {e}")

    # 2. Run traced_dijkstra WITHOUT End Node (empty string)
    end_node = ""
    print(f"\nRunning Dijkstra {start_node} -> '{end_node}'")
    distances, predecessors, steps = traced_dijkstra(g, start_node, end_node)
    
    finite_distances = {k: v for k, v in distances.items() if v != float('inf')}
    path = None
    
    response = {
        "result": {
            "distances": finite_distances,
            "path": path,
            "pathDistance": distances.get(end_node) if end_node else None
        },
        "steps": steps
    }
    
    try:
        json_output = json.dumps(response)
        print("Serialization Successful (no End Node)")
    except Exception as e:
        print(f"Serialization Failed: {e}")
        
    # Check for Inf in pathDistance
    # Force unreachable end node
    end_node = "Rio" # Not in graph
    print(f"\nRunning Dijkstra {start_node} -> '{end_node}'")
    
    # traced_dijkstra raises KeyError if start not found, but what if end not found?
    # traced_dijkstra logic:
    # if start_node not in graph... raise KeyError
    # It does NOT check end_node existence until it tries to reach it?
    # No, traced_dijkstra doesn't validate end_node existence.
    
    try:
        distances, predecessors, steps = traced_dijkstra(g, start_node, end_node)
        
        # Checking API logic
        path_dist = distances.get(end_node) if end_node else None
        print(f"Path Distance to {end_node}: {path_dist}")
        
        response["result"]["pathDistance"] = path_dist
        
        json_output = json.dumps(response)
        print("Serialization Successful (Unreachable Node)")
        
    except KeyError:
        print("KeyError caught (Expected if start node missing, but here end node is missing)")
    except Exception as e:
        print(f"Error: {e}")

if __name__ == "__main__":
    test_dijkstra()
