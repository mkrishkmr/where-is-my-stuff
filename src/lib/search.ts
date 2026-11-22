import { callDivyamChat } from "./divyam";
import { getStoredItems } from "./store";
import { SearchQueryResponse, Item } from "@/types";

function localKeywordSearch(query: string, items: Item[]): { matches: Item[]; answer: string } {
  const qLower = query.toLowerCase();
  const words = qLower.split(/\s+/).filter((w) => w.length > 2);

  const scored = items.map((item) => {
    let score = 0;
    const nameLower = item.name.toLowerCase();
    const descLower = item.description.toLowerCase();
    const locLower = item.location.toLowerCase();
    const tagsLower = item.tags.map((t) => t.toLowerCase()).join(" ");

    if (nameLower.includes(qLower)) score += 10;
    if (descLower.includes(qLower)) score += 6;
    if (locLower.includes(qLower)) score += 4;
    if (tagsLower.includes(qLower)) score += 5;

    for (const word of words) {
      if (nameLower.includes(word)) score += 4;
      if (descLower.includes(word)) score += 2;
      if (tagsLower.includes(word)) score += 3;
      if (locLower.includes(word)) score += 1;
    }

    return { item, score };
  });

  scored.sort((a, b) => b.score - a.score);
  const matches = scored.filter((s) => s.score > 0).map((s) => s.item);

  const top = matches[0] || items[0];
  const answer = matches.length > 0
    ? `Hey! Your **${top.name}** is kept in the **${top.location}** (${top.room}). Here is the photo proof so you can spot it immediately.`
    : `I checked our household catalog for "${query}". Here is the most relevant item found: **${top.name}** in the **${top.location}**.`;

  return { matches: matches.length > 0 ? matches : [top], answer };
}

export async function searchBelongingsHumanlike(
  query: string,
  userEmail: string = "alex@family.com",
  isDemo: boolean = false
): Promise<SearchQueryResponse> {
  const items = getStoredItems();

  if (items.length === 0) {
    return {
      answer: "Your family hasn't logged any items yet. Snap a photo of a drawer or shelf to start.",
      matches: [],
      reasoning: "Catalog is empty."
    };
  }

  // Fast offline/demo fallback
  if (isDemo || !process.env.DIVYAM_API_KEY) {
    const { matches, answer } = localKeywordSearch(query, items);
    return {
      answer,
      matches,
      reasoning: "Local semantic fallback matched intent."
    };
  }

  try {
    const catalogSummary = items.map((i, idx) => 
      `[${idx + 1}] ID: "${i.id}" | Name: "${i.name}" | Location: "${i.location}" (${i.room}) | Description: "${i.description}" | Tags: ${i.tags.join(", ")} | Status: ${i.borrowedBy ? `Currently borrowed by ${i.borrowedBy}` : "In designated place"}`
    ).join("\n");

    const prompt = `You are the household assistant for "Where Is My Stuff".
You are speaking to a family member (${userEmail}). Answer in a warm, helpful, natural human voice (not robotic).
Tell them exactly which room, piece of furniture, and drawer/shelf the item is in.
If the item is currently borrowed by someone, mention that gently.

Here is the entire household catalog:
${catalogSummary}

User question: "${query}"

Respond with ONLY valid JSON:
{
  "answer": "Warm, natural conversational reply telling them where the item is located",
  "matched_ids": ["item-id-1"],
  "reasoning": "Why this item matches the user's description"
}`;

    const raw = await callDivyamChat([
      { role: "user", content: prompt }
    ], 900);

    let cleanJson = raw.trim();
    if (cleanJson.includes("```")) {
      const matchFence = cleanJson.match(/```(?:json)?\s*([\s\S]*?)\s*```/);
      if (matchFence) {
        cleanJson = matchFence[1].trim();
      }
    }

    const firstBrace = cleanJson.indexOf("{");
    const lastBrace = cleanJson.lastIndexOf("}");
    if (firstBrace !== -1 && lastBrace !== -1 && lastBrace > firstBrace) {
      cleanJson = cleanJson.substring(firstBrace, lastBrace + 1);
    }

    try {
      const parsed = JSON.parse(cleanJson);
      const matchedIds: string[] = parsed.matched_ids || [];
      const matchedItems = items.filter((item) => matchedIds.includes(item.id));

      if (matchedItems.length > 0) {
        return {
          answer: parsed.answer || `Found it! Your item is in ${matchedItems[0].location}.`,
          matches: matchedItems,
          reasoning: parsed.reasoning || "Opus 5.5 semantic resolution"
        };
      }
    } catch (parseErr) {
      console.warn("Opus search JSON parse failed, falling back to local search:", parseErr);
    }

    // Fallback if matched_ids was empty or JSON parse failed
    const { matches, answer } = localKeywordSearch(query, items);
    return {
      answer,
      matches,
      reasoning: "Semantic search fallback"
    };
  } catch (error) {
    console.error("Opus 5.5 conversational search error:", error);
    const { matches, answer } = localKeywordSearch(query, items);
    return {
      answer,
      matches,
      reasoning: "Emergency safety fallback"
    };
  }
}
