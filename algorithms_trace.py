from typing import List, Dict, Tuple, Any, Optional
from collections import deque
from graph import Graph
from pert_scheduler import PertScheduler

class Step:
    """Represents a single step in algorithm execution."""
    
    def __init__(
        self,
        step_type: str,
        target_id: str,
        description: str,
        data: Optional[Dict[str, Any]] = None
    ):
        self.type = step_type
        self.target_id = target_id
        self.description = description
        self.data = data or {}
    
    def to_dict(self) -> Dict[str, Any]:
        return {
            "type": self.type,
            "targetId": self.target_id,
            "description": self.description,
            "data": self._sanitize_data(self.data)
        }

    def _sanitize_data(self, data: Dict[str, Any]) -> Dict[str, Any]:
        """Recursively sanitize data to be JSON serializable."""
        if not data:
            return {}
            
        sanitized = {}
        for key, value in data.items():
            if isinstance(value, float):
                if value == float('inf'):
                    sanitized[key] = "Infinity"
                elif value == float('-inf'):
                    sanitized[key] = "-Infinity"
                else:
                    sanitized[key] = value
            elif isinstance(value, dict):
                sanitized[key] = self._sanitize_data(value)
            elif isinstance(value, list):
                sanitized[key] = [
                    "Infinity" if v == float('inf') else 
                    "-Infinity" if v == float('-inf') else v 
                    for v in value
                ]
            else:
                sanitized[key] = value
        return sanitized


def traced_bfs(graph: Graph, start_node: str) -> Tuple[List[str], List[Dict]]:
    """
    BFS with execution trace.
    
    Returns:
        Tuple of (visit_order, trace_steps)
    """
    if start_node not in graph.adjacency_list:
        raise KeyError(f"Node '{start_node}' not found")
    
    visited = {start_node}
    queue = deque([start_node])
    path = []
    steps = []
    
    steps.append(Step(
        "init",
        start_node,
        f"Starting BFS from '{start_node}'"
    ).to_dict())
    
    while queue:
        current = queue.popleft()
        path.append(current)
        
        steps.append(Step(
            "visit_node",
            current,
            f"Visiting node '{current}'",
            {"visitOrder": len(path)}
        ).to_dict())
        
        for neighbor in graph.get_neighbors(current):
            edge_id = f"{current}-{neighbor}"
            
            steps.append(Step(
                "explore_edge",
                edge_id,
                f"Exploring edge {current} → {neighbor}"
            ).to_dict())
            
            if neighbor not in visited:
                visited.add(neighbor)
                queue.append(neighbor)
                
                steps.append(Step(
                    "enqueue",
                    neighbor,
                    f"Adding '{neighbor}' to queue",
                    {"queueSize": len(queue)}
                ).to_dict())
    
    steps.append(Step(
        "complete",
        "",
        f"BFS complete. Visited {len(path)} nodes.",
        {"visitOrder": path}
    ).to_dict())
    
    return path, steps


def traced_dfs(graph: Graph, start_node: str) -> Tuple[List[str], List[Dict]]:
    """
    DFS with execution trace.
    
    Returns:
        Tuple of (visit_order, trace_steps)
    """
    if start_node not in graph.adjacency_list:
        raise KeyError(f"Node '{start_node}' not found")
    
    visited = set()
    stack = [start_node]
    path = []
    steps = []
    
    steps.append(Step(
        "init",
        start_node,
        f"Starting DFS from '{start_node}'"
    ).to_dict())
    
    while stack:
        current = stack.pop()
        
        if current in visited:
            continue
            
        visited.add(current)
        path.append(current)
        
        steps.append(Step(
            "visit_node",
            current,
            f"Visiting node '{current}'",
            {"visitOrder": len(path)}
        ).to_dict())
        
        neighbors = graph.get_neighbors(current)
        for neighbor in reversed(neighbors):
            edge_id = f"{current}-{neighbor}"
            
            steps.append(Step(
                "explore_edge",
                edge_id,
                f"Exploring edge {current} → {neighbor}"
            ).to_dict())
            
            if neighbor not in visited:
                stack.append(neighbor)
                
                steps.append(Step(
                    "push_stack",
                    neighbor,
                    f"Pushing '{neighbor}' to stack",
                    {"stackSize": len(stack)}
                ).to_dict())
    
    steps.append(Step(
        "complete",
        "",
        f"DFS complete. Visited {len(path)} nodes.",
        {"visitOrder": path}
    ).to_dict())
    
    return path, steps


