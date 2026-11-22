import { CapturedItem } from "./types";

const OPUS_SYSTEM_PROMPT = `
You are the vision extraction engine for "Where Is My Stuff".
The user photographs an open storage location (drawer, pouch, bag, box, or shelf).

TASK:
Identify 3 to 8 retrievable physical items visible in the image.
Return ONLY valid JSON matching this schema:
{
  "items": [
    {
      "name": "Specific common noun (e.g. 'Braided USB-C Cable', 'Sony Headphones')",
      "description": "Visual details: color, material, distinguishing marks, scale",
      "confidence": 0.95,
      "tags": ["cable", "charging", "black", "electronics"],
      "sizeClass": "small"
    }
  ]
}

RULES:
1. Prioritize items people lose and search for (cables, keys, tools, chargers, adapters, documents).
2. Do not include the container itself (drawer walls or shelf).
3. Do not include loose debris or dust.
4. Output strict JSON with NO markdown formatting.
`;

export async function runOpusVisionExtraction(
  imageBase64OrUrl: string,
  location: string,
  room: string,
  apiKey?: string,
  baseUrl: string = "https://api.preview.divyam.ai/v1"
): Promise<CapturedItem[]> {
  const timestamp = new Date().toISOString();

  // If no API key provided, return verified demo items
  if (!apiKey) {
    return [
      {
        id: `item-pouch-${Date.now()}-1`,
        name: "Braided 60W USB-C Cable",
        description: "Black nylon braided charging cable, neatly coiled with rubber strap",
        location,
        room,
        confidence: 0.98,
        tags: ["cable", "charging", "usb-c", "black"],
        photoUrl: imageBase64OrUrl,
        capturedAt: timestamp,
        sizeClass: "small",
        distinguishingFeatures: ["coiled with strap", "reinforced strain relief"]
      },
      {
        id: `item-pouch-${Date.now()}-2`,
        name: "SanDisk 128GB Flash Drive",
        description: "Silver metal slim USB 3.0 thumb drive with keyhole ring",
        location,
        room,
        confidence: 0.95,
        tags: ["storage", "usb", "flash drive", "silver"],
        photoUrl: imageBase64OrUrl,
        capturedAt: timestamp,
        sizeClass: "tiny",
        distinguishingFeatures: ["all-metal casing", "keyring loop"]
      },
      {
        id: `item-pouch-${Date.now()}-3`,
        name: "Pilot G2 0.7mm Blue Gel Pen",
        description: "Navy blue transparent body with black grip and silver clip",
        location,
        room,
        confidence: 0.92,
        tags: ["pen", "stationery", "writing", "office"],
        photoUrl: imageBase64OrUrl,
        capturedAt: timestamp,
        sizeClass: "small",
        distinguishingFeatures: ["rubber grip", "clear ink window"]
      }
    ];
  }

  const imageUrl = imageBase64OrUrl.startsWith("data:") || imageBase64OrUrl.startsWith("http")
    ? imageBase64OrUrl
    : `data:image/jpeg;base64,${imageBase64OrUrl}`;

  const response = await fetch(`${baseUrl}/chat/completions`, {
    method: "POST",
    headers: {
      "Authorization": `Bearer ${apiKey}`,
      "Content-Type": "application/json"
    },
    body: JSON.stringify({
      model: "divyam-as/claude-opus-5-5",
      messages: [
        {
          role: "user",
          content: [
            { type: "text", text: OPUS_SYSTEM_PROMPT },
            { type: "image_url", image_url: { url: imageUrl } }
          ]
        }
      ],
      max_tokens: 1000,
      temperature: 0.1
    })
  });

  if (!response.ok) {
    throw new Error(`Divyam Opus 5.5 failed with HTTP ${response.status}`);
  }

  const data = await response.json();
  const rawText = data.choices?.[0]?.message?.content || "";
  const cleaned = rawText.replace(/```json\s*/gi, "").replace(/```\s*$/gi, "").trim();
  const parsed = JSON.parse(cleaned);

  return (parsed.items || []).map((item: any, idx: number) => ({
    id: `item-cap-${Date.now()}-${idx}`,
    name: item.name,
    description: item.description,
    location,
    room,
    confidence: item.confidence || 0.9,
    tags: item.tags || [],
    photoUrl: imageBase64OrUrl,
    capturedAt: timestamp,
    sizeClass: item.sizeClass || "small"
  }));
}

