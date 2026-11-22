const fs = require("fs");
const path = require("path");

async function testCaptureLogic() {
  const { extractItemsFromPhoto } = require("../src/lib/vision.ts");
  const { addBatchItems, getStoredItems } = require("../src/lib/store.ts");

  console.log("Testing Phase 2 Capture Ingestion...");
  const initialCount = getStoredItems().length;

  const testImage = "https://images.unsplash.com/photo-1544816155-12df9643f363?auto=format&fit=crop&w=400&q=80";
  const start = Date.now();
  const extraction = await extractItemsFromPhoto(testImage, true);
  const elapsed = Date.now() - start;

  console.log(`Extraction returned ${extraction.items.length} items in ${elapsed}ms:`);
  extraction.items.forEach((item, idx) => {
    console.log(`  [${idx + 1}] ${item.name} (${item.tags.join(", ")})`);
  });

  if (extraction.items.length >= 3 && elapsed < 3000) {
    console.log("✅ Phase 2 Capture Ingestion contract: PASSED.");
  } else {
    console.error("❌ Phase 2 Capture Ingestion contract: FAILED.");
    process.exit(1);
  }
}

testCaptureLogic().catch((err) => {
  console.error("Test error:", err);
  process.exit(1);
});

