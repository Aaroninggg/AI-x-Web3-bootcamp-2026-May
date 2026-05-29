// 格式化输出：将 LLM 返回的 Markdown 文本直接输出

export function formatOutput(llmResponse: string, txHash: string): string {
  const lines: string[] = [];

  lines.push(`# 交易解释`);
  lines.push("");
  lines.push(`> 交易哈希: \`${txHash}\``);
  lines.push("");
  lines.push("---");
  lines.push("");
  lines.push(llmResponse);
  lines.push("");
  lines.push("---");
  lines.push("");
  lines.push(
    `*免责声明：本解释由 AI 基于链上数据生成，不构成任何投资、法律或税务建议。*`
  );

  return lines.join("\n");
}
