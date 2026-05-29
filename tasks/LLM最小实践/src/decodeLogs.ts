// 解码事件日志：根据 ABI 解析事件名和参数
import { decodeEventLog, type Abi } from "viem";
import type { LogInfo } from "./fetchTransaction.js";
import type { AbiItem } from "./fetchAbi.js";
import { STANDARD_EVENT_ABIS } from "./fetchAbi.js";

export interface DecodedLog {
  logIndex: number;
  address: string;
  decoded: boolean;
  eventName?: string;
  params?: Record<string, unknown>;
  topics: string[];
  data: string;
  note?: string;
}

// 合并合约 ABI 和标准事件 ABI 进行解码
function mergeAbis(
  contractAbi: AbiItem[] | null,
  standardEvents: AbiItem[]
): AbiItem[] {
  if (!contractAbi) return standardEvents;
  return [...contractAbi, ...standardEvents];
}

export function decodeLogs(
  logs: LogInfo[],
  abiMap: Map<
    string,
    { abi: AbiItem[] | null; source: string }
  >
): DecodedLog[] {
  return logs.map((log, idx) => {
    const addrKey = log.address.toLowerCase();
    const abiInfo = abiMap.get(addrKey);
    const contractAbi = abiInfo?.abi ?? null;

    // 合并合约 ABI + 标准事件 ABI
    const mergedAbi = mergeAbis(contractAbi, STANDARD_EVENT_ABIS as AbiItem[]);

    try {
      const result = decodeEventLog({
        abi: mergedAbi as Abi,
        data: log.data as `0x${string}`,
        topics: log.topics as [signature: `0x${string}`, ...args: `0x${string}`[]],
      });

      // 只关心有名字的事件
      if (!result.eventName) {
        return {
          logIndex: log.logIndex,
          address: log.address,
          decoded: false,
          topics: log.topics,
          data: log.data,
          note: "事件签名未匹配任何已知 ABI",
        };
      }

      // 转换参数
      const params: Record<string, unknown> = {};
      if (result.args) {
        const args = result.args as unknown as Record<string, unknown>;
        for (const [key, val] of Object.entries(args)) {
          params[key] = typeof val === "bigint" ? val.toString() : val;
        }
      }

      // 标记解码来源
      let sourceNote: string | undefined;
      if (abiInfo?.source === "explorer") {
        sourceNote = undefined; // 完整 ABI 解码，无需额外说明
      } else if (abiInfo?.source === "builtin") {
        sourceNote = "通过内置标准事件 ABI 解码";
      } else {
        sourceNote = "通过内置标准事件 ABI 解码（合约 ABI 未获取到）";
      }

      return {
        logIndex: log.logIndex,
        address: log.address,
        decoded: true,
        eventName: result.eventName,
        params,
        topics: log.topics,
        data: log.data,
        note: sourceNote,
      };
    } catch {
      return {
        logIndex: log.logIndex,
        address: log.address,
        decoded: false,
        topics: log.topics,
        data: log.data,
        note:
          abiInfo?.source === "none"
            ? "该合约 ABI 未获取到，无法完全解码"
            : "事件解码失败",
      };
    }
  });
}
