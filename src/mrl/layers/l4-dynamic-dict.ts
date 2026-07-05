import { MRLLayerResult, MRLMap } from "../types";

// Finds phrases that repeat 2+ times in the prompt
// and replaces them with short runtime tokens §D0, §D1, §D2...

export function l4DynamicDict(text: string, mrlMap: MRLMap): MRLLayerResult {
  const original = text;
  let result = text;
  let tokenIndex = 0;

  // Extract all word sequences of length 2–5 words
  const words = text.split(/\s+/);
  const phraseCounts: Map<string, number> = new Map();

  for (let len = 5; len >= 2; len--) {
    for (let i = 0; i <= words.length - len; i++) {
      const phrase = words.slice(i, i + len).join(" ").toLowerCase();

      // Skip if already a MRL token
      if (phrase.includes("§")) continue;

      // Skip very short or meaningless phrases
      if (phrase.length < 6) continue;

      phraseCounts.set(phrase, (phraseCounts.get(phrase) ?? 0) + 1);
    }
  }

  // Only replace phrases that appear 2+ times — worth tokenizing
  const candidates = [...phraseCounts.entries()]
    .filter(([_, count]) => count >= 2)
    .sort((a, b) => b[0].length - a[0].length); // longest first

  for (const [phrase, _] of candidates) {
    const token = `§D${tokenIndex++}`;
    const regex = new RegExp(escapeRegex(phrase), "gi");

    if (regex.test(result)) {
      mrlMap[token] = phrase;
      result = result.replace(
        new RegExp(escapeRegex(phrase), "gi"),
        token
      );
    }
  }

  const saved = Math.max(0, original.length - result.length);

  return {
    text: result,
    tokensSaved: Math.round(saved / 4),
    layerName: "L4-DynamicDict",
  };
}

function escapeRegex(s: string): string {
  return s.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}