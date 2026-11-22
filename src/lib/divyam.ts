export const DIVYAM_BASE_URL = process.env.DIVYAM_BASE_URL || "https://api.preview.divyam.ai/v1";
export const DIVYAM_API_KEY = process.env.DIVYAM_API_KEY || "";
export const OPUS_MODEL = process.env.DIVYAM_CHAT_MODEL || "divyam-as/claude-opus-5-5";

export async function callDivyamChat(messages: Array<{ role: string; content: any }>, maxTokens = 1200): Promise<string> {
  if (!DIVYAM_API_KEY) {
    throw new Error("DIVYAM_API_KEY is not configured.");
  }

  const response = await fetch(`${DIVYAM_BASE_URL}/chat/completions`, {
    method: "POST",
    headers: {
      "Authorization": `Bearer ${DIVYAM_API_KEY}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      model: OPUS_MODEL,
      messages,
      max_tokens: maxTokens,
      temperature: 0.2,
    }),
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`Divyam API failed with HTTP ${response.status}: ${errorText}`);
  }

  const data = await response.json();
  const choice = data.choices?.[0]?.message;
  return choice?.content || choice?.reasoning_content || "";
}

