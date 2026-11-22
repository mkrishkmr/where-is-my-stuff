# API Keys & Divyam.ai Configuration

## Overview
This project uses **Divyam.ai** as the intelligent inference layer for:
1. **Vision Analysis:** Extracts physical items from photos (`gpt-4o` routed through Divyam).
2. **Conversational Retrieval:** Translates fuzzy user questions into catalog matches (`gpt-4o-mini` routed through Divyam).

## Setup Instructions

1. Obtain your API key from the Divyam console (https://console.divyam.ai).
2. Copy `.env.example` to `.env.local` in the project root:
   ```bash
   cp api_keys/.env.example .env.local
   ```
3. Insert your API key into `.env.local`:
   ```bash
   DIVYAM_API_KEY=divyam_your_actual_key
   DIVYAM_BASE_URL=https://api.preview.divyam.ai/v1
   ```
4. Run the validation script to verify credit balance and connection:
   ```bash
   bash api_keys/verify_connection.sh
   ```

## Fallback Strategy for Credit Exhaustion
If Divyam API credits are exhausted during testing or stage demo:
- The backend automatically detects HTTP status codes `401`, `402`, or `429`.
- The application automatically degrades to deterministic local semantic search so the presentation never crashes.

