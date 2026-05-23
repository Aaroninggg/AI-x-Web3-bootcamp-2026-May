---
title: "Week 1 学习计划：AI × Web3 Bootcamp"
type: project
created: 2026-05-19
updated: 2026-05-19
tags: [bootcamp, learning-plan, ai, web3]
sources:
  - wiki/sources/ai-x-web3-school
  - wiki/sources/web3-career-build
  - wiki/projects/ai-x-web3-bootcamp/week-0-self-study
---

# Week 1 学习计划

> 时间段：周二 5/19 ~ 周六 5/23 17:00
> 每日 2-3h，周六 7h，总计约 18h
> 已完成：Week 0 自修（AI 基础概念、ML 入门、深度学习简介）

---

## 总体分配

```
周二（~2h）│  AI Agent 与 Prompt
周三（3h）  │  Web3 基础：钱包、签名、交易
周四（3h）  │  智能合约 + Context/RAG
周五（3h）  │  Agent Workflow + AI×Web3 交叉
周六（7h）  │  实操任务 + 最小交叉实验 + Proof-of-Work 汇总
```

---

## 学习流程说明

每条学习路径包含：
1. **精读材料** — 来自 Handbook 的章节，必须读完
2. **视频/链接** — 核心推荐，关键知识点已从原文提取（见下文）
3. **实操环节** — 动手才能巩固
4. **打卡输出** — 整理到 daily note，准备提交

---

## 📅 周二 5/19（~2h）| AI Agent 与 Prompt

**基础预估：** 已有 Week 0 AI 基础概念，任务是从理解→实践

### 1️⃣ 学习 AI Agent 入门（45min）

