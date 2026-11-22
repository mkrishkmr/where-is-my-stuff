import { NextResponse } from "next/server";
import { extractItemsFromPhoto } from "@/lib/vision";
import { addBatchItems } from "@/lib/store";
import { Item } from "@/types";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { image, location, room, isDemo, commit } = body;

    if (!image) {
      return NextResponse.json({ error: "Image is required" }, { status: 400 });
    }

    const assignedLocation = location || "Living Room — TV Media Console";
    const assignedRoom = room || "Living Room";

    // 1. Run Divyam Claude Opus 5.5 Vision Extraction
    const extraction = await extractItemsFromPhoto(image, Boolean(isDemo));

    // 2. Pick primary extracted item (or fallback)
    const primary = extraction.items[0] || {
      name: "Stored Belonging",
      description: "Visual item captured via camera",
      confidence: 0.95,
      tags: ["household"]
    };

    const timestamp = new Date().toISOString();
    const candidateItem: Item = {
      id: `item-${Date.now()}`,
      name: primary.name,
      description: primary.description,
      location: assignedLocation,
      room: assignedRoom,
      photoUrl: image.startsWith("data:")
        ? image
        : image.startsWith("http")
        ? image
        : "https://images.unsplash.com/photo-1544816155-12df9643f363?auto=format&fit=crop&w=600&q=80",
      capturedAt: timestamp,
      tags: primary.tags || ["household"],
      confidence: primary.confidence || 0.95,
      borrowedBy: null,
      returnTimerExpiresAt: null,
    };

    // If commit is explicitly false, do not write to catalog yet (return for user confirmation)
    if (commit === false) {
      return NextResponse.json({
        success: true,
        candidateItem,
        allItems: extraction.items,
        analysis: extraction.rawAnalysis,
      });
    }

    // Otherwise, save to store directly
    addBatchItems([candidateItem]);

    return NextResponse.json({
      success: true,
      count: 1,
      items: [candidateItem],
      analysis: extraction.rawAnalysis,
    });
  } catch (error) {
    console.error("Capture API endpoint failure:", error);
    return NextResponse.json({ error: "Failed to process photo capture", details: String(error) }, { status: 500 });
  }
}
