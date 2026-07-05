export interface MRLToken {
  token: string;
  original: string;
}

export interface MRLMap {
  [token: string]: string;
}

export interface MRLLayerResult {
  text: string;
  tokensSaved: number;
  layerName: string;
}

export interface MRLResult {
  original: string;
  compressed: string;
  mrlMap: MRLMap;
  compressionRatio: number;
  originalTokenCount: number;
  compressedTokenCount: number;
  layerResults: MRLLayerResult[];
}

export interface MRLOptions {
  enableL1Whitespace?: boolean;
  enableL2Stopwords?: boolean;
  enableL3StaticDict?: boolean;
  enableL4DynamicDict?: boolean;
  enableL5Structural?: boolean;
  enableL6Normalization?: boolean;
  sessionId?: string;
}