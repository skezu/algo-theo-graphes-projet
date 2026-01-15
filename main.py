"""
Point d'entrée principal du projet ALMF51 - Algorithmes de Graphes.

Ce module démontre l'utilisation de la librairie de graphes et
des différents algorithmes implémentés.
"""

from graph import Graph
from algorithms_traversal import bfs, dfs
from algorithms_pathfinding import dijkstra, bellman_ford, floyd_warshall
from algorithms_mst import prim, kruskal
from pert_scheduler import PertScheduler


def demo_road_network() -> None:
    """
    Démonstration des algorithmes sur le réseau routier français.

    Crée un graphe représentant les villes et distances, puis
    exécute les différents algorithmes.
    """
    print("=" * 60)
    print("DÉMONSTRATION - RÉSEAU ROUTIER FRANÇAIS")
    print("=" * 60)

    # TODO: Créer et charger le graphe
    graph = Graph(directed=False)
    graph.load_data()

    print("\n--- Parcours du graphe ---")
    # TODO: Exécuter BFS depuis Paris
    ordre_bfs = bfs(graph, "Paris")
    print(f"BFS depuis Paris: {ordre_bfs}")

    # TODO: Exécuter DFS depuis Paris
    ordre_dfs = dfs(graph, "Paris")
    print(f"DFS depuis Paris: {ordre_dfs}")

    print("\n--- Plus courts chemins ---")
    # TODO: Trouver le plus court chemin Paris -> Lyon
    distance, chemin = dijkstra(graph, "Paris", "Lyon")
    print(f"Dijkstra Paris -> Lyon: {distance} km")
    print(f"Chemin: {' -> '.join(chemin)}")

    # TODO: Bellman-Ford depuis Paris
    distances, _ = bellman_ford(graph, "Paris")
    print(f"\nDistances depuis Paris (Bellman-Ford):")
    for ville, dist in sorted(distances.items()):
        print(f"  {ville}: {dist} km")

    # TODO: Floyd-Warshall - Matrice des distances
    all_distances, _ = floyd_warshall(graph)
    print(f"\nMatrice des distances (Floyd-Warshall):")
    print(f"  Lyon -> Lille: {all_distances['Lyon']['Lille']} km")

    print("\n--- Arbre Couvrant Minimum ---")
    # TODO: Calculer le MST avec Prim
    mst_prim = prim(graph, "Paris")
    poids_prim = sum(w for _, _, w in mst_prim)
    print(f"MST (Prim) - Poids total: {poids_prim} km")

    # TODO: Calculer le MST avec Kruskal
    mst_kruskal = kruskal(graph)
    poids_kruskal = sum(w for _, _, w in mst_kruskal)
    print(f"MST (Kruskal) - Poids total: {poids_kruskal} km")


def demo_pert_scheduling() -> None:
    """
    Démonstration de l'ordonnancement PERT.

    Crée un projet d'exemple et calcule le planning optimal.
    """
    print("\n" + "=" * 60)
    print("DÉMONSTRATION - ORDONNANCEMENT PERT")
    print("=" * 60)

    # TODO: Créer le planificateur et ajouter les tâches
    scheduler = PertScheduler()
    scheduler.load_sample_project()
    
    # Vérification d'absence de cycle
    if scheduler.validate_no_cycles():
        print("Le graphe est acyclique, calcul possible.")
    else:
        print("Erreur: Le graphe contient un cycle !")
        return

    # TODO: Calculer et afficher l'ordonnancement
    print("\n--- Dates au plus tôt ---")
    earliest = scheduler.calculate_earliest_dates()
    for task_id, (start, finish) in earliest.items():
        print(f"  {task_id}: début={start}, fin={finish}")

    # TODO: Calculer et afficher les dates au plus tard
    print("\n--- Dates au plus tard ---")
    latest = scheduler.calculate_latest_dates()
    for task_id, (start, finish) in latest.items():
        print(f"  {task_id}: début={start}, fin={finish}")

    # TODO: Afficher les marges
    print("\n--- Marges ---")
    floats = scheduler.calculate_floats()
    for task_id, (total, free) in floats.items():
        print(f"  {task_id}: marge totale={total}, marge libre={free}")

    # TODO: Afficher le chemin critique
    print("\n--- Chemin Critique ---")
    critical_path = scheduler.get_critical_path()
    print(f"  {' -> '.join(critical_path)}")

    # TODO: Afficher la durée du projet
    print(f"\nDurée totale du projet: {scheduler.get_project_duration()} unités")
    
    # Test cycle detection
    print("\n--- Test détection de cycle ---")
    scheduler_cycle = PertScheduler()
    scheduler_cycle.add_task("A", "A", 1, [])
    scheduler_cycle.add_task("B", "B", 1, ["A"])
    # Manually inject cycle A -> B -> A
    scheduler_cycle.tasks["A"].predecessors.append("B")
    print(f"Graphe avec cycle A<->B valide ? {scheduler_cycle.validate_no_cycles()}")


def main() -> None:
    """Point d'entrée principal."""
    print("Projet ALMF51 - Algorithmes de Graphes")
    print("Efrei Paris - 2026")
    print()

    # Démonstration du réseau routier
    demo_road_network()

    # Démonstration de l'ordonnancement PERT
    demo_pert_scheduling()

    print("\n" + "=" * 60)
    print("FIN DES DÉMONSTRATIONS")
    print("=" * 60)


if __name__ == "__main__":
    main()
