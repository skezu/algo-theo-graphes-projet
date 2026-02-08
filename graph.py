"""
Module graph.py - Structure de données pour les graphes.

Ce module contient la classe Graph qui représente un graphe pondéré
pouvant être orienté ou non orienté.
"""

from typing import Dict, List, Optional, Tuple, Set, Any


class Graph:
    """
    Classe représentant un graphe pondéré.

    Cette classe utilise un dictionnaire d'adjacence pour stocker
    les nœuds et les arêtes du graphe.

    Attributes:
        adjacency_list (Dict[str, Dict[str, float]]): Dictionnaire d'adjacence
            où chaque clé est un nœud et la valeur est un dictionnaire
            des voisins avec leurs poids.
        directed (bool): Indique si le graphe est orienté ou non.
    """

    def __init__(self, directed: bool = False) -> None:
        """
        Initialise un nouveau graphe.

        Args:
            directed: Si True, le graphe est orienté. Par défaut False
                     (graphe non orienté, adapté au réseau routier).
        """
        self.adjacency_list: Dict[str, Dict[str, float]] = {}
        self.directed: bool = directed

    def add_node(self, node: str) -> None:
        """
        Ajoute un nœud au graphe.

        Si le nœud existe déjà, cette méthode ne fait rien.

        Args:
            node: L'identifiant du nœud à ajouter (ex: "Paris", "Lyon").
        """
        if node not in self.adjacency_list:
                    self.adjacency_list[node] = {}

    def add_edge(
        self,
        node1: str,
        node2: str,
        weight: float = 1.0
    ) -> None:
        """
        Ajoute une arête entre deux nœuds avec un poids optionnel.
        """
        # S'assurer que les deux nœuds existent dans le graphe
        # On réutilise la méthode add_node implémentée précédemment
        self.add_node(node1)
        self.add_node(node2)

        # Ajout de l'arête du nœud1 vers le nœud2
        self.adjacency_list[node1][node2] = weight

        # Si le graphe est non orienté (directed=False), 
        # on ajoute l'arête dans l'autre sens (nœud2 vers nœud1)
        if not self.directed:
            self.adjacency_list[node2][node1] = weight

    def get_neighbors(self, node: str) -> List[str]:
        """
        Retourne la liste des voisins d'un nœud.

        Args:
            node: Le nœud dont on veut les voisins.

        Returns:
            Liste des nœuds adjacents au nœud donné.

        Raises:
            KeyError: Si le nœud n'existe pas dans le graphe.
        """
        # On vérifie d'abord si le nœud existe dans notre dictionnaire d'adjacence
        if node not in self.adjacency_list:
            raise KeyError(f"Le nœud '{node}' n'existe pas dans le graphe.")
        
        # On retourne les clés du dictionnaire interne associé au nœud
        # Ces clés représentent les identifiants des voisins
        return list(self.adjacency_list[node].keys())

    def get_weight(self, node1: str, node2: str) -> Optional[float]:
        """
        Retourne le poids de l'arête entre deux nœuds.

        Args:
            node1: Le premier nœud.
            node2: Le second nœud.

        Returns:
            Le poids de l'arête, ou None si l'arête n'existe pas.
        """
        # On vérifie si node1 existe et si node2 est bien dans ses voisins
        if node1 in self.adjacency_list and node2 in self.adjacency_list[node1]:
            # On retourne la valeur stockée (le poids/la distance)
            return self.adjacency_list[node1][node2]
        
        # Si le nœud source n'existe pas ou s'il n'y a pas d'arête vers node2
        return None
    
    def get_nodes(self) -> List[str]:
        """
        Retourne la liste de tous les nœuds du graphe.

        Returns:
            Liste de tous les identifiants de nœuds.
        """
        # On retourne simplement la liste des clés du dictionnaire principal
        return list(self.adjacency_list.keys())

    def get_edges(self) -> List[Tuple[str, str, float]]:
        """
        Retourne la liste de toutes les arêtes du graphe.

        Returns:
            Liste de tuples (nœud1, nœud2, poids) pour chaque arête.
            Pour un graphe non orienté, chaque arête n'apparaît qu'une fois.
        """
        edges = []
        visited_undirected = set()

        for node1 in self.adjacency_list:
            for node2, weight in self.adjacency_list[node1].items():
                if not self.directed:
                    # Pour un graphe non orienté, on évite les doublons (A,B) et (B,A)
                    edge_id = tuple(sorted((node1, node2)))
                    if edge_id not in visited_undirected:
                        edges.append((node1, node2, weight))
                        visited_undirected.add(edge_id)
                else:
                    # Pour un graphe orienté, on ajoute toutes les relations
                    edges.append((node1, node2, weight))
        
        return edges

    def load_data(self) -> None:
        """
        Charge les données du réseau routier français.
        """
        # Liste des connexions basée sur les données fournies dans le module
        # Format: (Ville A, Ville B, Distance en km)
        road_connections = [
            ("Rennes", "Caen", 75),
            ("Rennes", "Nantes", 45),
            ("Rennes", "Paris", 110),
            ("Caen", "Paris", 50),
            ("Caen", "Lille", 65),
            ("Paris", "Lille", 70),
            ("Paris", "Dijon", 60),
            ("Lille", "Nancy", 100),
            ("Nantes", "Paris", 80),
            ("Nantes", "Bordeaux", 130),
            ("Bordeaux", "Nantes", 90),
            ("Bordeaux", "Lyon", 100),
            ("Lyon", "Dijon", 70),
            ("Lyon", "Grenoble", 40),
            ("Dijon", "Nancy", 75),
            ("Dijon", "Grenoble", 75),
            ("Grenoble", "Nancy", 80),
            ("Nancy", "Lille", 120)
        ]

        # On parcourt la liste pour ajouter chaque arête au graphe
        for city1, city2, distance in road_connections:
            self.add_edge(city1, city2, float(distance))

    def load_negative_weights_data(self) -> None:
        """
        Charge un graphe avec des poids négatifs pour tester Bellman-Ford.
        """
        # Graphe orienté pour éviter les cycles négatifs immédiats d'arêtes bidirectionnelles
        self.directed = True
        self.adjacency_list = {} # Reset

        connections = [
            ("Paris", "Lyon", 4),
            ("Paris", "Bordeaux", 5),
            ("Lyon", "Marseille", 3),
            ("Bordeaux", "Toulouse", 2),
            ("Toulouse", "Marseille", 1),
            ("Marseille", "Nice", -2), # Poids négatif
            ("Nice", "Toulouse", -5), # Cycle négatif potentiel si mal géré, ou raccourci
            ("Lyon", "Nice", 10)
        ]

        for u, v, w in connections:
            self.add_edge(u, v, float(w))

    def __repr__(self) -> str:
        """Représentation textuelle du graphe."""
        graph_type = "orienté" if self.directed else "non orienté"
        return f"Graph({graph_type}, {len(self.adjacency_list)} nœuds)"
