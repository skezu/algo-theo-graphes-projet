"""
Module algorithms_trace.py - Instrumented algorithms for visualization.
"""

from typing import List, Dict, Any, Set, Optional, Tuple
from collections import deque
import heapq
from graph import Graph

def trace_bfs(graph: Graph, start_node: str) -> List[Dict[str, Any]]:
    """BFS with step tracing."""
    trace = []
    
    if start_node not in graph.get_nodes():
        return [{"type": "error", "message": f"Start node {start_node} not found"}]

    visited = {start_node}
    queue = deque([start_node])
    
    trace.append({
        "type": "start",
        "description": f"Starting BFS from {start_node}",
        "nodeId": start_node
    })

    while queue:
        current_node = queue.popleft()
        
        trace.append({
            "type": "visit_node",
            "nodeId": current_node,
            "description": f"Visiting {current_node}"
        })

        neighbors = graph.get_neighbors(current_node)
        for neighbor in neighbors:
            trace.append({
                "type": "check_neighbor",
                "source": current_node,
                "target": neighbor,
                "description": f"Checking neighbor {neighbor} of {current_node}"
            })
            
            if neighbor not in visited:
                visited.add(neighbor)
                queue.append(neighbor)
                trace.append({
                    "type": "add_to_queue",
                    "nodeId": neighbor,
                    "description": f"Adding {neighbor} to queue"
                })
            else:
                 trace.append({
                    "type": "skip",
                    "nodeId": neighbor,
                    "description": f"{neighbor} already visited"
                })

    trace.append({"type": "complete", "description": "BFS Traversal Complete"})
    return trace

def trace_dfs(graph: Graph, start_node: str) -> List[Dict[str, Any]]:
    """DFS with step tracing."""
    trace = []
    
    if start_node not in graph.get_nodes():
        return [{"type": "error", "message": f"Start node {start_node} not found"}]

    visited = set()
    stack = [start_node]
    
    trace.append({
        "type": "start",
        "description": f"Starting DFS from {start_node}",
        "nodeId": start_node
    })

    while stack:
        current_node = stack.pop()
        
        if current_node not in visited:
            visited.add(current_node)
            trace.append({
                "type": "visit_node",
                "nodeId": current_node,
                "description": f"Visiting {current_node}"
            })

            neighbors = graph.get_neighbors(current_node)
            # Reverse to mimic stack behavior (right-to-left processing)
            for neighbor in reversed(neighbors):
                trace.append({
                    "type": "check_neighbor",
                    "source": current_node,
                    "target": neighbor,
                    "description": f"Checking neighbor {neighbor}"
                })
                
                if neighbor not in visited:
                    stack.append(neighbor)
                    trace.append({
                        "type": "add_to_stack",
                        "nodeId": neighbor,
                        "description": f"Adding {neighbor} to stack"
                    })
                else:
                    trace.append({
                        "type": "skip",
                        "nodeId": neighbor,
                        "description": f"{neighbor} already visited"
                    })
                    
    trace.append({"type": "complete", "description": "DFS Traversal Complete"})
    return trace

def trace_dijkstra(graph: Graph, start: str, end: str) -> List[Dict[str, Any]]:
    """Dijkstra with step tracing."""
    trace = []
    nodes = graph.get_nodes()
    
    if start not in nodes or end not in nodes:
        return [{"type": "error", "message": "Start or End node not found"}]

    distances = {node: float('inf') for node in nodes}
    distances[start] = 0.0
    previous = {node: None for node in nodes}
    pq = [(0.0, start)]
    
    trace.append({
        "type": "start",
        "description": f"Starting Dijkstra from {start} to {end}",
        "nodeId": start,
        "distances": distances.copy()
    })

    visited_process = set()

    while pq:
        current_dist, current_node = heapq.heappop(pq)
        
        if current_dist > distances[current_node]:
            continue
            
        trace.append({
            "type": "visit_node",
            "nodeId": current_node,
            "currentDist": current_dist,
            "description": f"Processing {current_node} (dist: {current_dist})"
        })
        
        if current_node == end:
            trace.append({"type": "found_target", "nodeId": end, "description": "Target reached!"})
            break

        visited_process.add(current_node)

        for neighbor in graph.get_neighbors(current_node):
            weight = graph.get_weight(current_node, neighbor)
            if weight is None: continue
            
            trace.append({
                "type": "check_edge",
                "source": current_node,
                "target": neighbor,
                "weight": weight,
                "description": f"Checking edge {current_node}->{neighbor} (w={weight})"
            })

            new_dist = current_dist + weight
            if new_dist < distances[neighbor]:
                distances[neighbor] = new_dist
                previous[neighbor] = current_node
                heapq.heappush(pq, (new_dist, neighbor))
                
                trace.append({
                    "type": "update_distance",
                    "nodeId": neighbor,
                    "newDist": new_dist,
                    "previous": current_node,
                    "description": f"Updated {neighbor} distance to {new_dist}"
                })

    # Reconstruct path
    path = []
    curr = end
    if distances[end] != float('inf'):
        while curr:
            path.append(curr)
            curr = previous[curr]
        path.reverse()
        trace.append({
            "type": "path_found",
            "path": path,
            "description": f"Shortest path found: {' -> '.join(path)}"
        })
    else:
        trace.append({"type": "no_path", "description": "No path found"})

    return trace
