// 交易详情、Receipt、事件日志读取
// 使用 viem 库与链上 RPC 交互

import {
  createPublicClient,
  http,
} from "viem";
import { getChainConfig } from "./chains.js";

// eslint-disable-next-line @typescript-eslint/no-explicit-any
let client: any = null;

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function getClient(): any {
  if (!client) {
    const config = getChainConfig();
    client = createPublicClient({
      transport: http(config.rpcUrl),
    });
  }
  return client;
}

export interface TxDetail {
  hash: string;
  blockNumber: bigint | null;
  blockTimestamp: string | null;
  from: string;
  to: string | null;
  value: string;
  input: string;
  gas: string;
  gasPrice: string | null;
  maxFeePerGas: string | null;
  maxPriorityFeePerGas: string | null;
  nonce: number;
  chainId: number;
}

export interface LogInfo {
  address: string;
  topics: string[];
  data: string;
  logIndex: number;
  transactionIndex: number;
  removed: boolean;
}

export interface TxReceiptInfo {
  status: "success" | "failed" | "unknown";
  gasUsed: string;
  effectiveGasPrice: string;
  contractAddress: string | null;
  logs: LogInfo[];
  cumulativeGasUsed: string;
}

export interface FetchedData {
  tx: TxDetail;
  receipt: TxReceiptInfo;
  involvedAddresses: string[];
}

// 通用 RPC 调用辅助类型
// eslint-disable-next-line @typescript-eslint/no-explicit-any
type AnyTx = any;
// eslint-disable-next-line @typescript-eslint/no-explicit-any
type AnyReceipt = any;
// eslint-disable-next-line @typescript-eslint/no-explicit-any
type AnyBlock = any;

// 获取交易详情
async function fetchTransaction(
  c: any,
  hash: `0x${string}`
): Promise<AnyTx> {
  const tx = await c.getTransaction({ hash });
  if (!tx) {
    throw new Error(`未找到交易: ${hash}`);
  }
  return tx;
}

// 获取交易 receipt
async function fetchReceipt(
  c: any,
  hash: `0x${string}`
): Promise<AnyReceipt> {
  const receipt = await c.getTransactionReceipt({ hash });
  if (!receipt) {
    throw new Error(`未找到交易 receipt: ${hash}`);
  }
  return receipt;
}

// 获取区块时间戳
async function fetchBlockTimestamp(
  c: any,
  blockNumber: bigint
): Promise<string> {
  const block = (await c.getBlock({ blockNumber })) as AnyBlock;
  const ts = Number(block.timestamp) * 1000;
  return new Date(ts).toISOString();
}

// 格式化交易详情
function formatTxDetail(
  tx: AnyTx,
  blockTimestamp: string | null,
  chainId: number
): TxDetail {
  return {
    hash: tx.hash,
    blockNumber: tx.blockNumber ?? null,
    blockTimestamp,
    from: tx.from,
    to: tx.to ?? null,
    value: tx.value.toString(),
    input: tx.input,
    gas: tx.gas.toString(),
    gasPrice: tx.gasPrice?.toString() ?? null,
    maxFeePerGas: tx.maxFeePerGas?.toString() ?? null,
    maxPriorityFeePerGas: tx.maxPriorityFeePerGas?.toString() ?? null,
    nonce: tx.nonce,
    chainId,
  };
}

// 格式化 receipt 信息
function formatReceiptInfo(receipt: AnyReceipt): TxReceiptInfo {
  return {
    status:
      receipt.status === "success"
        ? "success"
        : receipt.status === "reverted"
          ? "failed"
          : "unknown",
    gasUsed: receipt.gasUsed.toString(),
    effectiveGasPrice: receipt.effectiveGasPrice.toString(),
    contractAddress: receipt.contractAddress ?? null,
    cumulativeGasUsed: receipt.cumulativeGasUsed.toString(),
    logs: (receipt.logs as AnyTx[]).map((log: AnyTx, idx: number) => ({
      address: log.address,
      topics: log.topics,
      data: log.data,
      logIndex: log.logIndex ?? idx,
      transactionIndex: log.transactionIndex ?? 0,
      removed: log.removed ?? false,
    })),
  };
}

// 收集交易中涉及的所有地址
function collectInvolvedAddresses(
  tx: AnyTx,
  receipt: AnyReceipt
): string[] {
  const addrSet = new Set<string>();
  addrSet.add(tx.from.toLowerCase());
  if (tx.to) addrSet.add(tx.to.toLowerCase());
  if (receipt.contractAddress)
    addrSet.add(receipt.contractAddress.toLowerCase());

  const logs: AnyTx[] = receipt.logs ?? [];
  for (const log of logs) {
    addrSet.add(log.address.toLowerCase());
  }

  // 从 Transfer 事件日志中提取地址 (topics[1], topics[2])
  const transferTopic =
    "0xddf252ad1be2c89b69c2b068fc378daa952ba7f163c4a11628f55a4df523b3ef";
  for (const log of logs) {
    if (
      log.topics &&
      log.topics[0] === transferTopic &&
      log.topics.length >= 3
    ) {
      const fromAddr = "0x" + log.topics[1].slice(26);
      const toAddr = "0x" + log.topics[2].slice(26);
      addrSet.add(fromAddr.toLowerCase());
      addrSet.add(toAddr.toLowerCase());
    }
  }
  return Array.from(addrSet);
}

// 主入口：获取所有链上数据
export async function fetchAllTxData(
  txHash: string
): Promise<FetchedData> {
  const config = getChainConfig();
  const c = getClient();

  if (!txHash.startsWith("0x") || txHash.length !== 66) {
    throw new Error(`无效的交易哈希格式: ${txHash}`);
  }

  const hash = txHash as `0x${string}`;

  const [tx, receipt] = await Promise.all([
    fetchTransaction(c, hash),
    fetchReceipt(c, hash),
  ]);

  let blockTimestamp: string | null = null;
  if (tx.blockNumber) {
    try {
      blockTimestamp = await fetchBlockTimestamp(c, tx.blockNumber);
    } catch {
      // 某些 RPC 可能不支持，忽略
    }
  }

  const txDetail = formatTxDetail(tx, blockTimestamp, config.chainId);
  const receiptInfo = formatReceiptInfo(receipt);
  const involvedAddresses = collectInvolvedAddresses(tx, receipt);

  return {
    tx: txDetail,
    receipt: receiptInfo,
    involvedAddresses,
  };
}
