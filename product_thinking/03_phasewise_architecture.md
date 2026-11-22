# Experience-Driven Phasewise Architecture — Where Is My Stuff

> **Design Philosophy:** Optimized for the human experience of finding, storing, and sharing belongings across a household.  
> **Evaluation Anchor:** Live hackathon demo to product judges (90-minute implementation window).  
> **Inference Engine:** Divyam API (`divyam-as/claude-opus-5-5`).

---

## The 4 Core Experience Phases

```
┌────────────────────────────────────────────────────────────────────────┐
│ Phase 1: The "Effortless Capture" Experience                           │
│ Shutter to saved in ≤3s • 1-tap location pills • Zero form-filling      │
└───────────────────────────────────┬────────────────────────────────────┘
                                    │
                                    ▼
┌────────────────────────────────────────────────────────────────────────┐
│ Phase 2: The "Humanlike Recall" Experience                             │
│ Conversational queries • Warm empathetic responses • Photo proof       │
└───────────────────────────────────┬────────────────────────────────────┘
                                    │
                                    ▼
┌────────────────────────────────────────────────────────────────────────┐
│ Phase 3: The "Put It Back" Return Timer Experience                     │
│ Borrow accountability • Context departure nudges • Active countdowns   │
└───────────────────────────────────┬────────────────────────────────────┘
                                    │
                                    ▼
┌────────────────────────────────────────────────────────────────────────┐
│ Phase 4: The "Connected Household" Family Share Experience             │
│ Email wall • 1-click profile switch • Deep-linked instant item lookup  │
└────────────────────────────────────────────────────────────────────────┘
```

---

## Phase 1: The "Effortless Capture" Experience

### 1. The Human Problem
Traditional inventory apps force users through high-friction admin: typing item names, selecting dropdown categories, choosing quantities, and manually uploading photos. Because people put things away when they are distracted, tired, or mid-task, they abandon the app within two days.

### 2. The Target Experience
The capture experience must feel lighter than sending a WhatsApp photo:
1. **One Tap:** User opens app and taps camera or drags a photo.
2. **One Tap:** User selects a location pill (e.g., `Hallway Console`, `Kitchen Key Bowl`, `Office Desk`).
3. **Instant Acknowledgment:** The app immediately shows a success checkmark and runs extraction in the background. No waiting.
4. **Visual Reward:** Within 2 seconds, Opus 5.5 populates extracted item cards with visual tags (*"Braided HDMI Cable"*, *"SanDisk Flash Drive"*).

### 3. Architecture & Contracts
- **Client Component:** `CameraCapture.tsx` + `LocationPicker.tsx`.
- **API Endpoint:** `POST /api/capture`.
- **Contract Payload:**
  ```json
  {
    "image": "data:image/jpeg;base64,...",
    "location": "Hallway console, top drawer",
    "room": "Hallway",
    "isDemo": false
  }
  ```
- **Opus 5.5 Vision Prompt:**
  *"Analyze this drawer/shelf photo. Identify every physical item with specific names and distinguishing attributes. Output strict JSON `{ items: [{ name, description, confidence, tags }] }`."*
- **Storage:** Appends extracted items to `data/items.json`.

### 4. Stage Demo Proof (30 Seconds)
Pull out a prop pouch containing 3 items on stage. Take 1 photo, tap "Demo Pouch", tap Process. Three labeled cards appear instantly. Zero typing.

### 5. Done-When Gate
- A photo uploaded with 1 tap saves 3+ cataloged items in `data/items.json` in under 3 seconds.

---

## Phase 2: The "Humanlike Recall" Experience

### 1. The Human Problem
When people search for something they lost, they do not remember the SKU or formal name. They remember fragmented visual details (*"that black TV cord"*, *"the yellow sticky pad"*). Traditional database keyword search returns zero results, causing frustration.

### 2. The Target Experience
The user talks to the app as if texting a spouse or roommate:
- User asks: *"Where did you put the cord for connecting my laptop to the TV?"*
- The app does not return a sterile table row. It replies in warm, natural plain English:
  > *"Hey! Your **Braided HDMI 2.1 Cable** is in the **Office desk drawer, left compartment**. Here is the photo so you can see exactly where it is resting."*
- Original photo proof renders directly beneath the reply.

### 3. Architecture & Contracts
- **Client Component:** `ChatQueryBox.tsx` + `ItemCard.tsx`.
- **Stage Demo Prompts:** Quick-tap chips for common family panic items:
  - *"where did we put the spare house keys?"*
  - *"that black cable for connecting my laptop to the TV"*
  - *"where is my passport?"*
