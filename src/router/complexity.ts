// ============================================================
// Smart Router — Complexity Analyzer
// Scores a prompt 0-100 to determine which model tier it needs
// ============================================================

export type TaskType =
  | "simple-qa"
  | "explain"
  | "summarize"
  | "translate"
  | "classify"
  | "code"
  | "debug"
  | "refactor"
  | "architect"
  | "analyze"
  | "long-context";

export interface ComplexityResult {
  score: number;           // 0-100
  taskType: TaskType;
  tokenCount: number;
  hasCode: boolean;
  codeBlockCount: number;
  signals: string[];       // human-readable reasons
}

// Task detection keyword map
const TASK_PATTERNS: Array<{ task: TaskType; patterns: RegExp }> = [
  {
    task: "debug",
    patterns: /\b(debug|fix|error|bug|broken|not working|failing|crash|exception|undefined|null pointer)\b/i,
  },
  {
    task: "refactor",
    patterns: /\b(refactor|restructure|rewrite|clean up|improve|optimize the code)\b/i,
  },
  {
    task: "architect",
    patterns: /\b(architect|design system|system design|design pattern|microservice|infrastructure|scalab)\b/i,
  },
  {
    task: "code",
    patterns: /\b(implement|build|create|write|generate|develop|function|class|api|endpoint|component)\b/i,
  },
  {
    task: "analyze",
    patterns: /\b(analyze|review|evaluate|assess|compare|audit|check)\b/i,
  },
  {
    task: "explain",
    patterns: /\b(explain|how does|what is|how to|describe|clarify|elaborate)\b/i,
  },
  {
    task: "summarize",
    patterns: /\b(summarize|summary|tldr|key points|brief|overview|condense)\b/i,
  },
  {
    task: "translate",
    patterns: /\b(translate|convert to|in spanish|in french|in hindi|in german)\b/i,
  },
  {
    task: "classify",
    patterns: /\b(classify|categorize|label|tag|sort|rank|list)\b/i,
  },
];

function estimateTokens(text: string): number {
  return Math.ceil(text.length / 4);
}

function detectCodeBlocks(text: string): number {
  const fenced = (text.match(/```[\s\S]*?```/g) || []).length;
  const inline = (text.match(/`[^`]+`/g) || []).length;
  return fenced + Math.floor(inline / 3); // inline counts less
}

function detectTaskType(prompt: string): TaskType {
  for (const { task, patterns } of TASK_PATTERNS) {
    if (patterns.test(prompt)) return task;
  }
  return "simple-qa";
}

export function analyzeComplexity(prompt: string): ComplexityResult {
  let score = 0;
  const signals: string[] = [];

  const tokenCount = estimateTokens(prompt);
  const codeBlockCount = detectCodeBlocks(prompt);
  const hasCode = codeBlockCount > 0;
  const taskType = detectTaskType(prompt);

  // ── Signal 1: Token count ─────────────────────────────────
  if (tokenCount > 500) {
    score += 30;
    signals.push(`Long prompt (${tokenCount} tokens) +30`);
  } else if (tokenCount > 200) {
    score += 15;
    signals.push(`Medium prompt (${tokenCount} tokens) +15`);
  } else {
    signals.push(`Short prompt (${tokenCount} tokens) +0`);
  }

  // ── Signal 2: Code blocks ─────────────────────────────────
  if (codeBlockCount >= 2) {
    score += 30;
    signals.push(`Multiple code blocks (${codeBlockCount}) +30`);
  } else if (codeBlockCount === 1) {
    score += 20;
    signals.push(`Code block detected +20`);
  }

  // ── Signal 3: Task type ───────────────────────────────────
  const taskScores: Record<TaskType, number> = {
    "architect":   35,
    "debug":       25,
    "refactor":    25,
    "code":        20,
    "analyze":     15,
    "long-context":15,
    "explain":      5,
    "summarize":    5,
    "translate":    5,
    "classify":     0,
    "simple-qa":    0,
  };

  const taskScore = taskScores[taskType] ?? 0;
  score += taskScore;
  signals.push(`Task: ${taskType} +${taskScore}`);

  // Cap at 100
  score = Math.min(100, score);

  return {
    score,
    taskType,
    tokenCount,
    hasCode,
    codeBlockCount,
    signals,
  };
}