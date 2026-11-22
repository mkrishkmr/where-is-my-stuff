import fs from "fs";
import path from "path";
import { runOpusVisionExtraction } from "./vision_engine";
import { CapturePayload, CaptureResult, CapturedItem } from "./types";

const DATA_FILE = path.join(process.cwd(), "data", "items.json");

export async function processPhase1Capture(
  payload: CapturePayload,
  apiKey?: string,
  baseUrl?: string
): Promise<CaptureResult> {
  const startTime = Date.now();

  // 1. Run Opus 5.5 visual extraction
  const extractedItems = await runOpusVisionExtraction(
    payload.image,
    payload.location || "Quick drop drawer",
    payload.room || "General",
    apiKey,
    baseUrl
  );

  // 2. Persist to data/items.json
  if (fs.existsSync(DATA_FILE)) {
    try {
      const raw = fs.readFileSync(DATA_FILE, "utf-8");
      const current = JSON.parse(raw);
      const updated = [...extractedItems, ...current];
      fs.writeFileSync(DATA_FILE, JSON.stringify(updated, null, 2), "utf-8");
    } catch (e) {
      console.error("Failed to append to data/items.json:", e);
    }
  }

  const latencyMs = Date.now() - startTime;

  return {
    success: true,
    count: extractedItems.length,
    items: extractedItems,
    latencyMs
  };
}

