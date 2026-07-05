import { MRLLayerResult, MRLMap } from "../types";
import { STATIC_DICT } from "../dictionary/static-dict";

function escapeRegex(s: string): string {
  return s.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

export function l3StaticDict(text: string, mrlMap: MRLMap): MRLLayerResult {
  const original = text;
  let result = text;

  for (const entry of STATIC_DICT) {
    const regex = new RegExp(
      `(?<![§\\w])${escapeRegex(entry.original)}(?![\\w])`,
      "gi"
    );

    if (regex.test(result)) {
      mrlMap[entry.token] = entry.original;
      result = result.replace(
        new RegExp(`(?<![§\\w])${escapeRegex(entry.original)}(?![\\w])`, "gi"),
        entry.token
      );
    }
  }

  const saved = Math.max(0, original.length - result.length);

  return {
    text: result,
    tokensSaved: Math.round(saved / 4),
    layerName: "L3-StaticDict",
  };
}