# 拆解 Open WebUI：前端如何做一个生产级 AI 对话界面

用过 ChatGPT 的同学都会有一个念头：**这个对话界面，我自己能不能做一个？**

说实话，做一个"能聊天"的界面不难——一个输入框、一个消息列表、调个接口就完了。但你要做一个**生产级**的 AI 对话界面，那里面的门道就多了：流式渲染怎么不卡？Markdown 和代码高亮怎么做？多模型怎么切换？会话怎么管理？知识库怎么接？插件系统怎么设计？

好消息是，有一个开源项目已经把这些问题全解决了——**Open WebUI**。

它在 GitHub 上有 **124k+ Star**，是目前最火的开源 AI 对话界面项目，没有之一。更关键的是，它的前端做得非常扎实，很多设计思路和工程实践都值得我们学习。

今天这篇文章，我就带你把 Open WebUI 的前端拆开来看看，搞清楚一个生产级 AI 对话界面到底是怎么做出来的。

### 先看看 Open WebUI 能干啥

在拆代码之前，先对它的能力有个整体印象。你可以把它理解成一个**自己可以部署的 ChatGPT**，但功能比 ChatGPT 还多：

- 支持接入 Ollama（本地模型）、OpenAI、以及任何兼容 OpenAI API 的模型
- 同时选两个模型，并排对比回答（Arena 模式）
- 内置 RAG——上传文档后 AI 就能基于你的资料回答问题
- 支持 Tools（工具调用）、Functions（自定义功能）、Pipelines（管道处理）
- 会话管理、文件夹分组、对话分支、分享链接
- 支持语音输入、图片理解、代码执行
- 完善的权限管理（RBAC、OAuth、LDAP）

功能确实很全，但我们今天不是来列功能清单的。**我们从前端开发的视角出发，看看这些功能背后的技术实现有什么值得学的。**

### 整体架构：前后端怎么分的

先搞清楚 Open WebUI 的整体技术架构，不然后面看具体实现时容易迷路。

