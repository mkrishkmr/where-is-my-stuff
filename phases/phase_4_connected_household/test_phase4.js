const fs = require("fs");
const path = require("path");

const DATA_FILE = path.join(process.cwd(), "data", "items.json");

console.log("=== RUNNING PHASE 4 CONNECTED HOUSEHOLD & FAMILY SHARE TEST SUITE ===");

if (!fs.existsSync(DATA_FILE)) {
  console.error("❌ data/items.json does not exist!");
  process.exit(1);
}

const catalog = JSON.parse(fs.readFileSync(DATA_FILE, "utf-8"));

// Household membership simulator
const SHARMA_HOUSEHOLD_MEMBERS = [
  { email: "alex@family.com", name: "Alex", role: "admin", avatarColor: "indigo", householdName: "The Sharma Household" },
  { email: "mom@family.com", name: "Sarah (Mom)", role: "member", avatarColor: "purple", householdName: "The Sharma Household" },
  { email: "sam@family.com", name: "Sam (Kid)", role: "member", avatarColor: "pink", householdName: "The Sharma Household" }
];

function resolveHouseholdMember(email) {
  const normalized = email.trim().toLowerCase();
  const existing = SHARMA_HOUSEHOLD_MEMBERS.find((m) => m.email === normalized);
  if (existing) return existing;

  const namePart = normalized.split("@")[0];
  const capitalized = namePart.charAt(0).toUpperCase() + namePart.slice(1);
  return {
    email: normalized,
    name: capitalized,
    role: "member",
    avatarColor: "emerald",
    householdName: "The Sharma Household"
  };
}

function generateFamilySharePayload(item, senderName = "Alex", baseUrl = "http://localhost:3000") {
  const encodedFind = encodeURIComponent(item.name);
  const shareUrl = `${baseUrl}?item=${item.id}&find=${encodedFind}&sender=${encodeURIComponent(senderName)}`;
  const shareMessage = `Hey! Here is where we keep the ${item.name}: ${item.location} (${item.room}). View photo proof here: ${shareUrl}`;

  return {
    itemId: item.id,
    itemName: item.name,
    senderName,
    shareUrl,
    shareMessage
  };
}

function parseRecipientShareLink(queryString, itemsCatalog) {
  const params = new URLSearchParams(queryString.startsWith("?") ? queryString : `?${queryString}`);
  const itemId = params.get("item");
  const senderName = params.get("sender") || "A family member";

  if (!itemId) {
    return {
      resolved: false,
      sharedBy: senderName,
      retrievalPath: "Invalid or missing share link."
    };
  }

  const target = itemsCatalog.find((i) => i.id === itemId);
  if (!target) {
    return {
      resolved: false,
      sharedBy: senderName,
      retrievalPath: "Item not found in household catalog."
    };
  }

  return {
    resolved: true,
    item: target,
    sharedBy: senderName,
    retrievalPath: `${target.room} ➔ ${target.location}`
  };
}

const testResults = [];
let passedCount = 0;

// Test 1: Predefined Family Email Resolution
console.log("[TC-P4-01] Testing Predefined Family Member Resolution...");
const t1Start = Date.now();
const alex = resolveHouseholdMember("alex@family.com");
const mom = resolveHouseholdMember("mom@family.com");
const t1Passed = Boolean(alex && alex.role === "admin" && mom && mom.name === "Sarah (Mom)");
if (t1Passed) passedCount++;
testResults.push({ id: "TC-P4-01", name: "Predefined Member Email Resolution", status: t1Passed ? "PASSED" : "FAILED", latencyMs: Date.now() - t1Start });
console.log(`   Alex: ${alex.name} (${alex.role}) | Mom: ${mom.name} (${mom.role})`);
console.log(`   Result: ${t1Passed ? "✅ PASSED" : "❌ FAILED"}\n`);

