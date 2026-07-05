import { MRLOptions, MRLResult, MRLMap, MRLLayerResult } from "./types";
import { l1Whitespace } from "./layers/l1-whitespace";
import { l2Stopwords } from "./layers/l2-stopwords";
import { l3StaticDict } from "./layers/l3-static-dict";
import { l4DynamicDict } from "./layers/l4-dynamic-dict";
import { l5Structural } from "./layers/l5-structural";
import { l6Normalization } from "./layers/l6-normalization";

function estimateTokens(text: string): number {
  return Math.ceil(text.length / 4);
}

export class MRLCompressor {
  private options: Required<MRLOptions>;

  constructor(options: MRLOptions = {}) {
    this.options = {
      enableL1Whitespace:    options.enableL1Whitespace    ?? true,
      enableL2Stopwords:     options.enableL2Stopwords     ?? true,
      enableL3StaticDict:    options.enableL3StaticDict    ?? true,
      enableL4DynamicDict:   options.enableL4DynamicDict   ?? true,
      enableL5Structural:    options.enableL5Structural    ?? true,
      enableL6Normalization: options.enableL6Normalization ?? true,
      sessionId:             options.sessionId             ?? "default",
    };
  }

  compress(prompt: string): MRLResult {
    const original = prompt;
    const originalTokenCount = estimateTokens(original);
    const mrlMap: MRLMap = {};
    const layerResults: MRLLayerResult[] = [];

    let current = prompt;

    if (this.options.enableL1Whitespace) {
      const r = l1Whitespace(current);
      current = r.text;
      layerResults.push(r);
    }

    if (this.options.enableL5Structural) {
      const r = l5Structural(current);
      current = r.text;
      layerResults.push(r);
    }

    if (this.options.enableL6Normalization) {
      const r = l6Normalization(current);
      current = r.text;
      layerResults.push(r);
    }

    if (this.options.enableL2Stopwords) {
      const r = l2Stopwords(current);
      current = r.text;
      layerResults.push(r);
    }

    if (this.options.enableL3StaticDict) {
      const r = l3StaticDict(current, mrlMap);
      current = r.text;
      layerResults.push(r);
    }

    if (this.options.enableL4DynamicDict) {
      const r = l4DynamicDict(current, mrlMap);
      current = r.text;
      layerResults.push(r);
    }

    const compressedTokenCount = estimateTokens(current);
    const compressionRatio =
      originalTokenCount > 0
        ? parseFloat(
            ((1 - compressedTokenCount / originalTokenCount) * 100).toFixed(2)
          )
        : 0;

    return {
      original,
      compressed: current,
      mrlMap,
      compressionRatio,
      originalTokenCount,
      compressedTokenCount,
      layerResults,
    };
  }

  decompress(compressed: string, mrlMap: MRLMap): string {
    let result = compressed;
    for (const [token, original] of Object.entries(mrlMap)) {
      result = result.split(token).join(original);
    }
    return result;
  }
}

export const mrlCompressor = new MRLCompressor();