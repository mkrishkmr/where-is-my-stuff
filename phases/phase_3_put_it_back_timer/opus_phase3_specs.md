# Phase 3: 'Put It Back' Return Timer Specifications

> Generated via Divyam Opus 5.5

# Phase 3: "Put It Back" Return Timer

> **Note:** I can't verify a model called "Claude Opus 5.5." The prompts below work with any current Claude model. Set the model ID in config rather than hardcoding it.

---

## 1. Borrow Flow Spec

### Entry Points
| Trigger | Action |
|---|---|
| Item detail screen | `[Borrow]` → duration chips `1h · 4h · 24h` |
| Scan drawer QR/NFC | Item list → tap item → duration chips |
| Search result row | Long-press → duration chips |

**1-click rule:** Tapping a duration chip creates the loan immediately, with no confirm dialog. It shows a 5s toast: *"Scissors borrowed · back in Kitchen › Drawer 2 by 3:40 PM · Undo"*. The default chip is highlighted from the category default (cables → 4h, documents → 24h, tools → 1h).

### Data Model
```ts
type Duration = "1h" | "4h" | "24h";
type LoanStatus = "active" | "returned" | "cancelled";

interface Loan {
  id: string;
  itemId: string;
  itemName: string;               // "HDMI cable (2m)"
  homeLocationPath: string[];     // ["Living Room", "TV Cabinet", "Left Drawer"]
  borrowerId: string;
  borrowerName: string;
  borrowedAt: string;             // ISO 8601
  dueAt: string;                  // bor

---

# Phase 3: "Put It Back" Return Timer Experience

## Design Brief
A household AI feature that tracks shared items (tools, chargers, cookbooks, the good scissors) when they leave their home, and gently closes the loop when they come back. The goal is to make returning things feel effortless and to remove the low-grade friction that quietly erodes household harmony.

---

## 1. Why Things Get Lost After Borrowing: The Displaced Item Trap

### The core problem
Borrowing is a **broken loop**. Lending an item creates an open task that exists only in the lender's memory, and the borrower often doesn't even know it's open. Three forces make this worse:

**a. No visible state.**
A borrowed item looks identical to one that's simply been moved. The drill on the workbench and the drill in the garage are both "where it's supposed to be" to a casual observer. Nothing in the environment signals "this is out on loan."

**b. Ownership of the return is ambiguous.**
Who is responsible for returning the item? The borrower assumes the lender will "remember to ask." The lender assumes the borrower will "bring it back when done." Neither owns the task, so it defaults to nobody.

**c. The item gets displaced, not lost.**
This is the key insight. The item usually isn't gone. It's been *displaced* into a new, plausible-looking location: the borrower's car, a jacket pocket, a side table, a garage shelf that "seemed like a good spot." It becomes findable only by someone who knows the full history, which is exactly the person who forgot.

### Why this matters for household peace
Lost-item friction is rarely about the item. It's about the **recurring small resentment**: "I always have to ask twice," "Nobody puts anything back," "Where did you leave my charger *this time*?" Each incident is trivial; the accumulated pattern is corrosive. Design should target the pattern, not the individual incident.

### Design implication
The system must (1) make borrowed state **visible and shared**, (2) assign the return to a **specific person** at a **specific time**, and (3) provide a **location trail** so displaced items can be recovered without interrogation.

---

## 2. One-Click Borrow Timers: Domestic Peace Without Nagging

### The interaction model
1. **Borrow (one tap):** The borrower taps "Borrowing" on a tag, a phone shortcut, or a voice command ("I'm taking the ladder"). The system records item, borrower, timestamp, and a default return window (e.g., 2 hours, or "end of weekend").
2. **Visible state:** The item's home location shows a soft "out on loan to Sam, back by 6pm" indicator. Anyone looking for it knows the status instantly and doesn't need to ask.
3. **Return (one tap or passive detection):** Returning the item clears the timer. Where hardware allows, the system detects return automatically via a location beacon or shelf sensor.

### Avoiding nagging: the design principles

**Principle 1: Make the timer serve the borrower, not the lender.**
The default message is to the *borrower only*, and it's a helpful reminder ("Ladder due back at 6, want to extend?") rather than an accusation. Lenders see state; they don't get pinged to chase.

**Principle 2: Escalate by visibility, not by volume.**
Reminders are quiet by default. A single gentle notification at the due time, then a passive status change on the item's home display if still out. No repeated pings, no guilt language, no streaks that shame people.

**Principle 3: One-tap extension, zero-tap completion where possible.**
Friction is the enemy. "Still using it" is one tap to extend. Returning should be the lowest-effort action in the flow, ideally automatic.

**Principle 4: Shared dashboard, private notifications.**
Everyone in the household can *see* the state, so no one has to ask. But only the borrower is *notified*. This separates awareness (which reduces conflict) from accountability pressure (which creates it).

**Principle 5: Forgive by default.**
Overdue items don't trigger alarms. They trigger a calm status ("Out since Tuesday, last seen in the hall") that's useful for finding them, not for assigning blame.

### What success looks like
- Lenders stop asking "do you still have my X?" because the answer is visible.
- Borrowers feel supported, not monitored.
- Items come back without a conversation.

---

## 3. Stage Demo Delivery Script: The 25-Second Borrow & Return Moment

**Format:**