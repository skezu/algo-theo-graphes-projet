
    def get_aoa_structure(self) -> Dict[str, Any]:
        """
        Génère une structure Activity-on-Arrow (AoA) simplifiée.
        Les nœuds représentent des événements (étapes).
        Les arêtes représentent les tâches.
        """
        from collections import defaultdict

        # 1. Identifier les niveaux et les dépendances
        topo_order = self.get_topological_sort()
        earliest_dates = self.calculate_earliest_dates()
        latest_dates = self.calculate_latest_dates()
        
        # Structure de données pour AoA
        events = {}  # event_id -> {id, label, eet, let}
        edges = []   # {source, target, label, duration, type}
        
        # Start event
        start_event_id = "Step 0"
        events[start_event_id] = {
            "id": start_event_id, 
            "label": "Début", 
            "eet": 0, 
            "let": 0
        }
        
        # Usage count: combien de fois chaque tâche est utilisée comme prédécesseur direct
        # dans une signature unique de successeurs.
        usage_count = defaultdict(int) 
        
        # Group tasks by predecessor signatures to identify junctions
        pred_signatures = defaultdict(list) # signature -> [task_ids]
        
        for task_id in topo_order:
            task = self.tasks[task_id]
            # Signature triée pour unicité
            signature = tuple(sorted(task.predecessors))
            pred_signatures[signature].append(task_id)
            
            # Count usage of each predecessor in this NEW signature
            for pred in signature:
                usage_count[pred] += 1
                
        # Create Junction Nodes for each signature
        junctions = {} # signature -> node_id
        
        # Map: task_id -> "Event where task ends"
        # Initialement non défini. Sera défini soit par un Junction (merge), soit par un événement unique.
        task_end_nodes = {} 
        
        junction_counter = 1
        
        # Il faut traiter les signatures dans un ordre topologique implicite?
        # Non, la création des jonctions est indépendante, c'est la connexion qui compte.
        
        for signature, consumers in pred_signatures.items():
            if not signature:
                # No predecessors -> Start Node
                junctions[signature] = start_event_id
                continue
                
            # Create a Junction Node
            junction_id = f"Step {junction_counter}"
            junction_counter += 1
            
            junctions[signature] = junction_id
            
            # Calculate Junction EET/LET approximations (sera recalculé proprement)
            # EET = max(EF of preds)
            # LET = min(LS of consumers)
            
            events[junction_id] = {
                "id": junction_id,
                "label": str(junction_counter - 1), # Simple number
                "eet": 0,
                "let": 0 
            }
            
            # Connect predecessors to this junction
            for pred_id in signature:
                # Check if pred_id completes exclusively here?
                # Si usage_count[pred_id] == 1, on peut merger la fin de la tâche directement au Junction.
                
                # Attention: Une tâche ne peut aller qu'à UN SEUL endroit comme fin "directe" (solid arrow).
                # Si elle va ailleurs, il faut des dummies.
                # Mais ici, on définit où la tâche *se termine visuellement*.
                
                # Logique:
                # Si pred_id n'a pas encore de noeud de fin assigné:
                #   Assigner junction_id comme fin de pred_id.
                # Sinon:
                #   Ajouter un dummy de task_end_nodes[pred_id] vers junction_id.
                
                if pred_id not in task_end_nodes:
                    task_end_nodes[pred_id] = junction_id
                else:
                    # Tâche déjà terminée ailleurs, il faut un dummy pour rejoindre ce groupement
                    # ID unique pour l'arête dummy
                    edges.append({
                        "source": task_end_nodes[pred_id],
                        "target": junction_id,
                        "label": "",
                        "task_id": None,
                        "is_dummy": True
                    })

        # Assign start nodes for tasks
        task_start_nodes = {}
        for signature, consumers in pred_signatures.items():
            junction_id = junctions[signature]
            for task_id in consumers:
                task_start_nodes[task_id] = junction_id
                
        # Cleanup: Handle tasks that haven't been assigned an end node
        # (Elles ne sont prédécesseurs de personne, ou exclus des signatures traitées)
        # Ce sont les tâches finales du projet.
        
        end_event_id = f"Step {junction_counter}"
        events[end_event_id] = {
            "id": end_event_id,
            "label": "Fin",
            "eet": 0,
            "let": 0
        }
        
        for task_id in self.tasks:
            if task_id not in task_end_nodes:
                task_end_nodes[task_id] = end_event_id
                
        # Build Task Edges
        for task_id, task in self.tasks.items():
            src = task_start_nodes.get(task_id)
            tgt = task_end_nodes.get(task_id)
            
            if src and tgt:
                # Avoid self loops if logic is flawed (devrait pas arriver)
                if src != tgt:
                     edges.append({
                        "source": src,
                        "target": tgt,
                        "label": f"{task.name}({int(task.duration) if task.duration.is_integer() else task.duration})",
                        "task_id": task_id,
                        "duration": task.duration,
                        "is_dummy": False
                    })
        
        # Recalculate EET / LET for Events properly
        # Build adjacency for events
        # Initialize
        for evt in events.values():
            evt["eet"] = 0
            evt["let"] = float('inf')
            
        # EET (Forward) -> Besoin d'ordre topo des EVENTS
        # On va faire simple: Bellman-Ford style ou simple itération tant que ça change (DAG)
        changed = True
        while changed:
            changed = False
            for edge in edges:
                u, v = edge["source"], edge["target"]
                dur = edge.get("duration", 0) if not edge.get("is_dummy") else 0
                if events[u]["eet"] + dur > events[v]["eet"]:
                    events[v]["eet"] = events[u]["eet"] + dur
                    changed = True
                    
        # LET (Backward)
        # Start with LET[End] = EET[End]
        max_eet = max(e["eet"] for e in events.values())
        for evt in events.values():
            # Init LET relative to project end, or INF?
            # Si un event n'est pas connecte a la fin, son LET est infini théoriquement ?
            # Mais ici tout converge vers EndEvent par construction (sinks -> EndEvent).
            pass
        
        # Set LET of sinks to max_eet
        # Identify sinks (nodes with no outgoing edges)
        outgoing = defaultdict(list)
        for edge in edges:
            outgoing[edge["source"]].append(edge["target"])
            
        for evt_id in events:
            if not outgoing[evt_id]:
                events[evt_id]["let"] = max_eet
            else:
                events[evt_id]["let"] = float('inf')

        # Backward Pass
        # On peut iterer N fois ou topo inverse
        # Simple iteration
        for _ in range(len(events) + 2):
            for edge in edges:
                u, v = edge["source"], edge["target"]
                dur = edge.get("duration", 0) if not edge.get("is_dummy") else 0
                
                if events[v]["let"] - dur < events[u]["let"]:
                    events[u]["let"] = events[v]["let"] - dur
                    
        # Renumber nodes cleanly 1 to N (Start=0, End=N) already done mostly
        # Just ensure labels are clean
        # Trier par EET pour numérotation logique
        sorted_evts = sorted(events.values(), key=lambda x: x["eet"])
        
        final_nodes = []
        node_id_map = {}
        
        counter = 1
        for evt in sorted_evts:
            old_id = evt["id"]
            if evt["label"] == "Début":
                new_label = "Début"
                new_id = "start"
            elif evt["label"] == "Fin":
                new_label = "Fin"
                new_id = "end"
            else:
                new_label = str(counter)
                new_id = f"n{counter}"
                counter += 1
            
            node_id_map[old_id] = new_id
            
            final_nodes.append({
                "id": new_id,
                "label": new_label,
                "eet": evt["eet"],
                "let": evt["let"]
            })
            
        final_edges = []
        for i, edge in enumerate(edges):
            final_edges.append({
                "id": f"e{i}",
                "source": node_id_map[edge["source"]],
                "target": node_id_map[edge["target"]],
                "label": edge["label"],
                "is_dummy": edge.get("is_dummy", False),
                "task_id": edge.get("task_id")
            })
            
        return {"nodes": final_nodes, "edges": final_edges}
