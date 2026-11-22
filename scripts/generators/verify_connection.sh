#!/usr/bin/env bash
set -e

if [ -f ".env.local" ]; then
  export $(grep -v '^#' .env.local | xargs)
fi

DIVYAM_KEY="${DIVYAM_API_KEY}"
BASE_URL="${DIVYAM_BASE_URL:-https://api.preview.divyam.ai/v1}"
MODEL="${DIVYAM_CHAT_MODEL:-divyam-as/claude-opus-5-5}"

if [ -z "$DIVYAM_KEY" ] || [ "$DIVYAM_KEY" = "your_divyam_api_key_here" ]; then
  echo "❌ Error: DIVYAM_API_KEY is not set in .env.local."
  exit 1
fi

echo "🔍 Testing Divyam.ai API models list..."
HTTP_MODELS=$(curl -s -o /tmp/divyam_models.json -w "%{http_code}" \
  "$BASE_URL/models" \
  -H "Authorization: Bearer $DIVYAM_KEY" \
  -H "Content-Type: application/json")

if [ "$HTTP_MODELS" -ne 200 ]; then
  echo "❌ Models check failed with HTTP $HTTP_MODELS"
  cat /tmp/divyam_models.json
  exit 1
fi
echo "✅ Models endpoint returned HTTP 200."

echo "🔍 Testing live inference with model: $MODEL..."
HTTP_INFER=$(curl -s -o /tmp/divyam_infer.json -w "%{http_code}" \
  "$BASE_URL/chat/completions" \
  -H "Authorization: Bearer $DIVYAM_KEY" \
  -H "Content-Type: application/json" \
  -d "{
    \"model\": \"$MODEL\",
    \"messages\": [
      {\"role\": \"user\", \"content\": \"Confirm in 5 words that you are online for Where Is My Stuff.\"}
    ],
    \"max_tokens\": 25
  }")

if [ "$HTTP_INFER" -eq 200 ]; then
  echo "✅ Inference test PASSED (HTTP 200)!"
  echo "Response from $MODEL:"
  cat /tmp/divyam_infer.json
else
  echo "❌ Inference test failed with HTTP $HTTP_INFER:"
  cat /tmp/divyam_infer.json
  exit 1
fi
