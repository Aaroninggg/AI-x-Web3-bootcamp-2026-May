#!/usr/bin/env node
// 交易解释器 MVP - CLI 入口
// 用法: npm run explain -- --tx 0x交易哈希

import "dotenv/config";
import { getChainConfig } from "./chains.js";
import { fetchAllTxData } from "./fetchTransaction.js";
import { getAbisForAddresses } from "./fetchAbi.js";
import { decodeTransactionInput } from "./decodeInput.js";
import { decodeLogs } from "./decodeLogs.js";
import { buildSystemPrompt, buildUserPrompt } from "./buildLLMPrompt.js";
import { callLLM } from "./callLLM.js";
import { formatOutput } from "./formatOutput.js";

async function parseArgs(): Promise<string> {
  const args = process.argv.slice(2);
  let txHash = "";

  for (let i = 0; i < args.length; i++) {
    if (args[i] === "--tx" && i + 1 < args.length) {
      txHash = args[i + 1];
      i++;
    } else if (args[i].startsWith("--tx=")) {
      txHash = args[i].slice(5);
    } else if (args[i].startsWith("0x") && args[i].length === 66) {
      txHash = args[i];
    }
  }

  if (!txHash) {
    console.error("用法: npm run explain -- --tx <交易哈希>");
    console.error("示例: npm run explain -- --tx 0xc2f3098906d406dfef5511711ef0c86ecfe233a54242af79060bf8807ee5b73c");
    process.exit(1);
  }

  return txHash;
}

async function loadEnvFile(): Promise<void> {
  // dotenv/config 已自动加载 .env
  // 检查必须的配置项
  const missing: string[] = [];
  if (!process.env.LLM_API_KEY) {
    missing.push("LLM_API_KEY");
  }
  if (missing.length > 0) {
    console.error(`错误：缺少必需的环境变量: ${missing.join(", ")}`);
    console.error("请复制 .env.example 为 .env 并填写配置");
    process.exit(1);
  }
}

async function main() {
  const txHash = await parseArgs();
  await loadEnvFile();

  const config = getChainConfig();
  console.log(`🔗 网络: ${config.name} (Chain ID: ${config.chainId})`);
  console.log(`🔍 正在读取交易: ${txHash}`);
  console.log();

  try {
    // Step 1: 读取交易数据
    console.log("📡 读取链上数据...");
    const { tx, receipt, involvedAddresses } = await fetchAllTxData(txHash);
    console.log(`   ✅ 交易详情已获取 (区块 ${tx.blockNumber})`);
    console.log(`   ✅ Receipt 已获取 (${receipt.logs.length} 条日志)`);
    console.log(`   ✅ 涉及 ${involvedAddresses.length} 个地址`);
    console.log();

    // Step 2: 获取 ABI
    console.log("📋 获取合约 ABI...");
    const abiMap = await getAbisForAddresses(involvedAddresses);
    let abiCount = 0;
    const abiSources: Record<string, string> = {};
    for (const [addr, info] of abiMap) {
      abiSources[addr] = info.source;
      if (info.abi) abiCount++;
    }
    console.log(`   ✅ ${abiCount}/${abiMap.size} 个合约获取到 ABI`);
    console.log();

    // Step 3: 解码
    console.log("🔓 解码交易数据...");
    const toAbi = tx.to
      ? abiMap.get(tx.to.toLowerCase())?.abi ?? null
      : null;
    const decodedInput = decodeTransactionInput(tx.input, tx.to, toAbi);
    const decodedLogs = decodeLogs(receipt.logs, abiMap);
    const decodedLogCount = decodedLogs.filter((l) => l.decoded).length;
    console.log(
      `   ✅ 交易方法${decodedInput.decoded ? `已解码: ${decodedInput.methodName}` : "未解码"}`
    );
    console.log(`   ✅ ${decodedLogCount}/${decodedLogs.length} 条日志已解码`);
    console.log();

    // Step 4: 构建 LLM prompt 并调用
    console.log("🤖 调用 LLM 生成解释...");
    const systemPrompt = buildSystemPrompt();
    const userPrompt = buildUserPrompt({
      chain: config,
      tx,
      receipt,
      decodedInput,
      decodedLogs,
      abiSources,
    });

    const llmResponse = await callLLM(systemPrompt, userPrompt);
    console.log("   ✅ LLM 已生成解释");
    console.log();

    // Step 5: 输出
    console.log("=".repeat(60));
    console.log();
    console.log(formatOutput(llmResponse, txHash));

  } catch (err) {
    console.error();
    console.error("❌ 错误:", err instanceof Error ? err.message : err);
    process.exit(1);
  }
}

main();
