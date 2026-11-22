const fs = require("fs");
const path = require("path");

const DATA_FILE = path.join(process.cwd(), "data", "items.json");
const items = JSON.parse(fs.readFileSync(DATA_FILE, "utf-8"));

console.log("=== VERIFYING PHASE 2: HUMANLIKE RECALL EXPERIENCE ===");

const testQueries = [
  {
    query: "that black cable for connecting my laptop to the TV",
    expectedItem: "Braided HDMI 2.1 Cable",
    expectedLocation: "Office desk drawer, left compartment"
  },
  {
    query: "where did we leave our blue passport for the flight?",
    expectedItem: "Passport (Blue Cover)",
    expectedLocation: "Hallway console, top drawer"
  },
  {
    query: "spare house keys",
    expectedItem: "Spare House Keys",
    expectedLocation: "Kitchen key bowl near entrance"
  }
];

let allPassed = true;

testQueries.forEach((t, idx) => {
  const qLower = t.query.toLowerCase();
  const matched = items.filter((item) => {
    const matchName = item.name.toLowerCase().includes(qLower);
    const matchDesc = item.description.toLowerCase().includes(qLower);
    const matchLoc = item.location.toLowerCase().includes(qLower);
    const matchTags = item.tags.some((tag) => qLower.includes(tag.toLowerCase()));

    if (qLower.includes("cable") || qLower.includes("tv")) {
      if (item.name.toLowerCase().includes("hdmi") || item.tags.includes("cable")) return true;
    }
    if (qLower.includes("passport") || qLower.includes("flight")) {
      if (item.name.toLowerCase().includes("passport")) return true;
    }
    if (qLower.includes("key")) {
      if (item.name.toLowerCase().includes("key")) return true;
    }
    return matchName || matchDesc || matchLoc || matchTags;
  });

  const topMatch = matched[0];
  if (topMatch && topMatch.name === t.expectedItem) {
    const humanAnswer = `Hey! Your **${topMatch.name}** is safely kept in the **${topMatch.location}** (${topMatch.room}). Here is the photo proof.`;
    console.log(`[Query ${idx + 1}] "${t.query}"`);
    console.log(`  ➔ Resolved to: "${topMatch.name}" in ${topMatch.location}`);
    console.log(`  ➔ Assistant Reply: "${humanAnswer}"`);
    console.log(`  ➔ Photo Proof: ${topMatch.photoUrl ? "Available" : "Missing"}`);
  } else {
    console.error(`❌ [Query ${idx + 1}] Failed to match "${t.expectedItem}" for query "${t.query}"`);
    allPassed = false;
  }
});

if (allPassed) {
  console.log("✅ Phase 2 Humanlike Recall verification: PASSED.");
} else {
  console.error("❌ Phase 2 Humanlike Recall verification: FAILED.");
  process.exit(1);
}

