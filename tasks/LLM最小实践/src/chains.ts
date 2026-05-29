// 链配置：支持 Sepolia 测试网和 Ethereum 主网
// 通过环境变量 CHAIN 切换

export interface ChainConfig {
  name: string;
  chainId: number;
  rpcUrl: string;
  blockExplorerApiUrl: string;
  blockExplorerApiKey: string;
}

function getEnv(key: string, fallback: string = ""): string {
  return process.env[key] || fallback;
}

export function getChainConfig(): ChainConfig {
  const chain = (getEnv("CHAIN", "sepolia")).toLowerCase();

  if (chain === "mainnet" || chain === "ethereum") {
    return {
      name: "Ethereum Mainnet",
      chainId: 1,
      rpcUrl: getEnv("RPC_URL", "https://eth.llamarpc.com"),
      blockExplorerApiUrl: "https://api.etherscan.io/api",
      blockExplorerApiKey: getEnv("BLOCK_EXPLORER_API_KEY"),
    };
  }

  // 默认 Sepolia
  return {
    name: "Sepolia Testnet",
    chainId: 11155111,
    rpcUrl: getEnv("RPC_URL", "https://sepolia.drpc.org"),
    blockExplorerApiUrl: "https://api-sepolia.etherscan.io/api",
    blockExplorerApiKey: getEnv("BLOCK_EXPLORER_API_KEY"),
  };
}
