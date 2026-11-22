export interface ItemRecord {
  id: string;
  name: string;
  description: string;
  location: string;
  room: string;
  photoUrl: string;
  capturedAt: string;
  tags: string[];
  borrowedBy?: string | null;
  returnTimerExpiresAt?: string | null;
}

export interface RecallQueryRequest {
  query: string;
  requesterName?: string;
  isDemo?: boolean;
}

export interface RecallQueryResponse {
  answer: string;
  matches: ItemRecord[];
  confidence: number;
  reasoning: string;
  latencyMs: number;
}

