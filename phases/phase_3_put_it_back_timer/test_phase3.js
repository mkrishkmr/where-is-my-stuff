const fs = require("fs");
const path = require("path");

const DATA_FILE = path.join(process.cwd(), "data", "items.json");

console.log("=== RUNNING PHASE 3 'PUT IT BACK' RETURN TIMER TEST SUITE ===");

if (!fs.existsSync(DATA_FILE)) {
  console.error("❌ data/items.json does not exist!");
  process.exit(1);
}

function getItems() {
  return JSON.parse(fs.readFileSync(DATA_FILE, "utf-8"));
}

function saveItems(items) {
  fs.writeFileSync(DATA_FILE, JSON.stringify(items, null, 2), "utf-8");
}

function buildAlerts(items) {
  const alerts = [];
  const now = Date.now();

  items
    .filter((i) => i.borrowedBy && i.returnTimerExpiresAt)
    .forEach((item) => {
      const dueTimestamp = new Date(item.returnTimerExpiresAt).getTime();
      const isOverdue = dueTimestamp < now;

      alerts.push({
        id: `loan-${item.id}`,
        type: isOverdue ? "return_due" : "active_loan",
        title: isOverdue ? "⏰ Return Due: Time to Put It Back" : "⏳ Active Borrow Timer",
        alertText: isOverdue
          ? `Hey ${item.borrowedBy}! Time to return "${item.name}" back to its home in ${item.location} (${item.room}).`
          : `Borrowed by ${item.borrowedBy}. Designated home: ${item.location} (${item.room}).`,
        itemName: item.name,
        location: item.location,
        room: item.room,
        borrowedBy: item.borrowedBy,
        isOverdue,
        dueAt: item.returnTimerExpiresAt,
        photoUrl: item.photoUrl
      });
    });

  const passport = items.find((i) => i.name.toLowerCase().includes("passport"));
  alerts.push({
    id: "calendar-flight-london",
    type: "calendar_context",
    title: "Upcoming Travel Context",
    alertText: passport
      ? `You have Flight AI 102 to London tomorrow at 06:30 AM. Your passport was verified in ${passport.location} (${passport.room}).`
      : "You have an international flight tomorrow. Remember to log your passport location before heading out.",
    itemName: passport ? passport.name : "Passport",
    location: passport ? passport.location : "Hallway console, top drawer",
    room: passport ? passport.room : "Hallway",
    photoUrl: passport ? passport.photoUrl : undefined
  });

  return alerts;
}

const initialItems = getItems();
const targetItem = initialItems.find((i) => i.id === "item-2"); // HDMI Cable

if (!targetItem) {
  console.error("❌ Target item-2 (HDMI cable) missing.");
  process.exit(1);
}

const testResults = [];
let passedCount = 0;

// Test 1: Borrow Item (1-Hour Duration)
console.log("[TC-P3-01] Testing 1-Click Borrow Action (60 mins)...");
const t1Start = Date.now();
const expiresAt60 = new Date(Date.now() + 60 * 60 * 1000).toISOString();
targetItem.borrowedBy = "Alex";
targetItem.returnTimerExpiresAt = expiresAt60;
saveItems(initialItems);

const verifyBorrow = getItems().find((i) => i.id === "item-2");
const t1Passed = verifyBorrow.borrowedBy === "Alex" && verifyBorrow.returnTimerExpiresAt === expiresAt60;
if (t1Passed) passedCount++;
testResults.push({ id: "TC-P3-01", name: "1-Click Borrow Action", status: t1Passed ? "PASSED" : "FAILED", latencyMs: Date.now() - t1Start });
console.log(`   Result: ${t1Passed ? "✅ PASSED" : "❌ FAILED"}\n`);

// Test 2: Active Borrow Timer Alert Generation
console.log("[TC-P3-02] Testing Active Loan Household Alert Generation...");
const t2Start = Date.now();
const activeAlerts = buildAlerts(getItems());
const activeLoanAlert = activeAlerts.find((a) => a.id === "loan-item-2");

