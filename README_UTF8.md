# Algorithmes de Graphes - Visualisation

Ce projet est une application de visualisation d'algorithmes de graphes (BFS, DFS, Dijkstra, Bellman-Ford, Prim, Kruskal) appliquée à un réseau routier.

## 🛠️ Installation

### Backend (Python)
1. Installez les dépendances :
```bash
pip install -r requirements.txt
```

### Frontend (React + Vite)
1. Allez dans le dossier frontend :
```bash
cd frontend
```
2. Installez les dépendances :
```bash
npm install
# ou
pnpm install
```

## 🚀 Lancement

### 1. Lancer le Backend
Depuis la racine du projet :
```bash
python api.py
```
Le serveur sera disponible sur `http://localhost:8000`.

### 2. Lancer le Frontend
Depuis le dossier `frontend` :
```bash
npm run dev
```
L'application sera accessible sur `http://localhost:5173`.

## 📝 Fonctionnalités
- Chargement d'un réseau routier.
- Visualisation interactive avec React Flow.
- Exécution d'algorithmes étape par étape avec trace visuelle.
- Ordonnancement PERT.
