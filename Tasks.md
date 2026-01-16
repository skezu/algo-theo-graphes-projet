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

## 7. Interface Visuelle (Nouveau)
- [x] Créer `api.py` (Serveur FastAPI)
- [x] Créer `algorithms_trace.py` (Algorithmes avec trace)
- [x] Créer `requirements.txt` (Dépendances Python)
- [x] Implémenter le frontend React avec React Flow
- [x] Implémenter la visualisation dynamique des algorithmes
- [ ] Tester tous les algorithmes visuellement

## 8. Améliorations UI/UX (Nouveau)
- [x] Améliorer le thème sombre avec une palette de couleurs raffinée
- [x] Styliser les nœuds du graphe avec un fond sombre cohérent
- [x] Ajouter des effets de glassmorphism aux panneaux latéraux
- [x] Améliorer la typographie avec la police Inter
- [x] Ajouter des animations d'entrée fluides (fade-in, slide)
- [x] Styliser les contrôles React Flow (minimap, zoom) pour le thème sombre
- [x] Améliorer l'état vide avec une icône animée flottante
- [x] Affiner l'espacement et la hiérarchie visuelle
- [x] Ajouter des effets de survol et transitions sur les éléments interactifs
- [x] Implémenter l'algorithme de layout Dagre (Sugiyama) pour minimiser les croisements d'arêtes
