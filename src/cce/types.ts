export type SupportedLanguage =
  | "typescript"
  | "javascript"
  | "python"
  | "java"
  | "go"
  | "rust"
  | "cpp"
  | "csharp"
  | "sql"
  | "bash"
  | "unknown";

export interface CodeBlock {
  raw: string;
  language: SupportedLanguage;
  startIndex: number;
  endIndex: number;
  fenced: boolean;
}

export interface CCELayerResult {
  code: string;
  tokensSaved: number;
  layerName: string;
}

export interface SymbolMap {
  [original: string]: string;
}

export interface CCEResult {
  originalPrompt: string;
  compressedPrompt: string;
  codeBlocksFound: number;
  originalCodeTokens: number;
  compressedCodeTokens: number;
  compressionRatio: number;
  symbolMap: SymbolMap;
  layerResults: CCELayerResult[];
  diffMode: boolean;
}

export interface CCEOptions {
  enableC2Minification?: boolean;
  enableC3Symbols?: boolean;
  enableC4Diff?: boolean;
  enableC5Tags?: boolean;
  sessionId?: string;
}