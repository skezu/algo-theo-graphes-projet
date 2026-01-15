"""
Module algorithms_pathfinding.py - Algorithmes de plus court chemin.

Ce module contient les implémentations des algorithmes classiques
pour trouver les plus courts chemins dans un graphe pondéré.
"""

from typing import Dict, List, Optional, Tuple, TYPE_CHECKING
import heapq

if TYPE_CHECKING:
    from graph import Graph


def dijkstra(
    graph: "Graph",
    start: str,
    end: str
) -> Tuple[Optional[float], List[str]]:
    """
    Algorithme de Dijkstra pour le plus court chemin.

    Trouve le chemin le plus court entre deux nœuds dans un graphe
    avec des poids positifs uniquement.

    Args:
        graph: Le graphe à parcourir.
        start: Le nœud de départ.
        end: Le nœud d'arrivée.

    Returns:
        Un tuple contenant:
            - La distance totale du plus court chemin (None si pas de chemin).
            - La liste des nœuds formant le chemin (vide si pas de chemin).

    Raises:
        KeyError: Si le nœud de départ ou d'arrivée n'existe pas.
        ValueError: Si le graphe contient des poids négatifs.

    Example:
        >>> g = Graph()
        >>> g.load_data()
        >>> distance, chemin = dijkstra(g, "Paris", "Lyon")
        >>> print(f"Distance: {distance} km, Chemin: {chemin}")

    Note:
        Complexité: O((V + E) log V) avec une file de priorité.
        Ne fonctionne pas avec des poids négatifs.
    """
    # Vérification de base des nœuds
    nodes = graph.get_nodes()
    if start not in nodes:
        raise KeyError(f"Le nœud de départ '{start}' n'existe pas.")
    if end not in nodes:
        raise KeyError(f"Le nœud d'arrivée '{end}' n'existe pas.")

    # Initialisation
    distances: Dict[str, float] = {node: float('inf') for node in nodes}
    distances[start] = 0.0
    previous: Dict[str, Optional[str]] = {node: None for node in nodes}
    
    # File de priorité : (distance, noeud)
    pq: List[Tuple[float, str]] = [(0.0, start)]
    
    while pq:
        current_distance, current_node = heapq.heappop(pq)
        
        # Si on a trouvé un chemin plus court vers ce nœud entre temps, on ignore
        if current_distance > distances[current_node]:
            continue
            
        if current_node == end:
            break
            
        for neighbor in graph.get_neighbors(current_node):
            weight = graph.get_weight(current_node, neighbor)
            if weight is None:
                continue
                
            if weight < 0:
                raise ValueError("Dijkstra ne supporte pas les poids négatifs.")
                
            distance = current_distance + weight
            
            if distance < distances[neighbor]:
                distances[neighbor] = distance
                previous[neighbor] = current_node
                heapq.heappush(pq, (distance, neighbor))
                
    # Reconstruction du chemin
    if distances[end] == float('inf'):
        return None, []
        
    path = []
    current: Optional[str] = end
    while current is not None:
        path.append(current)
        current = previous[current]
    path.reverse()
    
    return distances[end], path


def bellman_ford(
    graph: "Graph",
    start: str
) -> Tuple[Dict[str, float], Dict[str, Optional[str]]]:
    """
    Algorithme de Bellman-Ford pour les plus courts chemins.

    Trouve les plus courts chemins depuis un nœud source vers tous
    les autres nœuds. Gère les poids négatifs et détecte les cycles
    de poids négatif.

    Args:
        graph: Le graphe à parcourir (doit être orienté pour les poids négatifs).
        start: Le nœud source.

    Returns:
        Un tuple contenant:
            - distances: Dict des distances minimales depuis start vers chaque nœud.
            - predecessors: Dict des prédécesseurs pour reconstruire les chemins.

    Raises:
        KeyError: Si le nœud de départ n'existe pas.
        ValueError: Si un cycle de poids négatif est détecté.

    Example:
        >>> g = Graph(directed=True)
        >>> distances, predecesseurs = bellman_ford(g, "Paris")
        >>> print(distances["Lyon"])

    Note:
        Complexité: O(V * E).
        Peut gérer les poids négatifs contrairement à Dijkstra.
    """
    nodes = graph.get_nodes()
    if start not in nodes:
        raise KeyError(f"Le nœud de départ '{start}' n'existe pas.")
        
    distances: Dict[str, float] = {node: float('inf') for node in nodes}
    distances[start] = 0.0
    predecessors: Dict[str, Optional[str]] = {node: None for node in nodes}
    
    edges = graph.get_edges()
    
    # Relaxation V-1 fois
    for _ in range(len(nodes) - 1):
        modified = False
        for u, v, weight in edges:
            if distances[u] != float('inf') and distances[u] + weight < distances[v]:
                distances[v] = distances[u] + weight
                predecessors[v] = u
                modified = True
            
            # Pour un graphe non orienté, on doit aussi relaxer l'arête inverse (v -> u)
            # car get_edges() ne retourne qu'une seule direction pour chaque paire
            if not graph.directed:
                if distances[v] != float('inf') and distances[v] + weight < distances[u]:
                    distances[u] = distances[v] + weight
                    predecessors[u] = v
                    modified = True
        # Optimisation : si aucune distance n'a changé, on peut arrêter
        if not modified:
             break

    # Détection de cycle négatif
    for u, v, weight in edges:
        if distances[u] != float('inf') and distances[u] + weight < distances[v]:
            raise ValueError("Le graphe contient un cycle de poids négatif.")
            
    return distances, predecessors


def floyd_warshall(
    graph: "Graph"
) -> Tuple[Dict[str, Dict[str, float]], Dict[str, Dict[str, Optional[str]]]]:
    """
    Algorithme de Floyd-Warshall pour tous les plus courts chemins.

    Calcule la matrice des distances minimales entre toutes les paires
    de nœuds du graphe.

    Args:
        graph: Le graphe à analyser.

    Returns:
        Un tuple contenant:
            - distances: Matrice (dict de dicts) des distances minimales.
            - next_node: Matrice pour reconstruire les chemins.

    Raises:
        ValueError: Si un cycle de poids négatif est détecté.

    Example:
        >>> g = Graph()
        >>> g.load_data()
        >>> distances, next_nodes = floyd_warshall(g)
        >>> print(f"Paris -> Lyon: {distances['Paris']['Lyon']} km")

    Note:
        Complexité: O(V³).
        Utile quand on a besoin de toutes les distances entre toutes les paires.
    """
    nodes = graph.get_nodes()
    dist: Dict[str, Dict[str, float]] = {u: {v: float('inf') for v in nodes} for u in nodes}
    next_node: Dict[str, Dict[str, Optional[str]]] = {u: {v: None for v in nodes} for u in nodes}
    
    # Initialisation avec les arêtes existantes
    for u in nodes:
        dist[u][u] = 0.0
        for v in graph.get_neighbors(u):
            weight = graph.get_weight(u, v)
            if weight is not None:
                dist[u][v] = weight
                next_node[u][v] = v
                
    # Algorithme principal
    for k in nodes:
        for i in nodes:
            for j in nodes:
                if dist[i][k] != float('inf') and dist[k][j] != float('inf'):
                    new_dist = dist[i][k] + dist[k][j]
                    if new_dist < dist[i][j]:
                        dist[i][j] = new_dist
                        next_node[i][j] = next_node[i][k]
                        
    # Détection de cycles négatifs (distance d'un nœud à lui-même < 0)
    for u in nodes:
        if dist[u][u] < 0:
            raise ValueError("Le graphe contient un cycle de poids négatif.")
            
    return dist, next_node
