# 前端 AI SDK 怎么选？三大方案实战对比

想在前端项目里接入 AI 能力，你一定绕不过这三个名字：**Vercel AI SDK**、**LangChain.js**、**OpenAI SDK**。

它们各自占据一个生态位——有的专注流式渲染和 UI 集成，有的擅长 Agent 编排和 RAG 管线，有的就是官方出品、简单直接。选错了不至于做不出来，但大概率要在半路换工具，甚至重构核心逻辑。

今天这篇文章，我把三个 SDK 拉到一起，从**安装上手、流式对话、Tool Calling、框架集成、多模型切换**五个维度做一次实战对比，帮你在动手写代码之前就选对武器。

前端 AI SDK 选型

### 先说结论

如果你时间紧，直接看这张表：


| 维度                 | Vercel AI SDK    | LangChain.js       | OpenAI SDK   |
| ------------------ | ---------------- | ------------------ | ------------ |
| 定位                 | 前端 AI UI 框架      | LLM 应用编排框架         | OpenAI 官方客户端 |
| 流式渲染               | ⭐⭐⭐⭐⭐ 原生支持       | ⭐⭐⭐ 需要自己接          | ⭐⭐⭐ 原生支持     |
| React / Next.js 集成 | ⭐⭐⭐⭐⭐ 开箱即用       | ⭐⭐ 无官方 Hook        | ⭐⭐ 无官方 Hook  |
| 多模型支持              | 40+ Provider     | 13+ Provider       | 仅 OpenAI     |
| Tool Calling       | ⭐⭐⭐⭐⭐ Zod Schema | ⭐⭐⭐⭐ 灵活            | ⭐⭐⭐⭐ 原生支持    |
| Agent 编排           | ⭐⭐⭐⭐ SDK 5+ 内置   | ⭐⭐⭐⭐⭐ 核心能力         | ⭐⭐ 需自己做      |
| RAG 支持             | ⭐⭐ 需自行实现         | ⭐⭐⭐⭐⭐ 内置 Retriever | ⭐ 无          |
| 学习曲线               | 低                | 高                  | 最低           |
| 包体积                | 中                | 大                  | 小            |
| GitHub Star        | 22k+             | 14k+               | 8k+          |


**一句话总结**：

- **做 AI 聊天界面 / Next.js 项目** → Vercel AI SDK
- **做复杂 Agent / RAG / 多步编排** → LangChain.js
- **只调 OpenAI 一家、追求极简** → OpenAI SDK

---

### 三个 SDK 到底是什么

在具体对比之前，先搞清楚它们各自的"出身"和核心定位。

#### Vercel AI SDK

- **GitHub**：github.com/vercel/ai（22k+ Star）
- **npm 包**：`ai`（主包）+ `@ai-sdk/openai`、`@ai-sdk/anthropic` 等 Provider 包
- **当前版本**：5.x（2026 年初已发布 6.0 预览）

Vercel AI SDK 本质上是一个**前端 AI UI 工具箱**。它的核心卖点是两个东西：

1. **AI SDK Core**：`generateText`、`streamText`、`generateObject` 等函数，封装了与各家大模型的通信协议
2. **AI SDK UI**：`useChat`、`useCompletion`、`useAssistant` 等 React Hook，帮你用几行代码就搞定一个流式聊天界面

它不关心你的 Agent 怎么编排，也不管你的 RAG 管线怎么搭，它只关心一件事：**让前端和大模型的交互体验做到最好**。

#### LangChain.js

- **GitHub**：github.com/langchain-ai/langchainjs（14k+ Star）
- **npm 包**：`langchain` + `@langchain/core` + `@langchain/openai` 等
- **当前版本**：0.3.x

LangChain 最早是 Python 生态的 LLM 应用框架，后来出了 JS 版。它的核心定位是 **LLM 应用编排框架**——帮你把模型调用、Tool Calling、记忆管理、文档检索这些零件"串"成一条完整的处理链。

它的模块很多：Chain（处理链）、Agent（自主决策体）、Memory（对话记忆）、Retriever（检索器）、Tool（工具）……每个模块都是可插拔的，自由组合。

**优点是灵活性无敌，缺点是概念多、学习曲线陡**。

#### OpenAI SDK

- **GitHub**：github.com/openai/openai-node（8k+ Star）
- **npm 包**：`openai`
- **当前版本**：4.98.x

这个最简单——就是 OpenAI 官方出的 Node.js / TypeScript 客户端。它不是框架，不是工具箱，就是一个**调接口用的 SDK**。

