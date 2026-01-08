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
        raise NotImplementedError(
            "La méthode calculate_earliest_dates doit être implémentée."
        )

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
        raise NotImplementedError(
            "La méthode calculate_latest_dates doit être implémentée."
        )

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
        raise NotImplementedError(
            "La méthode calculate_floats doit être implémentée."
        )

    def get_critical_path(self) -> List[str]:
        """
        Identifie le chemin critique du projet.

        Le chemin critique est la séquence de tâches ayant une marge
        totale nulle. Tout retard sur ces tâches retarde le projet.

        Returns:
            Liste ordonnée des IDs des tâches sur le chemin critique.
        """
        raise NotImplementedError(
            "La méthode get_critical_path doit être implémentée."
        )

    def get_full_schedule(self) -> List[TaskSchedule]:
        """
        Calcule l'ordonnancement complet du projet.

        Combine tous les calculs pour produire un rapport complet
        avec toutes les dates et marges pour chaque tâche.

        Returns:
            Liste de TaskSchedule pour chaque tâche du projet.
        """
        raise NotImplementedError(
            "La méthode get_full_schedule doit être implémentée."
        )

    def get_project_duration(self) -> float:
        """
        Retourne la durée totale du projet.

        Returns:
            La durée minimale pour terminer toutes les tâches.
        """
        raise NotImplementedError(
            "La méthode get_project_duration doit être implémentée."
        )

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
