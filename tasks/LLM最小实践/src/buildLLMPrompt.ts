// 构建发送给 LLM 的提示词
// 按照需求文档第 10 节的严格要求

import type { TxDetail, TxReceiptInfo } from "./fetchTransaction.js";
import type { DecodedInput } from "./decodeInput.js";
import type { DecodedLog } from "./decodeLogs.js";
import type { ChainConfig } from "./chains.js";

export interface StructuredData {
  chain: ChainConfig;
  tx: TxDetail;
  receipt: TxReceiptInfo;
  decodedInput: DecodedInput;
  decodedLogs: DecodedLog[];
  abiSources: Record<string, string>; // address -> source
}

export function buildSystemPrompt(): string {
  return `你是一个区块链交易解释助手。你的任务是基于提供的链上结构化数据解释交易含义。

要求：
1. 只能把链上字段中明确存在的信息称为事实。
2. 对无法直接从链上确认的信息，必须标记为"模型推断"或"不确定"。
3. 不要编造合约名称、项目名称、地址归属或用户意图。
4. 不要提供投资建议。
5. 不要承诺交易安全。
6. 输出必须包含以下六个部分：
   - 用户发起了什么动作
   - 涉及哪些资产和地址
   - 哪些信息来自链上数据
   - 哪些信息是模型推断
   - 模型不确定的地方
   - 如果要签类似交易，用户应该检查什么

输出格式：使用 Markdown，用中文回答。`;
}

export function buildUserPrompt(data: StructuredData): string {
  const { chain, tx, receipt, decodedInput, decodedLogs, abiSources } = data;

  let prompt = `## 链上结构化数据

### 网络信息
- 网络名称：${chain.name}
- Chain ID：${chain.chainId}

### 交易详情
- 交易哈希：${tx.hash}
- 区块号：${tx.blockNumber?.toString() ?? "未知"}
- 区块时间：${tx.blockTimestamp ?? "未知"}
- 发起地址（from）：${tx.from}
- 接收地址（to）：${tx.to ?? "(合约创建)"}
- ETH 转账金额（value）：${tx.value} wei
- Gas 限额：${tx.gas}
- Gas 价格：${tx.gasPrice ?? "EIP-1559"}
- Max Fee Per Gas：${tx.maxFeePerGas ?? "N/A"}
- Max Priority Fee Per Gas：${tx.maxPriorityFeePerGas ?? "N/A"}
- Nonce：${tx.nonce}
- Input Data：${tx.input.slice(0, 200)}${tx.input.length > 200 ? "..." : ""}

### Receipt 信息
- 交易状态：${receipt.status === "success" ? "成功" : receipt.status === "failed" ? "失败" : "未知"}
- Gas 实际使用量：${receipt.gasUsed}
- 有效 Gas 价格：${receipt.effectiveGasPrice}
- 累计 Gas 使用量：${receipt.cumulativeGasUsed}
- 合约地址（如为部署）：${receipt.contractAddress ?? "N/A"}

### 解码的交易方法调用
`;

  if (decodedInput.decoded && decodedInput.methodName) {
    prompt += `- 方法名：${decodedInput.methodName}\n`;
    if (decodedInput.params && Object.keys(decodedInput.params).length > 0) {
      prompt += `- 参数：\n`;
      for (const [key, val] of Object.entries(decodedInput.params)) {
        prompt += `  - ${key}: ${JSON.stringify(val)}\n`;
      }
    }
  } else {
    prompt += `- 状态：未解码\n`;
    if (decodedInput.note) {
      prompt += `- 原因：${decodedInput.note}\n`;
    }
  }

  prompt += `\n### 事件日志（共 ${decodedLogs.length} 条）\n\n`;

  for (const log of decodedLogs) {
    prompt += `#### Log #${log.logIndex}\n`;
    prompt += `- 合约地址：${log.address}\n`;
    if (log.decoded && log.eventName) {
      prompt += `- 事件名：${log.eventName}\n`;
      if (log.note) prompt += `- 来源：${log.note}\n`;
      if (log.params && Object.keys(log.params).length > 0) {
        prompt += `- 参数：\n`;
        for (const [key, val] of Object.entries(log.params)) {
          prompt += `  - ${key}: ${JSON.stringify(val)}\n`;
        }
      }
    } else {
      prompt += `- 状态：未解码\n`;
      if (log.note) prompt += `- 原因：${log.note}\n`;
      prompt += `- Topics：${log.topics.join(", ")}\n`;
    }
    prompt += "\n";
  }

  prompt += `### ABI 获取情况\n`;
  for (const [addr, source] of Object.entries(abiSources)) {
    const label =
      source === "explorer"
        ? "已验证合约 ABI 已获取"
        : source === "builtin"
          ? "仅内置标准事件"
          : "ABI 未获取到";
    prompt += `- ${addr}: ${label}\n`;
  }

  prompt += `\n请按照系统提示词要求的六个部分，生成这笔交易的 Markdown 解释。`;

  return prompt;
}
