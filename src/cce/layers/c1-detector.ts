import { CodeBlock } from "../types";
import { detectLanguage } from "../languages/detect";

const FENCED_BLOCK_REGEX = /```(\w*)\n?([\s\S]*?)```/g;
const INLINE_CODE_REGEX = /`([^`\n]{10,})`/g;

export function detectCodeBlocks(prompt: string): CodeBlock[] {
  const blocks: CodeBlock[] = [];
  const coveredRanges: Array<[number, number]> = [];

  let match: RegExpExecArray | null;
  FENCED_BLOCK_REGEX.lastIndex = 0;

  while ((match = FENCED_BLOCK_REGEX.exec(prompt)) !== null) {
    const fenceHint = match[1] || null;
    const code = match[2];
    const startIndex = match.index;
    const endIndex = match.index + match[0].length;
    const language = detectLanguage(fenceHint, code);

    blocks.push({
      raw: match[0],
      language,
      startIndex,
      endIndex,
      fenced: true,
    });

    coveredRanges.push([startIndex, endIndex]);
  }

  INLINE_CODE_REGEX.lastIndex = 0;

  while ((match = INLINE_CODE_REGEX.exec(prompt)) !== null) {
    const startIndex = match.index;
    const endIndex = match.index + match[0].length;

    if (isInRange(startIndex, endIndex, coveredRanges)) continue;

    const code = match[1];
    const language = detectLanguage(null, code);

    blocks.push({
      raw: match[0],
      language,
      startIndex,
      endIndex,
      fenced: false,
    });

    coveredRanges.push([startIndex, endIndex]);
  }

  return blocks.sort((a, b) => a.startIndex - b.startIndex);
}

function isInRange(
  start: number,
  end: number,
  ranges: Array<[number, number]>
): boolean {
  return ranges.some(([rs, re]) => start >= rs && end <= re);
}