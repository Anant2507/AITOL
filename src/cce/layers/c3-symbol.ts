import { SupportedLanguage, CCELayerResult, SymbolMap } from "../types";

const RESERVED: Set<string> = new Set([
  "const","let","var","function","return","if","else","for","while","do",
  "class","new","this","super","import","export","default","from","async",
  "await","try","catch","finally","throw","typeof","instanceof","in","of",
  "true","false","null","undefined","void","break","continue","switch","case",
  "string","number","boolean","any","never","object","unknown",
  "def","self","cls","pass","lambda","yield","with","as","raise","except",
  "and","or","not","is","elif","None","True","False","print","range","len",
  "func","package","main","make","append","cap","map","chan","go",
  "defer","select","interface","struct","type","error","nil","int",
  "i","j","k","n","x","y","z","a","b","c","s","e","t","r","id","ok","err",
  "req","res","ctx","key","val","msg","arr","obj","str","num","idx","buf",
  "data","args","opts","config","result","error","response","request","value",
]);

const SHORT_NAMES = [
  "p","q","u","v","w","g","h","m","f","d","l","o",
  "p1","p2","q1","q2","u1","u2","v1","v2","w1","w2",
  "aa","ab","ac","ad","ae","af","ag","ah","ai","aj",
];

function escapeRegex(s: string): string {
  return s.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

export function c3SymbolCompact(
  code: string,
  language: SupportedLanguage,
  symbolMap: SymbolMap
): CCELayerResult {
  const original = code;

  if (language === "sql" || language === "bash" || language === "unknown") {
    return { code, tokensSaved: 0, layerName: "C3-Symbols" };
  }

  const identifierPattern = /\b([a-zA-Z_][a-zA-Z0-9_]{6,})\b/g;
  const candidates: Map<string, number> = new Map();

  let match: RegExpExecArray | null;
  while ((match = identifierPattern.exec(code)) !== null) {
    const name = match[1];
    if (!RESERVED.has(name) && !name.startsWith("§")) {
      candidates.set(name, (candidates.get(name) ?? 0) + 1);
    }
  }

  const sorted = [...candidates.entries()]
    .filter(([_, count]) => count >= 1)
    .sort((a, b) => (b[1] * b[0].length) - (a[1] * a[0].length));

  // Start index after already-used tokens to avoid collisions
  let shortNameIndex = Object.keys(symbolMap).length;
  let result = code;

for (const [name, _] of sorted) {
    // Check if this name already has a token from a previous block
    const existingEntry = Object.entries(symbolMap).find(([_, v]) => v === name);
    if (existingEntry) {
      // Reuse existing token — just apply the replacement
      const [existingShort] = existingEntry;
      result = result.replace(new RegExp(`\\b${escapeRegex(name)}\\b`, "g"), existingShort);
      continue;
    }

    if (shortNameIndex >= SHORT_NAMES.length) break;
    const short = SHORT_NAMES[shortNameIndex++];
    symbolMap[short] = name;
    result = result.replace(new RegExp(`\\b${escapeRegex(name)}\\b`, "g"), short);
  }

  const saved = Math.max(0, original.length - result.length);

  return {
    code: result,
    tokensSaved: Math.round(saved / 4),
    layerName: "C3-Symbols",
  };
}