def traced_dijkstra(
    graph: Graph,
    start_node: str,
    end_node: Optional[str] = None
) -> Tuple[Dict[str, float], Dict[str, Optional[str]], List[Dict]]:
    """
    Dijkstra with execution trace.
    
    Returns:
        Tuple of (distances, predecessors, trace_steps)
    """
    import heapq
    
    if start_node not in graph.adjacency_list:
        raise KeyError(f"Node '{start_node}' not found")
    
    nodes = graph.get_nodes()
    distances = {node: float('inf') for node in nodes}
    distances[start_node] = 0
    predecessors = {node: None for node in nodes}
    visited = set()
    priority_queue = [(0, start_node)]
    steps = []
    
    steps.append(Step(
        "init",
        start_node,
        f"Starting Dijkstra from '{start_node}'",
        {"target": end_node}
    ).to_dict())
    
    while priority_queue:
        current_dist, current = heapq.heappop(priority_queue)
        
        if current in visited:
            continue
        
        visited.add(current)
        
        steps.append(Step(
            "visit_node",
            current,
            f"Processing '{current}' with distance {current_dist}",
            {"distance": current_dist}
        ).to_dict())
        
        if end_node and current == end_node:
            # Reconstruct path
            path = []
            node = end_node
            while node:
                path.append(node)
                node = predecessors[node]
            path.reverse()
            
            steps.append(Step(
                "found_path",
                end_node,
                f"Found shortest path to '{end_node}'",
                {"path": path, "distance": distances[end_node]}
            ).to_dict())
            break
        
        for neighbor in graph.get_neighbors(current):
            if neighbor in visited:
                continue
                
            edge_id = f"{current}-{neighbor}"
            weight = graph.get_weight(current, neighbor) or 1
            new_dist = current_dist + weight
            
            steps.append(Step(
                "explore_edge",
                edge_id,
                f"Checking edge {current} → {neighbor} (weight: {weight})",
                {"currentDist": distances[neighbor], "newDist": new_dist}
            ).to_dict())
            
            if new_dist < distances[neighbor]:
                distances[neighbor] = new_dist
                predecessors[neighbor] = current
                heapq.heappush(priority_queue, (new_dist, neighbor))
                
                steps.append(Step(
                    "update_distance",
                    neighbor,
                    f"Updated distance to '{neighbor}': {new_dist}",
                    {"distance": new_dist, "predecessor": current}
                ).to_dict())
    
    steps.append(Step(
        "complete",
        "",
        "Dijkstra complete.",
        {"distances": {k: v for k, v in distances.items() if v != float('inf')}}
    ).to_dict())
    
    return distances, predecessors, steps


