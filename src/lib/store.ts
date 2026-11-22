import fs from "fs";
import path from "path";
import { Item } from "@/types";

const DATA_FILE = path.join(process.cwd(), "data", "items.json");

export function getStoredItems(): Item[] {
  try {
    if (!fs.existsSync(DATA_FILE)) {
      return [];
    }
    const raw = fs.readFileSync(DATA_FILE, "utf-8");
    return JSON.parse(raw);
  } catch (error) {
    console.error("Failed to read data/items.json:", error);
    return [];
  }
}

export function saveStoredItems(items: Item[]): boolean {
  try {
    const dir = path.dirname(DATA_FILE);
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }
    fs.writeFileSync(DATA_FILE, JSON.stringify(items, null, 2), "utf-8");
    return true;
  } catch (error) {
    console.error("Failed to write data/items.json:", error);
    return false;
  }
}

export function addItem(item: Item): Item {
  const current = getStoredItems();
  const updated = [item, ...current];
  saveStoredItems(updated);
  return item;
}

export function addBatchItems(newItems: Item[]): Item[] {
  const current = getStoredItems();
  const updated = [...newItems, ...current];
  saveStoredItems(updated);
  return newItems;
}

export function getItemById(id: string): Item | undefined {
  const current = getStoredItems();
  return current.find((item) => item.id === id);
}

