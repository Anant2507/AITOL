import { generateEmbedding, cosineSimilarity } from "./services/embeddingService";

async function test() {
  console.log("Generating embeddings...");
  const a = await generateEmbedding("What is the capital of France?");
  const b = await generateEmbedding("what's france's capital city?");
  const c = await generateEmbedding("How do I bake a chocolate cake?");

  console.log("Similarity (similar questions):", cosineSimilarity(a, b));
  console.log("Similarity (different questions):", cosineSimilarity(a, c));
  process.exit(0);
}

test();