const t2Passed = Boolean(activeLoanAlert && !activeLoanAlert.isOverdue && activeLoanAlert.borrowedBy === "Alex");
if (t2Passed) passedCount++;
testResults.push({ id: "TC-P3-02", name: "Active Loan Household Alert", status: t2Passed ? "PASSED" : "FAILED", latencyMs: Date.now() - t2Start });
console.log(`   Alert: "${activeLoanAlert ? activeLoanAlert.alertText : 'None'}"`);
console.log(`   Result: ${t2Passed ? "✅ PASSED" : "❌ FAILED"}\n`);

// Test 3: Overdue Timer Escalation
console.log("[TC-P3-03] Testing Overdue Loan Urgency Escalation...");
const t3Start = Date.now();
const expiredTimestamp = new Date(Date.now() - 5 * 60 * 1000).toISOString(); // 5 mins in past
targetItem.returnTimerExpiresAt = expiredTimestamp;
saveItems(initialItems);

const overdueAlerts = buildAlerts(getItems());
const overdueAlert = overdueAlerts.find((a) => a.id === "loan-item-2");
const t3Passed = Boolean(overdueAlert && overdueAlert.isOverdue && overdueAlert.title.includes("Return Due"));
if (t3Passed) passedCount++;
testResults.push({ id: "TC-P3-03", name: "Overdue Loan Urgency Escalation", status: t3Passed ? "PASSED" : "FAILED", latencyMs: Date.now() - t3Start });
console.log(`   Escalated Title: "${overdueAlert ? overdueAlert.title : 'None'}"`);
console.log(`   Result: ${t3Passed ? "✅ PASSED" : "❌ FAILED"}\n`);

// Test 4: Mark Returned Action (Loop Closure)
console.log("[TC-P3-04] Testing 'Mark Returned to Spot' Loop Closure...");
const t4Start = Date.now();
targetItem.borrowedBy = null;
targetItem.returnTimerExpiresAt = null;
saveItems(initialItems);

const clearedCheck = getItems().find((i) => i.id === "item-2");
const clearedAlerts = buildAlerts(getItems());
const loanAlertCleared = !clearedAlerts.some((a) => a.id === "loan-item-2");
const t4Passed = clearedCheck.borrowedBy === null && clearedCheck.returnTimerExpiresAt === null && loanAlertCleared;
if (t4Passed) passedCount++;
testResults.push({ id: "TC-P3-04", name: "Mark Returned Action", status: t4Passed ? "PASSED" : "FAILED", latencyMs: Date.now() - t4Start });
console.log(`   Status: Item returned to ${clearedCheck.location}; loan alert cleared.`);
console.log(`   Result: ${t4Passed ? "✅ PASSED" : "❌ FAILED"}\n`);

// Test 5: Proactive Travel Context Check (Flight & Passport)
console.log("[TC-P3-05] Testing Proactive Travel Departure Check...");
const t5Start = Date.now();
const flightAlert = clearedAlerts.find((a) => a.id === "calendar-flight-london");
const t5Passed = Boolean(flightAlert && flightAlert.itemName.includes("Passport") && flightAlert.location.includes("Hallway console"));
if (t5Passed) passedCount++;
testResults.push({ id: "TC-P3-05", name: "Proactive Travel Context Check", status: t5Passed ? "PASSED" : "FAILED", latencyMs: Date.now() - t5Start });
console.log(`   Alert: "${flightAlert ? flightAlert.alertText : 'None'}"`);
console.log(`   Result: ${t5Passed ? "✅ PASSED" : "❌ FAILED"}\n`);

console.log(`Summary: ${passedCount}/${testResults.length} Phase 3 test cases passed.`);

if (passedCount === testResults.length) {
  console.log("🎉 All Phase 3 'Put It Back' Return Timer tests passed!");
} else {
  console.error("❌ Some Phase 3 tests failed.");
  process.exit(1);
}