2025 年底 OpenAI 推出了 Responses API 替代原来的 Chat Completions API，新 SDK 同步支持了这套新接口。功能上，它支持流式输出、Function Calling、文件上传、图片生成等 OpenAI 全量 API。

**最大限制**：只能调 OpenAI 的模型。你想换 Claude 或者 Gemini，这个 SDK 就帮不了你。

---

### 实战对比一：最简流式对话

我们从最常见的场景开始——做一个**流式 AI 对话**。用户发一句话，AI 一个 token 一个 token 地"吐"回答。

#### Vercel AI SDK

```typescript
// app/api/chat/route.ts（Next.js API Route）
import { openai } from '@ai-sdk/openai'
import { streamText } from 'ai'

export async function POST(req: Request) {
  const { messages } = await req.json()
  const result = streamText({
    model: openai('gpt-4o'),
    messages,
  })
  return result.toDataStreamResponse()
}
```

```tsx
// app/page.tsx（前端页面）
'use client'
import { useChat } from '@ai-sdk/react'

export default function Chat() {
  const { messages, input, handleInputChange, handleSubmit } = useChat()

  return (
    <div>
      {messages.map(m => (
        <div key={m.id}>{m.role}: {m.content}</div>
      ))}
      <form onSubmit={handleSubmit}>
        <input value={input} onChange={handleInputChange} />
      </form>
    </div>
  )
}
```

**两个文件，不到 30 行代码**，一个带流式渲染的聊天界面就出来了。`useChat` 帮你管了消息列表、输入状态、流式拼接、错误处理这些脏活。

#### LangChain.js

```typescript
// 后端
import { ChatOpenAI } from '@langchain/openai'
import { HumanMessage } from '@langchain/core/messages'

const model = new ChatOpenAI({
  modelName: 'gpt-4o',
  streaming: true,
})

const stream = await model.stream([
  new HumanMessage('用一句话介绍 React')
])

for await (const chunk of stream) {
  process.stdout.write(chunk.content as string)
}
```

LangChain.js 的流式输出用的是 AsyncIterator，你需要自己把 chunk 拼接起来，然后通过 SSE 或 WebSocket 推给前端。**没有现成的 React Hook**——前端的流式渲染逻辑需要你自己写。

```tsx
// 前端需要自己处理 SSE
const response = await fetch('/api/chat', {
  method: 'POST',
  body: JSON.stringify({ message }),
})

const reader = response.body?.getReader()
const decoder = new TextDecoder()

while (true) {
  const { done, value } = await reader!.read()
  if (done) break
  const text = decoder.decode(value)
  setMessages(prev => [...prev, text])
}
```

比 Vercel AI SDK 多了不少"胶水代码"。

#### OpenAI SDK

```typescript
import OpenAI from 'openai'

const client = new OpenAI()

const stream = await client.responses.create({
  model: 'gpt-4o',
  input: '用一句话介绍 React',
  stream: true,
})

for await (const event of stream) {
  if (event.type === 'response.output_text.delta') {
    process.stdout.write(event.delta)
  }
}
```

OpenAI SDK 的流式写法也很简洁。但和 LangChain.js 一样，**前端的流式渲染你得自己来**。

#### 对比小结


|         | Vercel AI SDK           | LangChain.js | OpenAI SDK |
| ------- | ----------------------- | ------------ | ---------- |
| 后端代码量   | 极少                      | 中等           | 少          |
| 前端 Hook | `useChat` 开箱即用          | 无，自己写        | 无，自己写      |
| 流式协议    | 内置 Data Stream Protocol | 自己处理 SSE     | 自己处理 SSE   |


**如果你做的是带前端界面的 AI 应用**，Vercel AI SDK 在这个环节的优势是碾压级的。

---

### 实战对比二：Tool Calling

Tool Calling 是 AI 应用的标配能力——让 AI 决定什么时候调用外部工具（查天气、搜索、查数据库等）。

#### Vercel AI SDK

```typescript
import { openai } from '@ai-sdk/openai'
import { streamText, tool } from 'ai'
import { z } from 'zod'

const result = streamText({
  model: openai('gpt-4o'),
  messages,
  tools: {
    getWeather: tool({
      description: '查询指定城市的天气',
      parameters: z.object({
        city: z.string().describe('城市名'),
      }),
      execute: async ({ city }) => {
        return { temperature: 26, condition: '晴' }
      },
    }),
  },
})
```

用 **Zod** 定义参数 Schema，类型安全、自带校验，写起来非常舒服。而且 `tool()` 函数同时声明了描述、参数和执行逻辑，一个对象搞定。

#### LangChain.js

