import fs from "fs";
import path from "path";
import { runOpusConversationalRecall } from "./recall_engine";
import { RecallQueryRequest, RecallQueryResponse, ItemRecord } from "./types";

const DATA_FILE = path.join(process.cwd(), "data", "items.json");

export function loadCatalog(): ItemRecord[] {
  try {
    if (!fs.existsSync(DATA_FILE)) return [];
    return JSON.parse(fs.readFileSync(DATA_FILE, "utf-8"));
  } catch (e) {
    console.error("Failed to load catalog for recall:", e);
    return [];
  }
}

export async function processHumanlikeRecall(
  request: RecallQueryRequest,
  apiKey?: string,
  baseUrl?: string
): Promise<RecallQueryResponse> {
  const startTime = Date.now();
  const catalog = loadCatalog();

  const result = await runOpusConversationalRecall(
    request.query,
    catalog,
    request.requesterName || "Alex",
    request.isDemo ? undefined : apiKey,
    baseUrl
  );

  const matchedItems = catalog.filter((item) =>
    result.matched_ids.includes(item.id)
  );

  const latencyMs = Date.now() - startTime;

  return {
    answer: result.answer,
    matches: matchedItems.length > 0 ? matchedItems : (catalog.length > 0 ? [catalog[0]] : []),
    confidence: result.confidence,
    reasoning: result.reasoning,
    latencyMs
  };
}

