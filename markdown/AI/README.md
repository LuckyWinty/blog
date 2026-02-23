# 前端 + AI 从进阶到精通 · 系列文章目录

> 作者：winty ｜ 公众号：前端Q
>
> 每篇绑定 GitHub 热门项目，跳过入门直接实战，前端视角贯穿始终。

---

## 第一模块：定制你的 AI 编码搭档

| 序号 | 标题 | 绑定项目 / 工具 | 状态 |
|:---:|------|:-------------:|:---:|
| 01 | [前端如何写出优秀的 AI Agent Skills](./前端如何写出优秀的%20AI%20Agent%20Skills.md) | Agent Skills 开放标准 / anthropics/skills (71k+ ⭐) | ✅ 已完成 |
| 02 | [用 MCP 给 AI 编辑器接上"外挂"：Figma、数据库、浏览器全打通](./用%20MCP%20给%20AI%20编辑器接上"外挂"：Figma、数据库、浏览器全打通.md) | use-mcp (官方 React Hook) / MCP Apps 扩展 | ✅ 已完成 |
| 03 | [Context 工程：如何把正确的上下文喂给 AI](./Context%20工程：如何把正确的上下文喂给%20AI.md) | Cursor / Claude Code / Continue (开源) | ✅ 已完成 |
| 04 | CLAUDE.md 实战：让 AI 记住你整个项目的"潜规则" | Claude Code | 📝 待写 |

**模块主线**：教 AI 技能（Skills）→ 给 AI 接数据（MCP）→ 管好 AI 看到的信息（Context）→ 让 AI 记住项目规则（CLAUDE.md）

---

## 第二模块：AI 驱动的前端开发实战

| 序号 | 标题 | 绑定项目 / 工具 | 状态 |
|:---:|------|:-------------:|:---:|
| 05 | [拆解 Open WebUI：前端如何做一个生产级 AI 对话界面](./拆解%20Open%20WebUI：前端如何做一个生产级%20AI%20对话界面.md) | open-webui (124k ⭐) | ✅ 已完成 |
| 06 | [Browser-Use 源码解析：AI 是怎么"看懂"并操控网页的](./Browser-Use%20源码解析：AI%20是怎么"看懂"并操控网页的.md) | browser-use (78k ⭐) | ✅ 已完成 |
| 07 | [前端 AI SDK 怎么选？三大方案实战对比](./前端%20AI%20SDK%20怎么选？三大方案实战对比.md) | Vercel AI SDK / LangChain.js / OpenAI SDK | ✅ 已完成 |

**模块主线**：产品级源码拆解（Open WebUI）→ 浏览器自动化原理（Browser-Use）→ SDK 选型指南（选好武器再上阵）

---

## 第三模块：AI Agent 工程化

> 从零搭一个 Agent → 让它会用工具 → 给它加记忆 → 升级到 Graph 架构 → 多 Agent 协作 → 生产级优化，**六步走完 Agent 工程化全链路**。

### 3.1 单 Agent 基础

| 序号 | 标题 | 绑定项目 / 工具 | 状态 |
|:---:|------|:-------------:|:---:|
| 08 | 从零开始：用 LangChain.js 构建你的第一个 Tool-Calling Agent | LangChain.js / Vercel AI SDK | 📝 待写 |
| 09 | ReAct 模式深度解析：Agent 的"思考 → 行动 → 观察"循环 | LangChain.js ReAct Agent | 📝 待写 |
| 10 | Agent 记忆与状态管理：从短期 Memory 到长期 Memory | LangChain.js Memory / Zep | 📝 待写 |

### 3.2 从 Chain 到 Graph

| 序号 | 标题 | 绑定项目 / 工具 | 状态 |
|:---:|------|:-------------:|:---:|
| 11 | 从 Chain 到 Graph：为什么 LangGraph 是复杂 Agent 的更优解 | LangGraph.js | 📝 待写 |
| 12 | LangGraph.js 核心概念：State / Node / Edge 一文讲透 | LangGraph.js | 📝 待写 |

### 3.3 多 Agent 协作模式

| 序号 | 标题 | 绑定项目 / 工具 | 状态 |
|:---:|------|:-------------:|:---:|
| 13 | 父子 Agent 编排：用 Supervisor 模式实现任务自动分发 | LangGraph.js Supervisor | 📝 待写 |
| 14 | Multi-Agent Teams：让多个专家 Agent 像团队一样协作 | LangGraph.js / CrewAI | 📝 待写 |
| 15 | Handoffs 与动态路由：Agent 之间如何优雅地"交接班" | LangGraph.js / OpenAI Swarm | 📝 待写 |

