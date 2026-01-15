"""
Module pert_scheduler.py - Ordonnancement PERT.

Ce module contient les structures et algorithmes pour l'ordonnancement
de projet selon la méthode PERT (Program Evaluation and Review Technique).
"""

from typing import Dict, List, Optional, Tuple
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

        for pred_id in predecessors:
            if pred_id not in self.tasks:
                raise ValueError(f"Le prédécesseur {pred_id} n'existe pas.")

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

    def _get_topological_sort(self) -> List[str]:
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
        topo_order = self._get_topological_sort()
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
        
        topo_order = self._get_topological_sort()
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
        raise NotImplementedError(
            "La méthode validate_no_cycles doit être implémentée."
        )

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
