interface LLMRequest {
  prompt: string;
  model: string;
  params?: Record<string, any>;
}

interface LLMResponse {
  text: string;
  tokensUsed: number;
}

export async function callLLM(req: LLMRequest): Promise<LLMResponse> {
  const response = await fetch("https://api.anthropic.com/v1/messages", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "x-api-key": process.env.ANTHROPIC_API_KEY || "",
      "anthropic-version": "2023-06-01",
    },
    body: JSON.stringify({
      model: req.model,
      max_tokens: 1000,
      messages: [{ role: "user", content: req.prompt }],
    }),
  });

  const data = await response.json();
  const text = data.content?.[0]?.text || "";

  return {
    text,
    tokensUsed: data.usage?.output_tokens || 0,
  };
}