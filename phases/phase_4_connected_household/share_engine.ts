import { ShareDeepLinkPayload, RecipientItemView } from "./types";

export function generateFamilySharePayload(
  item: { id: string; name: string; location: string; room: string },
  senderName = "Alex",
  baseUrl = "http://localhost:3000"
): ShareDeepLinkPayload {
  const encodedFind = encodeURIComponent(item.name);
  const shareUrl = `${baseUrl}?item=${item.id}&find=${encodedFind}&sender=${encodeURIComponent(senderName)}`;
  const shareMessage = `Hey! Here is where we keep the ${item.name}: ${item.location} (${item.room}). View photo proof here: ${shareUrl}`;

  return {
    itemId: item.id,
    itemName: item.name,
    senderName,
    shareUrl,
    shareMessage
  };
}

export function parseRecipientShareLink(
  queryString: string,
  catalog: Array<{ id: string; name: string; location: string; room: string; photoUrl: string; capturedAt: string; tags: string[] }>
): RecipientItemView {
  const params = new URLSearchParams(queryString.startsWith("?") ? queryString : `?${queryString}`);
  const itemId = params.get("item");
  const senderName = params.get("sender") || "A family member";

  if (!itemId) {
    return {
      resolved: false,
      sharedBy: senderName,
      retrievalPath: "Invalid or missing share link."
    };
  }

  const target = catalog.find((i) => i.id === itemId);
  if (!target) {
    return {
      resolved: false,
      sharedBy: senderName,
      retrievalPath: "Item not found in household catalog."
    };
  }

  return {
    resolved: true,
    item: target,
    sharedBy: senderName,
    retrievalPath: `${target.room} ➔ ${target.location}`
  };
}