```typescript
import { tool } from '@langchain/core/tools'
import { z } from 'zod'
import { ChatOpenAI } from '@langchain/openai'

const getWeather = tool(
  async ({ city }) => {
    return JSON.stringify({ temperature: 26, condition: '晴' })
  },
  {
    name: 'getWeather',
    description: '查询指定城市的天气',
    schema: z.object({
      city: z.string().describe('城市名'),
    }),
  }
)

const model = new ChatOpenAI({ modelName: 'gpt-4o' })
const modelWithTools = model.bindTools([getWeather])
const response = await modelWithTools.invoke('北京今天天气怎么样')
```

LangChain.js 的 Tool 定义也用 Zod，写法略有不同但功能是等价的。它的优势在于 Tool 可以被 Agent、Chain 等各种模块复用，**可组合性更强**。

#### OpenAI SDK

```typescript
import OpenAI from 'openai'

const response = await client.responses.create({
  model: 'gpt-4o',
  tools: [{
    type: 'function',
    name: 'getWeather',
    description: '查询指定城市的天气',
    parameters: {
      type: 'object',
      properties: {
        city: { type: 'string', description: '城市名' }
      },
      required: ['city']
    }
  }],
  input: '北京今天天气怎么样',
})
```

OpenAI SDK 用的是原生 JSON Schema 定义参数。没有 Zod 那么爽，但好处是**不依赖任何额外库**，而且和 OpenAI 文档完全一一对应，抄文档就能跑。

#### 对比小结


|           | Vercel AI SDK | LangChain.js      | OpenAI SDK      |
| --------- | ------------- | ----------------- | --------------- |
| Schema 定义 | Zod（类型安全）     | Zod（类型安全）         | JSON Schema（原生） |
| 执行逻辑      | 内置在 tool 定义中  | 内置在 tool 定义中      | 需要自己匹配和调用       |
| 可组合性      | 中             | 高（Agent/Chain 复用） | 低               |


---

### 实战对比三：框架集成

前端开发最关心的问题之一——这些 SDK 和你用的前端框架配合得怎么样？

#### Vercel AI SDK：框架集成最好


| 框架                 | 支持方式                                     |
| ------------------ | ---------------------------------------- |
| React / Next.js    | `useChat`、`useCompletion`、`useAssistant` |
| Svelte / SvelteKit | `useChat`（Svelte 版）                      |
| Vue / Nuxt         | `useChat`（Vue 版）                         |
| Solid.js           | `useChat`（Solid 版）                       |


Vercel AI SDK 是**唯一一个为前端框架提供官方 Hook 的 AI SDK**。你不需要自己处理流式数据的拼接、状态管理、错误处理和重试逻辑——`useChat` 全包了。

一个 `useChat` Hook 给你提供了：

- `messages` —— 消息列表（自动更新）
- `input` / `handleInputChange` —— 输入框状态
- `handleSubmit` —— 发送消息
- `isLoading` —— 加载状态
- `error` —— 错误信息
- `reload` —— 重新生成
- `stop` —— 停止生成

如果你写过 React，你会觉得这个 Hook 就像是"AI 版的 useForm"——把所有常见的状态管理都封装好了。

#### LangChain.js：没有前端 Hook

LangChain.js 是一个"后端优先"的框架。它在 Node.js 端非常强大，但**不提供任何前端 UI Hook**。

你需要自己搭一层"胶水"：后端用 LangChain.js 跑 Chain/Agent，通过 SSE 或 WebSocket 把结果推给前端，前端自己写状态管理逻辑。

当然，你可以**把 LangChain.js 和 Vercel AI SDK 混着用**——后端用 LangChain.js 做 Agent 编排，前端用 Vercel AI SDK 的 `useChat` 做 UI。Vercel AI SDK 官方文档里甚至有专门的 LangChain 集成指南。

#### OpenAI SDK：纯 API 客户端

OpenAI SDK 和前端框架没有任何集成。它就是一个 HTTP 客户端，发请求、收响应，仅此而已。

前端怎么渲染、状态怎么管理，全靠你自己。

---

### 实战对比四：多模型支持

这是一个经常被忽略但非常重要的维度——你的项目以后会不会需要切换或新增模型？

三大 SDK 架构对比

#### Vercel AI SDK：40+ Provider，换模型改一行代码

```typescript
import { openai } from '@ai-sdk/openai'
import { anthropic } from '@ai-sdk/anthropic'
import { google } from '@ai-sdk/google'

// 换模型只需要改这一行
const result = streamText({
  model: openai('gpt-4o'),
  // model: anthropic('claude-sonnet-4-20250514'),
  // model: google('gemini-2.0-flash'),
  messages,
})
```

