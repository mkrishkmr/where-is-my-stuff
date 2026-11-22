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

def call_opus(prompt_text):
    payload = {
        "model": model,
        "messages": [
            {"role": "user", "content": prompt_text}
        ],
        "max_tokens": 1500,
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
    with urllib.request.urlopen(req, timeout=120) as resp:
        body = resp.read().decode("utf-8")
        data = json.loads(body)
        print("Finish reason:", data["choices"][0].get("finish_reason"))
        return data["choices"][0]["message"].get("content", "")

prompt_part1 = """You are a sharp product partner and AI engineer at an unconference hackathon.
The idea is "Where Is My Stuff" (6 hours build time, live demo on stage).
Stack: Divyam AI (Claude Opus 5.5 for vision and chat).

Provide concise, factual, action-first analysis for:
# Where Is My Stuff — Product Strategy & Architecture (Part 1)

1. Challenge the idea (weaknesses, skeptical judge pushback, benchmark comparison).
2. Five AI-native angles (with Wow factor, Build difficulty, Demo risk table).
3. Recommendation: One hero feature, one supporting feature, and explicit cut list.
4. Under-5-second capture flow design (compare photo, voice, combined).
5. Data model and 6-hour architecture using Divyam Claude Opus 5.5.
"""

prompt_part2 = """You are a sharp product partner and AI engineer at an unconference hackathon.
The idea is "Where Is My Stuff" (6 hours build time, live demo on stage).
Stack: Divyam AI (Claude Opus 5.5 for vision and chat).

Provide concise, factual, action-first analysis for:
# Where Is My Stuff — Demo Pitch & Execution (Part 2)

6. 3-minute live stage demo script (stage directions, screen output, reaction moment).
7. Top 5 demo failure modes and immediate fallbacks table.
8. 6-hour build plan split into hourly milestones (Hour 1 to Hour 6).
9. Three critical questions needed before build starts.
"""

print("Querying Opus 5.5 for Part 1...")
part1 = call_opus(prompt_part1)

print("Querying Opus 5.5 for Part 2...")
part2 = call_opus(prompt_part2)

full_document = part1.strip() + "\n\n---\n\n" + part2.strip() + "\n"

with open("product_thinking/01_product_brief.md", "w") as out:
    out.write(full_document)

print(f"Successfully wrote {len(full_document)} characters to product_thinking/01_product_brief.md!")