- **API Endpoint:** `POST /api/search`.
- **Contract Payload:** `{ "query": "string", "userEmail": "alex@family.com", "isDemo": false }`.
- **Opus 5.5 Persona Prompt:**
  *"You are a warm, helpful household assistant. Answer where the item is located in conversational natural language. Quote the exact room, furniture, and drawer. Pair with matched item IDs."*

### 4. Stage Demo Proof (30 Seconds)
Click prompt chip: *"that black cable for connecting my laptop to the TV"*. The app answers conversationally and shows the photo proof of the desk drawer.

### 5. Done-When Gate
- Vague colloquial queries correctly resolve to the underlying item and return an empathetic plain-text answer + photo card.

---

## Phase 3: The "Put It Back" Return Timer Experience

### 1. The Human Problem
Belongings do not get lost when they are in their home location; they get lost when a family member borrows them, leaves them in another room, and forgets to return them.

### 2. The Target Experience
Accountability without nagging:
1. **1-Click Borrow:** When taking an item, the user taps **"Borrow (1h / 24h)"**.
2. **Visual Status Shift:** The item card turns amber: *"Borrowed by Alex • Due in 58 mins"*.
3. **Proactive Notification Banner:** Top of dashboard alerts the household:
   > *"⏰ Return Due: Time to return 'Braided HDMI Cable' back to Office desk drawer."*
4. **Context Departure Alert:** Checks calendar context (e.g. flight tomorrow morning) and alerts the passport location *before* the user leaves.
5. **1-Click Return:** Tapping **"Mark Returned"** restores it to safe status.

### 3. Architecture & Contracts
- **Client Component:** `ItemCard.tsx` (Borrow/Return controls) + `ProactiveBanner.tsx`.
- **API Endpoints:**
  - `POST /api/items`: `{ action: "borrow" | "return", itemId: string, borrowedBy: string, timerMinutes: number }`.
  - `GET /api/nudge`: Returns active return timers and calendar departure alerts.
- **Data Mutation:** Updates `borrowedBy` and `returnTimerExpiresAt` in `data/items.json`.

### 4. Stage Demo Proof (25 Seconds)
Click **"1h"** borrow on the HDMI cable. Item card badge switches to active borrow. Proactive top banner pings with the return notification. Click **"Mark Returned"** to reset.

### 5. Done-When Gate
- Borrowing an item sets a timestamped return timer; `GET /api/nudge` returns an active return alert until cleared.

---

## Phase 4: The "Connected Household" Family Share Experience

### 1. The Human Problem
The #1 source of domestic friction around belongings is cross-examination texts: *"Did you move my passport?"*, *"Where are the car keys?"*. Both parties waste time because the location is trapped in one person's head.

### 2. The Target Experience
Frictionless transparency:
1. **Email-Walled Access:** No passwords or verification links. Users select their identity:
   - `alex@family.com` (Alex — Household Admin)
   - `mom@family.com` (Sarah — Mom)
   - `sam@family.com` (Sam — Kid)
2. **1-Click Profile Switch:** Instant profile toggling in the header to demonstrate multi-family member viewpoints live on stage.
3. **1-Click "Share with Family":** Each item card has a share button that copies a direct lookup link:
   `http://localhost:3000?item=item-1&find=Passport`
4. **Immediate Deep-Link Resolution:** When a spouse clicks the link on WhatsApp/iMessage, it opens directly to the item with photo proof and drawer directions. Zero searching required.

### 3. Architecture & Contracts
- **Client Component:** `EmailWall.tsx` + `Header.tsx` + URL query param listener in `page.tsx`.
- **Session Model:** `household_user_email` stored in `localStorage`.
- **Stage Safe Mode (`?demo=true`):** Offline switch in header that serves local deterministic responses to protect against venue WiFi drops.

### 4. Stage Demo Proof (25 Seconds)
Click **"Share with Family"** on the passport card. Open an incognito browser tab. Paste the URL. The app opens immediately to Sarah's view, highlighting the passport and photo proof.

### 5. Done-When Gate
- Pasting a share link in a clean browser session unlocks the household inventory and auto-scrolls to the target item.

---

## 90-Minute Experience Build Schedule

| Phase | Experience Focus | Window |
|---|---|---|
| **Phase 1** | **Effortless Capture Experience** (1-tap location pills + Opus 5.5 vision) | 25 Mins |
| **Phase 2** | **Humanlike Recall Experience** (colloquial search + warm persona + photo cards) | 25 Mins |
| **Phase 3** | **"Put It Back" Return Timer Experience** (borrow timer + proactive nudge banner) | 20 Mins |
| **Phase 4** | **Connected Household Experience** (email wall + profile switch + share link) | 15 Mins |
| **Rehearsal** | **Stage Runbook Verification** (timed 3-minute physical prop dry run) | 5 Mins |
