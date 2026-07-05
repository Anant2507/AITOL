import { MRLLayerResult } from "../types";

export function l1Whitespace(text: string): MRLLayerResult {
  const original = text;
  let t = text;

  t = t.replace(/[\u00A0\u1680\u2000-\u200A\u202F\u205F\u3000]/g, " ");
  t = t.replace(/[\u200B\u200C\u200D\uFEFF]/g, "");
  t = t.replace(/ {2,}/g, " ");
  t = t.replace(/\n{3,}/g, "\n\n");
  t = t.replace(/ +\n/g, "\n");
  t = t.replace(/\n +/g, "\n");
  t = t.replace(/!{2,}/g, "!");
  t = t.replace(/\?{2,}/g, "?");
  t = t.replace(/\.{3,}/g, "…");
  t = t.replace(/-{3,}/g, "—");
  t = t.trim();

  const saved = Math.max(0, original.length - t.length);

  return {
    text: t,
    tokensSaved: Math.round(saved / 4),
    layerName: "L1-Whitespace",
  };
}