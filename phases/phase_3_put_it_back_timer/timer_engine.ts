import { ProactiveAlert } from "./types";

export interface ItemLike {
  id: string;
  name: string;
  location: string;
  room: string;
  photoUrl: string;
  borrowedBy?: string | null;
  returnTimerExpiresAt?: string | null;
}

export function buildActiveAlerts(items: ItemLike[]): ProactiveAlert[] {
  const alerts: ProactiveAlert[] = [];
  const now = Date.now();

  // 1. Process active and overdue borrowed items
  items
    .filter((i) => i.borrowedBy && i.returnTimerExpiresAt)
    .forEach((item) => {
      const dueTimestamp = new Date(item.returnTimerExpiresAt!).getTime();
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
        borrowedBy: item.borrowedBy || undefined,
        isOverdue,
        dueAt: item.returnTimerExpiresAt || undefined,
        photoUrl: item.photoUrl
      });
    });

  // 2. Proactive Travel Departure Check (Passport)
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

