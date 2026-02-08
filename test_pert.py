import requests
import json

url = "http://localhost:8000/algorithm/pert"
payload = {
    "tasks": [
        {"id": "A", "name": "Task A", "duration": 3, "predecessors": []},
        {"id": "B", "name": "Task B", "duration": 5, "predecessors": ["A"]},
        {"id": "C", "name": "Task C", "duration": 4, "predecessors": ["B"]},
        {"id": "D", "name": "Task D", "duration": 3, "predecessors": ["C"]}
    ]
}

try:
    response = requests.post(url, json=payload)
    print(f"Status Code: {response.status_code}")
    if response.status_code == 200:
        data = response.json()
        print("Steps found:", len(data.get('steps', [])))
        print("\n--- Explore Edge Steps ---")
        for step in data.get('steps', []):
            if step.get('type') == 'explore_edge':
                print(f"{step.get('description')}")
        print("--------------------------\n")
        types = set(s['type'] for s in data.get('steps', []))
        print("Step Types:", types)
    else:
        print("Error:", response.text)
except Exception as e:
    print(f"Request failed: {e}")
