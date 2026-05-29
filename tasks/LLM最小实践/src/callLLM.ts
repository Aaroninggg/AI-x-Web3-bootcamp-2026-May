// LLM 调用：使用 OpenAI-compatible API
// 配置通过环境变量传入

export interface LLMConfig {
  apiKey: string;
  baseUrl: string;
  model: string;
}

function getLLMConfig(): LLMConfig {
  return {
    apiKey: process.env.LLM_API_KEY || "",
    baseUrl: process.env.LLM_BASE_URL || "https://api.openai.com/v1",
    model: process.env.LLM_MODEL || "gpt-4o-mini",
  };
}

export async function callLLM(
  systemPrompt: string,
  userPrompt: string
): Promise<string> {
  const config = getLLMConfig();

  if (!config.apiKey) {
    throw new Error(
      "LLM_API_KEY 未设置。请在 .env 文件中配置 LLM_API_KEY。"
    );
  }

  const response = await fetch(`${config.baseUrl}/chat/completions`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${config.apiKey}`,
    },
    body: JSON.stringify({
      model: config.model,
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: userPrompt },
      ],
      temperature: 0.3, // 低温度，减少幻觉
      max_tokens: 4096,
    }),
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(
      `LLM API 请求失败 (${response.status}): ${errorText.slice(0, 500)}`
    );
  }

  const data = (await response.json()) as {
    choices: Array<{
      message: { content: string };
    }>;
  };

  const content = data.choices?.[0]?.message?.content;
  if (!content) {
    throw new Error("LLM 返回了空内容");
  }

  return content;
}
