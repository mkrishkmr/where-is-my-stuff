# Phase 1: Effortless Capture Specifications

> Generated via Divyam Opus 5.5

# Where Is My Stuff: Phase 1 Capture Spec

## 1. Production Vision Extraction Prompt

### System Prompt

```text
You are the vision extraction engine for "Where Is My Stuff", a personal inventory app.
The user photographs an open storage location (drawer, pouch, bag, box, or shelf) so they can later find items by searching.

TASK
Identify the 3 to 8 most distinct, retrievable physical items visible in the image. Return ONLY JSON that conforms to the provided schema.

SELECTION RULES
1. Prioritize items a person would plausibly search for later (keys, chargers, cables, tools, documents, medication, batteries, adapters, jewelry, cards). Rank items by retrieval value, then by visual prominence.
2. Exclude the container itself (the drawer, pouch, or shelf), its liners and dividers, and background surfaces.
3. Exclude loose debris such as lint, crumbs, dust, and torn scraps.
4. Group identical loose units into one item and set "quantity". Example: 6 AA batteries is one item with quantity 6.
5. Treat items that are physically attached as one item. Example: a keyring with keys.
6. Exclude anything you cannot distinguish with confidence >= 0.40.
7. If fewer than 3 qualifying items are visible, return only the ones you see. Never invent items to reach 3.
8. Return at most 8 items.

NAMING
- "name": 2–5 words in Title Case, using a specific common noun. Write "USB-C Charging Cable", not "Cable" or "Cord Thing".
- Include the brand in the name only if it is clearly legible. Example: "Apple AirPods Case".
- Never guess brands or model numbers.

VISUAL ATTRIBUTES
Describe only what is visible. Do not infer hidden properties. Use null when an attribute cannot be determined.
- primary_color / secondary_color: use one of the enum values.
- material: use the dominant visible material.
- size_class: estimate from relative scale against nearby objects.
  - tiny: smaller than a coin
  - small: palm-sized
  - medium: hand to forearm
  - large: larger than forearm
- distinguishing_features: 0–4 short phrases that separate this item from similar items. Examples: "frayed end", "red tape label", "cracked corner".
- visible_text: exact legible text or brand only; otherwise null.
- location_hint: where the item sits within the container, using the enum values.
- bbox: normalized [x, y, width, height], each value in 0–1, with the origin at the top-left.

CONFIDENCE
"confidence" is your calibrated probability (0.00–1.00) that "name" correctly identifies the

---

# Phase 1: The Effortless Capture Experience

## Overview
Phase 1 focuses on one core promise: **capturing a moment should feel as fast as taking a photo.** Every design and engineering decision in this phase serves to minimize the gap between intent ("I want to remember this") and completion ("it's saved").

---

## 1. The UX Journey: Camera Shutter to Saved State (≤ 3 Seconds)

### Target Timeline

| Step | User Action | System Response | Target Time |
|------|-------------|-----------------|-------------|
| 1 | Taps shutter | Immediate haptic + shutter animation | 0 ms |
| 2 | Preview appears | Captured image shown as a provisional card | ~100 ms |
| 3 | Location suggested | Top 3 nearby locations shown as tappable chips | ~300 ms |
| 4 | Taps a location chip (or skips) | Selection confirmed with a subtle check | ~1.0 s |
| 5 | Saved state confirmed | Card animates into the timeline; "Saved" toast | ≤ 1.5–2.5 s |

### Design Principles Applied
- **Optimistic UI:** The capture appears in the feed immediately with a lightweight "saving" indicator. The user is never blocked waiting for the server.
- **Progressive disclosure:** Only the most likely choices are shown. Everything else is one step deeper.
- **Reversible actions:** Any mistake (wrong location, wrong photo) can be corrected later, so nothing requires perfection at capture time.
- **Clear completion signal:** A distinct saved state (animation, haptic, toast) tells the user they can move on.

### Frontend Implementation Notes
- Camera capture uses the native media stream with a pre-warmed session to remove cold-start latency.
- The provisional card is rendered from the local blob URL, not from a network fetch.
- State transitions (`capturing → provisional → saved`) are modeled explicitly so the UI can never be in an ambiguous state.

---

## 2. Why 1-Tap Location Selection Removes Form Fatigue

### The Problem
Traditional capture flows ask for metadata through forms: title, tags, category, location, date, privacy. Each field adds a decision. Cumulatively, these decisions create **form fatigue**, and users abandon the flow or never start it.

### The Solution
Location is the metadata users most often want but find most tedious to enter. We reduce it to a single tap by:

- **Predicting the answer:** Device GPS plus the user's history surfaces the most probable places first.
- **Presenting choices, not input:** Users recognize a place faster than they type one.
- **Making skip free:** Selecting nothing is a valid, first-class outcome. The memory still saves.

### Why It Works
- **Recognition over recall:** Tapping a visible option is cognitively cheaper than generating a name.
- **Decision count drops to one:** From "what is this place, what category, what tags?" to "which of these three?"
- **Momentum is preserved:** The user stays in the capture mindset rather than switching into data-entry mode.

### Measured Intent (for reference)
- Fewer form fields completed per capture
- Higher capture completion rate
- Lower time-to-saved state

---

## 3. Background Async Extraction: Zero Lag for the User

### The Principle
Anything that doesn't need to block the user should not block the user. Extraction (EXIF parsing, reverse geocoding, nearby-place lookup, image resizing, and metadata enrichment) runs **after** the save is acknowledged.

### Architecture
1. **Immediate local save:** The raw capture and minimal metadata are written to local storage synchronously. This is the source of truth for the UI.
2. **Enqueue extraction jobs:** Enrichment tasks are pushed to a background queue.
3. **Async workers process:** Geocoding, place matching, thumbnail generation, and text/tag extraction run off the main thread (Web Workers or service worker task queues).
4. **Reactive updates:** When enrichment completes, the card updates in place with a subtle transition. The user is never asked to wait for it.
5. **Retry and resilience:** Failed jobs retry with backoff. The memory remains usable even if enrichment never completes.

### Why Zero Lag
- The **critical path** is only: capture → local write → UI update.
- Network latency, third-party APIs, and heavy image processing are **off the critical path**.