### 3.4 RAG 与生产优化

| 序号 | 标题 | 绑定项目 / 工具 | 状态 |
|:---:|------|:-------------:|:---:|
| 16 | 给 AI 产品加上 RAG：前端知识库检索增强实战 | Dify (129k ⭐) / AI SDK | 📝 待写 |
| 17 | AI 应用的前端性能优化：流式渲染、Token 节约与缓存策略 | AI SDK / Next.js | 📝 待写 |

**模块主线**：

```
单 Agent 基础（08-10）
  └── 学会 Tool Calling → 掌握 ReAct 循环 → 加上 Memory

从 Chain 到 Graph（11-12）
  └── 理解为什么要升级 → 吃透 LangGraph 核心概念

多 Agent 协作（13-15）
  └── Supervisor 父子模式 → Agent Teams 团队模式 → Handoffs 动态路由

RAG 与生产优化（16-17）
  └── 知识增强 → 性能调优，推向生产可用
```

---

## 第四模块：原理与趋势

> 从使用者走向理解者：**用前端熟悉的概念（事件循环 / 中间件 / 编译管线）类比 AI 底层机制**，最后展望趋势。

### 4.1 Agent 运行原理

| 序号 | 标题 | 绑定项目 / 工具 | 状态 |
|:---:|------|:-------------:|:---:|
| 18 | 前端视角拆解 AI Agent 运行原理：从事件循环到 ReAct Loop | Claude Code / Cursor | 📝 待写 |
| 19 | Tool Calling 底层机制：Function Calling 到底发生了什么 | OpenAI / Anthropic API | 📝 待写 |

### 4.2 AI 编码工具架构

| 序号 | 标题 | 绑定项目 / 工具 | 状态 |
|:---:|------|:-------------:|:---:|
| 20 | AI 编码工具的底层架构：Cursor 是怎么给你补全代码的 | Cursor / Continue (开源对标) | 📝 待写 |
| 21 | Prompt Engineering 进阶：System Prompt 设计模式与 Few-Shot 策略 | Claude / GPT API | 📝 待写 |

### 4.3 成本、安全与趋势

| 序号 | 标题 | 绑定项目 / 工具 | 状态 |
|:---:|------|:-------------:|:---:|
| 22 | Token 经济学：AI 应用的成本控制与计费优化实战 | OpenAI / Claude API 计费 | 📝 待写 |
| 23 | AI × 前端的下一站：本地模型、WebGPU 推理与 Edge AI | WebLLM / Transformers.js | 📝 待写 |

**模块主线**：

```
Agent 运行原理（18-19）
  └── 从宏观 ReAct 循环 → 到微观 Tool Calling 机制

AI 编码工具架构（20-21）
  └── 拆解 Cursor 补全原理 → Prompt 设计模式进阶

成本、安全与趋势（22-23）
  └── Token 成本优化 → WebGPU / Edge AI 前沿探索
```

---

## 推荐发文节奏

```
第一波（定制篇）✅ 已完成
  01 Skills ✅
  └── 02 MCP 实战 ✅
      └── 03 Context 工程 ✅

第二波（实战 + 选型篇）
  05 Open WebUI 源码拆解
  └── 06 Browser-Use 源码解析 ← 硬核差异化
      └── 07 AI SDK 全景横评 ← 选好武器再上阵

第三波（Agent 工程篇）← 核心重头戏
  08 第一个 Agent（LangChain.js）
  └── 09 ReAct 模式
      └── 11 从 Chain 到 Graph
          └── 13 Supervisor 父子 Agent
              └── 14 Agent Teams ← 高潮

第四波（RAG + 原理篇）
  16 RAG 知识增强
  └── 18 Agent 运行原理
      └── 20 Cursor 底层架构 ← 收尾升华

第五波（趋势篇）
  22 Token 经济学
  └── 23 Edge AI / WebGPU ← 展望未来
```

---

## 系列定位

- **读者画像**：有 1-3 年经验的前端开发者，已经在用或准备用 AI 编码工具
- **内容调性**：实战为主，源码为辅，原理收尾；通俗口语化，避免学术腔
- **差异化**：每篇绑定 GitHub 热门项目，不做泛 AI 科普，始终站在前端开发者视角
