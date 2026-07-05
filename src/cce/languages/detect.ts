import { SupportedLanguage } from "../types";

const FENCE_ALIAS_MAP: Record<string, SupportedLanguage> = {
  ts: "typescript",
  typescript: "typescript",
  js: "javascript",
  javascript: "javascript",
  jsx: "javascript",
  tsx: "typescript",
  py: "python",
  python: "python",
  java: "java",
  go: "go",
  golang: "go",
  rs: "rust",
  rust: "rust",
  cpp: "cpp",
  "c++": "cpp",
  cs: "csharp",
  csharp: "csharp",
  "c#": "csharp",
  sql: "sql",
  sh: "bash",
  bash: "bash",
  shell: "bash",
};

const CONTENT_PATTERNS: Array<{ language: SupportedLanguage; pattern: RegExp }> = [
  { language: "typescript", pattern: /:\s*(string|number|boolean|any|void|Promise<|interface |type )/ },
  { language: "typescript", pattern: /^(import|export)\s+.*from\s+['"]/ },
  { language: "javascript", pattern: /^(const|let|var)\s+\w+\s*=\s*(require|async|function|\()/ },
  { language: "python",     pattern: /^(def |class |import |from |if __name__|print\()/ },
  { language: "python",     pattern: /:\s*$/ },
  { language: "java",       pattern: /(public|private|protected)\s+(static\s+)?(void|class|int|String)/ },
  { language: "go",         pattern: /^(func |package |main|make|append|var |type \w+ struct)/ },
  { language: "rust",       pattern: /^(fn |use |let mut |impl |pub |struct |enum )/ },
  { language: "sql",        pattern: /\b(SELECT|INSERT|UPDATE|DELETE|CREATE TABLE|DROP|ALTER)\b/i },
  { language: "bash",       pattern: /^(#!\/bin\/|echo |chmod |grep |curl |apt |sudo )/ },
];

export function detectLanguage(
  fenceHint: string | null,
  codeContent: string
): SupportedLanguage {
  if (fenceHint) {
    const normalized = fenceHint.trim().toLowerCase();
    if (FENCE_ALIAS_MAP[normalized]) {
      return FENCE_ALIAS_MAP[normalized];
    }
  }

  for (const { language, pattern } of CONTENT_PATTERNS) {
    if (pattern.test(codeContent)) {
      return language;
    }
  }

  return "unknown";
}