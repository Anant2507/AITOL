import { MRLLayerResult } from "../types";

// Rewrites verbose instruction patterns into terse imperative form.
// "I would like you to please write me a function that..." → "Write FNC:"
// Works by detecting common verbose openings and stripping them.

const VERBOSE_PATTERNS: Array<{ pattern: RegExp; replacement: string }> = [
  // "I want you to / I would like you to / Can you" → strip entirely
  
    {
    pattern: /^(i want you to please|i would like you to please|i'd like you to please)\s*/i,
    replacement: "",
  },
  {
    pattern: /^(i want you to|i would like you to|i'd like you to)\s*/i,
    replacement: "",
  },
  {
    pattern: /^(can you please|could you please|can you|could you)\s*/i,
    replacement: "",
  },
  {
    pattern: /^(please can you|please could you)\s*/i,
    replacement: "",
  },
  {
    pattern: /^(i need you to|i need)\s*/i,
    replacement: "",
  },
  {
    pattern: /^(help me to|help me)\s*/i,
    replacement: "",
  },
  {
    pattern: /^(your task is to|your job is to|you are asked to)\s*/i,
    replacement: "",
  },
  {
    pattern: /^(please|kindly)\s*/i,
    replacement: "",
  },

  // "Write me a" → "Write a"
  {
    pattern: /\bwrite me (a|an|the)\b/gi,
    replacement: "write $1",
  },

  // "Give me a" → just the action
  {
    pattern: /\bgive me (a|an|the)\b/gi,
    replacement: "provide $1",
  },

  // "Tell me how to" → "How to" / "Explain how to"
  {
    pattern: /\btell me how to\b/gi,
    replacement: "explain how to",
  },

  // "Tell me what" → "What is"
  {
    pattern: /\btell me what (is|are|was|were)\b/gi,
    replacement: "what $1",
  },

  // "Make me a" → "Create a"
  {
    pattern: /\bmake me (a|an|the)\b/gi,
    replacement: "create $1",
  },

  // "Do you know how to" → "How to"
  {
    pattern: /\bdo you know how to\b/gi,
    replacement: "how to",
  },

  // "Is it possible to" → just the action
  {
    pattern: /\bis it possible to\b/gi,
    replacement: "",
  },

  // "I am looking for" → "Find"
  {
    pattern: /\bi('?m| am) looking for\b/gi,
    replacement: "find",
  },

  // "I am trying to" → strip
  {
    pattern: /\bi('?m| am) trying to\b/gi,
    replacement: "",
  },

  // "What would be the best way to" → "Best way to"
  {
    pattern: /\bwhat would be the best way to\b/gi,
    replacement: "best way to",
  },

  // "What is the best way to" → "Best way to"
  {
    pattern: /\bwhat is the best way to\b/gi,
    replacement: "best way to",
  },

  // "I need you to:" → strip (common in list-style prompts)
  {
    pattern: /\bi need you to:\s*/gi,
    replacement: "",
  },

  // "I want you to:" → strip
  {
    pattern: /\bi want you to:\s*/gi,
    replacement: "",
  },

  // "Your task is to:" → strip
  {
    pattern: /\byour task is to:\s*/gi,
    replacement: "",
  },

  // "Do the following:" → ":"
  {
    pattern: /\bdo the following:\s*/gi,
    replacement: "",
  },

  // "Please do the following" → strip
  {
    pattern: /\bplease do the following[:\s]*/gi,
    replacement: "",
  },

  // "The text is about" → "Topic:"
  {
    pattern: /\bthe text is about\b/gi,
    replacement: "Topic:",
  },

  // "The following text" → "Text:"
  {
    pattern: /\bthe following text\b/gi,
    replacement: "Text:",
  },

  // "The following" → "§WRK" (already in static dict, but catch here too)
  {
    pattern: /\bthe following\b/gi,
    replacement: "§WRK",
  },

  // Remove trailing pleasantries
  {
    pattern: /[,.]?\s*(thank you|thanks|cheers|appreciated|much appreciated)[.!]?\s*$/gi,
    replacement: "",
  },

  // Remove opening "Hi" / "Hello" / "Hey Claude"
  {
    pattern: /^(hi|hello|hey|hey claude|hi claude|hello claude)[,!.]?\s*/gi,
    replacement: "",
  },
];

export function l6Normalization(text: string): MRLLayerResult {
  const original = text;
  let t = text;

  for (const { pattern, replacement } of VERBOSE_PATTERNS) {
    t = t.replace(pattern, replacement);
  }

  // Capitalize first letter after normalization
  t = t.charAt(0).toUpperCase() + t.slice(1);

  // Clean up double spaces
  t = t.replace(/ {2,}/g, " ").trim();

  const saved = Math.max(0, original.length - t.length);

  return {
    text: t,
    tokensSaved: Math.round(saved / 4),
    layerName: "L6-Normalization",
  };
}