#!/usr/bin/env bash
set -e

if [ -f ".env.local" ]; then
  export $(grep -v '^#' .env.local | xargs)
fi

DIVYAM_KEY="${DIVYAM_API_KEY}"
BASE_URL="${DIVYAM_BASE_URL:-https://api.preview.divyam.ai/v1}"
MODEL="${DIVYAM_VISION_MODEL:-divyam-as/claude-opus-5-5}"

echo "🔍 Testing multimodal vision on Divyam with $MODEL..."

HTTP_CODE=$(curl -s -o /tmp/divyam_vision_test.json -w "%{http_code}" \
  "$BASE_URL/chat/completions" \
  -H "Authorization: Bearer $DIVYAM_KEY" \
  -H "Content-Type: application/json" \
  -d "{
    \"model\": \"$MODEL\",
    \"messages\": [
      {
        \"role\": \"user\",
        \"content\": [
          {\"type\": \"text\", \"text\": \"List the items visible in this image in JSON format: {\\\"items\\\": [\\\"item1\\\", \\\"item2\\\"]}\"},
          {\"type\": \"image_url\", \"image_url\": {\"url\": \"https://images.unsplash.com/photo-1544816155-12df9643f363?auto=format&fit=crop&w=400&q=80\"}}
        ]
      }
    ],
    \"max_tokens\": 200
  }")

if [ "$HTTP_CODE" -eq 200 ]; then
  echo "✅ Vision test PASSED (HTTP 200)!"
  cat /tmp/divyam_vision_test.json
else
  echo "⚠️ Vision test returned HTTP $HTTP_CODE:"
  cat /tmp/divyam_vision_test.json
fi