Vercel AI SDK 通过 **Provider 插件机制**实现了多模型支持。每个模型厂商一个包（`@ai-sdk/openai`、`@ai-sdk/anthropic`、`@ai-sdk/google`……），但对外暴露的 API 完全一致。你的业务代码**只需要改一行 model 参数**就能切换模型。

目前支持的 Provider 超过 40 个，涵盖了 OpenAI、Anthropic、Google、Azure、AWS Bedrock、Mistral、DeepSeek 等主流厂商。

#### LangChain.js：13+ Provider，同样抽象良好

```typescript
import { ChatOpenAI } from '@langchain/openai'
import { ChatAnthropic } from '@langchain/anthropic'
import { ChatGoogleGenerativeAI } from '@langchain/google-genai'

const model = new ChatOpenAI({ modelName: 'gpt-4o' })
// const model = new ChatAnthropic({ modelName: 'claude-sonnet-4-20250514' })
// const model = new ChatGoogleGenerativeAI({ modelName: 'gemini-2.0-flash' })
```

LangChain.js 的多模型抽象也做得很好。所有模型实现了统一的 `BaseChatModel` 接口，换模型改构造函数就行。而且这些模型可以直接插到 Chain 和 Agent 里用，**不需要改任何编排逻辑**。

#### OpenAI SDK：只支持 OpenAI

这没什么好说的——官方 SDK 只对接官方 API。如果你以后想加 Claude 或 Gemini，要么再装一个 Anthropic SDK / Google SDK，要么换成 Vercel AI SDK 或 LangChain.js。

---

### 实战对比五：Agent 编排能力

随着 AI 应用越来越复杂，单纯的"一问一答"已经不够了。你可能需要 AI 自己决定调用哪些工具、按什么顺序处理、甚至多个 Agent 协作。

#### Vercel AI SDK

从 5.0 开始，Vercel AI SDK 内置了 Agent 支持：

```typescript
import { openai } from '@ai-sdk/openai'
import { generateText, tool } from 'ai'
import { z } from 'zod'

const result = await generateText({
  model: openai('gpt-4o'),
  tools: {
    searchWeb: tool({ /* ... */ }),
    getWeather: tool({ /* ... */ }),
    calculate: tool({ /* ... */ }),
  },
  maxSteps: 10,
  prompt: '明天北京适合户外跑步吗？帮我查一下天气和空气质量',
})
```

通过 `maxSteps` 参数，AI 会自动进行多轮 Tool Calling，直到完成任务或达到最大步数。这对于简单到中等复杂度的 Agent 场景完全够用。

但如果你需要**多 Agent 协作、条件分支、状态图（State Graph）**这类复杂编排，Vercel AI SDK 就力不从心了。

#### LangChain.js

这是 LangChain.js 的**绝对主场**。它提供了完整的 Agent 编排能力：

```typescript
import { createReactAgent } from '@langchain/langgraph/prebuilt'
import { ChatOpenAI } from '@langchain/openai'

const agent = createReactAgent({
  llm: new ChatOpenAI({ modelName: 'gpt-4o' }),
  tools: [searchWeb, getWeather, calculate],
})

const result = await agent.invoke({
  messages: [{ role: 'user', content: '明天北京适合户外跑步吗？' }]
})
```

而且配合 **LangGraph.js**，你可以做更复杂的事情：

- **State Graph**：用图结构定义 Agent 的决策流程
- **Supervisor 模式**：一个"管理者" Agent 协调多个"专家" Agent
- **Memory**：短期记忆（对话上下文）和长期记忆（跨会话）
- **Human-in-the-Loop**：在关键步骤让人类审核后再继续

如果你的产品需要做"AI 自动处理工单"、"AI 辅助数据分析"这类复杂场景，LangChain.js + LangGraph.js 是目前 JS 生态的最优解。

#### OpenAI SDK

OpenAI SDK 本身不提供 Agent 编排能力。不过 OpenAI 推出了 **Agents SDK**（`@openai/agents`），提供了基本的 Agent 编排功能，但生态远不如 LangChain。

---

### 选型决策树

说了这么多，到底该选哪个？我画了一个决策流程图：

AI SDK 选型决策树

整理成文字就是：

**场景一：做 AI 聊天界面 / AI 产品前端**

→ **Vercel AI SDK**。`useChat` 一把梭，流式渲染、状态管理、多模型切换全搞定。

**场景二：复杂 Agent 编排 / RAG 知识库 / 多 Agent 协作**

