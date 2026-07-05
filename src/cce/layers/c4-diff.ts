import { CCELayerResult } from "../types";
import crypto from "crypto";

const sessionStore: Map<string, Map<string, string[]>> = new Map();

export function c4Diff(
  code: string,
  language: string,
  sessionId: string
): CCELayerResult {
  const lines = code.split("\n");
  const codeHash = hashSignature(code.slice(0, 200));

  if (!sessionStore.has(sessionId)) {
    sessionStore.set(sessionId, new Map());
  }
  const store = sessionStore.get(sessionId)!;

  const previousLines = findSimilar(store, lines, codeHash);

  if (!previousLines) {
    store.set(codeHash, lines);
    return {
      code,
      tokensSaved: 0,
      layerName: "C4-Diff (full, first seen)",
    };
  }

  const diff = buildDiff(previousLines, lines);

  if (diff.length >= code.length * 0.7) {
    store.set(codeHash, lines);
    return {
      code,
      tokensSaved: 0,
      layerName: "C4-Diff (full, diff not smaller)",
    };
  }

  store.set(codeHash, lines);
  const saved = Math.max(0, code.length - diff.length);

  return {
    code: `§DIFF{${language}}:${diff}`,
    tokensSaved: Math.round(saved / 4),
    layerName: "C4-Diff",
  };
}

function buildDiff(oldLines: string[], newLines: string[]): string {
  const parts: string[] = [];
  const maxLen = Math.max(oldLines.length, newLines.length);

  for (let i = 0; i < maxLen; i++) {
    const oldLine = oldLines[i] ?? null;
    const newLine = newLines[i] ?? null;

    if (oldLine === newLine) continue;

    if (newLine === null) {
      parts.push(`-${i + 1}`);
    } else if (oldLine === null) {
      parts.push(`+${i + 1}:${newLine.trim()}`);
    } else {
      parts.push(`~${i + 1}:${newLine.trim()}`);
    }
  }

  return parts.join("|");
}

function findSimilar(
  store: Map<string, string[]>,
  newLines: string[],
  hash: string
): string[] | null {
  if (store.has(hash)) return store.get(hash)!;

  for (const [_, stored] of store) {
    const ratio = Math.abs(stored.length - newLines.length) / Math.max(stored.length, newLines.length);
    if (ratio < 0.3) return stored;
  }

  return null;
}

function hashSignature(text: string): string {
  return crypto.createHash("md5").update(text).digest("hex").slice(0, 8);
}

export function clearDiffSession(sessionId: string): void {
  sessionStore.delete(sessionId);
}