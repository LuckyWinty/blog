# Context 工程：如何把正确的上下文喂给 AI

前两篇我们聊了怎么教 AI 干活（Skills），以及怎么给 AI 接上工具（MCP）。

但你有没有碰到过这种情况——

AI 明明很"聪明"，工具也都接好了，结果你让它改个 bug，它改的完全不是你想要的文件；你让它写个组件，它生成了一套跟项目风格完全不搭的代码。

这不是 AI 笨，也不是工具不行，**而是你"喂"给它的上下文不对。**

你可以把 AI 想象成一个远程结对编程的同事——他水平很高，但**他只能看到你屏幕共享的那部分内容**。你共享的窗口太小，他看不全；你共享了整个桌面，他又被一堆无关的东西干扰。

**Context 工程，就是"学会精准地给 AI 共享屏幕"。**

![上下文 = AI 的视野](https://raw.githubusercontent.com/LuckyWinty/blog/master/markdown/AI/images/context-engineering-funnel.jpg)

### 什么是 Context 工程？和 Prompt 工程有啥区别？

很多人把"写好 Prompt"和"管好 Context"混为一谈。其实它们解决的是两个完全不同的问题：

- **Prompt 工程**：研究"怎么问问题"——措辞、格式、角色设定、思维链……让 AI 更准确地理解你的意图
- **Context 工程**：研究"给 AI 看什么"——哪些文件、哪些代码、哪些规范应该在 AI 的"视野"里

打个比方：Prompt 工程是你"怎么跟同事说话"，Context 工程是你"把哪些文档放到同事桌上"。

说得再直白一点：**Prompt 写得再好，如果 AI 看不到正确的代码和背景信息，它照样写出离谱的东西。** 

所以在实际 AI 编码中，Context 工程比 Prompt 工程更重要，也更容易被忽略。

### AI 需要哪两类上下文？

不管你用 Cursor、Claude Code 还是 Continue，AI 每次干活时需要的上下文，本质上就两类：

![意图上下文 vs 状态上下文](https://raw.githubusercontent.com/LuckyWinty/blog/master/markdown/AI/images/context-intent-vs-state.jpg)

**1）意图上下文（Intent Context）—— "你想让我干嘛"**

就是你的指令、目标、约束条件。比如：
- "帮我修复登录页面的 bug，用户点击登录按钮没反应"
- "写一个新的 UserCard 组件，用 CSS Modules，不要用 Tailwind"
- "重构这个函数，但不要改变外部接口"

这些信息告诉 AI"方向在哪"。

**2）状态上下文（State Context）—— "现在是什么情况"**

就是当前项目的实际状态。比如：
- 当前文件的代码内容
- 报错信息和堆栈
- 项目的目录结构和技术栈
- Git 分支和最近的提交记录
- 相关文件的依赖关系

这些信息告诉 AI"现场长什么样"。

**AI 输出的质量 = 意图上下文 × 状态上下文。**

缺了意图，AI 不知道该往哪个方向走。缺了状态，AI 只能靠猜——猜你的项目结构、猜你的技术栈、猜你的代码风格，猜来猜去就跑偏了。

很多时候你觉得 AI "不好用"，仔细想想，是不是其实你只给了意图（"帮我写个组件"），但没给状态（"我的项目用的什么框架、组件放在哪、样式方案是啥"）？

### 上下文窗口：AI 的"工作记忆"有上限

这里要讲一个很关键但很多人不太清楚的事儿：**AI 的上下文窗口是有容量上限的。**

你可以把它想象成 AI 的"工作台桌面"。桌面就这么大，你堆的文件越多，它越容易手忙脚乱、找不到重点。

目前主流 AI 模型的上下文窗口大概在 128K~200K token 左右。听起来很大，但一个中等规模的前端项目，光 `src/` 目录下的代码就可能超过这个数。**你不可能把所有代码都"放到桌上"。**

![上下文窗口最佳区间](https://raw.githubusercontent.com/LuckyWinty/blog/master/markdown/AI/images/context-sweet-spot.jpg)

所以就有了一个"甜蜜区间"的概念：

- **上下文占用 < 40%**：AI 缺信息，容易瞎猜、编造不存在的函数或文件
- **上下文占用 40%~60%**：信息刚刚好，AI 既有足够的背景，又不会被无关内容干扰
- **上下文占用 > 60%**：信息过载，AI 开始"迷路"——可能忽略重要信息，或者前后矛盾

**Context 工程的核心目标，就是把上下文控制在那个甜蜜区间里。**

### 上下文的四个层次

在 Cursor、Claude Code 这类 AI 编辑器里，上下文其实是分层的，从自动到手动，从低到高：

![上下文四层模型](https://raw.githubusercontent.com/LuckyWinty/blog/master/markdown/AI/images/context-layers.jpg)

#### 第一层：自动上下文（AI 自己收集的）

你什么都不用做，AI 编辑器就会自动收集一些信息：

- **当前打开的文件**：你正在看的代码，AI 自然也能看到
- **打开的标签页**：Cursor 会参考你 IDE 里打开的其他文件
- **代码库索引**：AI 编辑器会在后台给你整个项目建索引，用语义搜索找相关代码

这一层是"基线"，不需要你操心，但也**不要过度依赖**。因为自动上下文的选择经常不够精准——特别是大型项目，AI 自动找到的文件可能跟你当前任务关系不大。

#### 第二层：手动上下文（你主动"喂"给 AI 的）

这是提升 AI 输出质量最立竿见影的方法——**直接告诉 AI 应该看哪些文件。**

在 Cursor 里，你可以用 `@` 符号来精准引用：

- `@Files` —— 指定某个具体文件："看一下 @src/hooks/useAuth.ts"
- `@Folders` —— 指定某个目录："参考 @src/components/ 下的组件风格"
- `@Code` —— 指定某段代码：选中代码后引用
- `@Docs` —— 引用文档：让 AI 参考外部文档
- `@Git` —— 引用 Git 信息：最近的 commit、diff 等

在 Claude Code 里也有类似的机制，你可以在对话中直接粘贴文件内容或路径。

**我的经验：养成习惯，每次给 AI 派任务前，先花 10 秒想一想"它需要看到哪几个文件"，然后用 @ 手动引用。** 这 10 秒的投入，能省你后面 10 分钟的返工。

举个真实例子：

```
❌ 差的做法：
"帮我写一个用户列表页面"
→ AI 不知道你的路由怎么配、组件怎么写、请求怎么发，只能按它自己的理解来

✅ 好的做法：
"帮我写一个用户列表页面，
参考 @src/pages/OrderList/index.tsx 的页面结构，
用 @src/hooks/useRequest.ts 里封装的请求方法，
样式参考 @src/pages/OrderList/index.module.css"
→ AI 有了三个"参照物"，写出来的代码跟项目风格一致
```

你看，区别就在于你有没有把"参照物"给到位。

#### 第三层：规则上下文（长期生效的"项目记忆"）

手动 @ 每次都要重复，有没有什么办法让 AI 自动就知道一些规则？有，就是通过配置文件来实现"持久化记忆"：

| 工具 | 配置文件 | 作用 |
|------|---------|------|
| Cursor | `.cursor/rules/*.mdc` | 项目级规则，支持 glob 匹配特定文件类型 |
| Claude Code | `CLAUDE.md` | 项目根目录放一个文件，永久生效 |
| GitHub Copilot | `.github/copilot-instructions.md` | Copilot 全局指令 |
| 通用 | `AGENTS.md` | 跨工具通用的 Agent 指令文件 |

这一层的好处是"一次配置，每次生效"。你把团队的编码规范、技术栈偏好、目录约定写进去，AI 每次对话都能自动读取。

前面 Skills 那篇文章里讲的 `.cursor/rules/` 就属于这一层。如果你还没配过，强烈建议先去配一个最基础的——至少告诉 AI 你们用什么框架、什么样式方案、组件放在哪个目录。

#### 第四层：会话上下文（当前对话的"短期记忆"）

就是你和 AI 在当前这轮对话中的所有聊天记录。AI 会记住你前面说了啥、它前面改了啥。

但这里有个坑：**对话越长，AI 越容易"忘事"。**

因为上下文窗口是有限的，聊天记录越长，早期的内容就越容易被"挤掉"或"淡化"。这在 AI 研究里叫"lost in the middle"——中间的信息最容易被忽略。

**所以我的建议：一个任务一轮对话，做完就开新的。** 别在一个对话里又改 bug、又写新功能、又做重构，那样后期的输出质量一定会下降。

### 实操：8 个马上能用的 Context 管理技巧

原理讲完了，接下来说具体怎么做。这 8 个技巧是我自己用下来最有效的，从简到难排列，你可以一个一个试：

#### 技巧一：用 @ 引用代替"你去看看"

不要说"帮我参考项目里类似的页面"，AI 不一定能找到你想要的。直接 @ 具体文件：

```
❌ "参考项目里其他页面的写法"
✅ "参考 @src/pages/Dashboard/index.tsx 的写法"
```

精准引用，永远比让 AI 自己"搜"靠谱。

#### 技巧二：大项目用 .cursorignore 减负

就像 `.gitignore` 一样，`.cursorignore` 告诉 AI 编辑器"这些文件你不用管"：

```
# .cursorignore
node_modules/
dist/
build/
.next/
coverage/
*.lock
*.map
```

好处很直接：索引更快、搜索更准、AI 不会被 `node_modules` 里几万个文件干扰。

**但注意：千万别把 `src/`、`test/`、配置文件这些排除掉。** 它们是 AI 理解你项目的关键信息。

#### 技巧三：Monorepo 只打开你在做的那个包

如果你的项目是 Monorepo，别直接打开整个仓库根目录。

```
❌ 打开 /my-monorepo（包含 20 个子包，AI 疯狂索引）
✅ 打开 /my-monorepo/packages/web-app（只有你在做的那个包）
```

上下文窗口就这么大，只打开你正在开发的部分，AI 的"注意力"才能集中在正确的地方。

如果确实需要跨包引用，可以用 VS Code 的多根工作区（Multi-root Workspace），只挂载你需要的几个包。

#### 技巧四：写好 Rules 文件，让 AI 自动"懂规矩"

这个在 Skills 那篇详细讲过了，这里快速给个模板。在 `.cursor/rules/` 下创建一个 `project-context.mdc`：

```markdown
---
description: Project context and conventions
alwaysApply: true
---

## 技术栈
- React 18 + TypeScript 5
- 样式：CSS Modules
- 状态管理：Zustand
- 请求：封装在 src/api/request.ts

## 目录约定
- 页面：src/pages/[PageName]/index.tsx
- 组件：src/components/[Name]/index.tsx
- Hooks：src/hooks/use[Name].ts

## 编码规范
- 组件用 named export，不用 default export
- Props 用 interface 定义，命名为 [组件名]Props
- 日期处理用 dayjs，不要用 moment
```

这些信息 AI 每次对话都会自动读取，相当于你给 AI 安了一个"项目记忆芯片"。

#### 技巧五：用 Notepads 管理高频上下文片段

Cursor 有个很好用但很多人不知道的功能——**Notepads**。

你可以把一些经常要引用的上下文片段保存为 Notepad，比如：
- API 接口的类型定义
- 团队的 code review 标准
- 某个复杂业务逻辑的说明

需要的时候 `@Notepads` 一下就能引用，不用每次都重新粘贴。

#### 技巧六：一个任务一个对话，及时"翻篇"

前面说了，对话越长上下文质量越差。所以：

- 修一个 bug → 新对话
- 写一个新功能 → 新对话
- 做一次重构 → 新对话

在 Claude Code 里有个 `/clear` 命令可以清空当前上下文重新开始。Cursor 里直接新建一个 Composer 就行。

**别舍不得"之前聊了那么多"。** 带着一堆过时的上下文继续聊，不如干干净净地重新开始。AI 不需要"预热"，但它需要"干净的视野"。

#### 技巧七：长输出让 AI 写文件，别塞对话里

如果你让 AI 生成了一大段代码或者分析报告，别让它直接输出到对话里——那会严重挤占上下文窗口。

更好的做法是让 AI 把结果写到文件里：

```
❌ "帮我分析所有组件的依赖关系，列出来"
→ AI 输出 500 行分析结果，塞满了上下文窗口

✅ "帮我分析所有组件的依赖关系，结果写到 docs/dependency-analysis.md 里"
→ 上下文窗口保持干净，结果保存在文件里随时查看
```

#### 技巧八：定期审计你的 alwaysApply 规则

如果你在 `.cursor/rules/` 里配了很多 `alwaysApply: true` 的规则，它们**每次对话都会被加载**。随着规则越来越多，光是规则本身就可能吃掉不少上下文窗口。

建议定期审计：

- 真正需要"每次都看"的规则才设 `alwaysApply: true`
- 只跟特定文件类型相关的规则，用 `globs` 匹配，按需加载
- 过时的规则及时删掉

```yaml
# ✅ 只在写 React 组件时加载
---
description: React component conventions
globs: src/components/**/*.tsx
alwaysApply: false
---

# ❌ 不需要每次都加载的规则硬设成 alwaysApply
---
description: React component conventions
alwaysApply: true
---
```

### 三大主流工具的 Context 机制对比

你可能同时在用或者考虑用不同的 AI 编码工具，这里做个横向对比，帮你了解各家的上下文机制有什么差异：

| 特性 | Cursor | Claude Code | Continue（开源） |
|------|--------|-------------|----------------|
| 自动索引 | 语义嵌入索引，后台自动建 | 基于项目结构分析 | 支持多种索引方式，可配置 |
| 手动引用 | `@Files` `@Folders` `@Docs` `@Code` `@Git` | 对话中引用文件路径 | @ 符号 + 自定义 context provider |
| 持久化规则 | `.cursor/rules/*.mdc` | `CLAUDE.md` | `.continue/` 目录配置 |
| 上下文排除 | `.cursorignore` | 项目级配置 | `.continueignore` |
| 会话管理 | 新建 Composer / Chat | `/clear` 清空 | 新建会话 |
| Notepads | 支持 | 不支持（用 CLAUDE.md 替代） | 不支持 |
| 动态发现 | 语义搜索自动查找 | Agent 自主决定读取哪些文件 | 依赖配置的 context provider |

**如果你只用 Cursor**：重点掌握 `@` 引用、`.cursor/rules/`、`.cursorignore` 和 Notepads。

**如果你用 Claude Code**：重点掌握 `CLAUDE.md` 的写法和 `/clear` 的使用时机。

**如果你用 Continue**：重点研究 context provider 的配置，它的灵活性最高但上手门槛也最高。

### 一个完整的实战例子

来看一个真实场景，把上面讲的东西串起来。

**场景：你要在项目里新增一个"用户详情"页面。**

**第一步：确保规则上下文到位**

检查 `.cursor/rules/` 里有没有项目级规则文件。如果还没有，先写一个基础的（见前面技巧四的模板）。

**第二步：手动引用"参照物"**

打开 Composer，输入任务时带上具体的参考文件：

```
帮我新增一个用户详情页面 UserDetail，需求：
- 路由 /user/:id
- 根据 id 请求用户信息并展示

请参考：
- @src/pages/OrderDetail/index.tsx（页面结构参考）
- @src/hooks/useRequest.ts（请求方法）
- @src/router/config.ts（路由注册方式）
- @src/types/user.ts（用户类型定义）
```

**第三步：控制对话粒度**

不要说"帮我把这个页面从头到尾做完"。拆成几步：

1. 先让 AI 创建页面文件和注册路由
2. 确认路由没问题后，再让 AI 写页面主体逻辑
3. 最后让 AI 补测试

每一步做完确认一下，再继续下一步。这样每次 AI 需要处理的上下文更小、更精准。

**第四步：做完这个任务，开新对话**

用户详情页做完了，接下来要做另一个功能？别继续在这个对话里聊，新建一个 Composer，让 AI 带着"干净的视野"开始新任务。

### 避坑指南

最后说几个常见的坑，都是容易踩的：

#### 1. 别把所有文件都 @ 进去

有人觉得"给的越多越好"，一口气 @ 了 20 个文件。结果 AI 被信息淹没了，输出质量反而下降。

**原则：每次只引用跟当前任务直接相关的 3~5 个文件。**

#### 2. 别忽略报错信息

当你让 AI 修 bug 时，**一定要把完整的报错信息贴上去**。很多人只说"这里报错了"，AI 就只能靠猜。把 error stack 贴全，AI 的诊断准确率会高很多。

#### 3. 别在一个超长对话里"万事包办"

前面说了好几遍了：一个任务一个对话。对话长了，AI 会"忘事"，会前后矛盾，会把前面的要求和后面的要求混在一起。

#### 4. 别让自动上下文替你思考

AI 编辑器的自动索引和语义搜索确实能帮你找到一些相关文件，但它的判断不总是对的。**特别是大型项目或者 Monorepo，自动上下文经常"找错重点"。**

花 10 秒手动 @ 几个关键文件，永远比期待 AI 自己找对要靠谱。

#### 5. 别忘了"负面约束"

不光要告诉 AI "做什么"，也要告诉它 "不做什么"：

```
✅ "用 CSS Modules，不要用 Tailwind"
✅ "用 dayjs，不要用 moment"
✅ "只改 UserDetail 组件，不要动其他文件"
```

负面约束能有效防止 AI "自作主张"。

### 总结

Context 工程的核心就一句话：**让 AI 在正确的时间看到正确的信息。**

不多也不少，不早也不晚。太少了 AI 瞎猜，太多了 AI 迷路。

如果你今天只能记住三件事，那就是：

1. **每次 @ 3~5 个相关文件**，比什么都不给好 10 倍
2. **写一个 Rules 文件**，把项目的技术栈和目录规范告诉 AI
3. **一个任务一个对话**，别在长对话里"万事包办"

这三个习惯养成之后，你用 AI 编码的效率和质量会有一个明显的提升。

想要进一步了解，推荐这些资源：
- **Cursor 动态上下文发现**：https://cursor.com/blog/dynamic-context-discovery
- **Claude Code Context 工程**：https://claudefa.st/blog/guide/mechanics/context-engineering
- **Developer Toolkit 上下文管理指南**：https://developertoolkit.ai/en/shared-workflows/context-management/
- **Continue 开源项目**：https://github.com/continuedev/continue

### 最后

欢迎扫码加我微信，拉你进技术群，长期交流学习...

欢迎关注「前端Q」,认真学前端，做个有专业的技术人...

![](https://mmbiz.qpic.cn/sz_mmbiz_jpg/2wV7LicL762ZePKQemg99H6tkm8KTFVk0Nib7DXYY4O45q6WQG4GElKAZMbt2MgD5zlLibLqbeDAl0nnhhQc203Ww/640?wx_fmt=jpeg&tp=webp&wxfrom=5&wx_lazy=1#imgIndex=6)
