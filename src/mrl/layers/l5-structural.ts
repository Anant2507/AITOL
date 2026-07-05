import { MRLLayerResult } from "../types";

// Compresses structural patterns:
// - Markdown headers     → §H1, §H2, §H3
// - Bullet points        → §B>
// - Numbered lists       → §N>
// - Bold/italic markdown → stripped
// - JSON keys            → shortened

export function l5Structural(text: string): MRLLayerResult {
  const original = text;
  let t = text;

  // Markdown headers
  t = t.replace(/^#{1}\s+/gm, "§H1 ");
  t = t.replace(/^#{2}\s+/gm, "§H2 ");
  t = t.replace(/^#{3}\s+/gm, "§H3 ");
  t = t.replace(/^#{4,}\s+/gm, "§H4 ");

  // Bullet points (-, *, •)
  t = t.replace(/^[\-\*•]\s+/gm, "§B> ");

  // Numbered lists (1. 2. 3.)
  t = t.replace(/^\d+\.\s+/gm, "§N> ");

  // Remove markdown bold/italic (LLM doesn't need ** or __)
  t = t.replace(/\*\*(.*?)\*\*/g, "$1");
  t = t.replace(/__(.*?)__/g, "$1");
  t = t.replace(/\*(.*?)\*/g, "$1");
  t = t.replace(/_(.*?)_/g, "$1");

  // Remove markdown horizontal rules
  t = t.replace(/^[-*_]{3,}\s*$/gm, "");

  // Compress common JSON boilerplate
  t = t.replace(/"([^"]+)":\s*/g, (_, key) => `${key}:`);

  // Collapse blank lines created by removals
  t = t.replace(/\n{3,}/g, "\n\n").trim();

  const saved = Math.max(0, original.length - t.length);

  return {
    text: t,
    tokensSaved: Math.round(saved / 4),
    layerName: "L5-Structural",
  };
}