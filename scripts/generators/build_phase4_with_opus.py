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

print("1. Querying Opus 5.5 for Phase 4 Family Share Specs & Security Model...")
p1 = ask_opus("""You are an expert product architect for 'Where Is My Stuff'.
Phase 4 is: The Connected Household Family Share Experience.
Problem: Domestic friction occurs when family members constantly text 'where did you put X?'.
Provide:
1. The email-walled session design (how entering an email like alex@family.com or mom@family.com creates instant household transparency without password friction).
2. The 1-click family share deep-link contract (?item=item-1&find=Passport) and how it auto-resolves for the recipient with zero search steps.
3. The offline stage demo safe mode contract (?demo=true) that guarantees zero network latency on stage.
Keep it concise, code-ready, with zero fluff.""")

print("2. Querying Opus 5.5 for Phase 4 UX Explainer Content...")
p2 = ask_opus("""You are a senior UX designer for AI products.
Explain Phase 4 (The Connected Household Family Share Experience):
- Why shared household visibility ends domestic 'hide-and-seek'.
- The recipient experience: from WhatsApp/iMessage link tap directly to photo proof in 1 second.
- The 25-second stage demo delivery script for judges demonstrating two family member viewpoints (Alex sharing -> Sarah opening).
Provide clean markdown.""")

os.makedirs("phases/phase_4_connected_household", exist_ok=True)

with open("phases/phase_4_connected_household/opus_phase4_specs.md", "w") as f:
    f.write("# Phase 4: Connected Household Specifications\n\n> Generated via Divyam Opus 5.5\n\n" + p1 + "\n\n---\n\n" + p2)

print("Saved specs to phases/phase_4_connected_household/opus_phase4_specs.md")

