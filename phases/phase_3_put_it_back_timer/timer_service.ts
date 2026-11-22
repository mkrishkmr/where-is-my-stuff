import fs from "fs";
import path from "path";
import { buildActiveAlerts, ItemLike } from "./timer_engine";
import { BorrowActionPayload, ProactiveAlert } from "./types";

const DATA_FILE = path.join(process.cwd(), "data", "items.json");

function readCatalog(): ItemLike[] {
  try {
    if (!fs.existsSync(DATA_FILE)) return [];
    return JSON.parse(fs.readFileSync(DATA_FILE, "utf-8"));
  } catch (e) {
    console.error("Failed to read items.json:", e);
    return [];
  }
}

function writeCatalog(items: ItemLike[]): boolean {
  try {
    fs.writeFileSync(DATA_FILE, JSON.stringify(items, null, 2), "utf-8");
    return true;
  } catch (e) {
    console.error("Failed to write items.json:", e);
    return false;
  }
}

export function borrowItem(payload: BorrowActionPayload): ItemLike | null {
  const items = readCatalog();
  const target = items.find((i) => i.id === payload.itemId);
  if (!target) return null;

  const expiresAt = new Date(Date.now() + payload.durationMinutes * 60 * 1000).toISOString();
  target.borrowedBy = payload.borrowerName;
  target.returnTimerExpiresAt = expiresAt;

  writeCatalog(items);
  return target;
}

export function returnItem(itemId: string): ItemLike | null {
  const items = readCatalog();
  const target = items.find((i) => i.id === itemId);
  if (!target) return null;

  target.borrowedBy = null;
  target.returnTimerExpiresAt = null;

  writeCatalog(items);
  return target;
}

export function getHouseholdAlerts(): ProactiveAlert[] {
  const items = readCatalog();
  return buildActiveAlerts(items);
}

