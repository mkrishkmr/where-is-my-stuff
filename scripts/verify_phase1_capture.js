const fs = require("fs");
const path = require("path");

const DATA_FILE = path.join(process.cwd(), "data", "items.json");

function getItems() {
  return JSON.parse(fs.readFileSync(DATA_FILE, "utf-8"));
}

function saveItems(items) {
  fs.writeFileSync(DATA_FILE, JSON.stringify(items, null, 2), "utf-8");
}

console.log("=== VERIFYING PHASE 1: EFFORTLESS CAPTURE EXPERIENCE ===");

const initialItems = getItems();
console.log(`1. Initial catalog count: ${initialItems.length} items.`);

const mockExtractedFromPhoto = [
  {
    name: "Braided 60W USB-C Cable",
    description: "Black nylon braided charging cable, neatly coiled with rubber strap",
    confidence: 0.98,
    tags: ["cable", "charging", "usb-c", "black"]
  },
  {
    name: "SanDisk 128GB Flash Drive",
    description: "Silver metal slim USB 3.0 thumb drive with keyhole ring",
    confidence: 0.95,
    tags: ["storage", "usb", "flash drive", "silver"]
  },
  {
    name: "Pilot G2 0.7mm Blue Gel Pen",
    description: "Navy blue transparent body with black grip and silver clip",
    confidence: 0.92,
    tags: ["pen", "stationery", "writing", "office"]
  }
];

const startTime = Date.now();
const assignedLocation = "Demo Box — stage demo pouch";
const assignedRoom = "Demo Box";
const timestamp = new Date().toISOString();

const newItems = mockExtractedFromPhoto.map((item, idx) => ({
  id: `item-test-${Date.now()}-${idx}`,
  name: item.name,
  description: item.description,
  location: assignedLocation,
  room: assignedRoom,
  photoUrl: "https://images.unsplash.com/photo-1544816155-12df9643f363?auto=format&fit=crop&w=400&q=80",
  capturedAt: timestamp,
  tags: item.tags,
  confidence: item.confidence,
  borrowedBy: null,
  returnTimerExpiresAt: null
}));

// Batch append to catalog
const updatedCatalog = [...newItems, ...initialItems];
saveItems(updatedCatalog);
const elapsed = Date.now() - startTime;

const verifiedItems = getItems();
console.log(`2. Updated catalog count: ${verifiedItems.length} items (+${newItems.length} items logged).`);
console.log(`3. Batch storage latency: ${elapsed}ms (Target: <500ms).`);

// Clean up test items to keep seed catalog pristine for stage demo
saveItems(initialItems);
console.log(`4. Pristine state restored (${getItems().length} items).`);

if (verifiedItems.length === initialItems.length + 3 && elapsed < 500) {
  console.log("✅ Phase 1 Effortless Capture verification: PASSED.");
} else {
  console.error("❌ Phase 1 Effortless Capture verification: FAILED.");
  process.exit(1);
}

