import json
import urllib.request
import sys

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

def call_divyam(prompt):
    payload = {
        "model": model,
        "messages": [
            {
                "role": "system",
                "content": "You are a sharp product architect. Write in specific, factual, action-first language with zero filler."
            },
            {
                "role": "user",
                "content": prompt
            }
        ],
        "max_tokens": 800,
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
    with urllib.request.urlopen(req, timeout=45) as resp:
        data = json.loads(resp.read().decode("utf-8"))
        return data["choices"][0]["message"].get("content", "").strip()

print("Querying Divyam Opus 5.5 for Part 1: Key Problems...")
p1 = call_divyam("""The product is 'Where Is My Stuff'. 6-hour hackathon build. Single user records where their belongings are and asks in plain English to find them.
Detail the 4 core problems this product solves:
1. Capture Friction: Why logging >5s kills adoption and how 1-shot batch vision solves it.
2. Fuzzy Recall: Why people forget exact technical names and how intent-based search resolves vague descriptions.
3. Spatial Disconnect: Why general photo apps (Apple/Google Photos) fail to pinpoint exact physical containers/drawers.
4. Passive vs Proactive Memory: Why reactive search alone is insufficient and why context triggers (e.g. flight departure) change the product tier.
Write in punchy, action-first markdown with clear headers.""")

print("Querying Divyam Opus 5.5 for Part 2: Architectural Next Steps...")
p2 = call_divyam("""For 'Where Is My Stuff' built with Divyam AI (Claude Opus 5.5) in 6 hours:
Detail the exact concrete next steps to build the architecture around these problems:
- Step 1: Storage & Seed Schema (local JSON datastore, 12 pre-seeded demo items).
- Step 2: Divyam Vision Ingestion Pipeline (/api/capture with Opus 5.5 prompt for structured JSON item extraction).
- Step 3: Divyam Conversational Retrieval Pipeline (/api/search with Opus 5.5 intent matching).
- Step 4: Proactive Nudge Engine (/api/nudge with flight departure context).
- Step 5: Fast UI & Offline Safe Switch (Next.js, 1-tap capture, photo proof card, ?demo=true).
For each step, specify: exact component, technical contract, and done-when condition.""")

brief = f"""# Where Is My Stuff — Product Brief & Architecture Blueprint

> **Synthesized using Divyam AI (`divyam-as/claude-opus-5-5`)**  
> **Build Scope:** 6-Hour Hackathon • Minimal Backend • Zero Auth • Live Stage Demo

---

## Part 1: Key Problems Solved

{p1}

---

## Part 2: Concrete Architectural Next Steps

{p2}
"""

with open("product_thinking/01_product_brief.md", "w") as f:
    f.write(brief)

print("Successfully written to product_thinking/01_product_brief.md!")