// Test 2: Auto-Provisioning Custom Email
console.log("[TC-P4-02] Testing Custom Email Auto-Provisioning...");
const t2Start = Date.now();
const guest = resolveHouseholdMember("priya@family.com");
const t2Passed = Boolean(guest && guest.name === "Priya" && guest.householdName === "The Sharma Household" && guest.role === "member");
if (t2Passed) passedCount++;
testResults.push({ id: "TC-P4-02", name: "Custom Email Auto-Provisioning", status: t2Passed ? "PASSED" : "FAILED", latencyMs: Date.now() - t2Start });
console.log(`   Provisioned: ${guest.name} <${guest.email}> [${guest.role}] for ${guest.householdName}`);
console.log(`   Result: ${t2Passed ? "✅ PASSED" : "❌ FAILED"}\n`);

// Test 3: Generate 1-Click Family Share Deep-Link Payload
console.log("[TC-P4-03] Testing 1-Click Share Deep-Link Generation...");
const t3Start = Date.now();
const sampleItem = catalog.find((i) => i.id === "item-1") || catalog[0];
const sharePayload = generateFamilySharePayload(sampleItem, "Alex", "http://localhost:3000");
const t3Passed = Boolean(
  sharePayload.shareUrl.includes(`item=${sampleItem.id}`) &&
  sharePayload.shareUrl.includes("sender=Alex") &&
  sharePayload.shareMessage.includes(sampleItem.name) &&
  sharePayload.shareMessage.includes(sampleItem.location)
);
if (t3Passed) passedCount++;
testResults.push({ id: "TC-P4-03", name: "1-Click Share Deep-Link Generation", status: t3Passed ? "PASSED" : "FAILED", latencyMs: Date.now() - t3Start });
console.log(`   Share URL: ${sharePayload.shareUrl}`);
console.log(`   WhatsApp Message: "${sharePayload.shareMessage}"`);
console.log(`   Result: ${t3Passed ? "✅ PASSED" : "❌ FAILED"}\n`);

// Test 4: Recipient Link Parsing & Instant Item Resolution
console.log("[TC-P4-04] Testing Recipient Share Link Parsing & Catalog Lookup...");
const t4Start = Date.now();
const recipientView = parseRecipientShareLink(`?item=${sampleItem.id}&sender=Alex`, catalog);
const t4Passed = Boolean(
  recipientView.resolved &&
  recipientView.item &&
  recipientView.item.id === sampleItem.id &&
  recipientView.sharedBy === "Alex" &&
  recipientView.retrievalPath === `${sampleItem.room} ➔ ${sampleItem.location}`
);
if (t4Passed) passedCount++;
testResults.push({ id: "TC-P4-04", name: "Recipient Link Parsing & Retrieval Path", status: t4Passed ? "PASSED" : "FAILED", latencyMs: Date.now() - t4Start });
console.log(`   Resolved: ${recipientView.item.name}`);
console.log(`   Path: ${recipientView.retrievalPath}`);
console.log(`   Result: ${t4Passed ? "✅ PASSED" : "❌ FAILED"}\n`);

// Test 5: Fallback & Error Resilience on Invalid Share Query
console.log("[TC-P4-05] Testing Fallback Resilience for Invalid/Missing Items...");
const t5Start = Date.now();
const invalidView = parseRecipientShareLink("?item=non-existent-999&sender=Alex", catalog);
const missingParamView = parseRecipientShareLink("", catalog);
const t5Passed = Boolean(!invalidView.resolved && !missingParamView.resolved && invalidView.retrievalPath.includes("not found"));
if (t5Passed) passedCount++;
testResults.push({ id: "TC-P4-05", name: "Fallback Resilience for Missing Items", status: t5Passed ? "PASSED" : "FAILED", latencyMs: Date.now() - t5Start });
console.log(`   Invalid item message: "${invalidView.retrievalPath}"`);
console.log(`   Result: ${t5Passed ? "✅ PASSED" : "❌ FAILED"}\n`);

console.log(`Summary: ${passedCount}/${testResults.length} Phase 4 test cases passed.`);

if (passedCount === testResults.length) {
  console.log("🎉 All Phase 4 Connected Household & Family Share tests passed!");
} else {
  console.error("❌ Some Phase 4 tests failed.");
  process.exit(1);
}

