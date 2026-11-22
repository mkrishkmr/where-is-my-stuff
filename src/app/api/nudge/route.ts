import { NextResponse } from "next/server";
import { getStoredItems } from "@/lib/store";
import { ProactiveNudge } from "@/types";

export async function GET() {
  const items = getStoredItems();
  const nudges: ProactiveNudge[] = [];

  // Check for borrowed items with active or expired return timers
  const borrowedItems = items.filter((i) => i.borrowedBy && i.returnTimerExpiresAt);
  borrowedItems.forEach((item) => {
    const isExpired = new Date(item.returnTimerExpiresAt!).getTime() < Date.now();
    nudges.push({
      id: `timer-${item.id}`,
      title: isExpired ? "⏰ Return Due: Put It Back" : "⏳ Active Borrow Timer",
      triggerEvent: `${item.borrowedBy} borrowed "${item.name}"`,
      suggestedItemName: item.name,
      item,
      alertText: isExpired
        ? `Time to return "${item.name}" back to its home: ${item.location} (${item.room}).`
        : `Due back in ${item.location} (${item.room}).`,
    });
  });

  return NextResponse.json({ nudges });
}
