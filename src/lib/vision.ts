import { callDivyamChat } from "./divyam";
import { ExtractionResult } from "@/types";

export async function extractItemsFromPhoto(
  imageBase64OrUrl: string,
  isDemo: boolean = false
): Promise<ExtractionResult> {
  if (isDemo || !process.env.DIVYAM_API_KEY) {
    return {
      items: [
        {
          name: "Braided 60W USB-C Cable",
          description: "Black nylon braided charging cable, neatly coiled with rubber strap",
          confidence: 0.98,
          tags: ["cable", "charging", "usb-c", "electronics", "black"]
        },
        {
          name: "SanDisk 128GB Flash Drive",
          description: "Silver metal slim USB 3.0 thumb drive with keyhole ring",
          confidence: 0.95,
          tags: ["storage", "usb", "flash drive", "silver", "electronics"]
        }
      ],
      rawAnalysis: "Demo mode fallback items."
    };
  }

  try {
    const isDataUrl = imageBase64OrUrl.startsWith("data:");
    const imageUrl = isDataUrl
      ? imageBase64OrUrl
      : imageBase64OrUrl.startsWith("http")
      ? imageBase64OrUrl
      : `data:image/jpeg;base64,${imageBase64OrUrl}`;

    const prompt = `You are an expert visual item classifier for a household inventory and recall app.
Analyze the uploaded photo carefully to identify the main physical item.

Classification rules:
1. SPECIFIC ITEM NAME: Identify the exact object (e.g., "Scented Candle in Glass Jar", "Braided USB-C Cable", "Over-Ear Headphones", "Passport", "Ceramic Mug"). Look for brand, labels, material, shape, or purpose. Avoid generic terms like "Item" or "Object".
2. CONCISE DESCRIPTION: Write exactly 1-2 factual sentences describing its color, material, visual condition, and distinguishing features. Keep under 30 words.
3. CONFIDENCE & TAGS: Assign a confidence score (0.85-0.99) and 3-5 relevant lowercase search tags.

Output ONLY a valid, parseable JSON object matching this schema with NO markdown code fences and NO preamble:
{
  "items": [
    {
      "name": "Exact Specific Item Name",
      "description": "Brief factual visual description (under 30 words).",
      "confidence": 0.95,
      "tags": ["tag1", "tag2", "tag3"]
    }
  ]
}`;

    const raw = await callDivyamChat([
      {
        role: "user",
        content: [
          { type: "text", text: prompt },
          { type: "image_url", image_url: { url: imageUrl } }
        ]
      }
    ], 1200);

    // 1. Try standard JSON extraction
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
      if (parsed.items && Array.isArray(parsed.items) && parsed.items.length > 0) {
        return {
          items: parsed.items,
          rawAnalysis: raw
        };
      }
    } catch (parseErr) {
      console.warn("Standard JSON parse failed, attempting regex recovery:", parseErr);
    }

    // 2. Resilient Regex recovery if JSON had minor truncation or trailing commas
    const nameMatch = raw.match(/"name"\s*:\s*"([^"]+)"/);
    const descMatch = raw.match(/"description"\s*:\s*"([^"]+)"/);
    const confMatch = raw.match(/"confidence"\s*:\s*([0-9.]+)/);
    const tagsMatch = raw.match(/"tags"\s*:\s*\[([\s\S]*?)\]/);

    if (nameMatch && nameMatch[1]) {
      let extractedTags: string[] = ["household"];
      if (tagsMatch && tagsMatch[1]) {
        try {
          extractedTags = JSON.parse(`[${tagsMatch[1]}]`);
        } catch {
          extractedTags = tagsMatch[1].replace(/["'\s]/g, "").split(",").filter(Boolean);
        }
      }

      return {
        items: [
          {
            name: nameMatch[1],
            description: descMatch ? descMatch[1] : "Visual item detected in photo",
            confidence: confMatch ? parseFloat(confMatch[1]) : 0.95,
            tags: extractedTags.length > 0 ? extractedTags : ["household"]
          }
        ],
        rawAnalysis: raw
      };
    }

    throw new Error(`Unable to extract item structure from Opus output: ${raw.slice(0, 150)}`);
  } catch (error) {
    console.error("Opus 5.5 Vision Extraction error:", error);
    return {
      items: [
        {
          name: "Unidentified Household Item",
          description: "Item detected in uploaded photo. Review and confirm name.",
          confidence: 0.8,
          tags: ["household"]
        }
      ],
      rawAnalysis: String(error)
    };
  }
}
