import { mrlCompressor } from "./index";

const prompts = [
  "Could you please explain how to implement a rest api in typescript with error handling step by step?",
  "Hey Claude, I would like you to please write me a function that calculates the difference between two arrays in javascript. Thank you.",
  "Hello! Can you help me create a database schema for a user authentication system? Make sure to include environment variables and best practices.",
  "## Task\nI need you to:\n- Summarize the following text\n- List the key points\n- Provide a conclusion\n\nThe text is about machine learning and how it is basically changing the world.",
];

console.log("=".repeat(60));
for (const prompt of prompts) {
  const result = mrlCompressor.compress(prompt);
  console.log("ORIGINAL:   ", result.original);
  console.log("COMPRESSED: ", result.compressed);
  console.log("RATIO:      ", result.compressionRatio + "% saved");
  console.log("TOKENS:     ", result.originalTokenCount, "→", result.compressedTokenCount);
  console.log("LAYERS:");
  result.layerResults.forEach(l =>
    console.log(`  ${l.layerName}: ${l.tokensSaved} tokens saved`)
  );
  console.log("=".repeat(60));
}