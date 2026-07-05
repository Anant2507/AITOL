import { CCEOptions, CCEResult, SymbolMap } from "./types";
import { detectCodeBlocks } from "./layers/c1-detector";
import { c2Minify } from "./layers/c2-minifier";
import { c3SymbolCompact } from "./layers/c3-symbol";
import { c4Diff } from "./layers/c4-diff";
import { c5Tags, CCE_SYSTEM_INSTRUCTION } from "./layers/c5-tags";

export { CCE_SYSTEM_INSTRUCTION };

function estimateTokens(text: string): number {
  return Math.ceil(text.length / 4);
}

export class CCECompressor {
  private options: Required<CCEOptions>;

  constructor(options: CCEOptions = {}) {
    this.options = {
      enableC2Minification: options.enableC2Minification ?? true,
      enableC3Symbols:      options.enableC3Symbols      ?? true,
      enableC4Diff:         options.enableC4Diff         ?? true,
      enableC5Tags:         options.enableC5Tags         ?? true,
      sessionId:            options.sessionId            ?? "default",
    };
  }

  compress(prompt: string): CCEResult {
    const originalPrompt = prompt;
    const symbolMap: SymbolMap = {};
    const allLayerResults = [];

    // ── C1: Detect code blocks ───────────────────────────────
    const codeBlocks = detectCodeBlocks(prompt);

    if (codeBlocks.length === 0) {
      return {
        originalPrompt,
        compressedPrompt: prompt,
        codeBlocksFound: 0,
        originalCodeTokens: estimateTokens(prompt),
        compressedCodeTokens: estimateTokens(prompt),
        compressionRatio: 0,
        symbolMap: {},
        layerResults: [],
        diffMode: false,
      };
    }

    // ── Pass 1: Run C2 + C3 on ALL blocks first ──────────────
    // This builds the complete symbolMap before we emit any legend
    const minifiedBlocks: string[] = [];

    for (const block of codeBlocks) {
      let code = block.fenced
        ? block.raw.replace(/^```\w*\n?/, "").replace(/```$/, "").trim()
        : block.raw.replace(/^`|`$/g, "").trim();

      if (this.options.enableC2Minification) {
        const r = c2Minify(code, block.language);
        code = r.code;
        allLayerResults.push(r);
      }

      if (this.options.enableC3Symbols) {
        const r = c3SymbolCompact(code, block.language, symbolMap);
        code = r.code;
        allLayerResults.push(r);
      }

      minifiedBlocks.push(code);
    }

    // ── Pass 2: Run C4 + C5, replace in prompt (reverse order) ──
    let compressedPrompt = prompt;
    let diffUsed = false;

    for (let i = codeBlocks.length - 1; i >= 0; i--) {
      const block = codeBlocks[i];
      let code = minifiedBlocks[i];
      const isFirstBlock = i === 0; // only first block gets the legend

      if (this.options.enableC4Diff) {
        const r = c4Diff(code, block.language, this.options.sessionId);
        if (r.tokensSaved > 0) diffUsed = true;
        code = r.code;
        allLayerResults.push(r);
      }

      if (this.options.enableC5Tags) {
        const r = c5Tags(code, block.language, symbolMap, isFirstBlock);
        code = r.code;
        allLayerResults.push(r);
      }

      compressedPrompt =
        compressedPrompt.slice(0, block.startIndex) +
        code +
        compressedPrompt.slice(block.endIndex);
    }

    const originalCodeTokens = estimateTokens(originalPrompt);
    const compressedCodeTokens = estimateTokens(compressedPrompt);
    const compressionRatio = originalCodeTokens > 0
      ? parseFloat(((1 - compressedCodeTokens / originalCodeTokens) * 100).toFixed(2))
      : 0;

    return {
      originalPrompt,
      compressedPrompt,
      codeBlocksFound: codeBlocks.length,
      originalCodeTokens,
      compressedCodeTokens,
      compressionRatio,
      symbolMap,
      layerResults: allLayerResults,
      diffMode: diffUsed,
    };
  }
}

export const cceCompressor = new CCECompressor();