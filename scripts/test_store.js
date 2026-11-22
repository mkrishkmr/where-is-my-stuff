const fs = require("fs");
const path = require("path");

const DATA_FILE = path.join(process.cwd(), "data", "items.json");

const start = Date.now();
const data = fs.readFileSync(DATA_FILE, "utf-8");
const items = JSON.parse(data);
const duration = Date.now() - start;

console.log(`✅ Loaded ${items.length} items from data/items.json in ${duration}ms.`);
const passport = items.find((i) => i.name.toLowerCase().includes("passport"));
const hdmi = items.find((i) => i.name.toLowerCase().includes("hdmi"));

if (passport) {
  console.log(`   Passport located: "${passport.name}" -> ${passport.location}`);
} else {
  console.error("❌ Passport item missing from seed!");
}

if (hdmi) {
  console.log(`   HDMI cable located: "${hdmi.name}" -> ${hdmi.location}`);
} else {
  console.error("❌ HDMI item missing from seed!");
}

if (items.length === 12 && passport && hdmi && duration < 50) {
  console.log("✅ Step 1 verification: PASSED.");
} else {
  console.error("❌ Step 1 verification: FAILED.");
  process.exit(1);
}

