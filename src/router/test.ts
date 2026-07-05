import { routePrompt } from "./index";

const testCases = [
  {
    label: "Simple Q&A",
    prompt: "What is the capital of France?",
    options: {},
  },
  {
    label: "Explain concept",
    prompt: "Could you please explain how closures work in javascript with examples?",
    options: {},
  },
  {
    label: "Code generation",
    prompt: "Implement a rest api in typescript with authentication and error handling step by step.",
    options: {},
  },
  {
    label: "Debug code",
    prompt: "Fix this function:\n```typescript\nfunction calculateAverageOfNumbers(numberArray: number[]): number {\n  let totalSum = 0;\n  for (let index = 0; index < numberArray.length; index++) {\n    totalSum += numberArray[index];\n  }\n  return totalSum / numberArray.length;\n}\n```",
    options: {},
  },
  {
    label: "Architect request",
    prompt: "Design a microservice architecture for an e-commerce platform with authentication, database, and api gateway.",
    options: {},
  },
  {
    label: "User forces fast tier",
    prompt: "Implement a complex distributed system with multiple microservices.",
    options: { quality: "fast" as const },
  },
  {
    label: "User forces best tier",
    prompt: "What is 2 + 2?",
    options: { quality: "best" as const },
  },
];

console.log("=".repeat(60));
for (const tc of testCases) {
  const result = routePrompt(tc.prompt, tc.options);
  console.log(`TEST: ${tc.label}`);
  console.log(`  Model:      ${result.model}`);
  console.log(`  Tier:       ${result.tier}`);
  console.log(`  Score:      ${result.complexity.score}/100`);
  console.log(`  Task:       ${result.complexity.taskType}`);
  console.log(`  Reason:     ${result.reason}`);
  console.log(`  Est. cost:  $${result.estimatedCost.toFixed(6)}`);
  console.log(`  Signals:    ${result.complexity.signals.join(" | ")}`);
  console.log("=".repeat(60));
}