export type DurationOption = "1h" | "4h" | "24h";

export interface BorrowActionPayload {
  itemId: string;
  borrowerName: string;
  duration: DurationOption;
  durationMinutes: number;
}

export interface ReturnActionPayload {
  itemId: string;
}

export interface ProactiveAlert {
  id: string;
  type: "return_due" | "active_loan" | "calendar_context";
  title: string;
  alertText: string;
  itemName: string;
  location: string;
  room: string;
  borrowedBy?: string;
  isOverdue?: boolean;
  dueAt?: string;
  photoUrl?: string;
}

