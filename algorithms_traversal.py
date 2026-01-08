"""
Module algorithms_traversal.py - Algorithmes de parcours de graphes.

Ce module contient les implémentations des algorithmes de parcours
classiques : BFS (Breadth-First Search) et DFS (Depth-First Search).
"""

from typing import List, Set, TYPE_CHECKING
from collections import deque

if TYPE_CHECKING:
    from graph import Graph


def bfs(graph: "Graph", start_node: str) -> List[str]:
    """
    Parcours en largeur (Breadth-First Search).

    Explore le graphe niveau par niveau, en visitant d'abord tous les
    voisins directs avant de passer aux voisins des voisins.

    Args:
        graph: Le graphe à parcourir.
        start_node: Le nœud de départ du parcours.

    Returns:
        L'ordre de visite des nœuds sous forme de liste.

    Raises:
        KeyError: Si le nœud de départ n'existe pas dans le graphe.

    Example:
        >>> g = Graph()
        >>> g.load_data()
        >>> ordre = bfs(g, "Paris")
        >>> print(ordre)
        ['Paris', 'Caen', 'Lille', 'Dijon', ...]

    Note:
        Doit retourner l'ordre de visite des nœuds.
        Utilise une file (queue) pour gérer les nœuds à visiter.
    """
    # Vérification de l'existence du nœud de départ
    # Nous utilisons get_neighbors pour vérifier l'existence, car elle lève KeyError si le nœud est absent.
    try:
        graph.get_neighbors(start_node)
    except KeyError:
        raise KeyError(f"Le nœud de départ '{start_node}' n'existe pas dans le graphe.")
    # Note: Si graph.get_neighbors lève NotImplementedError (Tâche 1 non faite), cela se propagera.

    visited: Set[str] = {start_node}
    queue: deque = deque([start_node])
    path: List[str] = []

    while queue:
        current_node = queue.popleft()
        path.append(current_node)

        for neighbor in graph.get_neighbors(current_node):
            if neighbor not in visited:
                visited.add(neighbor)
                queue.append(neighbor)

    return path


def dfs(graph: "Graph", start_node: str) -> List[str]:
    """
    Parcours en profondeur (Depth-First Search).

    Explore le graphe en allant le plus loin possible dans chaque branche
    avant de revenir en arrière (backtracking).

    Args:
        graph: Le graphe à parcourir.
        start_node: Le nœud de départ du parcours.

    Returns:
        L'ordre de visite des nœuds sous forme de liste.

    Raises:
        KeyError: Si le nœud de départ n'existe pas dans le graphe.

    Example:
        >>> g = Graph()
        >>> g.load_data()
        >>> ordre = dfs(g, "Paris")
        >>> print(ordre)
        ['Paris', 'Caen', 'Rennes', ...]

    Note:
        Doit retourner l'ordre de visite des nœuds.
        Peut être implémenté de manière itérative (pile) ou récursive.
    """
    # Vérification de l'existence du nœud de départ
    try:
        graph.get_neighbors(start_node)
    except KeyError:
        raise KeyError(f"Le nœud de départ '{start_node}' n'existe pas dans le graphe.")

    visited: Set[str] = set()
    stack: List[str] = [start_node]
    path: List[str] = []

    while stack:
        current_node = stack.pop()

        if current_node not in visited:
            visited.add(current_node)
            path.append(current_node)

            # On récupère les voisins
            neighbors = graph.get_neighbors(current_node)
            
            # Pour simuler un ordre de visite naturel (gauche à droite) avec une pile,
            # on doit ajouter les voisins en ordre inverse (le dernier ajouté sera le premier visité).
            for neighbor in reversed(neighbors):
                if neighbor not in visited:
                    stack.append(neighbor)

    return path
