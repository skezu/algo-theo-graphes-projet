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

    # Créer et charger le graphe
    graph = Graph(directed=False)
    graph.load_data()

    print("\n--- Parcours du graphe ---")
    # Exécuter BFS depuis Paris
    ordre_bfs = bfs(graph, "Paris")
    print(f"BFS depuis Paris: {ordre_bfs}")

    # Exécuter DFS depuis Paris
    ordre_dfs = dfs(graph, "Paris")
    print(f"DFS depuis Paris: {ordre_dfs}")

    print("\n--- Plus courts chemins ---")
    # Trouver le plus court chemin Paris -> Lyon
    distance, chemin = dijkstra(graph, "Paris", "Lyon")
    print(f"Dijkstra Paris -> Lyon: {distance} km")
    print(f"Chemin: {' -> '.join(chemin)}")

    # Bellman-Ford depuis Paris
    distances, _ = bellman_ford(graph, "Paris")
    print(f"\nDistances depuis Paris (Bellman-Ford):")
    for ville, dist in sorted(distances.items()):
        print(f"  {ville}: {dist} km")

    # Floyd-Warshall - Matrice des distances
    all_distances, _ = floyd_warshall(graph)
    print(f"\nMatrice des distances (Floyd-Warshall):")
    print(f"  Lyon -> Lille: {all_distances['Lyon']['Lille']} km")

    print("\n--- Arbre Couvrant Minimum ---")
    # Calculer le MST avec Prim
    mst_prim = prim(graph, "Paris")
    poids_prim = sum(w for _, _, w in mst_prim)
    print(f"MST (Prim) - Poids total: {poids_prim} km")

    # Calculer le MST avec Kruskal
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

    # Créer le planificateur et ajouter les tâches
    scheduler = PertScheduler()
    scheduler.load_sample_project()

    # Calculer et afficher l'ordonnancement
    print("\n--- Dates au plus tôt ---")
    earliest = scheduler.calculate_earliest_dates()
    for task_id, (start, finish) in earliest.items():
        print(f"  {task_id}: début={start}, fin={finish}")

    # Calculer et afficher les dates au plus tard
    print("\n--- Dates au plus tard ---")
    latest = scheduler.calculate_latest_dates()
    for task_id, (start, finish) in latest.items():
        print(f"  {task_id}: début={start}, finish={finish}")

    # Afficher les marges
    print("\n--- Marges ---")
    floats = scheduler.calculate_floats()
    for task_id, (total, free) in floats.items():
        print(f"  {task_id}: marge totale={total}, marge libre={free}")

    # Afficher le chemin critique
    print("\n--- Chemin Critique ---")
    critical_path = scheduler.get_critical_path()
    print(f"  {' -> '.join(critical_path)}")

    # Afficher la durée du projet
    print(f"\nDurée totale du projet: {scheduler.get_project_duration()} unités")


def show_menu() -> None:
    """Affiche le menu principal."""
    print("\n" + "=" * 60)
    print("      MENU PRINCIPAL - ALGORITHMES DE GRAPHES")
    print("=" * 60)
    print("1. Parcours en Largeur (BFS) - Paris")
    print("2. Parcours en Profondeur (DFS) - Paris")
    print("3. Plus Court Chemin (Dijkstra) - Paris -> Lyon")
    print("4. Plus Courts Chemins (Bellman-Ford) - Depuis Paris")
    print("5. Toutes Paires de Chemins (Floyd-Warshall)")
    print("6. Arbre Couvrant Minimum (Prim) - Depuis Paris")
    print("7. Arbre Couvrant Minimum (Kruskal)")
    print("8. Ordonnancement PERT (Projet de construction)")
    print("9. Tout exécuter (Démonstration complète)")
    print("0. Quitter")
    print("-" * 60)

def main() -> None:
    """Point d'entrée principal avec menu interactif."""
    graph = Graph(directed=False)
    graph.load_data()
    
    while True:
        show_menu()
        choice = input("Votre choix (0-9) : ").strip()
        
        if choice == "0":
            print("\nMerci et au revoir !")
            break
            
        print("\n" + "-" * 40)
        
        if choice == "1":
            print("BFS depuis Paris :")
            print(bfs(graph, "Paris"))
            
        elif choice == "2":
            print("DFS depuis Paris :")
            print(dfs(graph, "Paris"))
            
        elif choice == "3":
            dist, path = dijkstra(graph, "Paris", "Lyon")
            print(f"Dijkstra Paris -> Lyon : {dist} km")
            print(f"Chemin : {' -> '.join(path)}")
            
        elif choice == "4":
            distances, _ = bellman_ford(graph, "Paris")
            print("Distances depuis Paris (Bellman-Ford) :")
            for v, d in sorted(distances.items()):
                print(f"  {v}: {d} km")
                
        elif choice == "5":
            all_dists, _ = floyd_warshall(graph)
            print("Extrait Floyd-Warshall (Lyon -> Lille) :")
            print(f"Distance : {all_dists['Lyon']['Lille']} km")
            
        elif choice == "6":
            mst = prim(graph, "Paris")
            poids = sum(w for _, _, w in mst)
            print(f"MST (Prim) - Poids total : {poids} km")
            
        elif choice == "7":
            mst = kruskal(graph)
            poids = sum(w for _, _, w in mst)
            print(f"MST (Kruskal) - Poids total : {poids} km")
            
        elif choice == "8":
            demo_pert_scheduling()
            
        elif choice == "9":
            demo_road_network()
            demo_pert_scheduling()
            
        else:
            print("Choix invalide, veuillez réessayer.")
            
        input("\nAppuyez sur Entrée pour continuer...")

if __name__ == "__main__":
    main()
