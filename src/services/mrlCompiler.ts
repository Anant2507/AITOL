// MRL Lite — Machine-Readable Language compression layer
// Reduces input tokens (prompt compression) and output tokens (response compression)

// Filler phrases to strip from prompts before sending to the LLM
const FILLER_PATTERNS: [RegExp, string][] = [
  [/\bcould you please\b/gi, ""],
  [/\bcan you please\b/gi, ""],
  [/\bplease\b/gi, ""],
  [/\bI would like to know\b/gi, ""],
  [/\bI want to know\b/gi, ""],
  [/\bkindly\b/gi, ""],
  [/\bI was wondering if\b/gi, ""],
  [/\bin your opinion\b/gi, ""],
  [/\bjust to clarify\b/gi, ""],
  [/\bbasically\b/gi, ""],
  [/\bactually\b/gi, ""],
];

// Common word/phrase abbreviations
const ABBREVIATIONS: [RegExp, string][] = [
  [/\bfor example\b/gi, "e.g."],
  [/\bthat is\b/gi, "i.e."],
  [/\binformation\b/gi, "info"],
  [/\bapplication\b/gi, "app"],
  [/\bdocumentation\b/gi, "docs"],
  [/\bconfiguration\b/gi, "config"],
  [/\bas soon as possible\b/gi, "ASAP"],
  [/\bwith regard to\b/gi, "re:"],
];

export function compressPrompt(text: string): { compressed: string; originalTokensEst: number; compressedTokensEst: number } {
  let result = text;

  for (const [pattern, replacement] of FILLER_PATTERNS) {
    result = result.replace(pattern, replacement);
  }

  for (const [pattern, replacement] of ABBREVIATIONS) {
    result = result.replace(pattern, replacement);
  }

  // Clean up artifacts left behind after removals
  result = result
    .replace(/\s+/g, " ")           // collapse multiple spaces
    .replace(/\s+([,.!?])/g, "$1")  // remove space before punctuation
    .replace(/,\s*,/g, ",")          // collapse double commas
    .replace(/^\s*[,.]?\s*/, "")     // remove leading stray punctuation
    .trim();

  // Capitalize first letter (since filler removal can shift the start)
  if (result.length > 0) {
    result = result[0].toUpperCase() + result.slice(1);
  }

  return {
    compressed: result,
    originalTokensEst: estimateTokens(text),
    compressedTokensEst: estimateTokens(result),
  };
}

// Rough token estimate (1 token ≈ 4 characters, standard approximation)
export function estimateTokens(text: string): number {
  return Math.ceil(text.length / 4);
}

// System prompt instructing the LLM to respond in compact shorthand
export const COMPACT_RESPONSE_INSTRUCTION =
  "Respond in the most token-efficient way possible. Use short sentences, " +
  "avoid filler words and pleasantries, use bullet fragments instead of full prose where possible, " +
  "and omit unnecessary elaboration. Be direct and concise.";