# Tâches du Projet ALMF51 - Algorithmes de Graphes

## 1. Structure de Données (Priorité Haute)
- [x] Implémenter `Graph.add_node`
- [x] Implémenter `Graph.add_edge`
- [x] Implémenter `Graph.get_neighbors`
- [x] Implémenter `Graph.get_weight`
- [x] Implémenter `Graph.get_nodes` et `Graph.get_edges`
- [x] Implémenter `Graph.load_data` (Chargement du réseau routier)

## 2. Algorithmes de Parcours
- [x] Implémenter `bfs` (Parcours en Largeur)
- [x] Implémenter `dfs` (Parcours en Profondeur)

## 3. Algorithmes de Plus Court Chemin
- [x] Implémenter `dijkstra` (Poids positifs)
- [x] Implémenter `bellman_ford` (Poids négatifs)
- [x] Implémenter `floyd_warshall` (Toutes paires)

## 4. Arbre Couvrant Minimum (MST)
- [x] Implémenter la structure `UnionFind` (`find`, `union`)
- [x] Implémenter `prim`
- [x] Implémenter `kruskal`

## 5. Ordonnancement PERT
- [x] Implémenter `PertScheduler.add_task`
- [x] Implémenter `PertScheduler.calculate_earliest_dates`
- [x] Implémenter `PertScheduler.calculate_latest_dates`
- [x] Implémenter `PertScheduler.calculate_floats`
- [x] Implémenter `PertScheduler.get_critical_path`
- [x] Implémenter `PertScheduler.get_full_schedule` et `get_project_duration`
- [ ] Implémenter `PertScheduler.validate_no_cycles`
- [ ] Implémenter `PertScheduler.load_sample_project`

## 6. Validation et Démonstration
- [ ] Décommenter les tests dans `main.py`
- [ ] Vérifier les résultats sur le graphe routier
- [ ] Vérifier les résultats sur le projet PERT exemple

## 7. Interface Visuelle (Bonus)
- [x] Créer l'API Backend (FastAPI) pour exposer les graphes et algorithmes
- [x] Créer le Frontend (React + React Flow + Shadcn)
- [x] Implémenter la visualisation des étapes (BFS, DFS, Dijkstra)
