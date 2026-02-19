# AI 总写不对你的代码？你需要学会写 Agent Skills

### 背景

用 Cursor 写代码的时候，明明团队有自己的组件规范，但 AI 生成出来的代码风格完全对不上号，每次都要手动改半天——这不是 AI 不够聪明，而是你没"教"过它。

从 Cursor、Claude Code 到 GitHub Copilot，AI 编码工具正在从"对话助手"进化成能**自主执行任务**的 Agent。在这个趋势下，**Agent Skills** 悄然成为标配——简单说，它就是你写给 AI 的"操作手册"，教会它一项技能，它就能在合适的场景自动调用。

这篇文章，我会讲清楚 Skills 是什么、怎么写好、以及有哪些值得参考的案例。**无论你用的是 Cursor、Claude 还是 GitHub Copilot，都适用。**

### 什么是 Agent Skills

那 Agent Skills 到底是什么？它是一个**开放标准**（Open Standard），由 Anthropic 发起，目前已被 Cursor、GitHub Copilot、Claude Code 等主流 AI 编码工具采纳。官方规范地址：https://agentskills.io

一个 Skill 本质上就是一个**文件夹**，核心是一个 `SKILL.md` 文件，里面包含：

- **元数据**（YAML frontmatter）：告诉 Agent "我是谁"、"什么时候用我"
- **指令正文**（Markdown body）：告诉 Agent "具体怎么做"
- **可选资源**：脚本、参考文档、模板等

用一张图来理解它的工作机制：

