import { CCELayerResult, SymbolMap } from "../types";

export function c5Tags(
  code: string,
  language: string,
  symbolMap: SymbolMap,
  emitLegend: boolean = true
): CCELayerResult {
  const original = code;

  const symbolEntries = Object.entries(symbolMap);
  const legend = (emitLegend && symbolEntries.length > 0)
    ? `§SYM{${symbolEntries.map(([short, orig]) => `${short}=${orig}`).join(",")}}`
    : "";

  const tagged = `§CODE{${language}}:${legend}${code}`;
  const saved = Math.max(0, original.length - tagged.length + 20);

  return {
    code: tagged,
    tokensSaved: Math.max(0, Math.round(saved / 4)),
    layerName: "C5-Tags",
  };
}

export const CCE_SYSTEM_INSTRUCTION = `
CCE (Code Compressor Engine) tokens in prompts:
- §CODE{lang}: — compressed code block in language 'lang'
- §SYM{a=longName,b=otherName} — symbol map; substitute back before reading code (applies to ALL code blocks in the prompt)
- §DIFF{lang}: — code diff; +N:line=added, -N=deleted, ~N:line=modified vs previous
Decode all CCE tokens before processing. Treat the decoded code as the original.`;