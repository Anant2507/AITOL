// ============================================================
// Smart Router — Main Router
// Picks the cheapest model that can handle the prompt
// ============================================================

import { analyzeComplexity, ComplexityResult } from "./complexity";
import { QualityTier, ModelEntry, getBestModelForTask } from "./models";

export interface RouteResult {
  model: string;
  tier: QualityTier;
  complexity: ComplexityResult;
  reason: string;
  estimatedCost: number;
}

export interface RouteOptions {
  quality?: QualityTier;          // user override: "fast" | "balanced" | "best"
  preferredModel?: string;        // user can still force a specific model
  tokenCount?: number;            // estimated tokens for cost calculation
}

// Score thresholds for auto tier selection
const TIER_THRESHOLDS = {
  fast:     { min: 0,  max: 30  },
  balanced: { min: 31, max: 60  },
  best:     { min: 61, max: 100 },
};

function scoreToTier(score: number): QualityTier {
  if (score <= TIER_THRESHOLDS.fast.max)     return "fast";
  if (score <= TIER_THRESHOLDS.balanced.max) return "balanced";
  return "best";
}

export function routePrompt(
  prompt: string,
  options: RouteOptions = {}
): RouteResult {
  // Analyze complexity
  const complexity = analyzeComplexity(prompt);

  // Determine tier
  let tier: QualityTier;
  let reason: string;

  if (options.quality) {
    // User explicitly set quality preference
    tier = options.quality;
    reason = `User requested ${tier} quality`;
  } else {
    // Auto-select based on complexity score
    tier = scoreToTier(complexity.score);
    reason = `Auto-selected: score ${complexity.score}/100 → ${tier} tier`;
  }

  // If user forced a specific model, use it
  if (options.preferredModel) {
    return {
      model: options.preferredModel,
      tier,
      complexity,
      reason: `User forced model: ${options.preferredModel}`,
      estimatedCost: 0,
    };
  }

  // Pick best (cheapest) model in tier for this task
  const selectedModel = getBestModelForTask(tier, complexity.taskType);

  // Estimate cost
  const estimatedTokens = options.tokenCount ?? complexity.tokenCount;
  const estimatedCost = (estimatedTokens / 1000) * selectedModel.costPer1kTokens;

  return {
    model: selectedModel.id,
    tier,
    complexity,
    reason,
    estimatedCost,
  };
}