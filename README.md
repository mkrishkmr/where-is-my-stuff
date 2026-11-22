<div align="center">

# 📦 Where Is My Stuff

### *Inventory apps ask you to be a librarian.<br/>Where Is My Stuff asks you to take a photo.*

**A mobile-first household inventory & recall app.<br/>Snap it, forget it, find it later in plain English.**

[![Next.js](https://img.shields.io/badge/Next.js-14-black?logo=next.js&logoColor=white)](https://nextjs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.x-3178C6?logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-3.x-38B2AC?logo=tailwind-css&logoColor=white)](https://tailwindcss.com/)
[![AI](https://img.shields.io/badge/AI-Claude_Opus_5.5_via_Divyam-D97757)](#-frontier-ai-integration)
[![Tests](https://img.shields.io/badge/tests-19%2F19_passing-brightgreen)](#-verified-test-suite)
[![Mobile First](https://img.shields.io/badge/design-mobile--first-ff69b4)](#)

[Vision](#-project-vision) •
[Phases](#-the-four-product-phases) •
[Architecture](#%EF%B8%8F-system-architecture) •
[Folder Structure](#-folder-structure) •
[AI Integration](#-frontier-ai-integration) •
[Tests](#-verified-test-suite) •
[Setup](#-local-deployment-guide) •
[Demo Mode](#-stage-safe-demo-mode)

</div>

---

## 📖 Table of Contents

- [🎯 Project Vision](#-project-vision)
- [🧭 The Four Product Phases](#-the-four-product-phases)
  - [Phase 1: Effortless Capture](#-phase-1--effortless-capture)
  - [Phase 2: Humanlike Recall](#-phase-2--humanlike-recall)
  - [Phase 3: "Put It Back" Return Timers](#-phase-3--put-it-back-return-timers)
  - [Phase 4: Connected Household & Family Share](#-phase-4--connected-household--family-share)
- [🏗️ System Architecture](#%EF%B8%8F-system-architecture)
- [📁 Folder Structure](#-folder-structure)
- [🧠 Frontier AI Integration](#-frontier-ai-integration)
- [✅ Verified Test Suite](#-verified-test-suite)
- [🚀 Local Deployment Guide](#-local-deployment-guide)
- [🎭 Stage Safe Demo Mode](#-stage-safe-demo-mode)
- [🛡️ Design Principles](#%EF%B8%8F-design-principles)
- [🤝 Contributing](#-contributing)
- [📄 License](#-license)

---

## 🎯 Project Vision

> **"Inventory apps ask you to be a librarian. Where Is My Stuff asks you to take a photo."**

Every household has the same invisible tax: the spare charger, the passport, the HDMI cable, the drill someone borrowed last spring. Traditional inventory apps fail for one reason. **They front-load the friction.** They ask for names, categories, tags, and locations at the moment you are least motivated to give them.

**Where Is My Stuff inverts that model:**

| Traditional Inventory Apps 📚 | Where Is My Stuff 📸 |
| :--- | :--- |
| Type the item name manually | AI identifies the item from a photo |
| Choose from nested category trees | Categories are inferred automatically |
| Remember the exact name you used | Search the way you *think* ("that black cord…") |
| Static lists with no follow-up | Proactive return timers and travel checks |
| Single-user silos | Shared household memory |

### 🎯 Core Problem Statement

High-friction household item tracking fails because **capture cost exceeds perceived recall value**. We reduce capture cost to roughly zero (one photo and one tap) and raise recall value with associative, humanlike search backed by photo evidence.

### 📏 North-Star Metrics

| Metric | Target |
| :--- | :--- |
| ⏱️ Time from shutter to saved item | **< 3 seconds** |
| ⌨️ Keystrokes required to save an item | **0** |
| 🔍 Recall queries resolved with photo proof | **Every successful match** |
| 👆 Taps to share an item location with family | **1** |

---

## 🧭 The Four Product Phases

The product is delivered in four progressive phases. Each phase builds on the data captured by the one before it.

```
 Phase 1            Phase 2            Phase 3              Phase 4
┌──────────┐      ┌──────────┐      ┌──────────────┐      ┌──────────────┐
│ CAPTURE  │ ───▶ │  RECALL  │ ───▶ │ PUT IT BACK  │ ───▶ │  HOUSEHOLD   │
│ 📸 Snap  │      │ 🔍 Ask   │      │ ⏰ Remind    │      │ 👨‍👩‍👧 Share    │
└──────────┘      └──────────┘      └──────────────┘      └──────────────┘
```

---

### 📸 Phase 1 · Effortless Capture

> **Goal:** Save an item in under 3 seconds with zero typing.

**User Flow**

```
📷 Shutter Snap ──▶ 🧠 Opus 5.5 Vision ──▶ 🏷️ Specific Item Detected ──▶ 🛋️ 1-Tap Room/Furniture Pill ──▶ ✅ Saved
                     (auto-classify)        e.g. "Braided HDMI 2.1 Cable"   e.g. [Living Room] [TV Cabinet]
```

| Step | Interaction | Details |
| :---: | :--- | :--- |
| 1 | **Shutter snap** | Native mobile camera input. No forms are shown first. |
| 2 | **AI auto-detection** | Claude Opus 5.5 returns a *specific* item identity rather than a generic label ("Braided HDMI 2.1 Cable", not "cable"). |
| 3 | **1-tap location pill** | Room and furniture pills are ranked by recency and context. |
| 4 | **Saved** | The item persists with its photo, AI description, location, and timestamp. |

**Key Design Decisions**
- 🎯 **Specificity over category:** Generic labels are useless at recall time. The model is prompted for brand, material, color, and distinguishing features.
- 💊 **Pills over pickers:** Dropdowns add friction, so the location choice is presented as large, thumb-friendly pills.
- ⚡ **Optimistic UI:** The item card renders immediately while classification resolves.

---

### 🔍 Phase 2 · Humanlike Recall

> **Goal:** Find things the way humans remember them, through association rather than exact names.

People rarely remember what they *named* something. They remember what it *does*, what it *looks like*, or what it *connects to*.

**Example**

```text
User query: "that black cord for connecting my laptop to the TV"
```

The user never says "HDMI." They describe the object the way people remember it: by **color**, **shape**, and **purpose**. Opus 5.5 resolves the description against the stored inventory using both the visual descriptors captured in Phase 1 and the functional knowledge it already has.

```json
{
  "match": {
    "id": "itm_8f21c",
    "name": "HDMI cable (2m, black, braided)",
    "location": "Living room → TV cabinet → left drawer",
    "confidence": 0.94,
    "photo": "/uploads/itm_8f21c.jpg",
    "last_seen": "2025-01-14T19:42:00Z"
  },
  "reasoning": "Black cable + laptop-to-TV connection → HDMI. One HDMI cable in inventory.",
  "response": "That's your black braided HDMI cable. It's in the left drawer of the TV cabinet in the living room. You put it there on Tuesday evening."
}
```

#### Associative Search Examples

| What the user says | What Opus 5.5 infers | Resolved item |
|---|---|---|
| "that black cord for connecting my laptop to the TV" | Laptop→display link, black cable | HDMI cable |
| "the thing I need to get into the country" | Travel identity document | Passport |
| "grandma's ring" | Ownership + sentimental jewellery | Gold ring with green stone |
| "the clicker for the AC" | Remote control, appliance-specific | Daikin AC remote |
| "where's the stuff for my headache" | Medication, analgesic | Paracetamol strip |
| "the spare one for the front door" | Duplicate key, entry door | Spare house key (brass) |
| "my charger, the fat one" | Charger, high wattage / bulky brick | 96W USB-C laptop charger |
| "Riya's school thing with the blue cover" | Owner + school + visual cue | Riya's blue maths notebook |

#### How Associative Matching Works

1. **Candidate shortlist (local, ~5 ms):** A lightweight keyword and synonym pass over `data/items.json` narrows the inventory to the 25 most plausible candidates. This keeps prompts small and fast.
2. **Semantic resolution (Opus 5.5):** The shortlist goes to the model with the user's raw query. Each candidate includes its name, tags, colors, room, container, owner and last-seen timestamp. The model reasons about function, appearance, ownership and synonyms.
3. **Confidence gating:**
   - `≥ 0.80` → answer directly with photo proof.
   - `0.50 – 0.79` → answer with a gentle check ("Is it the black HDMI cable or the grey USB-C to HDMI adapter?").
   - `< 0.50` → ask one clarifying question and never guess silently.
4. **Ambiguity handling:** When several items match equally, the UI shows up to 3 tappable photo cards instead of a wall of text.

#### Conversational Responses

Responses are written the way a family member would answer. They are not database output.

| Robotic (what we avoid) | Humanlike (what we ship) |
|---|---|
| `Item: Passport. Location: Bedroom/Wardrobe/Shelf 2.` | "Your passport is in the bedroom wardrobe, second shelf, inside the blue document folder." |
| `No results found.` | "I don't have that one logged yet. Want to snap a photo of it now so we never lose it again?" |
| `Multiple matches (3).` | "I found three chargers. Did you mean the big laptop brick, the phone one, or the watch puck?" |

Tone rules enforced in the system prompt:

- Lead with the **location**, then add context.
- Use **relative time** ("on Tuesday evening", "about 3 weeks ago").
- Keep it to **two sentences or fewer** unless the user asks for more.
- **Never invent a location.** If unsure, say so.

#### Photo Proof

Every answer carries the original capture photo. This gives instant visual confirmation and builds trust.

```
┌─────────────────────────────────────┐
│  [ 📷  photo of the item in place ] │
│                                     │
│  HDMI cable (black, braided)        │
│  📍 Living room › TV cabinet ›      │
│     left drawer                     │
│  🕒 Seen Tue, 7:42 PM               │
│                                     │
│  [ ✅ Found it ]   [ 📍 Moved it ]   │
└─────────────────────────────────────┘
```

- **✅ Found it** updates `last_seen` and strengthens the item's recall weighting.
- **📍 Moved it** opens a one-step re-capture so the inventory never drifts out of sync with reality.
- Photos are lazy-loaded, served from `public/uploads/`, and shown with a blurred placeholder so the card renders instantly.



## ⏱️ Phase 3: "Put It Back" Return Timers

Phase 3 turns the app from a passive locator into an active reminder system. Items that leave their home location get a timer, and the app nudges the user before things go missing.

### 3.1 Loan Timers

When an item is lent out or temporarily moved, the user starts a return timer from the item card.

| Field | Type | Description |
|---|---|---|
| `loan.borrower` | `string` | Who has the item (e.g., "Rahul", "Office desk") |
| `loan.startedAt` | `ISO 8601` | Timestamp when the item left its home location |
| `loan.dueAt` | `ISO 8601` | Expected return time |
| `loan.homeLocation` | `string` | Canonical location the item should return to |
| `loan.status` | `enum` | `active` · `due_soon` · `overdue` · `returned` |

**Flow:**
1. The user taps **"Lend / Move"** on an item card and picks a preset duration (1h, 1d, 1w) or a custom date.
2. The item card shows a live countdown chip (`Due in 2d 4h`).
3. Tapping **"Put It Back"** marks the item `returned`, restores `homeLocation`, and records the event in item history.

### 3.2 Overdue Escalation

`/api/nudge` evaluates every active timer and escalates in tiers:

| Tier | Trigger | UI Behaviour |
|---|---|---|
| 🟢 **Active** | `now < dueAt − 24h` | Neutral countdown chip |
| 🟡 **Due Soon** | `now ≥ dueAt − 24h` | Amber chip and a gentle home-screen banner |
| 🔴 **Overdue** | `now > dueAt` | Red chip, pinned to the top of the home feed, with a one-tap "Remind Borrower" action |
| 🚨 **Critical** | `now > dueAt + 7d` | Persistent banner and a suggestion to update the item's location or mark it lost |

Escalation is **stateless and idempotent**: tiers are derived from timestamps on every request. No background workers are needed, so the logic stays reliable on serverless deployments.

### 3.3 Flight Departure Passport Check ✈️

This is a context-aware safety net for travel-critical documents.

1. The user adds an upcoming trip with a departure date and time.
2. Items tagged `travel_critical` (passport, visa, boarding documents, forex card) are checked automatically.
3. At **T−48h** and **T−6h**, `/api/nudge` returns a checklist nudge:

   > 🛂 **Flight in 6 hours.** Your passport was last seen in *Bedroom → Wardrobe → Top drawer*. Confirm it's packed?

4. If any travel-critical item has an **active loan or unknown location**, the nudge escalates to 🔴 immediately.
5. Confirming "Packed" sets each item's location to `Travel bag` with a return timer that ends at the trip's return date.

---

## 👨‍👩‍👧 Phase 4: Connected Household & Family Share

Phase 4 extends the app from one person to a whole household, so family members can find shared items without asking each other.

### 4.1 Email Wall Profiles

- Each household member is identified by an **email-based profile**. This is a lightweight identity layer with no password-heavy onboarding.
- An **email wall** gates access to a household. Only emails on the household allow-list can view or edit shared items.
- Every item records `addedBy` and `lastMovedBy`, so the activity feed reads naturally:
  > *Mom moved **Car Keys** to Hallway → Key Hook · 2h ago*
- Items can be marked **🔒 Private** (owner only) or **🏠 Shared** (visible to the household).

### 4.2 One-Tap WhatsApp Deep-Links

Any item can be shared through WhatsApp with a single tap. The app builds a pre-filled message containing a deep-link back into the app:

```
https://wa.me/?text=<encoded message>
```

**Embedded app link format:**

```
https://whereismystuff.app/?item=<itemId>&find=<locationSlug>
```

| Param | Purpose |
|---|---|
| `item` | Opens the exact item card |
| `find` | Highlights the location path and plays the "found it" reveal animation |

**Example message:**

> 📍 The **spare house key** is in *Kitchen → Second drawer → Blue tin*.
> Open: `https://whereismystuff.app/?item=itm_8f2a&find=kitchen-second-drawer`

When the link opens, the app goes straight to the item. There is no search step, which makes it ideal for "Where did you keep the…?" family conversations.

---

## 🏗️ System Architecture

```
┌──────────────────────────────────────────────────────────────────────┐
│                         CLIENT (Browser / PWA)                        │
│   Next.js 14 App Router · React Server + Client Components · Tailwind │
│                                                                       │
│   ┌────────────┐  ┌────────────┐  ┌────────────┐  ┌────────────────┐  │
│   │  Capture   │  │   Search   │  │ Item Cards │  │ Nudges/Timers  │  │
│   │  (Camera)  │  │  (NL Query)│  │  + Share   │  │  + Passport ✈️  │  │
│   └─────┬──────┘  └─────┬──────┘  └─────┬──────┘  └───────┬────────┘  │
└─────────┼───────────────┼───────────────┼─────────────────┼───────────┘
          │ POST image    │ POST query    │ GET/PATCH/DEL   │ GET
          ▼               ▼               ▼                 ▼
┌──────────────────────────────────────────────────────────────────────┐
│                      NEXT.JS API ROUTES (Server)                      │
│                                                                       │
│  /api/capture        /api/search          /api/items      /api/nudge  │
│  ├ validate image    ├ load inventory     ├ CRUD          ├ timer     │
│  ├ build vision      ├ build intent       ├ loans         │  tiering  │
│  │ prompt            │ prompt             ├ household     ├ travel    │
│  └ parse + persist   └ rank matches       │ sharing       │  checks   │
└─────────┬────────────────────┬──────────────────┬───────────────────┬─┘
          │                    │                  │                   │
          ▼                    ▼                  │                   │
┌─────────────────────────────────────┐           │                   │
│        DIVYAM AI GATEWAY            │           │                   │
│  ┌───────────────────────────────┐  │           │                   │
│  │      Claude Opus 5.5          │  │           │                   │
│  │  • Vision: object + location  │  │           │                   │
│  │  • Language: intent matching  │  │           │                   │
│  └───────────────────────────────┘  │           │                   │
└─────────────────────────────────────┘           │                   │
                                                  ▼                   ▼
                              ┌──────────────────────────────────────────┐
                              │           data/items.json                │
                              │  items[] · loans · households · trips    │
                              │  (atomic write via temp file + rename)   │
                              └──────────────────────────────────────────┘
```

**Key decisions**
- **Server-only AI calls:** API keys never reach the client. Every Divyam call goes through API routes.
- **JSON file store:** zero setup for local and demo use. The `lib/store.ts` abstraction allows a later swap to SQLite or Postgres without touching any routes.
- **Stateless nudges:** timer state is computed from timestamps at request time.

---

## 📁 Comprehensive Folder Structure

```
where-is-my-stuff/
├── src/
│   ├── app/
│   │   ├── layout.tsx                # Root layout, fonts, theme provider
│   │   ├── page.tsx                  # Home feed: nudges, recent items, search
│   │   ├── capture/page.tsx          # Camera capture flow
│   │   ├── item/[id]/page.tsx        # Item detail, history, loan, share
│   │   ├── household/page.tsx        # Members, email wall, privacy
│   │   ├── globals.css               # Tailwind base + Material You tokens
│   │   └── api/
│   │       ├── capture/route.ts      # Image → Claude vision → item
│   │       ├── search/route.ts       # NL query → intent match → results
│   │       ├── items/route.ts        # List / create
│   │       ├── items/[id]/route.ts   # Read / update / delete / loan
│   │       └── nudge/route.ts        # Timer tiers + travel checks
│   ├── components/
│   │   ├── CaptureSheet.tsx
│   │   ├── SearchBar.tsx
│   │   ├── ItemCard.tsx
│   │   ├── LoanTimerChip.tsx
│   │   ├── NudgeBanner.tsx
│   │   ├── PassportCheck.tsx
│   │   ├── ShareButton.tsx           # WhatsApp deep-link builder
│   │   └── BottomNav.tsx
│   ├── lib/
│   │   ├── divyam.ts                 # Divyam client + retry/timeout
│   │   ├── prompts.ts                # Vision + search prompt templates
│   │   ├── parse.ts                  # JSON extraction + schema validation
│   │   ├── store.ts                  # items.json read/write abstraction
│   │   ├── nudges.ts                 # Escalation tier logic
│   │   ├── deeplink.ts               # ?item=&find= helpers
│   │   └── demo.ts                   # Stage-safe demo fixtures

├── phases/
│   ├── phase_1_effortless_capture/   # Phase 1 standalone implementation & tests
│   │   ├── capture_service.ts
│   │   ├── vision_engine.ts
│   │   ├── test_phase1.js
│   │   └── explain_phase1.html
│   ├── phase_2_humanlike_recall/     # Phase 2 associative search & recall tests
│   │   ├── recall_engine.ts
│   │   ├── search_service.ts
│   │   ├── test_phase2.js
│   │   └── explain_phase2.html
│   ├── phase_3_put_it_back_timer/    # Phase 3 loan timers & return reminders
│   │   ├── timer_engine.ts
│   │   ├── timer_service.ts
│   │   ├── test_phase3.js
│   │   └── explain_phase3.html
│   └── phase_4_connected_household/  # Phase 4 profiles & 1-click sharing
│       ├── session_service.ts
│       ├── share_engine.ts
│       ├── test_phase4.js
│       └── explain_phase4.html
├── product_thinking/
│   ├── 01_product_brief.md           # Product strategy, problem space, metrics
│   ├── 02_stage_demo_script.md       # 3-minute stage pitch script
│   ├── 03_phasewise_architecture.md  # 4-phase technical roadmap
│   ├── 04_opus_executive_summary.md  # Opus 5.5 executive synthesis
│   ├── 05_google_tier_mobile_ui_design.md # Full mobile UI design spec
│   └── test_cases_passed_all_phases.md # Master test report
├── public/
│   ├── overview.html                 # One-page interactive overview & simulator
│   └── mobile_design_preview.html    # Mobile viewport frame preview
├── scripts/
│   ├── generators/                   # Pipeline synthesis scripts
│   └── verify_*.js                   # Automated verification harnesses
├── test_images/                      # Camera capture sample photos
├── data/
│   └── items.json                    # Canonical household catalog
├── .env.example                      # Template environment variables
├── .gitignore                        # Git exclusion rules
├── package.json                      # Next.js 14, React 18, Tailwind, Lucide
├── tsconfig.json                     # Strict TypeScript configuration
└── README.md                         # Project documentation

---

## 🧠 Frontier AI Integration: Divyam Claude Opus 5.5

The entire multimodal intelligence stack is powered by **Claude Opus 5.5** routed via **Divyam API** (`https://api.preview.divyam.ai/v1`).

### 1. Multimodal Vision Pipeline
- **Input:** Camera stream resized client-side to ≤1024px JPEG (0.82 quality) for low-latency transmission.
- **Model:** `divyam-as/claude-opus-5-5`
- **Output:** Structured JSON with specific object naming, physical description (under 30 words), confidence score, and contextual search tags.
- **Resilience:** Dual-layer parser: primary JSON parse + regex fallback recovery (`"name"`, `"description"`, `"confidence"`, `"tags"`), ensuring zero parsing failures.

### 2. Conversational Associative Recall
- **Model:** `divyam-as/claude-opus-5-5`
- **Context:** Catalog summary formatted dynamically with item status (in place vs borrowed).
- **Tone:** Warm, direct, natural human guidance answering which room, furniture piece, and drawer the item occupies, backed by photo proof.

---

## ✅ Verified Test Suite (19/19 Tests Passing)

All 19 automated test scenarios across all 4 product phases have been executed and verified green:

| Phase | Test Case | Scenario Description | Status |
|---|---|---|:---:|
| **Phase 1** | TC-P1-01 | Opus 5.5 Phase 1 Specification Integrity Check | ✅ PASS |
| **Phase 1** | TC-P1-02 | Interactive HTML Explainer Rendering | ✅ PASS |
| **Phase 1** | TC-P1-03 | TypeScript Contracts Validation (`CapturePayload`, `CaptureResult`) | ✅ PASS |
| **Phase 1** | TC-P1-04 | Divyam Opus 5.5 Multimodal Extraction Pipeline | ✅ PASS |
| **Phase 2** | TC-P2-01 | Vague Tech Accessory Recall (*"black cable for laptop to TV"*) | ✅ PASS |
| **Phase 2** | TC-P2-02 | Travel Document Intent Matching (*"blue passport for flight"*) | ✅ PASS |
| **Phase 2** | TC-P2-03 | Household Entry Key Recall (*"spare house keys"*) | ✅ PASS |
| **Phase 2** | TC-P2-04 | Audio Headphone Intent Matching (*"noise cancelling headphones"*) | ✅ PASS |
| **Phase 2** | TC-P2-05 | Nightstand Phone Fast Charger Recall (*"white fast charger"*) | ✅ PASS |
| **Phase 3** | TC-P3-01 | 1-Click Borrow Action (60 mins loan timer) | ✅ PASS |
| **Phase 3** | TC-P3-02 | Active Loan Household Alert Generation | ✅ PASS |
| **Phase 3** | TC-P3-03 | Overdue Loan Urgency Escalation | ✅ PASS |
| **Phase 3** | TC-P3-04 | "Mark Returned to Spot" Loop Closure | ✅ PASS |
| **Phase 3** | TC-P3-05 | Proactive Travel Departure Check (Flight AI 102) | ✅ PASS |
| **Phase 4** | TC-P4-01 | Predefined Family Member Resolution (Alex, Sarah) | ✅ PASS |
| **Phase 4** | TC-P4-02 | Custom Email Auto-Provisioning (`priya@family.com`) | ✅ PASS |
| **Phase 4** | TC-P4-03 | 1-Click Share Deep-Link Generation (`?item=...&find=...`) | ✅ PASS |
| **Phase 4** | TC-P4-04 | Recipient Share Link Parsing & Catalog Lookup | ✅ PASS |
| **Phase 4** | TC-P4-05 | Fallback Resilience for Invalid/Missing Items | ✅ PASS |

---

## 🚀 Local Deployment Guide

### Prerequisites
- Node.js 18.17+ or 20+
- npm 9+
- Divyam API Key

### Step 1: Clone Repository
```bash
git clone https://github.com/mkrishkmr/where-is-my-stuff.git
cd where-is-my-stuff
```

### Step 2: Install Dependencies
```bash
npm install
```

### Step 3: Configure Environment
Copy `.env.example` to `.env.local`:
```bash
cp .env.example .env.local
```
Add your credentials to `.env.local`:
```env
DIVYAM_API_KEY=your_divyam_api_key_here
DIVYAM_BASE_URL=https://api.preview.divyam.ai/v1
DIVYAM_CHAT_MODEL=divyam-as/claude-opus-5-5
```

### Step 4: Start Development Server
```bash
npm run dev -- -p 3000
```
Open **`http://localhost:3000`** on desktop or mobile browser.

### Step 5: Run Automated Tests
```bash
node phases/phase_1_effortless_capture/test_phase1.js && node phases/phase_2_humanlike_recall/test_phase2.js && node phases/phase_3_put_it_back_timer/test_phase3.js && node phases/phase_4_connected_household/test_phase4.js
```

---

## 🎭 Stage Safe Demo Mode

For zero-latency stage presentations and offline hackathon judging:
- Access URL: **`http://localhost:3000?demo=true`**
- Uses zero-latency local fallback fixtures for instant response without network latency.
- Toggle anytime via the **Stage Safe Mode** pill in the top header.

---

## 🛡️ Design Principles

- **Mobile-First & Touch-First:** Designed strictly within standard smartphone viewports (`max-w-md`), optimized for single-handed thumb operation.
- **OLED Dark Aesthetic:** Deep slate background (`#020617` / `#0F172A`) with emerald success markers, purple brand accents, and subtle borders (`border-slate-800`).
- **Zero-Typing Hierarchy:** 1-tap room & furniture selection pills, auto-advancing camera flow, and conversational voice-like search chips.
- **Optimistic UI:** Instant visual feedback during photo analysis and catalog transitions.

---

<div align="center">
Built for the Frontier Builders Hackathon • Repository: <a href="https://github.com/mkrishkmr/where-is-my-stuff">github.com/mkrishkmr/where-is-my-stuff</a>
</div>
