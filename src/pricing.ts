// Price per 1 million tokens (blended prompt+completion), in USD
// Update these as needed — check https://openrouter.ai/models for current rates
export const MODEL_PRICING: Record<string, number> = {
  "openrouter/free": 0,
  "meta-llama/llama-3.2-3b-instruct:free": 0,
  "google/gemma-2-9b-it:free": 0,
  "mistralai/mistral-7b-instruct:free": 0,
  "openai/gpt-4o": 5.0,
  "openai/gpt-4o-mini": 0.3,
  "anthropic/claude-3.5-sonnet": 6.0,
  "anthropic/claude-3-haiku": 0.5,
  "google/gemini-flash-1.5": 0.15,
};

const DEFAULT_PRICE_PER_MILLION = 1.0; // fallback for unknown models

export function calculateCost(model: string, tokensUsed: number): number {
  const pricePerMillion =
    MODEL_PRICING[model] !== undefined
      ? MODEL_PRICING[model]
      : DEFAULT_PRICE_PER_MILLION;

  return (tokensUsed / 1_000_000) * pricePerMillion;
}