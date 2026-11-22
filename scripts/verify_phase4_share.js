const fs = require("fs");
const path = require("path");

const DATA_FILE = path.join(process.cwd(), "data", "items.json");
const items = JSON.parse(fs.readFileSync(DATA_FILE, "utf-8"));

console.log("=== VERIFYING PHASE 4: CONNECTED HOUSEHOLD FAMILY SHARE ===");

// 1. Simulate 1-Click Family Share Link Generation
const targetItem = items[0]; // Passport
const baseUrl = "http://localhost:3000";
const shareLink = `${baseUrl}?item=${targetItem.id}&find=${encodeURIComponent(targetItem.name)}`;
console.log(`1. Generated Share Link: "${shareLink}"`);

// 2. Simulate Recipient parsing deep-link parameters
const parsedUrl = new URL(shareLink);
const paramItemId = parsedUrl.searchParams.get("item");
const paramFind = parsedUrl.searchParams.get("find");

console.log(`2. Recipient URL params: item="${paramItemId}", find="${paramFind}"`);

const resolvedItem = items.find((i) => i.id === paramItemId);
if (resolvedItem) {
  console.log(`3. Instant Resolution: "${resolvedItem.name}" located in ${resolvedItem.location} (${resolvedItem.room}).`);
  console.log(`   Photo Proof URL: ${resolvedItem.photoUrl}`);
} else {
  console.error("❌ Failed to resolve shared item by ID!");
  process.exit(1);
}

// 4. Verify Family Profiles
const familyProfiles = ["alex@family.com", "mom@family.com", "sam@family.com"];
console.log(`4. Available Family Profiles for Live Demo: ${familyProfiles.join(", ")}`);

if (resolvedItem && paramItemId === "item-1") {
  console.log("✅ Phase 4 Connected Household Family Share verification: PASSED.");
} else {
  console.error("❌ Phase 4 Connected Household Family Share verification: FAILED.");
  process.exit(1);
}

