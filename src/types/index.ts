export interface Item {
  id: string;
  name: string;
  description: string;
  location: string;
  room: string;
  photoUrl: string;
  capturedAt: string;
  tags: string[];
  confidence?: number;
  borrowedBy?: string | null;
  returnTimerExpiresAt?: string | null;
}

export interface LocationPreset {
  id: string;
  room: string;
  spot: string;
  fullLabel: string;
}

export interface ExtractionResult {
  items: Array<{
    name: string;
    description: string;
    confidence: number;
    tags: string[];
  }>;
  rawAnalysis?: string;
}

export interface SearchQueryRequest {
  query: string;
  userEmail?: string;
}

export interface SearchQueryResponse {
  answer: string;
  matches: Item[];
  reasoning: string;
}

export interface ProactiveNudge {
  id: string;
  title: string;
  triggerEvent: string;
  suggestedItemName: string;
  item?: Item;
  alertText: string;
}

export interface HouseholdMember {
  email: string;
  name: string;
  role: string;
  avatarColor: string;
}
