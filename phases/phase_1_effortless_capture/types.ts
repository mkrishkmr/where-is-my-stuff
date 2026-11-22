export interface CapturedItem {
  id: string;
  name: string;
  description: string;
  location: string;
  room: string;
  confidence: number;
  tags: string[];
  photoUrl: string;
  capturedAt: string;
  sizeClass?: "tiny" | "small" | "medium" | "large";
  distinguishingFeatures?: string[];
}

export interface CapturePayload {
  image: string; // base64 or URL
  location: string;
  room: string;
  isDemo?: boolean;
}

export interface CaptureResult {
  success: boolean;
  count: number;
  items: CapturedItem[];
  latencyMs: number;
}