![Open WebUI 整体架构](https://raw.githubusercontent.com/LuckyWinty/blog/master/markdown/AI/images/open-webui-architecture.jpg)

简单来说就是三层：

**前端层：Svelte + SvelteKit**

没错，Open WebUI 选的不是 React，也不是 Vue，而是 **Svelte**。具体技术栈：

| 技术 | 用途 |
|------|------|
| Svelte 5 + SvelteKit | 框架 + 元框架 |
| TypeScript | 类型安全 |
| Vite | 构建工具 |
| Tailwind CSS 4 | 样式方案 |
| Tiptap | 富文本编辑（输入框） |
| CodeMirror | 代码编辑器 |
| KaTeX | 数学公式渲染 |

**后端层：Python + FastAPI**

负责对接各种 LLM、处理 RAG 检索、管理用户权限、存储会话数据等。前端通过 REST API 和 WebSocket 与后端通信。

**数据层：SQLite / PostgreSQL + 向量数据库**

会话记录、用户信息、知识库文档等存在关系型数据库里，RAG 用的向量数据存在向量数据库里。

**为什么选 Svelte？**

这个问题很多人会问。我分析有几个原因：

1. **编译时优化**：Svelte 在编译阶段就把响应式逻辑处理好了，运行时开销比 React/Vue 小，对于需要高频更新 DOM 的流式渲染场景特别友好
2. **包体积小**：AI 对话界面需要快速加载，Svelte 编译出来的 bundle 通常比 React 项目小 30%~40%
3. **写法简洁**：Svelte 的组件写法确实比 React Hooks 简洁，开发效率高

当然，如果你的团队用 React 或 Vue 更熟练，完全可以用同样的架构思路去实现。**核心是学它的设计，不是照搬它的技术选型。**

### 核心组件拆解：对话界面长什么样

Open WebUI 的前端代码主要在 `src/lib/components/` 下，我们看看核心组件是怎么组织的：

![对话界面核心组件拆解](https://raw.githubusercontent.com/LuckyWinty/blog/master/markdown/AI/images/open-webui-components.jpg)

#### 1. Sidebar（会话列表）

左侧边栏，管理所有对话。支持的功能比你想象的多：

- 会话列表（按时间排序）
- 文件夹分组（可以把相关对话归类）
- 搜索过滤
- 会话置顶、归档、删除
- 拖拽排序

我们可以学的点：它的**文件夹不只是"抽屉"，而是"项目工作区"**。每个文件夹可以绑定一个专属的 system prompt 和知识库，文件夹下新建的所有对话都会自动继承这些配置。

举个例子：你建一个"电商后台"文件夹，配上 system prompt（"技术栈 React + Ant Design，请求用 src/api/request.ts"）再挂上项目 API 文档。之后在这个文件夹里开任何新对话，AI 都自动知道你的技术栈、能查到你的接口文档，不用每次重复交代。

实现上也不复杂——文件夹数据模型里多两个字段（`systemPrompt` 和 `knowledgeBaseIds`），新建对话时继承进去，发消息时把 system prompt 拼在 messages 最前面、知识库 ID 带给后端做 RAG 检索就行。本质就是 CSS 继承那个思路：**父级设了规则，子级自动生效。**

#### 2. ModelSelector（模型选择器）

顶部的模型选择器，看着简单但信息密度很大：

- 支持选择一个或两个模型（双模型并排对比）
- 显示模型的标签、描述、能力标识（视觉、工具调用等）
- 支持自定义模型的头像、名称、system prompt
- 模型列表可按角色权限过滤

前端实现上，它用了一个下拉选择器 + 模型卡片的组合，每个模型卡片上展示了关键信息。值得注意的是**它允许同时选两个模型**，这时候对话区域会自动分成左右两栏，同时展示两个模型的回答——这是做 Arena 模式的基础。

#### 3. ChatWindow（对话窗口）

整个界面的核心区域。它不只是一个简单的消息列表，而是一个**消息树（Message Tree）**：

- 每条消息有 `id` 和 `parentId`，形成父子关系
- 支持"重新生成"回答，生成的新回答会作为"兄弟节点"存在
- 你可以在任意节点"分叉"，切换到不同的回答分支
- 每条 AI 回答都带有模型信息、耗时、token 数等元数据

这个消息树的设计是 Open WebUI 最精华的部分之一。我们平时做聊天界面，消息列表就是一个扁平数组。但 Open WebUI 把它做成了**树结构**，这样就能支持对话分支——你可以在某个节点"回到过去"，尝试不同的提问方式或不同的模型，对比哪个回答更好。

数据结构大概长这样：

```typescript
interface Message {
  id: string
  parentId: string | null
  role: 'user' | 'assistant' | 'system'
  content: string
  model?: string
  timestamp: number
  childrenIds: string[]
  // 兄弟消息（同一个 parent 下的多个 response）
  siblingIdx?: number
}
```

#### 4. MessageInput（消息输入框）

输入框不是一个普通的 `<textarea>`，而是基于 **Tiptap**（ProseMirror 封装）的富文本编辑器。为什么？因为它要支持：

- Markdown 快捷输入（输入 ``` 自动变代码块）
- `@` 提及（引用模型、文档）
- `#` 引用知识库文档
- `$` 调用技能/工具
- 文件拖拽上传（图片、文档）
- 多行输入 + Shift+Enter 换行
- 语音输入

如果你也要做一个类似的输入框，**Tiptap 是目前最推荐的方案**。它基于 ProseMirror，扩展性极强，社区生态也好。用原生 textarea 做到这么多功能，工作量会大很多。

#### 5. ResponseMessage（消息气泡）

这是渲染 AI 回答的核心组件，也是**性能挑战最大**的组件。它要做的事情：

- 实时渲染流式输出的文本
- Markdown → HTML（标题、列表、表格、链接、图片……）
- 代码块语法高亮（支持几十种语言）
- 数学公式渲染（KaTeX / LaTeX）
- 操作按钮（复制、重新生成、编辑、点赞/踩）
- 引用来源展示（RAG 场景下的文档引用）

### 流式渲染：最核心的技术难点

AI 对话界面和传统聊天应用最大的区别就是**流式渲染**——AI 的回答是一个 token 一个 token "吐"出来的，你需要实时把这些 token 渲染成格式化的内容。

![消息渲染管线](https://raw.githubusercontent.com/LuckyWinty/blog/master/markdown/AI/images/open-webui-render-pipeline.jpg)

Open WebUI 的流式渲染管线大致是这样的：

**接收 → 拼接 → 解析 → 渲染 → 更新 DOM**

1. 通过 Fetch（ReadableStream）或 WebSocket 接收流式数据
2. 每收到一个 chunk，拼接到当前消息的 content 字符串
3. 用 `marked` 库把 Markdown 解析成 HTML
4. 代码块用 highlight.js 做语法高亮
5. 数学公式用 KaTeX 渲染
6. 最后更新到 DOM

听起来很直觉对吧？但这里面藏着一个**巨大的性能坑**。

#### 性能坑：全量渲染风暴

Open WebUI 的 Issue 区有很多人反馈过这个问题：当 AI 回答很长（比如生成了几百行代码）的时候，界面会明显卡顿，甚至 CPU 跑满。

原因是什么？

**每收到一个 token，都会触发一次完整的 Markdown 解析 + 代码高亮 + 公式渲染。**

假设 AI 一秒钟吐出 50 个 token，那就是一秒钟执行 50 次 `marked.parse()` + 50 次 `highlight.js` + 50 次 `KaTeX.renderToString()`。而且每次都是拿**完整的 content**去跑，不是只处理新增的那个 token。

这就好比你写了一篇 500 行的文档，每输入一个字，就把整篇文档重新排版一遍——当然卡。

#### 怎么优化？几个思路

如果你自己要做流式渲染，这里有几个被验证过的优化方向：

**思路一：节流渲染，攒一批再更新**

不要每个 token 都渲染一次，而是攒够一定数量或者过了一定时间间隔（比如 50ms）再批量更新一次。

```typescript
let buffer = ''
let rafId: number | null = null

function onToken(token: string) {
  buffer += token
  if (!rafId) {
    rafId = requestAnimationFrame(() => {
      updateContent(buffer)
      buffer = ''
      rafId = null
    })
  }
}
```

**思路二：增量解析，不要全量**

把 Markdown 内容分成"已完成的块"和"正在流入的块"。已完成的块只渲染一次，后续不再重新解析。只对最后一个"正在进行中"的块做实时渲染。

```
已完成的段落 1 ← 只渲染一次，缓存结果
已完成的段落 2 ← 只渲染一次，缓存结果
已完成的代码块 ← 只渲染一次，缓存结果
正在流入的段落 ← 每次更新只重新渲染这一部分
```

**思路三：代码高亮和公式延迟处理**

流式阶段先不做代码高亮和公式渲染，只做基本的 Markdown 解析。等流结束后，再统一跑一遍高亮和公式。ChatGPT 就是这么做的——你仔细观察会发现，它在流式输出时代码是没有高亮的，等输出完了才上色。

**思路四：虚拟滚动**

如果一个对话有几十条、上百条消息，全部渲染在 DOM 里也是一笔开销。对于长对话，可以用虚拟滚动（virtual scroll）只渲染可视区域的消息。

### 状态管理：Svelte Store 的实战用法

Open WebUI 的状态管理用的是 Svelte 自带的 **writable store**，没有引入 Redux、Zustand 这类第三方库。

主要的全局 Store 包括：

| Store | 管理的数据 |
|-------|----------|
| `config` | 应用配置（后端地址、功能开关等） |
| `models` | 可用的模型列表 |
| `user` | 当前登录用户信息 |
| `chats` | 会话列表 |
| `settings` | 用户偏好设置 |
| `WEBUI_NAME` | 应用名称 |

状态分成了两类：

- **全局状态**（用 writable store）：用户信息、模型列表、应用配置这些跨页面共享的数据
- **组件本地状态**（用 Svelte 的 reactive 变量）：当前对话的消息列表、输入框内容、UI 开关等

这个分法其实跟 React 里 "全局用 Zustand / Redux，局部用 useState" 是一个思路。

如果你用 React 来做类似的事情，状态设计可以参考这个结构：

```typescript
// 全局 Store（Zustand）
interface AppStore {
  user: User | null
  models: Model[]
  config: AppConfig
  settings: UserSettings
}

// 对话级状态（组件内或 Context）
interface ChatState {
  messages: Map<string, Message>  // 用 Map 存消息树
  rootMessageId: string | null
  activeLeafId: string | null     // 当前对话分支的最后一条消息
  isStreaming: boolean
  inputContent: string
}
```

### 消息树结构：对话分支怎么实现

前面提到 Open WebUI 的消息不是扁平数组而是**树结构**，这里展开说说它是怎么实现的。

传统聊天应用的消息结构：

```
消息1 → 消息2 → 消息3 → 消息4（线性数组）
```

Open WebUI 的消息结构：

```
消息1（用户提问）
└── 消息2（AI 回答 v1）
    └── 消息3（用户追问）
        ├── 消息4（AI 回答 v1）← 当前选中的分支
        └── 消息5（AI 回答 v2）← 重新生成的回答
```

实现上，核心就三个字段：

- `parentId` —— 指向父消息
- `childrenIds` —— 子消息列表
- `siblingIdx` —— 在兄弟节点中的索引（用于切换分支）

渲染的时候，从根节点开始，沿着"当前选中的分支"一路往下走，就得到了要展示的消息序列。切换分支时，只需要改变某个节点的 `siblingIdx`，指向另一个子节点就行。

**这个设计对于 AI 对话场景特别有用**：

- 用户可以对同一个问题让 AI 重新生成多次，对比不同回答
- 可以在对话中间某个节点"回溯"，换一种问法试试
- 做模型评测时，可以在同一个节点用不同模型回答并对比

如果你自己的 AI 产品也想做对话分支，不用从头造，参考 Open WebUI 的这套数据模型就够了。

### RAG 接入：知识库在前端怎么用

Open WebUI 的 RAG（检索增强生成）对前端来说主要涉及两个交互：

**1）上传文档**

用户在"知识库"里上传 PDF、TXT、Markdown 等文件。前端做的事情就是文件上传 + 进度展示，真正的文档解析、切片、向量化都在后端完成。

**2）对话时引用**

在聊天输入框里输入 `#`，会弹出知识库文档列表，选择后 AI 就会基于这份文档来回答。

前端实现上，关键是在**发送消息时把引用的文档 ID 带上**，后端会在调用 LLM 之前先去向量数据库里做相似度检索，把相关片段拼进 prompt。

对于 AI 回答中引用了哪些文档片段，Open WebUI 会在消息底部展示**引用来源**——点击可以看到原文出处。这个功能对于提升 AI 回答的可信度非常重要。

### 插件系统：Tools、Functions、Pipelines

Open WebUI 的扩展性是通过三层插件机制实现的：

**Tools（工具）** —— 给 AI 加能力

比如让 AI 能查天气、查股票、搜索网页。前端负责的是工具调用的 UI 展示——当 AI 决定调用某个工具时，界面上会展示调用过程和结果。

**Functions（函数）** —— 给 Open WebUI 自身加功能

比如自定义一个按钮、增加一个新的模型接入方式、写一个消息过滤器。这些 Function 可以直接在 Open WebUI 的管理界面里用 Python 编写和部署。

**Pipelines（管道）** —— 在消息处理链路里插入自定义逻辑

比如在消息发给 LLM 之前先做一次敏感词过滤，或者在收到回答后自动翻译成中文。

核心思路是"配置驱动"——后端返回插件的元数据（名称、描述、参数 schema），前端根据 schema **动态生成表单界面**。这样新增一个插件不需要改前端代码，只要后端注册好元数据就行。

这个模式在前端里很常见，本质就是"JSON Schema 驱动表单渲染"。如果你的产品也有类似的插件/扩展需求，这是一个很值得参考的架构。

### 如果你要自己做，学什么？不学什么？

看完 Open WebUI 的实现，如果你也想做一个 AI 对话界面，我的建议是**学它的架构思路，但不要照抄它的实现细节**。

![你也能做的 AI 对话界面](https://raw.githubusercontent.com/LuckyWinty/blog/master/markdown/AI/images/open-webui-takeaway.jpg)

#### 值得学的

1. **消息树结构** —— 用 `parentId` + `childrenIds` 实现对话分支，这个数据模型设计得很优雅
2. **流式渲染的管线思路** —— 接收 → 拼接 → 解析 → 渲染，虽然有性能坑，但整体思路是对的
3. **富文本输入框用 Tiptap** —— 比自己用 textarea 造轮子省太多事
4. **插件系统的"配置驱动"模式** —— JSON Schema 驱动表单，新增插件不改前端代码
5. **模型选择器支持多选** —— Arena 模式的实现基础，产品差异化利器

#### 不需要照搬的

1. **不一定要用 Svelte** —— React、Vue 都能做，核心是架构设计不是框架选择
2. **不需要一步到位做全功能** —— 先把"流式渲染 + 多模型切换 + 会话管理"做好，RAG 和插件后面再加
3. **流式渲染的实现可以优化** —— Open WebUI 自己都有性能问题，用前面说的增量解析方案会更好

### 总结

拆解完 Open WebUI，我最大的感受是：**做一个"能用"的 AI 对话界面很简单，但做一个"好用"的很难。**

难在哪？

- 流式渲染的性能优化——每个 token 都触发全量渲染是大坑
- 消息数据模型的设计——用树结构而不是数组，才能支持分支和回溯
- 输入框的交互复杂度——富文本、@ 提及、文件上传、快捷键……不用 Tiptap 这类成熟方案会被细节淹没
- 插件系统的可扩展性——配置驱动而不是硬编码，才能规模化

但好消息是，**这些问题都有成熟的解决方案**。Open WebUI 已经趟过了大部分坑，你只需要理解它的设计思路，然后用你熟悉的技术栈去实现就好。

推荐资源：
- **Open WebUI GitHub**：https://github.com/open-webui/open-webui
- **Open WebUI 文档**：https://docs.openwebui.com
- **Vercel AI SDK（React 做 AI 对话推荐）**：https://sdk.vercel.ai
- **Tiptap 富文本编辑器**：https://tiptap.dev

### 最后

欢迎扫码加我微信，拉你进技术群，长期交流学习...

欢迎关注「前端Q」,认真学前端，做个有专业的技术人...

![](https://mmbiz.qpic.cn/sz_mmbiz_jpg/2wV7LicL762ZePKQemg99H6tkm8KTFVk0Nib7DXYY4O45q6WQG4GElKAZMbt2MgD5zlLibLqbeDAl0nnhhQc203Ww/640?wx_fmt=jpeg&tp=webp&wxfrom=5&wx_lazy=1#imgIndex=6)
