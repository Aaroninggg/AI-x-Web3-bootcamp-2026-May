// 解码交易 input data：根据 ABI 解析方法名和参数
import { decodeFunctionData, type Abi } from "viem";
import type { AbiItem } from "./fetchAbi.js";

export interface DecodedInput {
  decoded: boolean;
  methodName?: string;
  params?: Record<string, unknown>;
  rawInput: string;
  note?: string;
}

export function decodeTransactionInput(
  inputData: string,
  toAddress: string | null,
  abi: AbiItem[] | null
): DecodedInput {
  if (!inputData || inputData === "0x") {
    return {
      decoded: false,
      rawInput: inputData,
      note: "交易 input data 为空（纯 ETH 转账）",
    };
  }

  if (!abi) {
    return {
      decoded: false,
      rawInput: inputData,
      note: `合约 ${toAddress || "(未知)"} 的 ABI 未获取到，无法解码`,
    };
  }

  try {
    // viem 的 decodeFunctionData 需要 Abi 类型
    const result = decodeFunctionData({
      abi: abi as Abi,
      data: inputData as `0x${string}`,
    });

    // 转换参数：处理 bigint
    const params: Record<string, unknown> = {};
    if (result.args) {
      const args = result.args as Array<unknown>;
      const funcAbi = abi.find(
        (item) =>
          item.type === "function" &&
          item.name === result.functionName
      );
      const inputNames =
        funcAbi?.inputs?.map((i) => i.name) ?? [];

      for (let i = 0; i < args.length; i++) {
        const name = inputNames[i] || `param${i}`;
        const val = args[i];
        params[name] =
          typeof val === "bigint" ? val.toString() : val;
      }
    }

    return {
      decoded: true,
      methodName: result.functionName,
      params,
      rawInput: inputData,
    };
  } catch (e) {
    return {
      decoded: false,
      rawInput: inputData,
      note: `解码失败: ${e instanceof Error ? e.message : "未知错误"}。可能 ABI 不匹配`,
    };
  }
}