def traced_prim(graph: Graph, start_node: str) -> Tuple[List[Tuple[str, str, float]], List[Dict]]:
    """
    Prim's MST algorithm with execution trace.
    
    Returns:
        Tuple of (mst_edges, trace_steps)
    """
    import heapq
    
    if start_node not in graph.adjacency_list:
        raise KeyError(f"Node '{start_node}' not found")
    
    visited = {start_node}
    mst_edges = []
    steps = []
    
    # Priority queue: (weight, from_node, to_node)
    edges = []
    for neighbor in graph.get_neighbors(start_node):
        weight = graph.get_weight(start_node, neighbor) or 1
        heapq.heappush(edges, (weight, start_node, neighbor))
    
    steps.append(Step(
        "init",
        start_node,
        f"Starting Prim's algorithm from '{start_node}'"
    ).to_dict())
    
    total_weight = 0
    
    while edges and len(visited) < len(graph.get_nodes()):
        weight, from_node, to_node = heapq.heappop(edges)
        edge_id = f"{from_node}-{to_node}"
        
        if to_node in visited:
            steps.append(Step(
                "skip_edge",
                edge_id,
                f"Skipping edge {from_node} → {to_node} (already visited)"
            ).to_dict())
            continue
        
        visited.add(to_node)
        mst_edges.append((from_node, to_node, weight))
        total_weight += weight
        
        steps.append(Step(
            "add_edge",
            edge_id,
            f"Adding edge {from_node} → {to_node} (weight: {weight})",
            {"totalWeight": total_weight, "edgeCount": len(mst_edges)}
        ).to_dict())
        
        steps.append(Step(
            "visit_node",
            to_node,
            f"Including '{to_node}' in MST",
            {"visitedCount": len(visited)}
        ).to_dict())
        
        for neighbor in graph.get_neighbors(to_node):
            if neighbor not in visited:
                neighbor_weight = graph.get_weight(to_node, neighbor) or 1
                heapq.heappush(edges, (neighbor_weight, to_node, neighbor))
    
    steps.append(Step(
        "complete",
        "",
        f"Prim's algorithm complete. MST has {len(mst_edges)} edges.",
        {"totalWeight": total_weight, "edges": [(e[0], e[1], e[2]) for e in mst_edges]}
    ).to_dict())
    
    return mst_edges, steps


def traced_kruskal(graph: Graph) -> Tuple[List[Tuple[str, str, float]], List[Dict]]:
    """
    Kruskal's MST algorithm with execution trace.
    
    Returns:
        Tuple of (mst_edges, trace_steps)
    """
    # Union-Find data structure
    parent = {}
    rank = {}
    
    def find(node):
        if parent[node] != node:
            parent[node] = find(parent[node])
        return parent[node]
    
    def union(node1, node2):
        root1, root2 = find(node1), find(node2)
        if root1 != root2:
            if rank[root1] < rank[root2]:
                parent[root1] = root2
            elif rank[root1] > rank[root2]:
                parent[root2] = root1
            else:
                parent[root2] = root1
                rank[root1] += 1
            return True
        return False
    
    nodes = graph.get_nodes()
    for node in nodes:
        parent[node] = node
        rank[node] = 0
    
    edges = graph.get_edges()
    edges.sort(key=lambda x: x[2])
    
    mst_edges = []
    steps = []
    
    steps.append(Step(
        "init",
        "",
        f"Starting Kruskal's algorithm. Sorted {len(edges)} edges by weight."
    ).to_dict())
    
    total_weight = 0
    
    for node1, node2, weight in edges:
        edge_id = f"{node1}-{node2}"
        
        steps.append(Step(
            "explore_edge",
            edge_id,
            f"Considering edge {node1} — {node2} (weight: {weight})"
        ).to_dict())
        
        if union(node1, node2):
            mst_edges.append((node1, node2, weight))
            total_weight += weight
            
            steps.append(Step(
                "add_edge",
                edge_id,
                f"Adding edge {node1} — {node2} to MST",
                {"totalWeight": total_weight, "edgeCount": len(mst_edges)}
            ).to_dict())
        else:
            steps.append(Step(
                "skip_edge",
                edge_id,
                f"Skipping edge {node1} — {node2} (would create cycle)"
            ).to_dict())
        
        if len(mst_edges) == len(nodes) - 1:
            break
    
    steps.append(Step(
        "complete",
        "",
        f"Kruskal's algorithm complete. MST has {len(mst_edges)} edges.",
        {"totalWeight": total_weight, "edges": [(e[0], e[1], e[2]) for e in mst_edges]}
    ).to_dict())
    
    return mst_edges, steps


