# Google-Tier Mobile Web Design System & UI Specification
> **Role:** Principal / Staff Product Designer (Google Material You / Pixel UI Standard)  
> **Application:** "Where Is My Stuff" (Mobile-First Web App)  
> **Synthesized by:** Divyam API (`divyam-as/claude-opus-5-5`)  
> **Status:** Pending User Approval Before Code Implementation

---

## 1. Design Language & Visual Tokens

The aesthetic transitions from a generic dark dashboard to an **ultra-clean Google Pixel / Material You dark surface** with Apple-grade tactile precision, high contrast readability, frosted glass blurs, and thumb-first ergonomics.

### Color Palette (Dark Theme / True-Black OLED)
| Token | Hex Value | Role & Applied Context |
|---|---|---|
| `--color-canvas` | `#080D1A` | Deep OLED base background |
| `--color-surface-container` | `#0F172A` | Card backgrounds, raised elevation (1dp) |
| `--color-surface-raised` | `#1E293B` | High elevation sheets, floating search bar (2dp) |
| `--color-surface-glass` | `rgba(15, 23, 42, 0.85)` | Frosted glass bottom pill dock (`backdrop-blur-xl`) |
| `--color-primary` | `#6366F1` / `#818CF8` | Material Iris accent for active states & primary CTA |
| `--color-capture-glow` | `#EC4899` ➔ `#8B5CF6` | Vibrant tactile gradient for the central camera shutter |
| `--color-success` | `#10B981` | Emerald badge for exact verified drawer locations |
| `--color-warning` | `#F59E0B` | Warm amber for active borrow return countdowns |
| `--color-danger` | `#EF4444` | High-urgency ruby for overdue return reminders |
| `--color-text-primary` | `#F8FAFC` | Main headings & key titles (high contrast ≥ 12:1) |
| `--color-text-muted` | `#94A3B8` | Micro-labels, container breadcrumbs, timestamps (≥ 4.5:1) |

### Typography & Spacing System
- **Font Stack:** Inter, Google Sans Text, system-ui, -apple-system.
- **Display Title:** `20px / 26px`, Semi-bold (`font-semibold`), Tracking `-0.02em`.
- **Location Breadcrumb:** `13px / 18px`, Bold (`font-bold`), Emerald highlight with `MapPin` icon.
- **Micro-Copy & Tags:** `11px / 14px`, Medium (`font-medium`), Uppercase tracking `+0.05em`.
- **Touch Target Standard:** All interactive pills, buttons, and icons conform to **48dp × 48dp** minimum touch bounds.
- **Corner Radii:** Outer sheets `rounded-3xl` (24px); cards `rounded-2xl` (16px); pills & buttons `rounded-xl` (12px); dock `rounded-full` (32px).

---

## 2. Mobile Ergonomics: The Thumb Zone Architecture

In a mobile-first web app, the top third of the screen is "viewing only", while the bottom 40% is the **primary interactive thumb zone**.

### A. Bottom Floating Pill Dock (Height: 64dp, Radius: 32dp)
- Anchored 16dp above the bottom safe area inset (respects iOS home bar & Android gesture pill).
- Floating container with `8dp` drop shadow and `backdrop-blur-xl` (90% opacity).
- 3 primary tabs:
  1. **Ask & Find** (Left, Search icon + 11sp label)
  2. **1-Tap Capture** (Center Elevated Action: 56dp circular button protruding 12dp above the dock with glowing rose-violet ring)
  3. **Household** (Right, Layers/Home icon + counter badge)

### B. Dynamic Top Bar & Ambient Household Status
- Height: 52dp, minimal padding.
- Left: Subtle avatar with household indicator ("The Sharma Family • 3 members").
- Right: Proactive status pill (e.g. "✈️ Travel Alert" or "⏰ 1 Borrow Active") that expands on tap.

---

## 3. Screen-by-Screen UI Specifications

### Screen 1: Natural Recall & Conversational Search
- **Search Bar (Google Pixel Search styling):** Full-bleed pill (56dp height, 28dp radius), `Surface Container High`, resting 1dp elevation. Sparkle glyph leading icon, "Ask about anything in your house..." placeholder.
- **Tactile Suggestion Chips:** Horizontal scrollable chips below search bar (*"black cable for TV"*, *"where are spare keys"*, *"blue passport for flight"*). Tapping instantly triggers associative search.
- **Warm Conversational Result Card:**
  - Card header: Room pill (`Office`) + capture date.
  - Title: Item Name (`Braided HDMI 2.1 Cable`).
  - **Exact Location Breadcrumb:** Emerald rounded card with `MapPin` icon: `📍 Office ➔ Office desk drawer, left compartment`.
  - **Conversational Answer:** Warm, human voice styled by Opus 5.5 (*"It's right in the left drawer of your office desk, coiled in the rear compartment next to the USB-C dock."*).
  - **Photo Proof:** High-resolution photo proof with 1-tap zoom lightbox.
  - **Action Row:** 1-Click Borrow pills (`1h`, `24h`) + `Share with Family` WhatsApp button.

### Screen 2: 1-Tap Mobile Capture Camera
- **Zero-Typing Mandate:** No virtual keyboard ever appears during capture.
- **Viewfinder:** Full-screen rounded container (`rounded-3xl`) with corner framing reticles.
- **Horizontal Location Pill Strip:** Anchored 16dp directly above the shutter button in the sweet spot of the thumb zone:
  - `🛋 Living Room ➔ TV Media`
  - `💼 Office ➔ Desk Left`
  - `🚪 Hallway ➔ Top Drawer`
  - `🛏 Bedroom ➔ Nightstand`
  - `🍳 Kitchen ➔ Counter Bowl`
- **Tactile Shutter Button:** 68dp circular button with pulsing gradient ring. Tapping immediately snaps photo, captures location from selected pill, and passes to Divyam Opus 5.5 for multi-item background extraction.

### Screen 3: Household Inventory & "Put It Back" Return Timers
- **Room Filter Pills:** Horizontally scrollable chips (`All`, `Living Room`, `Office`, `Kitchen`, `Hallway`, `Bedroom`).
- **Interactive Inventory Cards:**
  - Left: 88×88dp rounded photo thumbnail with "Photo Proof" badge.
  - Right: Item name, description snippet, and emerald location breadcrumb.
  - **Active Borrow Timer Progress Bar:**
    - Normal: Warm amber pill (`Borrowed by Alex • 45m left`) with animated subtle fill bar.
    - Overdue: Ruby red pulse (`⚠️ Return Overdue! Time to put back in Hallway drawer`).
    - Button: 1-tap `Mark Returned to Spot` that dismisses the banner and clears borrow state.
  - **1-Click Share Button:** Copies WhatsApp deep-link (`?item=...&find=...`).

---

## 4. Before vs After Comparison

| Element | Previous "Simplistic" Version | Google-Tier Senior UI Overhaul |
|---|---|---|
| **Form Factor** | Desktop-biased centered container | Mobile-first viewport with thumb-zone ergonomics |
| **Navigation** | Basic rectangular tab bar at top | Floating frosted-glass pill dock with elevated center shutter |
| **Location Input** | Static dropdown / text buttons | 1-tap horizontal scrolling pills directly above thumb zone |
| **Search Feel** | Generic prompt form | Google Search-grade pill with tactile chips and warm conversational quotes |
| **Visual Polish** | Flat slate colors | Deep OLED `#080D1A`, subtle glassmorphism, glowing gradient accents |
| **Borrow UX** | Simple text buttons | Progress-fill countdown badges with amber/ruby urgency states |
