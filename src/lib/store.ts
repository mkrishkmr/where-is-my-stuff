import fs from "fs";
import path from "path";
import { Item } from "@/types";

const LOCAL_DATA_FILE = path.join(process.cwd(), "data", "items.json");
const TMP_DATA_FILE = path.join("/tmp", "items.json");

function getActiveDataFilePath(): string {
  // If running in a serverless environment (Vercel, AWS Lambda), write to /tmp
  const isServerless = Boolean(process.env.VERCEL || process.env.AWS_LAMBDA_FUNCTION_NAME);
  
  if (isServerless) {
    if (!fs.existsSync(TMP_DATA_FILE)) {
      if (fs.existsSync(LOCAL_DATA_FILE)) {
        try {
          const seedContent = fs.readFileSync(LOCAL_DATA_FILE, "utf-8");
          fs.writeFileSync(TMP_DATA_FILE, seedContent, "utf-8");
        } catch (err) {
          console.warn("Failed to seed /tmp/items.json:", err);
        }
      }
    }
    return TMP_DATA_FILE;
  }

  return LOCAL_DATA_FILE;
}

export function getStoredItems(): Item[] {
  const filePath = getActiveDataFilePath();
  try {
    if (fs.existsSync(filePath)) {
      const raw = fs.readFileSync(filePath, "utf-8");
      return JSON.parse(raw);
    }
    if (fs.existsSync(LOCAL_DATA_FILE)) {
      const raw = fs.readFileSync(LOCAL_DATA_FILE, "utf-8");
      return JSON.parse(raw);
    }
    return [];
  } catch (error) {
    console.error(`Failed to read items from ${filePath}:`, error);
    try {
      if (fs.existsSync(LOCAL_DATA_FILE)) {
        const raw = fs.readFileSync(LOCAL_DATA_FILE, "utf-8");
        return JSON.parse(raw);
      }
    } catch {
      // fallback
    }
    return [];
  }
}

export function saveStoredItems(items: Item[]): boolean {
  const filePath = getActiveDataFilePath();
  try {
    const dir = path.dirname(filePath);
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }
    fs.writeFileSync(filePath, JSON.stringify(items, null, 2), "utf-8");
    return true;
  } catch (error) {
    console.error(`Failed to write items to primary path ${filePath}:`, error);
    // If local write failed due to read-only filesystem (EROFS), fall back to /tmp
    if (filePath !== TMP_DATA_FILE) {
      try {
        fs.writeFileSync(TMP_DATA_FILE, JSON.stringify(items, null, 2), "utf-8");
        return true;
      } catch (tmpErr) {
        console.error("Failed to write items to /tmp fallback:", tmpErr);
      }
    }
    return false;
  }
}

export function addItem(item: Item): Item {
  const current = getStoredItems();
  // Deduplicate by ID
  const filtered = current.filter((i) => i.id !== item.id);
  const updated = [item, ...filtered];
  saveStoredItems(updated);
  return item;
}

export function addBatchItems(newItems: Item[]): Item[] {
  const current = getStoredItems();
  const newIds = new Set(newItems.map((i) => i.id));
  const filtered = current.filter((i) => !newIds.has(i.id));
  const updated = [...newItems, ...filtered];
  saveStoredItems(updated);
  return newItems;
}

export function getItemById(id: string): Item | undefined {
  const current = getStoredItems();
  return current.find((item) => item.id === id);
}
