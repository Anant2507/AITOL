// ============================================================
// Smart Router — Model Registry
// All available models with pricing and capability tiers
// ============================================================

export type QualityTier = "fast" | "balanced" | "best";

export interface ModelEntry {
  id: string;                    // OpenRouter model string
  tier: QualityTier;
  costPer1kTokens: number;       // USD per 1k tokens (avg input+output)
  maxTokens: number;             // context window
  strengths: string[];           // what this model is good at
}

export const MODEL_REGISTRY: ModelEntry[] = [
  // ── Fast tier (cheapest) ──────────────────────────────────
  {
    id: "",
    tier: "fast",
    costPer1kTokens: 0.001,
    maxTokens: 16385,
    strengths: ["simple-qa", "summarize", "translate", "classify"],
  },
  
    {
    id: "openai/gpt-3.5-turbo",
    tier: "fast",
    costPer1kTokens: 0.001,
    maxTokens: 16385,
    strengths: ["simple-qa", "summarize", "explain", "translate", "classify"],
  },

  // ── Balanced tier ─────────────────────────────────────────
  {
    id: "openai/gpt-4o-mini",
    tier: "balanced",
    costPer1kTokens: 0.00015,
    maxTokens: 128000,
    strengths: ["code", "explain", "summarize", "analyze", "debug"],
  },
  {
    id: "openai/gpt-4o-mini",
    tier: "balanced",
    costPer1kTokens: 0.0008,
    maxTokens: 200000,
    strengths: ["code", "explain", "analyze", "long-context"],
  },

  // ── Best tier (most capable) ──────────────────────────────
  // ── Best tier ─────────────────────────────────────────────
  {
    id: "openai/gpt-4o-mini",
    tier: "best",
    costPer1kTokens: 0.00015,
    maxTokens: 128000,
    strengths: ["code", "debug", "architect", "refactor", "complex-reasoning"],
  },
  {
    id: "anthropic/claude-sonnet-4-6",
    tier: "best",
    costPer1kTokens: 0.003,
    maxTokens: 200000,
    strengths: ["code", "debug", "architect", "refactor", "long-context"],
  },
];

// Get cheapest model in a given tier
export function getCheapestInTier(tier: QualityTier): ModelEntry {
  const options = MODEL_REGISTRY
    .filter(m => m.tier === tier)
    .sort((a, b) => a.costPer1kTokens - b.costPer1kTokens);
  return options[0];
}

// Get cheapest model that matches task strength in tier
export function getBestModelForTask(
  tier: QualityTier,
  taskType: string
): ModelEntry {
  const tierModels = MODEL_REGISTRY
    .filter(m => m.tier === tier)
    .sort((a, b) => a.costPer1kTokens - b.costPer1kTokens);

  // Prefer model with matching strength
  const match = tierModels.find(m => m.strengths.includes(taskType));
  return match ?? tierModels[0];
}