**精读：**
- Handbook: [Agent 篇](https://aiweb3.school/zh/handbook/ai/agent/) — 核心概念：Tool Use、Planning、State、Human-in-the-loop

**关键知识点提取：**

| 概念 | 一句话 |
|------|--------|
| **Agent ≠ 问答** | Agent 是能拆任务、查资料、调 API、写代码的循环执行系统，不是一次回答 |
| **Tool Use 是分水岭** | 能调用工具的 Agent 从"会回答"变成"能做事"，但风险也因此升级 |
| **Plan 是候选路线** | 模型生成的计划不是授权，每一步都要区分只读/写入、自动/人工 |
| **State 必须外置** | 任务进度、工具结果、失败原因不能只藏在模型上下文里 |
| **Human-in-the-loop** | 合理分层：只读自动→小额白名单→高风险人工确认→超 policy 直接拒绝 |

**视频：**
- [AI Agent 入门视频](https://www.youtube.com/watch?v=FwOTs4UxQS4) — 建立 Agent 最小必要直觉
- [Hermes Agent Docs](https://hermes-agent.nousresearch.com/docs/) — 你已经在使用 Hermes，了解它的架构设计

### 2️⃣ 学习 Prompt Engineering（45min）

**精读：**
- Handbook: [Prompt 篇](https://aiweb3.school/zh/handbook/ai/prompt/)

**关键知识点：**

| 概念 | 一句话 |
|------|--------|
| **Prompt 是软约束** | 它提高遵循概率但不保证安全，真正的边界靠代码、权限、校验 |
| **指令分层** | 系统规则、用户目标、检索内容不能混在一起 |
| **结构化输出** | 关键结果用 JSON schema 承载，不走散文 |
| **Prompt Injection** | 外部内容标记为不可信数据；工具调用前做参数校验 |

**实操（30min）：**
- 用 Hermes Agent 生成本周学习计划（你已经做到了）
- 用 Hermes 帮你写一段结构化输出的 prompt：要求输出 JSON 格式的交易风险分析

---

## 📅 周三 5/20（3h）| Web3 基础：钱包、签名、交易

### 1️⃣ Web3 运行原理（1h）

**精读：**
- Handbook: [Wallet 篇](https://aiweb3.school/zh/handbook/web3/wallet/)
- [Web3 运行原理 PPT](https://docs.google.com/presentation/d/1NUeO115bLnz0V8aejx9bYqQTaDrznTjhgbCkn-pK1a0/edit)（建议先看）

**关键知识点提取：**

| 概念 | 一句话 |
|------|--------|
| **钱包≠登录按钮** | 钱包是私钥、签名入口和链上控制权的管理工具，不是"Web3 账号" |
| **EOA** | 私钥控制的普通账户，简单但恢复困难、权限难分 |
| **助记词≠验证码** | 任何要求你输入助记词的网页/客服/AI 都默认视为危险 |
| **签名≠登录** | 签名是在授权一个具体动作，不是"点一下确认" |
| **交易有 6 种状态** | 等待确认→拒绝→广播→成功→失败→pending，前端必须全部处理 |

### 2️⃣ 账户与签名机制（1h）

**精读：**
- [以太坊账户文档](https://ethereum.org/developers/docs/accounts/)
- [MetaMask 快速开始](https://support.metamask.io/start/getting-started-with-metamask/)

**关键知识点：**

| 概念 | 一句话 |
|------|--------|
| **地址** | 从公钥派生，可公开分享用来收资产 |
| **私钥** | 控制账户的唯一凭证，泄露=失去资产 |
| **Gas** | 链上执行成本，不是单纯手续费，是计算资源定价机制 |
| **L1/L2** | L1（如以太坊主网）安全但贵，L2（如 Arbitrum）便宜但信任假设不同 |
| **测试网** | 学习和实验必须先用测试网（Sepolia），不要在主网试 |

### 3️⃣ 实操（1h）— 测试网交互

步骤：
1. 安装 MetaMask 浏览器插件
2. 切换到 Sepolia 测试网
3. 从 [Sepolia Faucet](https://cloud.google.com/application/web3/faucet/ethereum/sepolia) 领取测试 ETH
4. 在 MetaMask 中完成一笔转账
5. 在 [Sepolia Etherscan](https://sepolia.etherscan.io/) 搜索你的交易哈希
6. 记录：交易哈希、状态、Gas Used、区块高度
7. ⚠️ 不要在任何地方暴露你的助记词/私钥

---

## 📅 周四 5/21（3h）| 智能合约 + Context/RAG

### 1️⃣ 智能合约基础（1h）

**精读：**
- Handbook: [Smart Contract 篇](https://aiweb3.school/zh/handbook/web3/smart-contract/)

**关键知识点：**

| 概念 | 一句话 |
|------|--------|
| **合约≠法律合同** | 合约是链上程序，把规则、资产、状态放到公开可验证环境 |
| **Solidity** | EVM 主流合约语言，需理解 storage、msg.sender、event、revert |
| **EVM** | 合约执行环境，决定了 gas、存储成本、外部调用风险 |
| **部署不可逆** | 合约一旦部署，修改成本远高于普通后端代码 |
| **ABI** | 合约的接口描述，前端/脚本通过 ABI 与合约交互 |

### 2️⃣ 实操（1h）— 部署最小合约

使用 Remix IDE（不需要安装）：
1. 打开 [Remix IDE](https://remix.ethereum.org/)
2. 新建文件 `Counter.sol`，粘贴计数器合约代码
3. 编译，切换到 "Injected Provider" 连接 MetaMask
4. 部署到 Sepolia 测试网
5. 调用 `increment()` 并查看状态变化
6. 记录：合约地址、交易哈希、区块浏览器链接

### 3️⃣ Context 与 RAG 概念（1h）

**精读：**
- Handbook: [Context 篇](https://aiweb3.school/zh/handbook/ai/context/)
- Handbook: [RAG 篇](https://aiweb3.school/zh/handbook/ai/rag/)

**关键知识点：**

| 概念 | 一句话 |
|------|--------|
| **Context ≠ 长文本拼接** | 系统规则、用户输入、检索文档、工具结果要分区放置 |
| **Context Engineering** | 设计什么进上下文、什么排序在前、什么需要每次刷新 |
| **RAG** | 通过检索外部知识降低幻觉，但检索本身也会引入噪声 |
| **上下文可刷新** | 状态、价格、权限不能长期缓存后继续使用 |

---

## 📅 周五 5/22（3h）| Agent Workflow + AI×Web3 交叉

### 1️⃣ 学习 Agent Workflow（1h）

**精读：**
- Handbook: [Agent Workflow 篇](https://aiweb3.school/zh/handbook/bridge/agent-workflow/)
- Handbook: [Web3 Tool Use 篇](https://aiweb3.school/zh/handbook/bridge/web3-tool-use/)

**关键知识点：**

| 概念 | 一句话 |
|------|--------|
| **Task Graph** | 把目标拆成节点和依赖，而不是让 Agent 一口气自由执行 |
| **State Machine** | Agent 执行有明确状态（draft→simulated→confirmed→submitted→done） |
| **Retry 要谨慎** | 读取失败可以重试；交易 pending 不能简单再发一笔 |
| **只读 vs 写入** | 读数据自动执行，写操作必须走 policy 检查+人工确认 |
| **AI×Web3 最小架构** | 用户目标→计划→只读自动→模拟→人工确认→钱包执行→日志记录 |

### 2️⃣ 学习 Chain-aware Context（45min）

**精读：**
- Handbook: [Chain-aware Context 篇](https://aiweb3.school/zh/handbook/bridge/chain-aware-context/)

**关键知识点：**
- 链上状态如何进入 Agent 上下文：RPC 读取、事件索引、交易历史
- 模型可以解释链上数据，但不能替用户确认
- 上下文中的链上数据要标注"来源"和"时效"

### 3️⃣ 学习 AI Security 基础（45min）

**精读：**
- Handbook: [AI Security 篇](https://aiweb3.school/zh/handbook/bridge/ai-security/)

**关键知识点：**
- Prompt Injection 在 Agent 场景更危险：模型不只是回答问题，还能调用工具
- 工具权限隔离：每类工具只有最小必要权限
- 敏感动作清单：签名、授权、转账、合约写入必须 human-in-the-loop

### 4️⃣ 观看回放（如果有时间）

- [5/19 AI Agent 入门：Hermes 从 0 到 1](https://web3career.build/zh/programs/AI-Web3-School#tab=learning)（观看回放）
- [5/21 AI 下乡计划｜Web3 应用]（观看回放）

---

## 📅 周六 5/23（7h，至 17:00）| 实操 + 交叉实验 + 汇总交付

### 上午（3.5h）

#### 1️⃣ 搭建 Learning Agent + GitHub Repo（1.5h）

步骤：
1. 创建 GitHub 仓库 `ai-web3-school-cohort-0`
2. 初始化结构：README.md、notes/、demos/、tasks/
3. 用 Hermes Agent（就是当前对话）完成一次学习任务
4. 将本学习计划 commit 到 repo 中
5. 提交 Proof-of-Work：repo 链接、commit 记录、Hermes 学习日志

#### 2️⃣ 完成 Web3 进阶任务（1h）

- 在 Sepolia 上再部署一个稍微复杂的合约（如存储字符串）
- 用区块浏览器验证并截图

#### 3️⃣ AI 可交互学习产物（1h）

选一个 Week 1 概念：
- LLM / Agent / Prompt 的工作原理
- 钱包/签名/交易的流程
- AI×Web3 最小交叉流程图

用 Hermes/Claude Code 帮你生成：概念卡片网页、CLI demo、或流程图

### 下午（3.5h，至 17:00）

#### 4️⃣ AI×Web3 最小交叉实验（2h）

选择一条链路完成记录：

**链路 A：AI 生成 → 人工复核 → 链上执行**
1. 让 AI（Hermes）生成一笔合约交互脚本（读取 `Counter` 合约的 `count()`）
2. 人工复核脚本的正确性
3. 在 Sepolia 上执行
4. 记录每一步

**链路 B：AI 解释交易 → 人工确认 → 记录到 repo**
1. 找一笔 Sepolia 上已完成的交易
2. 让 AI 解释交易内容、资产变化、风险点
3. 记录到 notes/

#### 5️⃣ 汇总 Proof-of-Work Pack（1h）

Week 1 需要交付：
- [ ] Learning Agent 配置记录 + GitHub repo 链接
- [ ] AI 概念卡片或可交互产物
- [ ] Web3 概念卡片
- [ ] 测试网钱包地址 + 测试交易哈希
- [ ] 已部署合约地址 + 合约读写记录
- [ ] 最小交叉实验说明（流程 + 边界 + 风险 + 验证材料）
- [ ] 每日打卡记录（每天在 WCB 平台打卡）

#### 6️⃣ 复盘与确认（30min）

- 检查所有 checklist 是否完成
- 在 WCB 平台提交 Week 1 Proof-of-Work
- 更新 wiki/log.md 记录本周学习成果

---

## 📋 总 Checklist

### 必做
- [ ] 读完 Handbook: Agent、Prompt、Context、Wallet、Smart Contract、Agent Workflow 章节
- [ ] 在 Sepolia 测试网完成至少一笔交易
- [ ] 用 Remix 部署一个最小合约（Counter）
- [ ] 创建 GitHub repo 并结构化初始化
- [ ] 让 Hermes 帮你完成至少一次学习/编码任务
- [ ] 提交 Proof-of-Work Pack
- [ ] 每日在 WCB 打卡（缺卡≥2 次淘汰）

### 推荐
- [ ] 看完 AI Agent 入门视频
- [ ] 看完 Web3 运行原理 PPT
- [ ] 生成一个可交互学习产物（概念卡/流程图/CLI demo）

### 加分项
- [ ] 比较 EOA、智能账户、多签的权限差异
- [ ] 用 AI 生成合约交互脚本并人工复核执行
- [ ] 拆解 1-2 个 AI×Web3 项目或个人

---

## ❓ 可能遇到的困惑

1. **Agent 和 Workflow 到底有什么区别？** → Agent 自主规划路径，Workflow 路径固定。关键看"谁决定下一步做什么"
2. **Gas 到底怎么算的？** → Gas = Gas Used × Gas Price。复杂操作（合约写入）比简单操作（转账）贵
3. **测试币不够怎么办？** → 多试几个 Sepolia Faucet 或用 Alchemy Faucet
4. **合约部署失败怎么办？** → 检查是否有足够测试 ETH、网络是否正确选择 Sepolia、合约是否编译通过
5. **AI 生成的代码能不能直接用？** → 绝对不能。AI 生成的合约代码/脚本必须人工审计后再执行
6. **每天打卡内容写什么？** → 当天学到了什么、实际操作了什么、还有哪些不明白
