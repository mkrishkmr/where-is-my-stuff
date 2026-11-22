export type MemberRole = "admin" | "member";

export interface FamilyMember {
  email: string;
  name: string;
  role: MemberRole;
  avatarColor: string;
  householdName: string;
}

export interface ShareDeepLinkPayload {
  itemId: string;
  itemName: string;
  senderName: string;
  shareUrl: string;
  shareMessage: string;
}

export interface RecipientItemView {
  resolved: boolean;
  item?: {
    id: string;
    name: string;
    location: string;
    room: string;
    photoUrl: string;
    capturedAt: string;
    tags: string[];
  };
  sharedBy: string;
  retrievalPath: string;
}

