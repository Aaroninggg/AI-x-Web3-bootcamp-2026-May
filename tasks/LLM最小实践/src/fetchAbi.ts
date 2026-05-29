// ABI 获取：区块浏览器 API + 内置标准事件 ABI
// 按优先级: 1) 区块浏览器已验证合约 ABI
//           2) 内置标准事件 ABI (ERC20/721/1155)
//           3) 返回 null，不编造

import { getChainConfig } from "./chains.js";

// ---- 内置标准事件 ABI ----
// 即使合约 ABI 无法获取，这些标准事件可用于解码日志

export const STANDARD_EVENT_ABIS = [
  // ERC20 Transfer
  {
    type: "event",
    name: "Transfer",
    inputs: [
      { indexed: true, name: "from", type: "address" },
      { indexed: true, name: "to", type: "address" },
      { indexed: false, name: "value", type: "uint256" },
    ],
  },
  // ERC20 Approval
  {
    type: "event",
    name: "Approval",
    inputs: [
      { indexed: true, name: "owner", type: "address" },
      { indexed: true, name: "spender", type: "address" },
      { indexed: false, name: "value", type: "uint256" },
    ],
  },
  // ERC721 Transfer
  {
    type: "event",
    name: "Transfer",
    inputs: [
      { indexed: true, name: "from", type: "address" },
      { indexed: true, name: "to", type: "address" },
      { indexed: true, name: "tokenId", type: "uint256" },
    ],
  },
  // ERC721 Approval
  {
    type: "event",
    name: "Approval",
    inputs: [
      { indexed: true, name: "owner", type: "address" },
      { indexed: true, name: "approved", type: "address" },
      { indexed: true, name: "tokenId", type: "uint256" },
    ],
  },
  // ERC721 ApprovalForAll
  {
    type: "event",
    name: "ApprovalForAll",
    inputs: [
      { indexed: true, name: "owner", type: "address" },
      { indexed: true, name: "operator", type: "address" },
      { indexed: false, name: "approved", type: "bool" },
    ],
  },
  // ERC1155 TransferSingle
  {
    type: "event",
    name: "TransferSingle",
    inputs: [
      { indexed: true, name: "operator", type: "address" },
      { indexed: true, name: "from", type: "address" },
      { indexed: true, name: "to", type: "address" },
      { indexed: false, name: "id", type: "uint256" },
      { indexed: false, name: "value", type: "uint256" },
    ],
  },
  // ERC1155 TransferBatch
  {
    type: "event",
    name: "TransferBatch",
    inputs: [
      { indexed: true, name: "operator", type: "address" },
      { indexed: true, name: "from", type: "address" },
      { indexed: true, name: "to", type: "address" },
      { indexed: false, name: "ids", type: "uint256[]" },
      { indexed: false, name: "values", type: "uint256[]" },
    ],
  },
];

// ABI 项类型
export interface AbiItem {
  type: string;
  name?: string;
  inputs?: Array<{
    indexed?: boolean;
    name: string;
    type: string;
    internalType?: string;
  }>;
  outputs?: Array<{
    name: string;
    type: string;
  }>;
  stateMutability?: string;
}

// ABI 缓存，避免重复请求
const abiCache = new Map<string, AbiItem[] | null>();

// 从区块浏览器 API 获取已验证合约 ABI
async function fetchAbiFromExplorer(
  contractAddress: string
): Promise<AbiItem[] | null> {
  const config = getChainConfig();
  if (!config.blockExplorerApiKey) {
    return null; // 没有 API key，跳过
  }

  const cached = abiCache.get(contractAddress.toLowerCase());
  if (cached !== undefined) return cached;

  try {
    const url = `${config.blockExplorerApiUrl}?module=contract&action=getabi&address=${contractAddress}&apikey=${config.blockExplorerApiKey}`;
    const resp = await fetch(url);
    const data = (await resp.json()) as {
      status: string;
      message: string;
      result: string;
    };

    if (data.status === "1" && data.message === "OK" && data.result) {
      const abi = JSON.parse(data.result) as AbiItem[];
      abiCache.set(contractAddress.toLowerCase(), abi);
      return abi;
    }

    // 合约未验证或其他错误
    abiCache.set(contractAddress.toLowerCase(), null);
    return null;
  } catch {
    abiCache.set(contractAddress.toLowerCase(), null);
    return null;
  }
}

// 获取合约 ABI：先尝试区块浏览器，失败则返回内置标准事件
export async function getContractAbi(
  contractAddress: string
): Promise<{ abi: AbiItem[] | null; source: "explorer" | "builtin" | "none" }> {
  const explorerAbi = await fetchAbiFromExplorer(contractAddress);
  if (explorerAbi) {
    return { abi: explorerAbi, source: "explorer" };
  }

  // 返回 null，调用方将无法完全解码该合约
  return { abi: null, source: "none" };
}

// 获取可用于解码事件日志的 ABI 集合
// 返回: { 合约地址 -> { abi, source } }
export async function getAbisForAddresses(
  addresses: string[]
): Promise<
  Map<string, { abi: AbiItem[] | null; source: "explorer" | "builtin" | "none" }>
> {
  const result = new Map<
    string,
    { abi: AbiItem[] | null; source: "explorer" | "builtin" | "none" }
  >();
  const unique = [...new Set(addresses.map((a) => a.toLowerCase()))];

  await Promise.all(
    unique.map(async (addr) => {
      result.set(addr, await getContractAbi(addr));
    })
  );

  return result;
}

// 获取标准事件 ABI（用于日志解码的兜底方案）
export function getStandardEventAbis(): AbiItem[] {
  return STANDARD_EVENT_ABIS as AbiItem[];
}
