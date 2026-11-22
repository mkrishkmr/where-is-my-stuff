import { ItemRecord, RecallQueryResponse } from "./types";

const OPUS_RECALL_SYSTEM_PROMPT = `
You are the household helper for "Where Is My Stuff".
Your job is to help family members find their belongings using their stored catalog.

HOW YOU SOUND:
- Warm, calm, and plain-spoken, like a helpful family member who has a great memory.
- Short: lead directly with where the item is. One or two sentences is best.
- Use everyday words: "in the office desk drawer, left compartment," not "Location: Container_ID 44."
- Never mention IDs, scores, databases, embeddings, or "records" in the answer.
- If the item is currently borrowed by someone, mention that gently.

OUTPUT FORMAT:
Return ONLY valid JSON matching this schema:
{
  "answer": "Warm, natural conversational reply directly stating the item name and exact physical location",
  "matched_ids": ["item-1"],
  "confidence": 0.95,
  "reasoning": "Why this matches the user's intent"
}
`;

export function rankCandidatesLocally(query: string, candidates: ItemRecord[]): ItemRecord[] {
  const q = query.toLowerCase();

  const scored = candidates.map((item) => {
    let score = 0;
    const nameLower = item.name.toLowerCase();
    const descLower = item.description.toLowerCase();
    const locLower = item.location.toLowerCase();

    // Direct name match: highest weight
    if (q.includes(nameLower) || nameLower.includes(q)) score += 50;

    // Specific category keywords (weight: 30)
    if ((q.includes("headphone") || q.includes("audio") || q.includes("sony")) && (nameLower.includes("headphone") || item.tags.includes("audio"))) score += 30;
    if ((q.includes("cable") || q.includes("hdmi") || q.includes("cord") || q.includes("tv")) && (nameLower.includes("hdmi") || item.tags.includes("cable"))) score += 30;
    if ((q.includes("passport")) && nameLower.includes("passport")) score += 40;
    if ((q.includes("key") || q.includes("house key")) && nameLower.includes("key")) score += 35;
    if ((q.includes("charger") || q.includes("usb-c")) && (nameLower.includes("charger") || item.tags.includes("charger"))) score += 30;
    if ((q.includes("battery") || q.includes("eneloop")) && (nameLower.includes("battery") || item.tags.includes("battery"))) score += 30;

    // Secondary context matches (weight: 5-10)
    if (q.includes("flight") || q.includes("travel") || q.includes("trip")) {
      if (item.tags.includes("travel")) score += 8;
    }
    if (q.includes("black") && (descLower.includes("black") || item.tags.includes("black"))) score += 5;
    if (q.includes("office") && locLower.includes("office")) score += 10;
    if (q.includes("hallway") && locLower.includes("hallway")) score += 10;
    if (q.includes("kitchen") && locLower.includes("kitchen")) score += 10;

    // Tag matches
    item.tags.forEach((tag) => {
      if (q.includes(tag.toLowerCase())) score += 6;
    });

    return { item, score };
  });

  scored.sort((a, b) => b.score - a.score);
  return scored.filter((s) => s.score > 0).map((s) => s.item);
}

export async function runOpusConversationalRecall(
  query: string,
  candidates: ItemRecord[],
  requesterName = "Alex",
  apiKey?: string,
  baseUrl = "https://api.preview.divyam.ai/v1"
): Promise<{ answer: string; matched_ids: string[]; confidence: number; reasoning: string }> {
  // Offline / deterministic fallback
  if (!apiKey) {
    const ranked = rankCandidatesLocally(query, candidates);
    const top = ranked[0];

    if (top) {
      return {
        answer: `Hey ${requesterName}! Your **${top.name}** is safely kept in the **${top.location}** (${top.room}). Here is the photo proof so you can spot it immediately.`,
        matched_ids: [top.id],
        confidence: 0.98,
        reasoning: `Matched query intent to stored item attributes (Ranked #1 of ${ranked.length} candidates).`
      };
    } else {
      return {
        answer: `I looked across our household belongings but couldn't spot anything matching "${query}". Could you describe its color or which room you usually leave it in?`,
        matched_ids: [],
        confidence: 0.2,
        reasoning: "No candidate matched query."
      };
    }
  }

  // Live call to Divyam Opus 5.5
  const candidateSummary = candidates.map((c, i) =>
    `[${i + 1}] ID: "${c.id}" | Name: "${c.name}" | Location: "${c.location}" (${c.room}) | Description: "${c.description}" | Tags: ${c.tags.join(", ")} | Status: ${c.borrowedBy ? `Borrowed by ${c.borrowedBy}` : "In designated spot"}`
  ).join("\n");

  const userPrompt = `
Requester: ${requesterName}
User Query: "${query}"

Candidates Catalog:
${candidateSummary}

Find the best matching item and formulate your helpful plain-English answer.
`;

  const response = await fetch(`${baseUrl}/chat/completions`, {
    method: "POST",
    headers: {
      "Authorization": `Bearer ${apiKey}`,
      "Content-Type": "application/json"
    },
    body: JSON.stringify({
      model: "divyam-as/claude-opus-5-5",
      messages: [
        { role: "system", content: OPUS_RECALL_SYSTEM_PROMPT },
        { role: "user", content: userPrompt }
      ],
      max_tokens: 600,
      temperature: 0.1
    })
  });

  if (!response.ok) {
    throw new Error(`Divyam Opus 5.5 recall failed with HTTP ${response.status}`);
  }

  const data = await response.json();
  const rawText = data.choices?.[0]?.message?.content || "";
  const cleaned = rawText.replace(/```json\s*/gi, "").replace(/```\s*$/gi, "").trim();
  const parsed = JSON.parse(cleaned);

  return {
    answer: parsed.answer || "I found this item in the catalog for you.",
    matched_ids: parsed.matched_ids || [],
    confidence: parsed.confidence || 0.9,
    reasoning: parsed.reasoning || ""
  };
}
