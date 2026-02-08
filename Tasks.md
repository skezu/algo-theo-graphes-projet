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
- [x] Implémenter `PertScheduler.validate_no_cycles`
- [x] Implémenter `PertScheduler.load_sample_project`
- [x] Implémenter `PertScheduler.validate_no_cycles`

## 6. Validation et Démonstration
- [x] Décommenter les tests dans `main.py`
- [x] Vérifier les résultats sur le graphe routier (CLI)
- [x] Vérifier les résultats sur le projet PERT exemple (CLI)

## 7. Interface Visuelle (Nouveau)
- [x] Créer `api.py` (Serveur FastAPI)
- [x] Créer `algorithms_trace.py` (Algorithmes avec trace)
- [x] Créer `requirements.txt` (Dépendances Python)
- [x] Implémenter le frontend React avec React Flow
- [x] Implémenter la visualisation dynamique des algorithmes
- [x] Intégrer l'algorithme PERT dans l'interface (Éditeur de tâches, Visualisation)
- [ ] Implémenter la visualisation pas-à-pas du calcul PERT (EET/LET sur les nœuds)
- [x] Tester tous les algorithmes visuellement
- [x] Corriger le crash de l'interface visuelle lors de l'exécution de Dijkstra
- [x] Corriger le faux positif "Algorithm returned no steps" (Sérialisation Infinity)
- [x] Corriger le problème de durée 0 dans la visualisation PERT
- [x] Corriger le crash lors de l'ajout de tâches désordonnées (PERT)

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
- [x] Diviser le panneau droit: pseudocode de l'algorithme (haut) + étapes d'exécution (bas)
- [x] Surlignage en temps réel des lignes du pseudocode pendant l'exécution
- [x] Rendre les panneaux du pseudocode et des étapes repliables
- [x] Séparer l'interface PERT dans un onglet dédié pour une meilleure ergonomie
- [x] Refondre l'éditeur de tâches PERT avec une vue liste/édition séparée pour éviter l'encombrement
- [x] Styliser les nœuds PERT selon le modèle AoA (Cercle avec ES (Vert) / LS (Rouge))
- [x] Afficher les résultat d'exécution dans un tableau ou un dialogue clair (au lieu du JSON brut)

## 9. Documentation & Nettoyage (Nouveau)
- [x] Générer un `README.md` complet et pédagogique avec explications, code et analyses
- [x] Nettoyer le dépôt (suppression des scripts temporaires et fichiers inutiles)
- [x] Rendre le point d'entrée `main.py` fonctionnel pour une démonstration CLI

## 10. Configuration & Agent (Nouveau)
- [x] Générer les règles de pilotage (Steering Rules) pour l'agent
