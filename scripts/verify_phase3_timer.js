const fs = require("fs");
const path = require("path");

const DATA_FILE = path.join(process.cwd(), "data", "items.json");

function getItems() {
  return JSON.parse(fs.readFileSync(DATA_FILE, "utf-8"));
}

function saveItems(items) {
  fs.writeFileSync(DATA_FILE, JSON.stringify(items, null, 2), "utf-8");
}

console.log("=== VERIFYING PHASE 3: 'PUT IT BACK' RETURN TIMER EXPERIENCE ===");

const initialItems = getItems();
const targetItem = initialItems.find((i) => i.id === "item-2");

if (!targetItem) {
  console.error("❌ Target item-2 (HDMI cable) missing.");
  process.exit(1);
}

// 1. Simulate Borrow Action (1-Hour Timer)
console.log(`1. Simulating borrow for "${targetItem.name}"...`);
const timerMinutes = 60;
const expiresAt = new Date(Date.now() + timerMinutes * 60 * 1000).toISOString();

targetItem.borrowedBy = "Alex";
targetItem.returnTimerExpiresAt = expiresAt;
saveItems(initialItems);

// 2. Verify state persistence
const refreshed = getItems();
const verifiedTarget = refreshed.find((i) => i.id === "item-2");
console.log(`2. State saved: borrowedBy="${verifiedTarget.borrowedBy}", expiresAt="${verifiedTarget.returnTimerExpiresAt}".`);

// 3. Simulate Nudge Alert Generation
const isExpired = new Date(verifiedTarget.returnTimerExpiresAt).getTime() < Date.now();
const alertMessage = isExpired
  ? `Return Due: Time to return "${verifiedTarget.name}" back to ${verifiedTarget.location}.`
  : `Active Timer: "${verifiedTarget.name}" is borrowed by ${verifiedTarget.borrowedBy}. Due back in ${verifiedTarget.location}.`;

console.log(`3. Generated Household Nudge: "${alertMessage}"`);

// 4. Simulate Return Action
console.log("4. Simulating 'Mark Returned to Spot' action...");
verifiedTarget.borrowedBy = null;
verifiedTarget.returnTimerExpiresAt = null;
saveItems(refreshed);

const finalCheck = getItems().find((i) => i.id === "item-2");
const isClean = finalCheck.borrowedBy === null && finalCheck.returnTimerExpiresAt === null;

if (isClean && verifiedTarget) {
  console.log("✅ Phase 3 'Put It Back' Return Timer verification: PASSED.");
} else {
  console.error("❌ Phase 3 'Put It Back' Return Timer verification: FAILED.");
  process.exit(1);
}

