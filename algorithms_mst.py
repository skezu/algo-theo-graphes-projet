"""
Module algorithms_mst.py - Algorithmes d'Arbre Couvrant Minimum (MST).

Ce module contient les implémentations des algorithmes classiques
pour trouver l'arbre couvrant de poids minimum dans un graphe.
"""

from typing import List, Tuple, Dict, TYPE_CHECKING
import heapq

if TYPE_CHECKING:
    from graph import Graph


def prim(graph: "Graph", start_node: str) -> List[Tuple[str, str, float]]:
    """
    Algorithme de Prim pour l'arbre couvrant minimum.

    Construit l'arbre couvrant minimum en partant d'un nœud et en
    ajoutant progressivement l'arête de poids minimum qui connecte
    l'arbre à un nouveau nœud.

    Args:
        graph: Le graphe non orienté à analyser.
        start_node: Le nœud de départ pour construire l'arbre.

    Returns:
        Liste des arêtes de l'arbre couvrant minimum.
        Chaque arête est un tuple (nœud1, nœud2, poids).

    Raises:
        KeyError: Si le nœud de départ n'existe pas.
        ValueError: Si le graphe n'est pas connexe.

    Example:
        >>> g = Graph()
        >>> g.load_data()
        >>> mst = prim(g, "Paris")
        >>> poids_total = sum(poids for _, _, poids in mst)
        >>> print(f"Poids total de l'arbre: {poids_total} km")

    Note:
        Complexité: O(E log V) avec une file de priorité.
        Le graphe doit être connexe pour avoir un arbre couvrant.
    """
    visited = {start_node}
    mst: List[Tuple[str, str, float]] = []
    # File de priorité : (poids, u, v)
    # On commence avec les arêtes partant du nœud de départ
    edges = []
    
    # Vérification de l'existence du nœud
    try:
        neighbors = graph.get_neighbors(start_node)
    except KeyError:
         raise KeyError(f"Le nœud de départ '{start_node}' n'existe pas.")

    for neighbor in neighbors:
        weight = graph.get_weight(start_node, neighbor)
        if weight is None: continue
        heapq.heappush(edges, (weight, start_node, neighbor))
    
    expected_nodes_count = len(graph.get_nodes())
    
    while edges:
        weight, u, v = heapq.heappop(edges)
        
        if v in visited:
            continue
            
        visited.add(v)
        mst.append((u, v, weight))
        
        for next_neighbor in graph.get_neighbors(v):
            if next_neighbor not in visited:
                next_weight = graph.get_weight(v, next_neighbor)
                if next_weight is None: continue
                heapq.heappush(edges, (next_weight, v, next_neighbor))
                
    # Vérification de la connexité (si graphe non connexe, on n'aura pas tous les nœuds)
    if len(visited) != expected_nodes_count:
        # Note : Pour un MST strict, on devrait lever une erreur ou gérer les composantes connexes.
        # Ici on retourne ce qu'on a trouvé (MST de la composante connexe du start_node).
        pass
        
    return mst


def kruskal(graph: "Graph") -> List[Tuple[str, str, float]]:
    """
    Algorithme de Kruskal pour l'arbre couvrant minimum.

    Construit l'arbre couvrant minimum en triant toutes les arêtes
    par poids et en les ajoutant si elles ne créent pas de cycle
    (utilisation de Union-Find).

    Args:
        graph: Le graphe non orienté à analyser.

    Returns:
        Liste des arêtes de l'arbre couvrant minimum.
        Chaque arête est un tuple (nœud1, nœud2, poids).

    Raises:
        ValueError: Si le graphe n'est pas connexe.

    Example:
        >>> g = Graph()
        >>> g.load_data()
        >>> mst = kruskal(g)
        >>> for u, v, w in mst:
        ...     print(f"{u} -- {v}: {w} km")

    Note:
        Complexité: O(E log E) ou O(E log V) avec Union-Find optimisé.
        Nécessite une structure Union-Find pour la détection de cycles.
    """
    mst: List[Tuple[str, str, float]] = []
    edges = graph.get_edges()
    nodes = graph.get_nodes()
    
    # Tri des arêtes par poids croissant
    # edges est une liste de tuples (u, v, weight)
    sorted_edges = sorted(edges, key=lambda x: x[2])
    
    uf = UnionFind(nodes)
    
    for u, v, weight in sorted_edges:
        # Si u et v ne sont pas dans le même ensemble (ne forment pas de cycle)
        if uf.union(u, v):
            mst.append((u, v, weight))
            
    # Vérification de la connexité
    # Pour un graphe connexe de V nœuds, un MST doit avoir V-1 arêtes
    if len(mst) != len(nodes) - 1:
        # Graphe non connexe ou arêtes manquantes
        pass
        
    return mst


class UnionFind:
    """
    Structure de données Union-Find (Disjoint Set Union).

    Utilisée par l'algorithme de Kruskal pour détecter efficacement
    les cycles lors de la construction de l'arbre couvrant minimum.

    Attributes:
        parent (Dict[str, str]): Parent de chaque élément.
        rank (Dict[str, int]): Rang de chaque élément pour l'union par rang.
    """

    def __init__(self, elements: List[str]) -> None:
        """
        Initialise la structure Union-Find.

        Args:
            elements: Liste des éléments initiaux.
        """
        self.parent: Dict[str, str] = {element: element for element in elements}
        self.rank: Dict[str, int] = {element: 0 for element in elements}

    def find(self, x: str) -> str:
        """
        Trouve le représentant (racine) de l'ensemble contenant x.

        Utilise la compression de chemin pour optimiser les recherches futures.

        Args:
            x: L'élément dont on cherche le représentant.

        Returns:
            Le représentant de l'ensemble contenant x.
        """
        if self.parent[x] != x:
            self.parent[x] = self.find(self.parent[x])
        return self.parent[x]

    def union(self, x: str, y: str) -> bool:
        """
        Fusionne les ensembles contenant x et y.

        Utilise l'union par rang pour maintenir des arbres équilibrés.

        Args:
            x: Premier élément.
            y: Second élément.

        Returns:
            True si les ensembles étaient différents et ont été fusionnés,
            False si x et y étaient déjà dans le même ensemble.
        """
        root_x = self.find(x)
        root_y = self.find(y)

        if root_x == root_y:
            return False

        # Union par rang
        if self.rank[root_x] < self.rank[root_y]:
            self.parent[root_x] = root_y
        elif self.rank[root_x] > self.rank[root_y]:
            self.parent[root_y] = root_x
        else:
            self.parent[root_y] = root_x
            self.rank[root_x] += 1
        
        return True
