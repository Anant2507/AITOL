import { cceCompressor } from "./index";

const prompts = [
  `Fix this function:
\`\`\`typescript
// Helper function to calculate average
function calculateAverageOfNumbers(numberArray: number[]): number {
  // Sum all numbers
  let totalSum = 0;
  for (let index = 0; index < numberArray.length; index++) {
    totalSum += numberArray[index];
  }
  return totalSum / numberArray.length;
}
\`\`\``,

  `Can you review this python code?
\`\`\`python
# This function fetches user data from the database
def fetch_user_data_from_database(user_identifier, database_connection):
    # Build the query string
    query_string = f"SELECT * FROM users WHERE id = {user_identifier}"
    # Execute and return results
    result_set = database_connection.execute(query_string)
    return result_set.fetchall()
\`\`\``,

  `Could you please explain how closures work in javascript?`,

  `Compare these two functions:
\`\`\`javascript
function getUserFullName(userObject) {
  return userObject.firstName + ' ' + userObject.lastName;
}
\`\`\`
and
\`\`\`javascript
const getUserFullName = (userObject) => \`\${userObject.firstName} \${userObject.lastName}\`;
\`\`\``,
];

console.log("=".repeat(60));
for (let i = 0; i < prompts.length; i++) {
  const result = cceCompressor.compress(prompts[i]);
  console.log(`TEST ${i + 1}`);
  console.log("CODE BLOCKS FOUND:", result.codeBlocksFound);
  console.log("ORIGINAL TOKENS:  ", result.originalCodeTokens);
  console.log("COMPRESSED TOKENS:", result.compressedCodeTokens);
  console.log("RATIO:            ", result.compressionRatio + "% saved");
  console.log("COMPRESSED PROMPT:\n", result.compressedPrompt);
  if (Object.keys(result.symbolMap).length > 0) {
    console.log("SYMBOL MAP:", result.symbolMap);
  }
  console.log("=".repeat(60));
}