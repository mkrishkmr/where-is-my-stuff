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

print("1. Querying Opus 5.5 for Phase 1 Technical Engine...")
p1 = ask_opus("""You are an expert systems engineer. For 'Where Is My Stuff' Phase 1: Effortless Capture Experience:
Provide:
1. The exact production vision extraction prompt that identifies 3 to 8 physical items in an open drawer, pouch, or shelf.
2. The strict JSON schema that returns item name, physical visual attributes, confidence score, and search tags.
3. The TypeScript interface definitions.
Keep it concise, code-ready, with zero fluff.""")

print("2. Querying Opus 5.5 for Phase 1 Visual Architecture & Explainer Content...")
p2 = ask_opus("""You are a senior product designer and frontend engineer.
Write a clear, structured summary of Phase 1 (The Effortless Capture Experience):
- The UX journey from camera shutter to saved state in <=3 seconds.
- Why 1-tap location selection removes form fatigue.
- How background async extraction ensures zero lag for the user.
- The stage demo talking points for judges.
Provide clean markdown.""")

os.makedirs("phases/phase_1_effortless_capture", exist_ok=True)

with open("phases/phase_1_effortless_capture/opus_phase1_specs.md", "w") as f:
    f.write("# Phase 1: Effortless Capture Specifications\n\n> Generated via Divyam Opus 5.5\n\n" + p1 + "\n\n---\n\n" + p2)

print("Saved specs to phases/phase_1_effortless_capture/opus_phase1_specs.md")

