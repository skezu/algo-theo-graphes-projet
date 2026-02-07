
    def get_aoa_structure(self) -> Dict[str, Any]:
        """
        Génère une structure Activity-on-Arrow (AoA) simplifiée.
        
        Note: C'est une approximation pour la visualisation.
        Les nœuds représentent des événements (étapes).
        Les arêtes représentent les tâches.
        """
        # 1. Identifier les niveaux et les dépendances
        topo_order = self.get_topological_sort()
        earliest_dates = self.calculate_earliest_dates()
        latest_dates = self.calculate_latest_dates()
        
        # Structure de données pour AoA
        events = {}  # event_id -> {id, label, eet, let}
        edges = []   # {source, target, label, duration, type}
        
        # Création des événements
        # Stratégie simplifiée:
        # - Un événement de début global (0)
        # - Un événement de fin pour chaque tâche
        # - Fusionner les événements de fin des prédécesseurs si nécessaire
        
        # Map: task_id -> end_event_id
        task_end_events = {}
        
        # Start event
        start_event_id = "0"
        events[start_event_id] = {
            "id": start_event_id, 
            "label": "Début", 
            "eet": 0, 
            "let": 0
        }
        
        event_counter = 1
        
        # Pour gérer les fusions, on utilise un dictionnaire de signature de prédécesseurs
        # signature -> event_id
        # signature = tuple sorted(pred_ids)
        predecessor_events = {} 
        predecessor_events[()] = start_event_id # No preds -> start event
        
        for task_id in topo_order:
            task = self.tasks[task_id]
            preds = tuple(sorted(task.predecessors))
            
            # Trouver ou créer l'événement de départ de la tâche
            source_event_id = None
            
            # Cas 1: Aucun prédécesseur -> Start Event
            if not preds:
                source_event_id = start_event_id
            
            # Cas 2: Prédécesseurs existent
            else:
                # Vérifier si cet ensemble exact de prédécesseurs a déjà généré un événement de fusion
                if preds in predecessor_events:
                    source_event_id = predecessor_events[preds]
                else:
                    # Créer un nouvel événement de convergence
                    # Mais attendez, si j'ai A->C et B->C, le noeud de départ de C doit être après A et B.
                    # Est-ce que ce noeud est unique pour {A, B} ? Oui, dans une représentation canonique.
                    # Cependant, A peut aussi être prérequis pour D (A->D).
                    # Donc le noeud de fin de A est utilisé pour {A, B} et {A}.
                    
                    # Approche plus robuste avec dummies:
                    # Chaque tâche T se termine à un événement unique E_T initialement.
                    # Pour commencer T, on part d'un événement S_T.
                    # S_T doit être postérieur à tous E_P (P in preds).
                    # On crée S_T et on ajoute des dummies E_P -> S_T.
                    pass
        
        # Recommençons avec l'approche "Événement par Tâche + Dummies" puis simplification
        # Reset
        events = {
            "Start": {"id": "Start", "label": "Début", "eet": 0, "let": 0}
        }
        edges = []
        task_end_nodes = {} # task_id -> node_id
        
        # Créer un événement de fin pour chaque tâche
        # Et déterminer le noeud de départ
        
        # D'abord, noeud de départ global
        # Les tâches sans prédécesseurs partent de "Start"
        # Elles se terminent à "End_T"
        
        nodes_map = {"Start": events["Start"]}
        
        for t_id in topo_order:
            task = self.tasks[t_id]
            es, ef = earliest_dates[t_id]
            ls, lf = latest_dates[t_id]
            
            # Determine start node
            if not task.predecessors:
                u = "Start"
            else:
                # Si un seul prédécesseur, on peut (peut-être) chaîner directement?
                # A -> B. End_A -> Start_B.
                # Si A a plusieurs successeurs, End_A est Start_B et Start_C.
                # Donc, essayons de réutiliser le EndNode du prédécesseur comme StartNode
                
                relevant_pred_ends = [task_end_nodes[p] for p in task.predecessors]
                
                if len(relevant_pred_ends) == 1:
                    u = relevant_pred_ends[0]
                else:
                    # Plusieurs prédécesseurs. Il faut un point de convergence.
                    # Créons un noeud de convergence temporaire
                    # Mais si plusieurs tâches ont EXACTEMENT les mêmes prédécesseurs, elles devraient partager ce noeud.
                    
                    preds_key = "_".join(sorted(task.predecessors))
                    merge_node_id = f"Merge_{preds_key}"
                    
                    if merge_node_id not in nodes_map:
                        # Créer le noeud de fusion
                        # Son EET est max(EET des preds) = ES de la tâche courante (car topo order)
                        # Son LET est min(LET des succs)... on verra plus tard ou on utilise ES/LS de la tâche
                        nodes_map[merge_node_id] = {
                            "id": merge_node_id,
                            "label": "", # Sera numéroté
                            "eet": es,
                            "let": ls # Approximation, correct si critique
                        }
                        
                        # Ajouter dummies
                        for pred_end in relevant_pred_ends:
                            edges.append({
                                "source": pred_end,
                                "target": merge_node_id,
                                "label": "",
                                "is_dummy": True
                            })
                    
                    u = merge_node_id

            # Create End Node for this task
            # Sauf si c'est la fin du projet? Non, on crée toujours, on fusionnera à la fin.
            # Nommage: Event après T.
            v = f"Event_{t_id}"
            nodes_map[v] = {
                "id": v,
                "label": "",
                "eet": ef,
                "let": lf
            }
            task_end_nodes[t_id] = v
            
            # Add Task Edge
            edges.append({
                "source": u,
                "target": v,
                "label": f"{task.name}({int(task.duration) if task.duration.is_integer() else task.duration})",
                "task_id": t_id,
                "duration": task.duration,
                "is_dummy": False
            })

        # Final Node
        end_node_id = "Fin"
        nodes_map[end_node_id] = {"id": end_node_id, "label": "Fin", "eet": 0, "let": 0} # dates update later
        
        # Relier les tâches sans successeurs à Fin
        project_duration = max(result[1] for result in earliest_dates.values()) if earliest_dates else 0
        nodes_map[end_node_id]["eet"] = project_duration
        nodes_map[end_node_id]["let"] = project_duration
        
        successors = self._build_successors()
        for t_id in self.tasks:
            if not successors[t_id]:
                # Connect End_T to Fin (Global End)
                # Via dummy? Ou merge?
                # Merge: End_T IS Fin? 
                # Si on merge, on remplace toutes les références à End_T par Fin.
                # Faisons simple: Dummy End_T -> Fin
                edges.append({
                    "source": task_end_nodes[t_id],
                    "target": end_node_id,
                    "label": "",
                    "is_dummy": True
                })

        # --- Simplification & Renumérotation ---
        # 1. Renuméroter les noeuds (1..N) sauf Début/Fin
        # Trier par EET pour que les numéros suivent le flux temporel
        sorted_nodes = sorted(
            [n for n in nodes_map.values() if n["id"] not in ("Start", "Fin")],
            key=lambda x: x["eet"]
        )
        
        # Assigner des IDs numériques simples
        node_mapping = {"Start": "Start", "Fin": "Fin"}
        display_nodes = []
        
        # Add Start
        display_nodes.append(nodes_map["Start"])
        
        counter = 1
        for node in sorted_nodes:
            new_id = str(counter)
            node_mapping[node["id"]] = new_id
            node["id"] = new_id # Update ID
            node["label"] = new_id
            display_nodes.append(node)
            counter += 1
            
        # Add Fin
        display_nodes.append(nodes_map["Fin"])
        
        # Update edges with new IDs
        final_edges = []
        for edge in edges:
            src = node_mapping.get(edge["source"], edge["source"])
            tgt = node_mapping.get(edge["target"], edge["target"])
            
            # Optimization: Remove dummy if src -> tgt and it's the only path?
            # Basic Graphviz-like merge optimization is complex.
            # Keeping dummies for accuracy of logic.
            
            final_edges.append({
                "id": f"{src}-{tgt}-{edge.get('task_id', 'dummy')}", # Unique ID
                "source": src,
                "target": tgt,
                "label": edge["label"],
                "task_id": edge.get("task_id"),
                "is_dummy": edge["is_dummy"],
                "animated": edge["is_dummy"], # Dummies often dashed/animated
                "style": {"strokeDasharray": "5,5"} if edge["is_dummy"] else {} 
            })
            
        return {"nodes": display_nodes, "edges": final_edges}