![Agent Skills 工作流程](https://raw.githubusercontent.com/LuckyWinty/blog/master/markdown/AI/images/agent-skills-workflow.jpg)

这里面有一个很巧妙的设计理念 —— **渐进式加载（Progressive Disclosure）**：

- **第一层**：元数据（name + description），始终在上下文中，约 100 词
- **第二层**：SKILL.md 正文，匹配触发后才加载，建议不超过 500 行
- **第三层**：附属资源文件，Agent 按需读取，大小不限

这样做的好处是节省上下文窗口（context window），让 Agent 把有限的"记忆容量"用在刀刃上。

### Skills 存放在哪里

了解了 Skills 的工作原理之后，下一个问题就是：**它具体放在项目的哪个位置？**

不同工具的 Skills 存放位置略有差异，但基本遵循相同的约定：

| 存放位置 | 作用范围 | 说明 |
|---------|---------|------|
| `.cursor/skills/` | 项目级别 | 跟随仓库，团队共享 |
| `.claude/skills/` | 项目级别 | Claude 兼容目录 |
| `.github/skills/` | 项目级别 | GitHub Copilot 目录 |
| `~/.cursor/skills/` | 用户级别 | 个人全局，所有项目可用 |
| `~/.claude/skills/` | 用户级别 | Claude 个人全局 |

**一个典型的项目级 Skill 目录结构是这样的：**

```
.cursor/
└── skills/
    └── react-component-creator/
        ├── SKILL.md              ← 必需：核心指令文件
        ├── scripts/              ← 可选：可执行脚本
        │   └── generate.sh
        ├── references/           ← 可选：参考文档（按需加载）
        │   └── coding-standards.md
        └── assets/               ← 可选：模板、图片等静态资源
            └── component-template.tsx
```

目录中各文件夹的定位如下：

| 目录 | 用途 | 加载时机 |
|-----|------|---------|
| `scripts/` | 可执行代码（Python/Bash/JS） | Agent 需要执行时调用 |
| `references/` | 参考文档、API 文档、规范等 | Agent 需要查阅时读取 |
| `assets/` | 模板文件、图片、配置等 | Agent 产出结果时使用 |

### SKILL.md 文件详解

目录结构搞清楚了，接下来重点讲 `SKILL.md` 文件怎么写。它由两部分组成：**YAML 头信息 + Markdown 正文**。

#### 1. YAML 头信息（Frontmatter）

```yaml
---
name: react-component-creator
description: Create React components following team conventions with TypeScript, hooks patterns, and proper file structure. Use when the user asks to create, generate, or scaffold a new React component.
---
```

两个必填字段：

| 字段 | 要求 | 作用 |
|-----|------|------|
| `name` | 最长 64 字符，仅限小写字母、数字、连字符 | Skill 唯一标识 |
| `description` | 最长 1024 字符 | **最关键**：Agent 根据它决定是否触发该 Skill |

**description 是整个 Skill 的灵魂**，写好它需要遵循几个原则：

**原则一：同时写清"做什么"和"什么时候用"**

```yaml
# ✅ 好的写法 —— 既有能力描述，又有触发场景
description: Create React components with TypeScript, hooks, and proper file structure. Use when the user asks to create, generate, or scaffold a new React component.

# ❌ 差的写法 —— 太模糊，Agent 不知道什么时候该触发
description: Helps with React stuff.
```

**原则二：用第三人称描述**

```yaml
# ✅ 好
description: Generates unit tests for React components using Vitest.

# ❌ 不好
description: I can help you write tests for React.
```

**原则三：包含关键触发词**

把用户可能提到的关键词写进去，比如"component""scaffold""generate""创建组件"等，这样 Agent 匹配时更精准。

#### 2. Markdown 正文

正文是给 Agent 看的"操作指南"。来看一个精简但完整的例子：

```markdown
---
name: react-component-creator
description: Create React components with TypeScript and hooks. Use when the user asks to create, generate, or scaffold a React component.
---

# React Component Creator

## Instructions

1. Create component file at `src/components/[ComponentName]/index.tsx`
2. Use function component with TypeScript interface for props
3. Export as named export (not default export)

## Component Template

\```tsx
interface [Name]Props {
  // props here
}

export function [Name]({ ...props }: [Name]Props) {
  return <div>...</div>
}
\```

## Conventions

- File naming: PascalCase for components, camelCase for hooks
- One component per file
- Co-locate styles: `[ComponentName].module.css`
- Co-locate tests: `[ComponentName].test.tsx`
```

### 写好 Skill 的 10 个核心原则

知道了怎么写一个 SKILL.md 之后，怎么把它**写好**才是关键。我研究了大量优秀的 Skills 案例，也在自己项目里反复试错，最后总结出这 10 个核心原则。它们各自解决的问题完全不同，缺哪个都会踩坑：

![10 个核心原则](https://raw.githubusercontent.com/LuckyWinty/blog/master/markdown/AI/images/ten-core-principles.jpg)

#### 原则一：只写 Agent 不知道的事

Agent 已经是一个训练有素的"高级开发"了——它知道 React 怎么写、TypeScript 怎么用、怎么发起 HTTP 请求。你不需要教它这些。

你真正需要写的，是那些**只存在于你团队脑子里**的知识：我们的状态管理用 zustand 不用 redux、接口请求统一走 `src/api/request.ts` 里封装的方法、日期用 dayjs 不用 moment...这些"潜规则"Agent 没法从公开知识里推断出来。

举个例子，下面两种写法对比：

```markdown
# ❌ 浪费：Agent 自己就知道怎么用 fetch
When making HTTP requests, you can use the fetch API. The fetch 
function takes a URL and an options object containing method, 
headers, and body...

# ✅ 有价值：这是你们团队的私有约定
All API calls MUST use the project's request wrapper:

\```ts
import { request } from '@/api/request'

// GET
const users = await request.get<User[]>('/api/users')

// POST
await request.post('/api/users', { name: 'Winty' })
\```

Do NOT use raw fetch or axios directly.
```

**判断标准很简单：这段话如果对一个刚入职的资深前端也需要交代，那就值得写；如果是前端基础知识，就删掉。**

#### 原则二：按风险等级调"管控力度"

写 Skill 指令就像设计道路——在高速公路上你需要严格的车道线和护栏，在公园小路上随意走走就好。不同任务的风险不同，给 Agent 的"自由空间"也应该不同。

我把它分成三档：

| 管控力度 | 什么时候用 | 实际场景 |
|---------|-----------|---------|
| **松** — 只给方向 | 方案灵活、不会出大问题 | "帮我 Review 这段代码" |
| **中** — 给模板 | 有推荐做法、但允许调整 | "按团队规范写一个组件" |
| **严** — 给精确步骤 | 操作敏感、一步都不能错 | "执行数据库迁移" |

比如在我的项目里，写一个新的 React 组件我会给"中"——提供模板和规范，但具体 JSX 怎么写 Agent 自己判断就好。但如果是修改 Nginx 配置、执行数据库迁移这种，我会给"严"——精确到每一条命令，不留任何发挥空间。

**记住：越危险的操作越要"收紧"，越创造性的任务越要"放手"。**

#### 原则三：内容分层加载，别一股脑全塞

Agent 的上下文窗口就像你的电脑内存——容量有限。如果你把所有规范、文档、示例一股脑全写进 SKILL.md，就像同时开了 200 个浏览器标签页，系统肯定卡死。

更聪明的做法是**分层**：

- **第一层**（始终加载）：SKILL.md 里只放最核心的指令和规则，控制在 500 行以内
- **第二层**（按需加载）：详细的规范文档、API 参考拆到 `references/` 目录

```markdown
# React Component Skill

## Core Rules
1. Named exports only
2. CSS Modules for styling
3. Co-locate tests

## Need More Detail?
- Naming conventions → see [naming.md](references/naming.md)
- State management patterns → see [state.md](references/state.md)
- Accessibility checklist → see [a11y.md](references/a11y.md)
```

当用户只是让 Agent 写个简单组件时，它看 Core Rules 就够了。只有涉及无障碍适配时，Agent 才会去读 `a11y.md`。这样每次执行任务时，上下文窗口里只有"用得着"的内容。

**注意一个坑：引用文件只支持一层深度。** 不要让 `naming.md` 里面再引用 `naming-detail.md`，Agent 大概率不会读到那么深。

#### 原则四：用代码说话，少用文字解释

这是我自己写 Skill 最深的一个体会：**当你发现自己在写第三段"解释"的时候，停下来，换一个代码示例就够了。**

Agent 理解代码的能力远强于理解自然语言描述。你用文字写"组件的 Props 要用 interface 定义，命名为组件名 + Props 后缀，放在组件函数的上面"——Agent 可能理解出好几种写法。但你直接贴一个代码示例，它就100%照着来：

```markdown
## Custom Hook 规范

\```ts
// ✅ 标准写法 — 直接照这个格式来
export function useUserList(params: UseUserListParams) {
  const [users, setUsers] = useState<User[]>([])
  const [loading, setLoading] = useState(false)

  const fetch = useCallback(async () => {
    setLoading(true)
    try {
      const data = await request.get<User[]>('/api/users', { params })
      setUsers(data)
    } finally {
      setLoading(false)
    }
  }, [params])

  useEffect(() => { fetch() }, [fetch])

  return { users, loading, refresh: fetch }
}
\```

Naming: `use` + resource name, e.g. `useOrderDetail`, `useCartItems`
Return: always return an object (not array), include a `refresh` method
```

一个真实的例子，比三段文字描述更精确、更省空间、也更不容易被误解。

#### 原则五：画好三条线——能做、要问、别碰

Agent 没有"职场常识"。你不告诉它什么不能动，它真可能顺手帮你重构了 `webpack.config.js`，或者把 `.env` 里的密钥提交到仓库里。

所以每个 Skill 都**必须**画三条线：

```markdown
## 操作边界

✅ **放手做：**
- 在 `src/components/` 下新建文件
- 在 `src/hooks/` 下新建 custom hook
- 修改当前任务相关的组件和样式

⚠️ **先问我：**
- 要改 `src/shared/` 或 `src/utils/` 里的公共代码
- 要新加一个 npm 依赖
- 要改路由配置或全局状态

🚫 **绝对不要：**
- 动任何 config 文件（webpack/vite/tsconfig/eslint）
- 删除或修改已有的测试用例
- 在代码里硬编码环境变量或密钥
```

实际用下来，这三条线对 Agent 的约束力非常强。我有一次没写 🚫 列表，结果 Agent 帮我"优化"了 ESLint 配置，直接把 `no-console` 规则关了...加了边界之后就再没出过这种事。

#### 原则六：多步任务用编号清单"锁死"顺序

让 Agent 写一段代码、一个函数，它很擅长。但让它**按特定顺序做一连串操作**，就容易出乱子——跳步、漏步、颠倒顺序都有可能。

编号清单是最简单有效的解药：

```markdown
## 新页面开发流程

按照以下顺序执行，不要跳步：

1. 在 `src/pages/` 下创建页面目录和 `index.tsx`
2. 在 `src/router/config.ts` 中注册路由
3. 编写页面基础结构和布局
4. 接入 API 数据，完成主要交互逻辑
5. 编写单元测试 `__tests__/index.test.tsx`
6. 运行 `npm run test` 确认通过
7. 运行 `npm run build` 确认构建无报错
```

为什么编号清单管用？因为它给了 Agent 两样东西：**明确的先后顺序**和**可追踪的进度**。Agent 做完第 3 步，它知道下一步该做什么，不需要自己判断。

这个特别适合**发布流程、环境部署、大功能开发**这类"步骤不能乱来"的场景。

#### 原则七：确定性操作封装成脚本

有一类操作是"不管谁来做，结果都应该一模一样"的——建目录结构、生成模板文件、注册路由、格式化代码。这种操作你用文字描述 10 行，不如包成一个脚本一行搞定。

```markdown
## 创建新组件

不要手动创建文件。运行脚手架脚本：

\```bash
node scripts/create-component.js UserCard
\```

脚本会自动完成：
- 创建 `src/components/UserCard/` 目录
- 生成 index.tsx（含 Props interface 模板）
- 生成 UserCard.module.css（含基础类名）
- 生成 UserCard.test.tsx（含 render 基础用例）
- 在 `src/components/index.ts` 中追加 export

查看所有选项：`node scripts/create-component.js --help`
```

为什么要这么做？两个原因：

1. **省上下文空间**。脚本细节不需要出现在 Skill 里，Agent 只要知道"调哪个命令"就行
2. **结果 100% 一致**。Agent 手写可能漏掉 export 注册或者文件名大小写写错，但脚本不会

简单说：**能用脚本跑的，就别让 Agent 手写。**

#### 原则八：交付前设一道"质检门"

你一定遇到过这种场景：Agent 信心满满地说"搞定了"，你一看——TypeScript 编译报错、测试没跑、甚至 `console.log` 还留着三四处。

问题不是 Agent 能力不行，而是你没告诉它**交活之前该检查什么**。加一个 Pre-Delivery Checklist，效果立竿见影：

```markdown
## 交付检查（每次完成任务后必须执行）

确认以下每一项都通过后，再告诉用户"已完成"：

- [ ] 运行 `npx tsc --noEmit` 无报错
- [ ] 运行 `npm run test` 全部通过
- [ ] 代码中没有 console.log / debugger / TODO 注释
- [ ] 新增的 Props 都有 JSDoc 注释
- [ ] 可交互元素有 aria-label 或 role 属性
- [ ] 组件在不传任何 props 时不会崩溃（有合理默认值）
- [ ] 新增文件已在 barrel file 中 export
```

你可以把它理解成代码的"出厂质检单"。我在自己项目里加了这道关之后，Agent 交付的代码返工率降了很多。**关键是要写得具体**——"代码质量要好"没有用，"运行 `npx tsc --noEmit` 无报错"才有用。

#### 原则九：用参数让 Skill "一鱼多吃"

你不太可能为 `UserCard`、`ProductCard`、`OrderCard` 各写一个 Skill 吧？用参数化设计，一个 Skill 就能通吃所有组件的生成。

核心思路是：把可变的部分抽成参数，固定的部分写成规则。

```markdown
## 输入参数

| 参数 | 必填 | 默认值 | 说明 |
|-----|------|-------|------|
| 组件名称 | 是 | - | PascalCase，如 UserCard |
| 样式方案 | 否 | css-modules | 可选 css-modules / tailwind |
| 是否生成测试 | 否 | 是 | 设为"否"可跳过测试文件 |
| 是否生成 Story | 否 | 否 | Storybook 文件 |

## 输出文件

根据参数生成以下文件：
- `src/components/{组件名称}/index.tsx` ← 始终生成
- `src/components/{组件名称}/{组件名称}.module.css` ← 样式方案为 css-modules 时
- `src/components/{组件名称}/{组件名称}.test.tsx` ← 开启测试时
- `src/components/{组件名称}/{组件名称}.stories.tsx` ← 开启 Story 时
```

这样一来，用户说"帮我创建一个 OrderCard 组件，用 Tailwind 样式，不需要 Storybook"，Agent 就能自动匹配参数执行。一个 Skill 覆盖 N 种场景，维护成本也低很多。

#### 原则十：告诉 Agent 你的项目有哪些"趁手工具"

大多数成熟项目都有一堆好用的 npm scripts 和 CLI 工具，但 Agent 完全不知道它们的存在。你不说，它就会自己"手搓"一个本该一行命令搞定的操作。

在 Skill 里**列出项目已有的工具清单**，相当于给 Agent 发了一套"装备"：

```markdown
## 项目工具箱

本项目提供了以下开发工具，请优先使用：

| 命令 | 用途 | 什么时候用 |
|-----|------|-----------|
| `npx plop component` | 创建组件脚手架 | 新建任何 React 组件时 |
| `npm run codegen` | 从 OpenAPI 生成 API 类型 | 后端接口有更新时 |
| `npm run analyze` | 分析打包体积 | 添加新依赖或大改动后 |
| `npm run lint:fix` | 自动修复 lint 问题 | 代码写完后 |
| `npm run test:visual` | 跑视觉回归测试 | 改了 UI 样式后 |

## 什么时候用工具 vs 手写

- **用工具**：脚手架搭建、代码生成、构建部署、格式化
- **手写**：业务逻辑、自定义 Hook、复杂交互组件

创建新组件时，**始终**优先用 `npx plop component` 而不是手动建文件。
```

这个和上面"原则七"的区别在于：原则七是说"把重复操作**封装**成脚本"，这里是说"把**已有的**工具告诉 Agent"。一个是造工具，一个是介绍工具。两者配合起来，Agent 就能像一个熟悉项目的老员工一样干活——知道该用什么工具、知道工具在哪。

### GitHub 优秀案例拆解

说了这么多写法要点，光说不练假把式。我们来看看 GitHub 上几个高质量的 Skills 案例，学学别人是怎么写的。

#### 案例一：anthropics/skills —— 官方示范仓库

仓库地址：https://github.com/anthropics/skills （⭐ 71k+）

这是 Anthropic 官方开源的 Skills 集合，涵盖了创意设计、技术开发、企业沟通、文档处理等多个方向。

其中 **`frontend-design`** 这个 Skill 非常值得前端同学学习。来看它的核心写法：

```yaml
---
name: frontend-design
description: Create distinctive, production-grade frontend interfaces 
  with high design quality. Use this skill when the user asks to build 
  web components, pages, artifacts, or applications.
---
```

它的正文最精彩的部分是**设计决策框架**：

```markdown
## Design Thinking

Before coding, understand the context and commit to a BOLD aesthetic direction:
- **Purpose**: What problem does this interface solve? Who uses it?
- **Tone**: Pick an extreme: brutally minimal, maximalist chaos, 
  retro-futuristic, luxury/refined, playful/toy-like...
- **Constraints**: Technical requirements (framework, performance, accessibility)
- **Differentiation**: What makes this UNFORGETTABLE?
```

这个案例好在哪里？

1. **description 写得精准**：既描述了能力（create frontend interfaces），又明确了触发时机（when the user asks to build web components, pages...）
2. **给出思考框架**：不是直接告诉 Agent "用什么颜色"，而是教它"怎么做设计决策"
3. **设定审美边界**：明确禁止了"AI 味"的设计（如 Inter 字体、紫色渐变等）

#### 案例二：webapp-testing —— 脚本集成模式

同样来自 anthropics/skills，这个 Skill 展示了如何用**决策树 + 脚本**来处理复杂工作流：

```markdown
## Decision Tree: Choosing Your Approach

User task → Is it static HTML?
    ├─ Yes → Read HTML file directly to identify selectors
    │         └─ Write Playwright script using selectors
    │
    └─ No (dynamic webapp) → Is the server already running?
        ├─ No → Run: python scripts/with_server.py --help
        └─ Yes → Reconnaissance-then-action:
            1. Navigate and wait for networkidle
            2. Take screenshot or inspect DOM
            3. Identify selectors from rendered state
            4. Execute actions with discovered selectors
```

这个写法的亮点在于：

1. **决策树清晰**：Agent 能快速判断走哪条路径
2. **脚本当黑盒用**：不需要把脚本内容加载到上下文，用 `--help` 了解用法后直接调用
3. **有明确的反模式提示**：用 ❌ 和 ✅ 标记常见陷阱

#### 案例三：GitHub Copilot docs-agent —— 角色定位模式

来自 GitHub 官方博客对 2500+ 个 `agents.md` 的最佳实践总结：

```markdown
---
name: docs_agent
description: Expert technical writer for this project
---

You are an expert technical writer for this project.

## Your role
- You are fluent in Markdown and can read TypeScript code
- You write for a developer audience
- Your task: read code from `src/` and generate documentation in `docs/`

## Commands you can use
Build docs: `npm run docs:build`
Lint markdown: `npx markdownlint docs/`

## Boundaries
- ✅ Always do: Write new files to `docs/`, follow style examples
- ⚠️ Ask first: Before modifying existing documents in a major way
- 🚫 Never do: Modify code in `src/`, edit config files, commit secrets
```

这个案例展示了"角色定位法"的威力：
- **明确角色**：不是"helpful assistant"，而是"expert technical writer"
- **明确能力边界**："read from `src/`"但"write to `docs/`"
- **给可执行命令**：Agent 可以自己跑 `npm run docs:build` 来验证结果

### 前端实战：写一个组件生成 Skill

学了这么多理论和案例，是时候动手了！假设你的团队有一套 React 组件开发规范，你想让 Agent 自动按规范生成组件，那我们一步步来写一个。

**目录结构：**

```
.cursor/
└── skills/
    └── react-component/
        ├── SKILL.md
        └── references/
            └── conventions.md
```

**SKILL.md 完整内容：**

```markdown
---
name: react-component
description: Scaffold React components with TypeScript following team conventions. Use when the user asks to create, generate, or scaffold a React component, or mentions creating a new UI element.
---

# React Component Generator

## File Structure

For a component named `UserCard`:

\```
src/components/UserCard/
├── index.tsx          # Component implementation
├── UserCard.module.css  # Scoped styles
├── UserCard.test.tsx    # Unit tests
└── types.ts           # Type definitions (if complex)
\```

## Implementation Template

\```tsx
import styles from './UserCard.module.css'

interface UserCardProps {
  name: string
  avatar?: string
  onClick?: () => void
}

export function UserCard({ name, avatar, onClick }: UserCardProps) {
  return (
    <div className={styles.container} onClick={onClick}>
      {avatar && <img src={avatar} alt={name} className={styles.avatar} />}
      <span className={styles.name}>{name}</span>
    </div>
  )
}
\```

## Rules

1. Named exports only, no default exports
2. Props interface in same file (unless 10+ props → extract to types.ts)
3. Use CSS Modules for styling, BEM-like class naming
4. Hooks extract to `useXxx.ts` when logic exceeds 15 lines
5. Every component must have at least one test covering render + key interaction

## Test Template

\```tsx
import { render, screen } from '@testing-library/react'
import { UserCard } from '.'

describe('UserCard', () => {
  it('renders user name', () => {
    render(<UserCard name="Winty" />)
    expect(screen.getByText('Winty')).toBeInTheDocument()
  })
})
\```

## Boundaries

- ✅ Create files in `src/components/`
- ⚠️ Ask before modifying existing shared components
- 🚫 Never modify `src/utils/` or config files

## Detailed Conventions

For complete coding standards, see [conventions.md](references/conventions.md)
```

这个 Skill 只有约 60 行正文，但信息密度很高：有文件结构、代码模板、规则清单、测试模板和明确边界。Agent 拿到后能直接执行，不需要额外猜测。

### 避坑指南

有了实战经验，再来看看常见的坑。这些都是我踩过或者看别人踩过的，帮大家提前避开：

#### 1. description 写得太模糊

```yaml
# ❌ Agent 完全不知道什么时候该用你
description: Helps with frontend stuff.

# ✅ 明确能力 + 触发场景
description: Create and style React components with TypeScript and CSS Modules. Use when building UI components, pages, or layouts.
```

#### 2. 正文太啰嗦

AI Agent 已经很聪明了，不需要解释"什么是 React""什么是 TypeScript"。只写它不知道的信息：你们团队的规范、项目的特殊约定、偏好的技术方案。

#### 3. 给太多选择

```markdown
# ❌ Agent 会困惑到底该用哪个
You can use styled-components, or CSS Modules, or Tailwind, or Emotion...

# ✅ 给一个默认方案，必要时提供备选
Use CSS Modules for component styling.
For utility-based layouts, use Tailwind CSS classes instead.
```

#### 4. 忘记设边界

没有边界的 Skill，就像没有护栏的高速公路。Agent 可能会：
- 改了不该改的配置文件
- 删了别人的代码
- 往仓库里提交了密钥

**一定要写 Boundaries 部分！**

#### 5. 名称太泛

```yaml
# ❌ 毫无辨识度
name: helper
name: utils
name: tools

# ✅ 一看就知道干什么
name: react-component
name: api-test-generator
name: commit-message
```

### 总结

最后总结一下，写好一个 AI Agent Skill 的核心要点：

1. **只写 Agent 不知道的事**：团队私有约定才值得写，前端基础知识不用教
2. **按风险调管控力度**：危险操作严格管控，创造性任务放手让 Agent 发挥
3. **内容分层加载**：核心规则放 SKILL.md，详细文档拆到 references/
4. **用代码说话**：一个真实的代码示例，顶三段文字解释
5. **画好三条线**：能做 / 要问 / 别碰，防止 Agent 越界
6. **多步任务锁顺序**：编号清单保证步骤不乱、不漏
7. **确定性操作封装脚本**：能用脚本跑的，就别让 Agent 手写
8. **交付前设质检门**：Pre-Delivery Checklist 让交付质量翻倍
9. **参数化设计**：一个 Skill 搞定 N 种场景，一鱼多吃
10. **亮出项目工具箱**：告诉 Agent 有哪些趁手工具可以用

Agent Skills 已经被 Cursor、Claude、GitHub Copilot 等主流工具采纳，是一个**开放标准**。现在花时间学好它的写法，相当于给你的 AI 协作能力做一次"基建升级"。

看完别光收藏，建议先从你们团队最痛的那个点开始——比如组件规范、代码风格、提交格式——写你的第一个 Skill 试试。

如果你想快速上手，这几个资源值得收藏：
- **官方规范**：https://agentskills.io
- **官方示例仓库**：https://github.com/anthropics/skills （⭐ 71k+）
- **Cursor 官方文档**：https://cursor.com/docs/context/skills
- **GitHub 最佳实践**：[How to write a great agents.md](https://github.blog/ai-and-ml/github-copilot/how-to-write-a-great-agents-md-lessons-from-over-2500-repositories/)

### 最后

欢迎扫码加我微信，拉你进技术群，长期交流学习...

欢迎关注「前端Q」,认真学前端，做个有专业的技术人...

![](https://mmbiz.qpic.cn/sz_mmbiz_jpg/2wV7LicL762ZePKQemg99H6tkm8KTFVk0Nib7DXYY4O45q6WQG4GElKAZMbt2MgD5zlLibLqbeDAl0nnhhQc203Ww/640?wx_fmt=jpeg&tp=webp&wxfrom=5&wx_lazy=1#imgIndex=6)