def traced_bellman_ford(
    graph: Graph,
    start_node: str
) -> Tuple[Dict[str, float], Dict[str, Optional[str]], bool, List[Dict]]:
    """
    Bellman-Ford with execution trace.
    
    Returns:
        Tuple of (distances, predecessors, has_negative_cycle, trace_steps)
    """
    if start_node not in graph.adjacency_list:
        raise KeyError(f"Node '{start_node}' not found")
    
    nodes = graph.get_nodes()
    edges = graph.get_edges()
    
    distances = {node: float('inf') for node in nodes}
    distances[start_node] = 0
    predecessors = {node: None for node in nodes}
    steps = []
    
    steps.append(Step(
        "init",
        start_node,
        f"Starting Bellman-Ford from '{start_node}'"
    ).to_dict())
    
    # Relax edges |V| - 1 times
    for iteration in range(len(nodes) - 1):
        updated = False
        
        steps.append(Step(
            "iteration",
            "",
            f"Iteration {iteration + 1}/{len(nodes) - 1}"
        ).to_dict())
        
        for u, v, weight in edges:
            edge_id = f"{u}-{v}"
            
            # Relaxation u -> v
            if distances[u] != float('inf') and distances[u] + weight < distances[v]:
                distances[v] = distances[u] + weight
                predecessors[v] = u
                updated = True
                
                steps.append(Step(
                    "update_distance",
                    v,
                    f"Relaxed edge {u} → {v}: new distance = {distances[v]}",
                    {"distance": distances[v], "predecessor": u}
                ).to_dict())

            # Relaxation v -> u (if undirected)
            if not graph.directed:
                if distances[v] != float('inf') and distances[v] + weight < distances[u]:
                    distances[u] = distances[v] + weight
                    predecessors[u] = v
                    updated = True
                    
                    steps.append(Step(
                        "update_distance",
                        u,
                        f"Relaxed edge {v} → {u}: new distance = {distances[u]}",
                        {"distance": distances[u], "predecessor": v}
                    ).to_dict())
        
        if not updated:
            steps.append(Step(
                "early_stop",
                "",
                f"No updates in iteration {iteration + 1}. Stopping early."
            ).to_dict())
            break
    
    # Check for negative cycles
    has_negative_cycle = False
    for u, v, weight in edges:
        # Check u -> v
        if distances[u] != float('inf') and distances[u] + weight < distances[v]:
            has_negative_cycle = True
            steps.append(Step(
                "negative_cycle",
                f"{u}-{v}",
                f"Negative cycle detected via edge {u} → {v}"
            ).to_dict())
            break
        
        # Check v -> u (if undirected)
        if not graph.directed:
            if distances[v] != float('inf') and distances[v] + weight < distances[u]:
                has_negative_cycle = True
                steps.append(Step(
                    "negative_cycle",
                    f"{v}-{u}",
                    f"Negative cycle detected via edge {v} → {u}"
                ).to_dict())
                break
    
    steps.append(Step(
        "complete",
        "",
        "Bellman-Ford complete." + (" (Negative cycle detected!)" if has_negative_cycle else ""),
        {"distances": {k: v for k, v in distances.items() if v != float('inf')}}
    ).to_dict())
    
    return distances, predecessors, has_negative_cycle, steps

