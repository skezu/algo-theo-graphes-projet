"""
Module pert_scheduler.py - Ordonnancement PERT.

Ce module contient les structures et algorithmes pour l'ordonnancement
de projet selon la méthode PERT (Program Evaluation and Review Technique).
"""

from typing import Dict, List, Optional, Tuple, Any
from collections import defaultdict
from dataclasses import dataclass


@dataclass
class Task:
    """
    Représente une tâche dans un diagramme PERT.

    Attributes:
        id: Identifiant unique de la tâche.
        name: Nom descriptif de la tâche.
        duration: Durée de la tâche (en jours, heures, etc.).
        predecessors: Liste des IDs des tâches prédécesseurs.
    """
    id: str
    name: str
    duration: float
    predecessors: List[str]


@dataclass
class TaskSchedule:
    """
    Résultat du calcul d'ordonnancement pour une tâche.

    Attributes:
        task_id: Identifiant de la tâche.
        earliest_start: Date de début au plus tôt.
        earliest_finish: Date de fin au plus tôt.
        latest_start: Date de début au plus tard.
        latest_finish: Date de fin au plus tard.
        total_float: Marge totale.
        free_float: Marge libre.
        is_critical: Indique si la tâche est sur le chemin critique.
    """
    task_id: str
    earliest_start: float
    earliest_finish: float
    latest_start: float
    latest_finish: float
    total_float: float
    free_float: float
    is_critical: bool


