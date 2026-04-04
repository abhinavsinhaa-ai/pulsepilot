import json

def load_data():
    with open("tasks.json", "r") as f:
        return json.load(f)

def generate_plan(data):
    hours = data["available_hours"]
    tasks = sorted(data["tasks"], key=lambda x: x["priority"], reverse=True)

    print("\nPULSEPILOT STUDY PLAN")
    print("-" * 25)

    for task in tasks:
        if hours <= 0:
            break
        allocated = min(task["hours"], hours)
        print(f"{task['name']}: {allocated} hour(s)")
        hours -= allocated

    if hours > 0:
        print(f"\nFree time left: {hours} hour(s)")
    else:
        print("\nAll time allocated.")

data = load_data()
generate_plan(data)
