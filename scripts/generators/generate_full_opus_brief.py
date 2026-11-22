import json
import urllib.request
import time

with open(".env.local") as f:
    env = {}
    for line in f:
        line = line.strip()
        if line and not line.startswith("#") and "=" in line:
            k, v = line.split("=", 1)
            env[k.strip()] = v.strip()

api_key = env["DIVYAM_API_KEY"]
base_url = env.get("DIVYAM_BASE_URL", "https://api.preview.divyam.ai/v1")
model = "divyam-as/claude-opus-5-5"

sections = [
    ("1. Challenge the Idea", "In 3 concise bullet points, challenge 'Where Is My Stuff'. What is its biggest weakness, what would a skeptical unconference judge say, and what existing products does it resemble?"),
    ("2. Five Product Angles", "Give a markdown table with 5 distinct AI angles for 'Where Is My Stuff'. Columns: Angle, Wow Factor, Build Difficulty (Low/Med/High), Demo Risk."),
    ("3. Feature Recommendation & Cut List", "Recommend exactly 1 hero feature and 1 supporting feature to build in 6 hours. List 4 things to explicitly cut."),
    ("4. Under-5-Second Capture Flow", "Design the fastest capture flow under 5 seconds. Compare photo vs voice vs photo+location picker in 3 bullets."),
    ("5. Data Model & Architecture", "Provide a minimal JSON data model schema and 3-step architecture using Divyam API (Opus 5.5) with local persistence and zero auth."),
    ("6. 3-Minute Stage Demo Script", "Write a 3-minute stage demo script with 4 clear chronological beats: Hook, Live Drawer Photo, Fuzzy Cable Search, and Proactive Flight Nudge."),
    ("7. Top 5 Demo Failure Modes & Fallbacks", "List the top 5 ways the live hackathon demo could fail and an actionable 1-line fallback for each."),
    ("8. 6-Hour Hourly Build Plan", "Provide a 6-hour build milestone plan from Hour 1 to Hour 6 (1 sentence per hour)."),
    ("9. Three Blocking Questions", "List the 3 exact technical/demo questions that must be answered before starting the build.")
]

full_md = "# Where Is My Stuff — Product Strategy & Execution Plan\n\n> Generated via Divyam API (`divyam-as/claude-opus-5-5`)\n\n"

for title, query in sections:
    print(f"Generating section: {title}...")
    payload = {
        "model": model,
        "messages": [
            {"role": "system", "content": "You are a sharp, opinionated product partner. Answer in punchy, action-first markdown."},
            {"role": "user", "content": query}
        ],
        "max_tokens": 400,
        "temperature": 0.3
    }
    req = urllib.request.Request(
        base_url + "/chat/completions",
        data=json.dumps(payload).encode("utf-8"),
        headers={
            "Authorization": "Bearer " + api_key,
            "Content-Type": "application/json"
        }
    )
    try:
        with urllib.request.urlopen(req, timeout=30) as resp:
            data = json.loads(resp.read().decode("utf-8"))
            ans = data["choices"][0]["message"].get("content", "").strip()
            full_md += f"## {title}\n\n{ans}\n\n---\n\n"
    except Exception as e:
        print(f"Error on {title}: {e}")
        full_md += f"## {title}\n\nError retrieving section: {e}\n\n---\n\n"
    time.sleep(1)

with open("product_thinking/01_product_brief.md", "w") as f:
    f.write(full_md)

print("Finished generating full product brief with Opus 5.5!")