class PertScheduler:
    """
    Classe pour l'ordonnancement de projet selon la méthode PERT.

    Cette classe permet de:
    - Définir un ensemble de tâches avec leurs dépendances
    - Calculer les dates au plus tôt et au plus tard
    - Calculer les marges
    - Identifier le chemin critique

    Attributes:
        tasks (Dict[str, Task]): Dictionnaire des tâches indexées par ID.
    """

    def __init__(self) -> None:
        """Initialise un nouveau planificateur PERT."""
        self.tasks: Dict[str, Task] = {}

    def add_task(
        self,
        task_id: str,
        name: str,
        duration: float,
        predecessors: Optional[List[str]] = None
    ) -> None:
        """
        Ajoute une tâche au projet.

        Args:
            task_id: Identifiant unique de la tâche.
            name: Nom descriptif de la tâche.
            duration: Durée de la tâche.
            predecessors: Liste des IDs des tâches qui doivent être
                         terminées avant de commencer celle-ci.

        Raises:
            ValueError: Si l'ID existe déjà ou si un prédécesseur n'existe pas.
        """
        if task_id in self.tasks:
            raise ValueError(f"La tâche {task_id} existe déjà.")

        if predecessors is None:
            predecessors = []

        # Validation des prédécesseurs reportée à la validation globale
        # pour permettre l'ajout dans le désordre.
        # for pred_id in predecessors:
        #     if pred_id not in self.tasks:
        #         raise ValueError(f"Le prédécesseur {pred_id} n'existe pas.")

        task = Task(
            id=task_id,
            name=name,
            duration=duration,
            predecessors=predecessors
        )
        self.tasks[task_id] = task

    def _build_successors(self) -> Dict[str, List[str]]:
        """Construit le graph des successeurs."""
        successors = {t_id: [] for t_id in self.tasks}
        for task in self.tasks.values():
            for pred_id in task.predecessors:
                if pred_id in successors:
                    successors[pred_id].append(task.id)
        return successors

    def validate_dependencies(self) -> None:
        """
        Vérifie que tous les prédécesseurs référencés existent.
        """
        for task_id, task in self.tasks.items():
            for pred_id in task.predecessors:
                if pred_id not in self.tasks:
                    raise ValueError(f"La tâche {task_id} dépend d'une tâche inconnue: {pred_id}")

    def get_topological_sort(self) -> List[str]:
        """Retourne les IDs des tâches triées topologiquement."""
        in_degree = {t_id: len(task.predecessors) for t_id, task in self.tasks.items()}
        successors = self._build_successors()
        
        queue = [t_id for t_id, deg in in_degree.items() if deg == 0]
        topo_order = []
        
        while queue:
            u_id = queue.pop(0)
            topo_order.append(u_id)
            
            for v_id in successors[u_id]:
                in_degree[v_id] -= 1
                if in_degree[v_id] == 0:
                    queue.append(v_id)
        
        if len(topo_order) != len(self.tasks):
            raise ValueError("Le graphe contient un cycle (dépendance circulaire détectée).")
            
        return topo_order

    def calculate_earliest_dates(self) -> Dict[str, Tuple[float, float]]:
        """
        Calcule les dates au plus tôt pour toutes les tâches.

        Effectue une passe avant (forward pass) dans le graphe des tâches
        pour déterminer les dates de début et fin au plus tôt.

        Returns:
            Dictionnaire {task_id: (earliest_start, earliest_finish)}.

        Note:
            Les tâches sans prédécesseur commencent à t=0.
        """
        topo_order = self.get_topological_sort()
        earliest_dates = {}  # {task_id: (start, finish)}
        
        for t_id in topo_order:
            task = self.tasks[t_id]
            
            # Start time is max of predecessors' finish times
            start_time = 0.0
            for pred_id in task.predecessors:
                if pred_id in earliest_dates:
                    _, pred_finish = earliest_dates[pred_id]
                    start_time = max(start_time, pred_finish)
            
            finish_time = start_time + task.duration
            earliest_dates[t_id] = (start_time, finish_time)
            
        return earliest_dates

    def calculate_latest_dates(self) -> Dict[str, Tuple[float, float]]:
        """
        Calcule les dates au plus tard pour toutes les tâches.

        Effectue une passe arrière (backward pass) à partir de la date
        de fin du projet pour déterminer les dates de début et fin
        au plus tard.

        Returns:
            Dictionnaire {task_id: (latest_start, latest_finish)}.

        Note:
            Nécessite d'abord le calcul des dates au plus tôt.
        """
        earliest_dates = self.calculate_earliest_dates()
        if not earliest_dates:
            return {}
            
        # Project duration is the max finish time of all tasks
        project_duration = max(result[1] for result in earliest_dates.values())
        
        topo_order = self.get_topological_sort()
        reverse_order = topo_order[::-1]
        successors = self._build_successors()
        
        latest_dates = {}
        
        for t_id in reverse_order:
            task = self.tasks[t_id]
            task_successors = successors[t_id]
            
            # Finish time is min of successors' start times
            # If no successors, it's the project end date
            if not task_successors:
                finish_time = project_duration
            else:
                finish_time = project_duration # Initialize with max possible
                has_successor_constraint = False
                temp_min_start = float('inf')
                
                for succ_id in task_successors:
                    if succ_id in latest_dates:
                        succ_start, _ = latest_dates[succ_id]
                        temp_min_start = min(temp_min_start, succ_start)
                        has_successor_constraint = True
                
                if has_successor_constraint:
                    finish_time = temp_min_start
            
            start_time = finish_time - task.duration
            latest_dates[t_id] = (start_time, finish_time)
            
        return latest_dates

    def calculate_floats(self) -> Dict[str, Tuple[float, float]]:
        """
        Calcule les marges pour toutes les tâches.

        Calcule la marge totale (total float) et la marge libre (free float)
        pour chaque tâche.

        Returns:
            Dictionnaire {task_id: (total_float, free_float)}.

        Note:
            - Marge totale = latest_start - earliest_start
            - Marge libre = min(earliest_start des successeurs) - earliest_finish
        """
        earliest = self.calculate_earliest_dates()
        latest = self.calculate_latest_dates()
        successors = self._build_successors()
        floats = {}
        
        # Determine project duration primarily to handle open-ended free float if logic requires,
        # usually free float for end tasks is 0 or based on project deadline. 
        # Here we define free float relative to successors. If no successors, it's 0 per some definitions,
        # or relative to project end. Standard definition: min ES(successors) - EF(task).
        # If no successors, conventionally free float = total float (margin to project end).
        
        project_duration = 0.0
        if earliest:
            project_duration = max(e[1] for e in earliest.values())

        for t_id, (es, ef) in earliest.items():
            ls, lf = latest[t_id]
            
            total_float = ls - es
            # Rounding to handle float point inaccuracies
            total_float = round(total_float, 6)
            
            task_successors = successors[t_id]
            if not task_successors:
                # If no successors, free float is relative to project finish
                free_float = project_duration - ef
            else:
                min_succ_es = float('inf')
                for succ_id in task_successors:
                    succ_es, _ = earliest[succ_id]
                    min_succ_es = min(min_succ_es, succ_es)
                free_float = min_succ_es - ef
                
            free_float = round(free_float, 6)
            floats[t_id] = (total_float, free_float)
            
        return floats

    def get_critical_path(self) -> List[str]:
        """
        Identifie le chemin critique du projet.

        Le chemin critique est la séquence de tâches ayant une marge
        totale nulle. Tout retard sur ces tâches retarde le projet.

        Returns:
            Liste ordonnée des IDs des tâches sur le chemin critique.
        """
        floats = self.calculate_floats()
        earliest = self.calculate_earliest_dates()
        
        # Critical tasks have 0 total float
        critical_tasks = [
            t_id for t_id, (total, _) in floats.items() 
            if abs(total) < 1e-6
        ]
        
        # Return them sorted by earliest start time to form a sequence
        critical_tasks.sort(key=lambda t_id: earliest[t_id][0])
        
        return critical_tasks

    def get_full_schedule(self) -> List[TaskSchedule]:
        """
        Calcule l'ordonnancement complet du projet.

        Combine tous les calculs pour produire un rapport complet
        avec toutes les dates et marges pour chaque tâche.

        Returns:
            Liste de TaskSchedule pour chaque tâche du projet.
        """
        earliest = self.calculate_earliest_dates()
        latest = self.calculate_latest_dates()
        floats = self.calculate_floats()
        
        schedule = []
        for t_id, task in self.tasks.items():
            es, ef = earliest[t_id]
            ls, lf = latest[t_id]
            total_f, free_f = floats[t_id]
            
            is_critical = abs(total_f) < 1e-6
            
            item = TaskSchedule(
                task_id=t_id,
                earliest_start=es,
                earliest_finish=ef,
                latest_start=ls,
                latest_finish=lf,
                total_float=total_f,
                free_float=free_f,
                is_critical=is_critical
            )
            schedule.append(item)
            
        # Optional: Sort by earliest start time for better readability
        schedule.sort(key=lambda x: x.earliest_start)
        
        return schedule

    def get_project_duration(self) -> float:
        """
        Retourne la durée totale du projet.

        Returns:
            La durée minimale pour terminer toutes les tâches.
        """
        earliest = self.calculate_earliest_dates()
        if not earliest:
            return 0.0
        return max(finish for _, finish in earliest.values())

    def validate_no_cycles(self) -> bool:
        """
        Vérifie que le graphe des tâches ne contient pas de cycles.

        Un cycle dans les dépendances rendrait le projet impossible à réaliser.

        Returns:
            True si le graphe est acyclique, False sinon.

        Note:
            Utilise un tri topologique ou un DFS pour détecter les cycles.
        """
    def get_aoa_structure(self) -> Dict[str, Any]:
        """
        Génère une structure Activity-on-Arrow (AoA) simplifiée.
        Les nœuds représentent des événements (étapes).
        Les arêtes représentent les tâches.
        """
        # 1. Identifier les niveaux et les dépendances
        topo_order = self.get_topological_sort()
        
        # Structure de données pour AoA
        events = {}  # event_id -> {id, label, eet, let}
        edges = []   # {source, target, label, duration, type}
        
        # Start event
        start_event_id = "Start"
        events[start_event_id] = {
            "id": start_event_id, 
            "label": "Début", 
            "eet": 0, 
            "let": 0
        }
        
        # Usage count: combien de fois chaque tâche est utilisée comme prédécesseur direct
        # dans une signature unique de successeurs.
        
        # Group tasks by predecessor signatures to identify junctions
        pred_signatures = defaultdict(list) # signature -> [task_ids]
        
        for task_id in topo_order:
            task = self.tasks[task_id]
            # Signature triée pour unicité
            signature = tuple(sorted(task.predecessors))
            pred_signatures[signature].append(task_id)

        # Create Junction Nodes for each signature
        junctions = {} # signature -> node_id
        
        # Map: task_id -> "Event where task ends"
        # Initialement non défini. Sera défini soit par un Junction (merge), soit par un événement unique.
        task_end_nodes = {} 
        
        junction_counter = 1
        
        for signature, consumers in pred_signatures.items():
            if not signature:
                # No predecessors -> Start Node
                junctions[signature] = start_event_id
                continue
                
            # Create a Junction Node
            junction_id = f"J{junction_counter}"
            junction_counter += 1
            
            junctions[signature] = junction_id
            
            events[junction_id] = {
                "id": junction_id,
                "label": "", # Sera numéroté
                "eet": 0,
                "let": float('inf')
            }
            
            # Connect predecessors to this junction
            for pred_id in signature:
                # Si pred_id n'a pas encore de noeud de fin assigné:
                #   Assigner junction_id comme fin de pred_id.
                # Sinon:
                #   Ajouter un dummy de task_end_nodes[pred_id] vers junction_id.
                
                if pred_id not in task_end_nodes:
                    task_end_nodes[pred_id] = junction_id
                else:
                    # Tâche déjà terminée ailleurs, il faut un dummy pour rejoindre ce groupement
                    # ID unique pour l'arête dummy
                    # Avoid duplicated dummies?
                    edges.append({
                        "source": task_end_nodes[pred_id],
                        "target": junction_id,
                        "label": "",
                        "task_id": None,
                        "duration": 0,
                        "is_dummy": True
                    })

        # Assign start nodes for tasks based on their predecessor signature
        task_start_nodes = {}
        for signature, consumers in pred_signatures.items():
            junction_id = junctions[signature]
            for task_id in consumers:
                task_start_nodes[task_id] = junction_id
                
        # Cleanup: Handle tasks that haven't been assigned an end node (Fin du projet)
        end_event_id = "Fin"
        events[end_event_id] = {
            "id": end_event_id,
            "label": "Fin",
            "eet": 0,
            "let": float('inf')
        }
        
        for task_id in self.tasks:
            if task_id not in task_end_nodes:
                task_end_nodes[task_id] = end_event_id
                
        # Build Task Edges (Nodes -> Nodes)
        for task_id, task in self.tasks.items():
            src = task_start_nodes.get(task_id)
            tgt = task_end_nodes.get(task_id)
            
            if src and tgt:
                # Avoid self loops
                if src != tgt:
                     edges.append({
                        "source": src,
                        "target": tgt,
                        "label": f"{task.name}({int(task.duration) if task.duration.is_integer() else task.duration})",
                        "task_id": task_id,
                        "duration": task.duration,
                        "is_dummy": False
                    })
        
        # Recalculate EET for Events (Forward Pass)
        # Simple recursion with memoization or iterative
        # Sort nodes topologically? Or simple relaxation loop
        
        # Init EET
        events[start_event_id]["eet"] = 0
        for eid in events:
            if eid != start_event_id:
                events[eid]["eet"] = 0

        # Relaxation (EET)
        for _ in range(len(events) + 2):
            for edge in edges:
                u, v = edge["source"], edge["target"]
                dur = edge["duration"]
                if events[u]["eet"] + dur > events[v]["eet"]:
                    events[v]["eet"] = events[u]["eet"] + dur
                    
        project_duration = events[end_event_id]["eet"]
        
        # Init LET
        for eid in events:
            events[eid]["let"] = float('inf')
        events[end_event_id]["let"] = project_duration
        
        # Relaxation (LET)
        for _ in range(len(events) + 2):
            for edge in edges:
                u, v = edge["source"], edge["target"]
                dur = edge["duration"]
                # u -> v. LET[u] <= LET[v] - dur
                if events[v]["let"] - dur < events[u]["let"]:
                    events[u]["let"] = events[v]["let"] - dur
                    
        # Final Renumbering 1..N
        # Sort by EET
        sorted_evts = sorted(events.values(), key=lambda x: (x["eet"], x["id"]))
        
        final_nodes = []
        node_id_map = {} # old_id -> new_id
        
        counter = 1
        for evt in sorted_evts:
            old_id = evt["id"]
            if evt["label"] == "Début":
                new_label = "Début"
                new_id = "start"
                final_eet = 0
                final_let = 0
            elif evt["label"] == "Fin":
                new_label = "Fin"
                new_id = "end"
                final_eet = evt["eet"]
                final_let = evt["let"]
            else:
                new_label = str(counter)
                new_id = f"n{counter}"
                counter += 1
                final_eet = evt["eet"]
                final_let = evt["let"]
            
            node_id_map[old_id] = new_id
            
            final_nodes.append({
                "id": new_id,
                "label": new_label,
                "eet": final_eet,
                "let": final_let
            })
            
        final_edges = []
        for i, edge in enumerate(edges):
            final_edges.append({
                "id": f"e{i}",
                "source": node_id_map[edge["source"]],
                "target": node_id_map[edge["target"]],
                "label": edge["label"],
                "is_dummy": edge.get("is_dummy", False),
                "task_id": edge.get("task_id"),
                "duration": edge.get("duration", 0)
            })
            
        return {"nodes": final_nodes, "edges": final_edges}


    def load_sample_project(self) -> None:
        """
        Charge un projet d'exemple pour les tests.

        Crée un ensemble de tâches avec dépendances pour démontrer
        les fonctionnalités du planificateur PERT.
        """
        # TODO: Ajouter des tâches d'exemple
        # Exemple de projet de construction:
        # - A: Études préliminaires (durée: 3)
        # - B: Fondations (durée: 5, après A)
        # - C: Murs (durée: 4, après B)
        # - D: Toiture (durée: 3, après C)
        # - E: Électricité (durée: 2, après B)
        # - F: Finitions (durée: 2, après D et E)
        raise NotImplementedError(
            "La méthode load_sample_project doit être implémentée."
        )

    def __repr__(self) -> str:
        """Représentation textuelle du planificateur."""
        return f"PertScheduler({len(self.tasks)} tâches)"
