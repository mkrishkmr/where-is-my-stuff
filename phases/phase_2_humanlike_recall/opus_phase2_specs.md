# Phase 2: Humanlike Recall Specifications

> Generated via Divyam Opus 5.5

# Where Is My Stuff: Retrieval Persona Spec

> **Model note:** I'm not aware of a model called "Claude Opus 5.5." This prompt is model-agnostic, so set the model ID in config (e.g., `MODEL = "claude-opus-4-1"` or whichever current Claude model you deploy) and don't hardcode it in the prompt.

---

## 1. Production System Prompt

```text
You are the household helper for "Where Is My Stuff." Your job is to help family members find their things.

HOW YOU SOUND
- Warm, calm, and plain-spoken, like a helpful family member who has a great memory.
- Short. Lead with where the item is. One or two sentences is usually enough.
- Use everyday words: "the hall closet, top shelf, in the blue shoebox," not "Location: Container_ID 44."
- Never mention IDs, scores, databases, embeddings, or "records" in the answer.
- If unsure, say so kindly and ask ONE simple question. Never guess with false confidence.
- No exclamation-mark overload, no filler like "Great question!"

WHAT YOU KNOW
- You only know what is in <candidates>. These are inventory entries retrieved for this question.
- You must never invent a room, container, drawer, or item that is not in <candidates>.
- If nothing fits, say you couldn't find it and ask for one helpful detail (color, size, who used it last, where it was last seen).

INPUT
<requester>{name, member_id, permissions}</requester>
<query>{the user's words}</query>
<candidates>[{id, name, description, category, color, material, size, owner, tags,
              room, container, position, last_seen_at, last_moved_by,
              photo_caption, visibility, retrieval_score}]</candidates>
<now>{ISO timestamp}</now>

Follow the SELECTION RULES below, then respond ONLY with the JSON object defined in OUTPUT FORMAT. No prose outside the JSON.

{SELECTION_RULES}

{OUTPUT_FOR

---

# Phase 2: The Humanlike Recall Experience

> **Phase goal:** The user asks for something the way they *remember* it, and the assistant answers the way a *thoughtful person* would, with proof.

*Assumed context: an AI assistant that remembers where physical items are, using photos the user captured over time.*

---

## 1. Why Keyword Search Fails Human Associative Memory

People don't store memories as labeled database rows. They store **webs of associations**: who, when, where, what it looked like, how they felt. Keyword search assumes the opposite.

### The Mismatch

| How humans recall | What keyword search requires |
|---|---|
| *"The cable thing that came with my old camera"* | The exact term used at save time: `USB-mini cable` |
| *"The documents from when we moved"* | A tag like `lease_2023` |
| *"That blue box Grandma gave me"* | A label that was never created |
| *"I put it somewhere after the trip"* | No support for time-relative, fuzzy cues |

### Four Failure Modes

1. **Vocabulary mismatch.** The word the user uses at search time rarely matches the word used at storage time. Studies of search behavior consistently show low agreement between how different people (or the same person on different days) name the same object.
2. **Fragmentary cues.** Memory surfaces in fragments: a color, a room, an event. Keyword search can't combine partial cues into a confident match.
3. **Labeling burden.** Keyword systems push the work to *capture time*. Users won't tag every drawer, so the system fails exactly when it's needed.
4. **Recall vs. recognition.** Humans are far better at *recognizing* an answer than *recalling* its name. A text box demands recall. A good answer offers something to recognize.

### Design Principles for Phase 2

- **Accept vague input as valid input.** "The blue thing from the trip" is a complete query, not an error.
- **Fuse multiple cues.** Combine visual attributes, location, time, and events into one ranked result.
- **Narrow conversationally, not with forms.** Ask *one* clarifying question only when confidence is low ("The blue pouch or the blue box?").
- **Show, don't list.** Lead with a visual the user can recognize instantly.

---

## 2. The 3-Second Perception of