def traced_pert(tasks: List[Dict[str, Any]]) -> Tuple[List[Any], List[str], List[Dict]]:
    """
    PERT algorithm with execution trace.
    
    Args:
        tasks: List of dicts with keys 'id', 'name', 'duration', 'predecessors'
        
    Returns:
        Tuple of (schedule_result, critical_path, trace_steps)
    """
    scheduler = PertScheduler()
    for task in tasks:
        scheduler.add_task(
            task['id'], 
            task['name'], 
            task['duration'], 
            task.get('predecessors', [])
        )
    
    steps = []
    
    # 1. Validation
    steps.append(Step("init", "", "Initializing PERT analysis").to_dict())
    
    try:
        topo_order = scheduler.get_topological_sort()
        steps.append(Step("info", "", "Topological sort completed", {"order": topo_order}).to_dict())
    except ValueError as e:
        steps.append(Step("error", "", str(e)).to_dict())
        return [], [], steps

    # 2. Forward Pass (ES, EF)
    steps.append(Step("phase", "", "Phase 1: Forward Pass (Earliest Dates)").to_dict())
    earliest_dates = {}
    
    for t_id in topo_order:
        task = scheduler.tasks[t_id]
        
        # Calculate start time
        start_time = 0.0
        contributing_pred = None
        
        for pred_id in task.predecessors:
            if pred_id in earliest_dates:
                _, pred_finish = earliest_dates[pred_id]
                if pred_finish > start_time:
                    start_time = pred_finish
                    contributing_pred = pred_id
        
        finish_time = start_time + task.duration
        earliest_dates[t_id] = (start_time, finish_time)
        
        log_msg = f"Task {t_id}: ES={start_time}, EF={finish_time}"
        if contributing_pred:
            log_msg += f" (constrained by {contributing_pred})"
            
        steps.append(Step(
            "calc_dates",
            t_id,
            log_msg,
            {"es": start_time, "ef": finish_time}
        ).to_dict())

    # 3. Backward Pass (LS, LF)
    steps.append(Step("phase", "", "Phase 2: Backward Pass (Latest Dates)").to_dict())
    
    project_duration = max(result[1] for result in earliest_dates.values()) if earliest_dates else 0
    steps.append(Step("info", "", f"Project Duration: {project_duration}").to_dict())
    
    latest_dates = {}
    successors = scheduler._build_successors()
    reverse_order = topo_order[::-1]
    
    for t_id in reverse_order:
        task = scheduler.tasks[t_id]
        task_successors = successors[t_id]
        
        if not task_successors:
            finish_time = project_duration
        else:
            finish_time = project_duration
            min_start = float('inf')
            has_const = False
            for succ_id in task_successors:
                if succ_id in latest_dates:
                    succ_start, _ = latest_dates[succ_id]
                    if succ_start < min_start:
                        min_start = succ_start
                        has_const = True
            
            if has_const:
                finish_time = min_start
        
        start_time = finish_time - task.duration
        latest_dates[t_id] = (start_time, finish_time)
        
        steps.append(Step(
            "calc_dates",
            t_id,
            f"Task {t_id}: LS={start_time}, LF={finish_time}",
            {"ls": start_time, "lf": finish_time}
        ).to_dict())

    # 4. Critical Path Calculation
    steps.append(Step("phase", "", "Phase 3: Calculating Margins & Critical Path").to_dict())
    
    critical_path = []
    for t_id in topo_order:
        es, ef = earliest_dates[t_id]
        ls, lf = latest_dates[t_id]
        total_float = round(ls - es, 6)
        
        is_critical = abs(total_float) < 1e-6
        if is_critical:
            critical_path.append(t_id)
            
        steps.append(Step(
            "calc_float",
            t_id,
            f"Task {t_id}: Float={total_float} {'(CRITICAL)' if is_critical else ''}",
            {"totalFloat": total_float, "isCritical": is_critical}
        ).to_dict())
            
    steps.append(Step(
        "complete",
        "",
        f"PERT Analysis Complete. Critical Path: {' -> '.join(critical_path)}",
        {"criticalPath": critical_path}
    ).to_dict())
    
    # Get the official full schedule object to return
    full_schedule = scheduler.get_full_schedule()
    # Convert dataclasses to dicts for JSON
    schedule_dicts = [
        {
            "taskId": item.task_id,
            "earliestStart": item.earliest_start,
            "earliestFinish": item.earliest_finish,
            "latestStart": item.latest_start,
            "latestFinish": item.latest_finish,
            "totalFloat": item.total_float,
            "freeFloat": item.free_float,
            "isCritical": item.is_critical
        }
        for item in full_schedule
    ]
    
    
    # Get AoA structure for visualization
    aoa_structure = scheduler.get_aoa_structure()

    return schedule_dicts, critical_path, aoa_structure, steps
