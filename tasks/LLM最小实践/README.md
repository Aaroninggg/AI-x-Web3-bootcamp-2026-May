# Transaction Explainer (交易解释器)

A CLI tool that reads an on-chain transaction hash and generates a plain-language explanation using an LLM. No wallet connection, no signing, no transaction submission — read-only interpretation.

## What it does

1. Reads transaction details, receipt, and event logs from the blockchain
2. Attempts to fetch verified contract ABIs from a block explorer
3. Decodes method calls and event logs (falls back to built-in ERC20/721/1155 standard events)
4. Sends structured on-chain data to an LLM for human-readable interpretation
5. Strictly separates: on-chain facts / model inferences / unknowns

## Supported networks

- Sepolia testnet (default)
- Ethereum mainnet

## Tech stack

- TypeScript + Node.js
- [viem](https://viem.sh/) for chain interaction
- OpenAI-compatible LLM API

---

## For Human Users

### Quick start

```bash
npm install
cp .env.example .env
# Edit .env — at minimum set LLM_API_KEY
npm run explain -- --tx 0xTRANSACTION_HASH
```

### Environment variables

| Variable | Required | Default | Description |
|---|---|---|---|
| `LLM_API_KEY` | **Yes** | — | API key for LLM provider |
| `LLM_BASE_URL` | No | `https://api.openai.com/v1` | LLM API endpoint (must be OpenAI-compatible) |
| `LLM_MODEL` | No | `gpt-4o-mini` | Model name to use |
| `CHAIN` | No | `sepolia` | `sepolia` or `mainnet` |
| `RPC_URL` | No | Public Sepolia RPC | Custom RPC endpoint |
| `BLOCK_EXPLORER_API_KEY` | No | — | Etherscan API key (for verified contract ABIs) |

---

## For AI Agents

> **Read this section before helping a user with this project.**

### Your job

Help the user set up and run the Transaction Explainer. The project is fully implemented — your task is configuration and execution, not coding.

### What you must ask the user

Before doing anything, determine what the user needs:

1. **If they just want to run it**: collect the missing config, then run `npm run explain -- --tx <hash>`.
2. **If they want to understand it**: explain the architecture below.
3. **If they hit errors**: diagnose from the output — common issues are RPC failures, missing API keys, or ABI decoding gaps.

### Configuration checklist

Run through this with the user. Stop and ask if anything is missing.

| # | Item | How to get it | Fallback if missing |
|---|---|---|---|
| 1 | **LLM provider** | Ask: "Which LLM provider do you want to use?" (OpenAI, DeepSeek, local Ollama, etc.) | None — this is required |
| 2 | **LLM_API_KEY** | Ask user to provide it. Do NOT guess or hardcode. | None — the tool won't run |
| 3 | **LLM_BASE_URL** | Infer from provider choice: OpenAI=`https://api.openai.com/v1`, DeepSeek=`https://api.deepseek.com/v1`, Ollama=`http://localhost:11434/v1` | Set to match provider |
| 4 | **LLM_MODEL** | Infer: `gpt-4o-mini`, `deepseek-chat`, `llama3`, etc. | `gpt-4o-mini` |
| 5 | **CHAIN** | Default `sepolia`. Only change if user explicitly asks. | `sepolia` |
| 6 | **BLOCK_EXPLORER_API_KEY** | Optional. Free from https://etherscan.io/register. Explainer works without it but can't decode verified contract methods. | Skip — built-in ERC20/721/1155 events still work |

### Configuration template

Once the user provides their choices, create `.env`:

```
CHAIN=sepolia
LLM_API_KEY=<user's key>
LLM_BASE_URL=<inferred from provider>
LLM_MODEL=<inferred from provider>
RPC_URL=
BLOCK_EXPLORER_API_KEY=
```

### Running the tool

```bash
cd <project_dir>
npm install        # first time only
npm run explain -- --tx 0xTRANSACTION_HASH
```

### Troubleshooting guide

| Symptom | Likely cause | Action |
|---|---|---|
| `LLM_API_KEY 未设置` | No .env or missing LLM_API_KEY | Walk through config checklist |
| `未找到交易` | Invalid tx hash or wrong network | Verify hash format (0x + 64 hex chars). Check CHAIN matches the tx's network. |
| `ABI 未获取到` (on all contracts) | No BLOCK_EXPLORER_API_KEY | Normal. Tell user: "Without an Etherscan key, method names can't be decoded, but the LLM will still explain based on raw data." |
| LLM returns garbled output | Wrong LLM_BASE_URL or MODEL | Double-check provider endpoint format. Ollama needs `/v1` suffix. |
| RPC timeout | Public RPC rate-limited | Set `RPC_URL` to a different public node or the user's own endpoint. |

### Important: security

- **NEVER** commit `.env` to git. It's in `.gitignore`.
- **NEVER** echo or display the user's API key in terminal output.
- The `.env.example` file is a template with placeholders — safe to commit.

---

## Project structure

```
src/
  index.ts            # CLI entry point — orchestrates the full pipeline
  chains.ts           # Chain configuration (Sepolia / Mainnet)
  fetchTransaction.ts # Read tx details, receipt, event logs from RPC
  fetchAbi.ts         # Fetch ABIs from block explorer + built-in standard events
  decodeInput.ts      # Decode transaction input data → method name + params
  decodeLogs.ts       # Decode event logs → event name + params
  buildLLMPrompt.ts   # Build structured LLM system/user prompts
  callLLM.ts          # OpenAI-compatible LLM API client
  formatOutput.ts     # Format LLM response as final Markdown
```

## Output format

The LLM generates 6 sections in Markdown:

1. **用户发起了什么动作** — Plain-language summary of what happened
2. **涉及哪些资产和地址** — All addresses and assets involved
3. **哪些信息来自链上数据** — Verifiable on-chain facts only
4. **哪些信息是模型推断** — Model inferences, prefixed with "可能" / "看起来像"
5. **模型不确定的地方** — All uncertainties explicitly listed
6. **签类似交易前应该检查什么** — Pre-signing safety checklist

## License

MIT
