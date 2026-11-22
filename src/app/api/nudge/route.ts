import { NextResponse } from "next/server";
import { getStoredItems } from "@/lib/store";
import { ProactiveNudge } from "@/types";

export async function GET() {
  const items = getStoredItems();
  const nudges: ProactiveNudge[] = [];

  // 1. Check for borrowed items with active or expired return timers
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

  // 2. Proactive Calendar Event (Passport Alert)
  const passport = items.find((i) => i.name.toLowerCase().includes("passport"));
  nudges.push({
    id: "nudge-flight-london",
    title: "Upcoming Travel Context",
    triggerEvent: "Flight AI 102 to London Heathrow tomorrow at 06:30 AM",
    suggestedItemName: "Passport",
    item: passport,
    alertText: passport
      ? `Found your passport in ${passport.location} (${passport.room}). Verified and ready for travel.`
      : "You have an upcoming flight. Don't forget to photograph and log your passport location.",
  });

  return NextResponse.json({ nudges });
}

