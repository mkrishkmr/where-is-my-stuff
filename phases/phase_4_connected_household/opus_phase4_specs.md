# Phase 4: Connected Household Specifications

> Generated via Divyam Opus 5.5

# Phase 4: Connected Household Family Share

---

## 1. Email-Walled Session (Passwordless, Not Proofless)

**Design rule:** Typing an email *identifies* the user. A one-time magic link *verifies* them. Verification happens once per device, and every later visit is zero-friction.

> ⚠️ Do not grant access on email entry alone. If typing `mom@family.com` unlocks the household, anyone who knows Mom's email sees where the passports, keys and valuables are. A home-inventory app is effectively a burglar's map, so it needs one verification step per device.

> ⚠️ Do not group households by email domain. `@family.com` works in a demo, but `@gmail.com` would merge millions of strangers. Membership comes only from explicit invites.

### Flow
```
Enter email ─► known device token? ─► YES ─► instant household view
                    │
                    NO ─► send magic link (6-digit code fallback)
                              │
                         click/enter ─► issue 90-day device session ─► household view
```

### Contract
```ts
// types.ts
type Email = string;               // normalized: trim().toLowerCase()
type HouseholdId = string;

interface Member {
  email: Email;
  householdId: HouseholdId;
  role: 'owner' | 'member';
  displayName: string;             // "Mom", "Alex"
}

interface DeviceSession {
  token: string;                   // opaque, 256-bit random, httpOnly cookie
  email: Email;
  householdId: HouseholdId;
  expiresAt: number;               // now + 90d, sliding renewal
}
```

```ts
// api
POST /auth/start   { email }             → 202 { sent: true }   // always 202: no account enumeration
POST /auth/verify  { email, code|token } → 200 Set-Cookie: wims_session (HttpOnly, Secure, SameSite=Lax)
GET  /session                            → 200 { member, household } | 401
POST /household/invite { email }         → owner only; invitee's first verify auto-joins
```

```ts
// auth.service.ts
export async function startAuth(rawEmail: string) {
  const email = rawEmail.trim().toLowerCase();
  const code = crypto.randomInt(100000, 999999).toString();
  await otpStore.set(email, hash(code), { ttl: 600, maxAttempts: 5 });
  await mailer.sendMagicLink(email, code);   // link embeds a signed token; code is the fallback
}

export async function verify(email: string, code: string): Promise<DeviceSession> {
  if (!(await otpStore.check(email, hash(code)))) throw new AuthError();
  const member = await members.findOrAcceptInvite(email);   // null → onboarding: create household
  return sessions.create({ email, householdId: member.householdId, ttlDays: 90 });
}
```

### "Instant transparency" once inside
- Every item is household-scoped: `items WHERE householdId = session.householdId`.
- Each item shows `lastMovedBy` and `lastMovedAt`, e.g. "Alex moved this to Hall Closet · 2h ago". This is the line that ends the "where did you put X?" texts.

```ts
interface Item {
  id: string;            // "item-1"
  householdId: H

---

# Phase 4: The Connected Household (Family Share Experience)

> **Phase goal:** Turn one person's memory of where things are into a shared household resource that anyone can open instantly, without an account.

---

## 1. Why Shared Visibility Ends Domestic "Hide-and-Seek"

### The Problem: One Person Holds the Household Map

In most homes, one person (we'll call her the **Household Memory Keeper**) knows where everything lives. Everyone else depends on her:

| Symptom | What it looks like | Hidden cost |
|---|---|---|
| **Interruption loop** | "Where's the spare key?" texted during her meeting | Context switching and mental load on one person |
| **Verbal ambiguity** | "It's in the drawer." *Which drawer?* | Follow-up calls and searches in the wrong rooms |
| **Trust gap** | "I already looked there!" | Friction, blame, and repeated searching |
| **Single point of failure** | The keeper is travelling or asleep | Nobody can find anything |

The real problem isn't lost items. **Location knowledge is locked inside one person's head**, and words are a poor way to transmit it.

### The Design Shift: From *Telling* to *Showing*

Phase 4 replaces a verbal description with **photo proof**: a timestamped image of the item where it was actually stored.

| Before (verbal) | After (visual proof) |
|---|---|
| "Top drawer, I think, maybe the left one" | 📸 Photo of the passport in a blue folder, hallway desk, top-left drawer |
| Recipient must interpret | Recipient simply **recognises** the spot |
| Keeper is interrupted repeatedly | Keeper shares once in two taps, then is done |
| "Are you sure?" | "Logged by Alex · 3 days ago" |

### Core UX Principles

1. **Proof over promise.** A photo removes doubt. Recognition is faster and more reliable than recall.
2. **Distribute the memory, not the labour.** Anyone can retrieve information