→ **LangChain.js**（后端）+ **Vercel AI SDK**（前端）。用 LangChain.js 的 Agent 和 Retriever 做后端逻辑，用 Vercel AI SDK 的 Hook 做前端展示。

**场景三：只调 OpenAI 的模型，功能简单，追求最小依赖**

→ **OpenAI SDK**。最轻量、最直接、没有任何多余抽象。

**场景四：不确定以后会不会换模型**

→ **Vercel AI SDK** 或 **LangChain.js**。两者都有良好的多模型抽象，以后换模型成本很低。

**场景五：全栈项目，前后端都有复杂需求**

→ **LangChain.js + Vercel AI SDK** 混搭方案。这不是非此即彼的选择——两者可以完美配合。

---

### 三个 SDK 能混着用吗？

可以，而且很多项目就是这么干的。

最常见的搭配是：**后端用 LangChain.js，前端用 Vercel AI SDK**。

后端用 LangChain.js 搭建 Agent 编排管线，跑完之后通过 SSE 返回流式结果；前端用 Vercel AI SDK 的 `useChat` Hook 接收流式数据并渲染。两者通过标准的 HTTP 流协议对接，互不侵入。

```
[前端 React]              [后端 Node.js]
useChat Hook  ──SSE──→  LangChain.js Agent
     ↑                       ↓
  流式渲染              Tool Calling / RAG / Memory
```

甚至你也可以在后端同时用 OpenAI SDK 做一些简单的直连调用（比如生成摘要、翻译），同时用 LangChain.js 做复杂的 Agent 任务。**它们不是互斥的。**

---

### 避坑指南

几个我实际踩过的坑，提前告诉你：

**1. LangChain.js 的版本混乱**

LangChain.js 的包拆分经历过好几次调整。现在的推荐做法是用 `@langchain/core` + 具体 Provider 包（如 `@langchain/openai`），尽量少直接依赖主包 `langchain`。如果你在网上看到的教程用的是 `import { ChatOpenAI } from 'langchain/chat_models/openai'` 这种写法，那已经过时了。

**2. Vercel AI SDK 不一定要部署在 Vercel**

虽然名字带 Vercel，但这个 SDK 完全可以跑在任何 Node.js 环境上——Express、Fastify、Hono、AWS Lambda 都行。不要因为名字就把它和 Vercel 平台绑定。

**3. OpenAI SDK 的 Responses API vs Chat Completions API**

OpenAI 2025 年底推出了 Responses API 作为新的推荐接口，但 Chat Completions API 仍然可用。如果你的项目需要兼容其他 OpenAI 兼容接口（比如本地部署的 Ollama），建议继续用 Chat Completions API，因为大部分兼容层还没适配 Responses API。

**4. 包体积要注意**

LangChain.js 的完整安装体积不小（加上各种依赖可以到几十 MB）。如果你只需要其中一小部分功能，考虑只装具体的子包而不是整个 `langchain`。Vercel AI SDK 和 OpenAI SDK 相对轻量。

---

### 总结

三个 SDK 各有所长，没有"绝对最好"的选择，只有"最适合你场景"的选择。


| 你的场景              | 推荐方案                                |
| ----------------- | ----------------------------------- |
| 快速做一个 AI 聊天产品     | Vercel AI SDK                       |
| 复杂 Agent + RAG 管线 | LangChain.js（后端）+ Vercel AI SDK（前端） |
| 只用 OpenAI、够简单就好   | OpenAI SDK                          |
| 不确定未来需求           | 先用 Vercel AI SDK，需要时加 LangChain.js  |


最后一个建议：**不要过早引入 LangChain.js**。如果你的需求就是一个简单的聊天界面 + 基本的 Tool Calling，Vercel AI SDK 一个就够了。等真正需要复杂 Agent 编排、RAG 检索、多 Agent 协作的时候，再把 LangChain.js 引进来做后端——这样你的架构是"渐进增强"的，不会一开始就背上不必要的复杂度。

**选对武器，事半功倍。**

推荐资源：

- **Vercel AI SDK 文档**：[https://sdk.vercel.ai](https://sdk.vercel.ai)
- **LangChain.js 文档**：[https://js.langchain.com](https://js.langchain.com)
- **OpenAI SDK GitHub**：[https://github.com/openai/openai-node](https://github.com/openai/openai-node)
- **LangGraph.js 文档**：[https://langchain-ai.github.io/langgraphjs/](https://langchain-ai.github.io/langgraphjs/)

### 最后

欢迎扫码加我微信，拉你进技术群，长期交流学习...

欢迎关注「前端Q」,认真学前端，做个有专业的技术人...

