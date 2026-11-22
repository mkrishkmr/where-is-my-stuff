import { NextResponse } from "next/server";
import { getStoredItems, addItem, saveStoredItems } from "@/lib/store";
import { Item } from "@/types";

export async function GET() {
  const items = getStoredItems();
  return NextResponse.json({ items, count: items.length });
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { action, itemId, borrowedBy, timerMinutes } = body;

    // Handle "Borrow & Set Return Timer"
    if (action === "borrow" && itemId) {
      const items = getStoredItems();
      const target = items.find((i) => i.id === itemId);
      if (!target) {
        return NextResponse.json({ error: "Item not found" }, { status: 404 });
      }

      const expiresAt = timerMinutes
        ? new Date(Date.now() + timerMinutes * 60 * 1000).toISOString()
        : null;

      target.borrowedBy = borrowedBy || "Family Member";
      target.returnTimerExpiresAt = expiresAt;
      saveStoredItems(items);

      return NextResponse.json({ success: true, item: target });
    }

    // Handle "Return Item"
    if (action === "return" && itemId) {
      const items = getStoredItems();
      const target = items.find((i) => i.id === itemId);
      if (!target) {
        return NextResponse.json({ error: "Item not found" }, { status: 404 });
      }

      target.borrowedBy = null;
      target.returnTimerExpiresAt = null;
      saveStoredItems(items);

      return NextResponse.json({ success: true, item: target });
    }

    // Standard manual add
    const { name, description, location, room, photoUrl, tags } = body;
    if (!name || !location) {
      return NextResponse.json({ error: "Name and location required" }, { status: 400 });
    }

    const newItem: Item = {
      id: `item-${Date.now()}`,
      name,
      description: description || "",
      location,
      room: room || "General",
      photoUrl: photoUrl || "https://images.unsplash.com/photo-1544816155-12df9643f363?auto=format&fit=crop&w=600&q=80",
      capturedAt: new Date().toISOString(),
      tags: tags || [],
    };

    addItem(newItem);
    return NextResponse.json({ item: newItem }, { status: 201 });
  } catch (error) {
    return NextResponse.json({ error: "Failed to update item", details: String(error) }, { status: 500 });
  }
}

