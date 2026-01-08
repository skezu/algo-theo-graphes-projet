"""
Module algorithms_pathfinding.py - Algorithmes de plus court chemin.

Ce module contient les implémentations des algorithmes classiques
pour trouver les plus courts chemins dans un graphe pondéré.
"""

from typing import Dict, List, Optional, Tuple, TYPE_CHECKING

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
    raise NotImplementedError("L'algorithme de Dijkstra doit être implémenté.")


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
    raise NotImplementedError("L'algorithme de Bellman-Ford doit être implémenté.")


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
    raise NotImplementedError("L'algorithme de Floyd-Warshall doit être implémenté.")
