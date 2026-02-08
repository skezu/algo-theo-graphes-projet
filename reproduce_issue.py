import requests
import json
import sys

# Define the tasks based on the user's image
tasks = [
    {"id": "A", "name": "A", "duration": 3, "predecessors": []},
    {"id": "B", "name": "B", "duration": 1, "predecessors": ["A"]},
    {"id": "C", "name": "C", "duration": 5, "predecessors": ["A"]},
    {"id": "D", "name": "D", "duration": 6, "predecessors": ["B"]},
    {"id": "E", "name": "E", "duration": 4, "predecessors": ["B"]},
    {"id": "F", "name": "F", "duration": 2, "predecessors": ["C", "I", "D"]},
    {"id": "G", "name": "G", "duration": 9, "predecessors": ["E", "F"]},
    {"id": "H", "name": "H", "duration": 5, "predecessors": []},
    {"id": "I", "name": "I", "duration": 8, "predecessors": ["H"]},
    {"id": "J", "name": "J", "duration": 2, "predecessors": ["H"]},
    {"id": "K", "name": "K", "duration": 3, "predecessors": ["I"]},
    {"id": "L", "name": "L", "duration": 7, "predecessors": ["J", "K"]}
]

url = "http://localhost:8000/algorithm/pert"
headers = {"Content-Type": "application/json"}
payload = {"tasks": tasks}

try:
    print(f"Sending request to {url} with {len(tasks)} tasks...")
    response = requests.post(url, json=payload, headers=headers)
    
    print(f"Status Code: {response.status_code}")
    if response.status_code == 200:
        data = response.json()
        print("Success!")
        print(f"Project Duration: {data.get('result', {}).get('projectDuration')}")
        print(f"Nodes: {len(data.get('result', {}).get('aoa', {}).get('nodes', []))}")
        print(f"Edges: {len(data.get('result', {}).get('aoa', {}).get('edges', []))}")
    else:
        print("Failed!")
        print(response.text)
        
except Exception as e:
    print(f"Exception: {e}")
