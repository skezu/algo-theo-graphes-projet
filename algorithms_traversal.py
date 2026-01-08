"""
Module algorithms_traversal.py - Algorithmes de parcours de graphes.

Ce module contient les implémentations des algorithmes de parcours
classiques : BFS (Breadth-First Search) et DFS (Depth-First Search).
"""

from typing import List, TYPE_CHECKING

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
    raise NotImplementedError("L'algorithme BFS doit être implémenté.")


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
    raise NotImplementedError("L'algorithme DFS doit être implémenté.")
