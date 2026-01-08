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
        raise NotImplementedError("La méthode add_node doit être implémentée.")

    def add_edge(
        self,
        node1: str,
        node2: str,
        weight: float = 1.0
    ) -> None:
        """
        Ajoute une arête entre deux nœuds avec un poids optionnel.

        Si le graphe est non orienté, l'arête est ajoutée dans les deux sens.
        Les nœuds sont créés automatiquement s'ils n'existent pas.

        Args:
            node1: Le premier nœud (source si orienté).
            node2: Le second nœud (destination si orienté).
            weight: Le poids de l'arête (distance en km pour le réseau routier).
                   Par défaut 1.0.
        """
        raise NotImplementedError("La méthode add_edge doit être implémentée.")

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
        raise NotImplementedError("La méthode get_neighbors doit être implémentée.")

    def get_weight(self, node1: str, node2: str) -> Optional[float]:
        """
        Retourne le poids de l'arête entre deux nœuds.

        Args:
            node1: Le premier nœud.
            node2: Le second nœud.

        Returns:
            Le poids de l'arête, ou None si l'arête n'existe pas.
        """
        raise NotImplementedError("La méthode get_weight doit être implémentée.")

    def get_nodes(self) -> List[str]:
        """
        Retourne la liste de tous les nœuds du graphe.

        Returns:
            Liste de tous les identifiants de nœuds.
        """
        raise NotImplementedError("La méthode get_nodes doit être implémentée.")

    def get_edges(self) -> List[Tuple[str, str, float]]:
        """
        Retourne la liste de toutes les arêtes du graphe.

        Returns:
            Liste de tuples (nœud1, nœud2, poids) pour chaque arête.
            Pour un graphe non orienté, chaque arête n'apparaît qu'une fois.
        """
        raise NotImplementedError("La méthode get_edges doit être implémentée.")

    def load_data(self) -> None:
        """
        Charge les données du réseau routier français.

        Cette méthode initialise le graphe avec les villes et distances
        du réseau routier. Les distances sont en kilomètres.

        Villes incluses:
            - Rennes, Caen, Paris, Nantes, Bordeaux, Lille,
            - Lyon, Dijon, Grenoble, Nancy

        Note:
            Les données sont basées sur la carte fournie.
            Structure extensible pour ajouter d'autres connexions.
        """
        # TODO: Implémenter le chargement des données
        # Données de la carte (distances en km approximatives):
        # - Rennes <-> Caen: 75
        # - Rennes <-> Nantes: 45
        # - Rennes <-> Paris: 110
        # - Caen <-> Paris: 50
        # - Caen <-> Lille: 65
        # - Paris <-> Lille: 70
        # - Paris <-> Dijon: 60
        # - Lille <-> Nancy: 100
        # - Nantes <-> Paris: 80
        # - Nantes <-> Bordeaux: 130
        # - Bordeaux <-> Nantes: 90
        # - Bordeaux <-> Lyon: 100
        # - Lyon <-> Dijon: 70
        # - Lyon <-> Grenoble: 40
        # - Dijon <-> Nancy: 75
        # - Dijon <-> Grenoble: 75
        # - Grenoble <-> Nancy: 80
        # - Nancy <-> Lille: 120
        raise NotImplementedError("La méthode load_data doit être implémentée.")

    def __repr__(self) -> str:
        """Représentation textuelle du graphe."""
        graph_type = "orienté" if self.directed else "non orienté"
        return f"Graph({graph_type}, {len(self.adjacency_list)} nœuds)"
