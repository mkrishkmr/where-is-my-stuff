import json
import urllib.request
import os

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

def ask_opus(prompt_text, max_tokens=1500):
    payload = {
        "model": model,
        "messages": [
            {"role": "user", "content": prompt_text}
        ],
        "max_tokens": max_tokens,
        "temperature": 0.2
    }
    req = urllib.request.Request(
        base_url + "/chat/completions",
        data=json.dumps(payload).encode("utf-8"),
        headers={
            "Authorization": "Bearer " + api_key,
            "Content-Type": "application/json"
        }
    )
    with urllib.request.urlopen(req, timeout=60) as resp:
        d = json.loads(resp.read().decode("utf-8"))
        return d["choices"][0]["message"].get("content") or d["choices"][0]["message"].get("reasoning_content") or ""

print("1. Querying Opus 5.5 for Phase 3 Return Timer Specs & Notification Prompts...")
p1 = ask_opus("""You are an expert product designer and AI prompt engineer for 'Where Is My Stuff'.
Phase 3 is: The 'Put It Back' Return Timer Experience.
Problem: Belongings go missing when family members borrow an item (e.g., HDMI cable, passport, scissors) and forget to put it back in its designated drawer.
Provide:
1. The borrow flow specifications (1-click borrow for 1h, 4h, 24h).
2. The exact prompt for Claude Opus 5.5 to generate polite, non-nagging, context-rich return reminders that mention the exact drawer to return the item to.
3. The calendar context alert prompt (e.g. flight departure linking to passport location).
4. Strict JSON format: { alert_title: string, message: string, urgency: 'gentle' | 'due' | 'overdue' }.
Keep it concise, code-ready, with zero fluff.""")

print("2. Querying Opus 5.5 for Phase 3 UX Explainer Content...")
p2 = ask_opus("""You are a senior UX designer for household AI products.
Explain Phase 3 (The 'Put It Back' Return Timer Experience):
- Why things get lost after borrowing (the displaced item trap).
- How 1-click borrow timers create domestic peace without nagging.
- The stage demo delivery script for unconference judges (the 25-second borrow & return moment).
Provide clean markdown.""")

os.makedirs("phases/phase_3_put_it_back_timer", exist_ok=True)

with open("phases/phase_3_put_it_back_timer/opus_phase3_specs.md", "w") as f:
    f.write("# Phase 3: 'Put It Back' Return Timer Specifications\n\n> Generated via Divyam Opus 5.5\n\n" + p1 + "\n\n---\n\n" + p2)

print("Saved specs to phases/phase_3_put_it_back_timer/opus_phase3_specs.md")

