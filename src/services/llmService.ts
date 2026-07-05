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
  const response = await fetch("https://openrouter.ai/api/v1/chat/completions", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "Authorization": `Bearer ${process.env.OPENROUTER_API_KEY}`,
      "HTTP-Referer": "http://localhost:3000", // optional, helps OpenRouter identify your app
      "X-Title": "AITOL", // optional, shows up in OpenRouter dashboard
    },
    body: JSON.stringify({
      model: req.model,
      messages: [
        ...(req.params?.systemInstruction
          ? [{ role: "system", content: req.params.systemInstruction }]
          : []),
        { role: "user", content: req.prompt },
      ],
      temperature: req.params?.temperature ?? 0,
    }),
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`OpenRouter API error (${response.status}): ${errorText}`);
  }

  const data = await response.json();
  const text = data.choices?.[0]?.message?.content || "";

  return {
    text,
    tokensUsed: data.usage?.total_tokens || 0,
  };
}