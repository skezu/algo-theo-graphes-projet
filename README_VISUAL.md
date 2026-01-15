# Interface Visuelle pour Algorithmes de Graphes

Ce projet inclut une interface visuelle moderne pour démontrer les algorithmes de graphes (BFS, DFS, Dijkstra).

## Prérequis
- Python 3.8+
- Node.js 18+
- pnpm

## Installation

### 1. Backend (API Python)
```bash
pip install -r requirements.txt
```

### 2. Frontend (React)
```bash
cd frontend
pnpm install
```

## Démarrage

Il faut lancer deux terminaux :

**Terminal 1 : Backend**
```bash
uvicorn api:app --reload
```
L'API sera accessible sur `http://localhost:8000`.

**Terminal 2 : Frontend**
```bash
cd frontend
pnpm run dev
```
L'interface sera accessible sur `http://localhost:5173`.

## Fonctionnalités
- **Visualisation Dynamique** : Voir le graphe (Réseau routier français) avec les nœuds positionnés géographiquement.
- **Algorithmes** : Lancer BFS, DFS, Dijkstra et voir l'exécution pas à pas.
- **Contrôles** : Lecture, Pause, Étape suivante/précédente, Slider.
