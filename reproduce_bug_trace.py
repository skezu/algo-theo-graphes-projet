from pert_scheduler import PertScheduler
import traceback

tasks = [
    {"id": "A", "name": "A", "duration": 3.0, "predecessors": []},
    {"id": "B", "name": "B", "duration": 1.0, "predecessors": ["A"]},
    {"id": "C", "name": "C", "duration": 5.0, "predecessors": ["A"]},
    {"id": "D", "name": "D", "duration": 6.0, "predecessors": ["B"]},
    {"id": "E", "name": "E", "duration": 4.0, "predecessors": ["B"]},
    {"id": "F", "name": "F", "duration": 2.0, "predecessors": ["C", "I", "D"]},
    {"id": "G", "name": "G", "duration": 9.0, "predecessors": ["E", "F"]},
    {"id": "H", "name": "H", "duration": 5.0, "predecessors": []},
    {"id": "I", "name": "I", "duration": 8.0, "predecessors": ["H"]},
    {"id": "J", "name": "J", "duration": 2.0, "predecessors": ["H"]},
    {"id": "K", "name": "K", "duration": 3.0, "predecessors": ["I"]},
    {"id": "L", "name": "L", "duration": 7.0, "predecessors": ["J", "K"]}
]

def run_test():
    scheduler = PertScheduler()
    try:
        for task in tasks:
            scheduler.add_task(
                task['id'], 
                task['name'], 
                task['duration'], 
                task.get('predecessors', [])
            )
        
        print("Tasks added successfully.")
        
        print("Calculating AoA structure...")
        aoa = scheduler.get_aoa_structure()
        print("AoA structure calculated successfully.")
        print(f"Nodes: {len(aoa['nodes'])}")
        print(f"Edges: {len(aoa['edges'])}")
        
    except Exception:
        traceback.print_exc()

if __name__ == "__main__":
    run_test()
