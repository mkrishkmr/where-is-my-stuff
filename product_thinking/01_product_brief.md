# Where Is My Stuff — Product Strategy & Hackathon Execution Plan (90-Min Final Sprint)

> **Core Value Proposition:** Smooth visual capture, humanlike conversational retrieval, proactive "put it back" return timers, and frictionless family sharing walled by email.  
> **Remaining Build Time:** 90 Minutes • Stack: Next.js + Divyam API (`divyam-as/claude-opus-5-5`) + Local JSON Datastore.

---

## 1. The 4 Product Pillars (Judge USPs)

### Pillar 1: Ultra-Smooth Location Capture (<5 Seconds)
- **Problem:** If adding a location takes typing and category selection, users quit.
- **Solution:** 1-tap photo snap + 1-tap location pill ("Hallway console", "Kitchen key bowl", "Office desk"). Divyam Opus 5.5 auto-extracts item tags and details in the background.

### Pillar 2: Seamless Humanlike Retrieval
- **Problem:** Rigid keyword searches fail when family members ask differently ("Where's the TV cord?" vs "HDMI Cable").
- **Solution:** Conversational AI that responds in warm, plain human speech: *"Your braided HDMI cable is safely in the Office desk drawer, left compartment. Here is the photo."*

### Pillar 3: "Put It Back" Return Timer & Notifications
- **Problem:** Belongings go missing because family members take them and forget to return them to their home location.
- **Solution:** 1-click **"Borrow & Remind"** button. Sets a 1-hour, 4-hour, or 24-hour return timer that triggers a proactive notification: *"Reminder: Return the Passport to Hallway console, top drawer."*

### Pillar 4: Lightweight Family Share (Email-Walled)
- **Problem:** Spouses, kids, and roommates constantly text: *"Where did you put the spare keys / passport / drill?"*
- **Solution:** 
  1. Lightweight email wall (e.g. `alex@family.com` or `mom@family.com`) connecting to the shared household inventory.
  2. 1-click **"Share with Family"** generating an instant direct lookup link that opens directly to the item with photo proof.

---

## 2. 90-Minute Tactical Build Sequence

| Time Block | Target Deliverable | Done-When Condition |
|---|---|---|
| **00:00–00:20** | **Dependencies & Next.js Scaffolding** | Next.js running locally with Tailwind CSS and Lucide icons. |
| **00:20–00:40** | **Simple Email Login & Family Context** | User enters email to enter shared household dashboard; can switch profiles. |
| **00:40–00:60** | **Smooth Capture & Divyam Opus 5.5 Vision** | Uploading/snapping photo auto-extracts items into `data/items.json`. |
| **00:60–00:75** | **Conversational Retrieval & Family Share** | Natural queries return humanlike text + photo; "Share" button copies direct link. |
| **00:75–00:90** | **"Put It Back" Return Timer & Demo Dry Run** | Timer counts down and fires return alert; `?demo=true` verified for stage safety. |

---

## 3. Data Schema Updates (`src/types/index.ts`)

```ts
export interface Item {
  id: string;
  name: string;
  description: string;
  location: string;
  room: string;
  photoUrl: string;
  capturedAt: string;
  tags: string[];
  borrowedBy?: string | null;     // e.g. "Alex"
  returnTimerExpiresAt?: string | null; // ISO timestamp for return reminder
}

export interface HouseholdProfile {
  email: string;
  displayName: string;
  familyName: string;
}
```
