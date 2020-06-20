# 打代码太苦，你需要一个鼓励师

### 背景

VS Code 是前端最牛逼最流行的开发工具之一，它本身是一个轻量级的开发者工具，但是它有一个庞大而种类丰富的插件生态，你可以安装自己需要的插件，而且扩展程序运行于独立的进程中，这样编辑器运行速度就不会受插件影响，因此备受 VS Code 广大开发者追捧。

大家在 VS Code 的插件库中可以看到各种各样的插件，有非常实用的的，有非常便捷的，能够给开发者带来效率上的提升以及开发上的帮助，不过除了实用之外，还有一些让人疑惑，沙雕的插件也挺有意思的。

今天我们就来列举一下 VS Code 上的那些“鼓励师”插件，打代码太苦，需要被鼓励一下，相信总有一款适合你。

### 语境语音鼓励师

#### VSCode Rainbow Fart

VSCode Rainbow Fart 是一个在你编程时持续夸你写的牛逼的扩展，可以根据代码关键字播放贴近代码意义的真人语音。

**特点**

- 采用真人语音，共计 34 个音频文件。
- 目前支持 JavaScript（ES6 ） 语言的常用关键字
- 提供针对时间的语音：如提醒吃午饭、下班关怀等等
- 提供针对产品经理的语音：如 fuck, shit

图片已无法展示它的魅力，直接看视频吧，记得打开声音，看着视频感受，会识别代码发出不同的鼓励哟～

**安装使用**

目前该插件还没发布到官方插件库，需要手动下载哦，地址如下：

https://saekiraku.github.io/vscode-rainbow-fart/#/zh/

**使用步骤**

1. 下载插件
2. 在 VSCode 的菜单栏中找到 `查看 - 命令面板`，或使用快捷键 `Ctrl + Shift + P（MacOS Command + Shift + P）`
3. 在 `命令面板` 中输入 > `Extensions: Install from VSIX` 并回车
4. 在弹出的 文件选择窗口 中找到下载的插件并打开
5. 安装完成，再次呼出 `命令面板` 输入 >`Enable Rainbow Fart`并回车以启动插件
6. 点击右下角弹出通知的`Open`按钮（或访问 http://127.0.0.1:7777/ ）
7. 遵循打开的网页的说明使用本插件

### 明星鼓励师

#### 超越鼓励师

在 VS Code 中连续写代码一小时（时间可配置），会有杨超越提醒你该休息啦~

除了每过一小时会自动弹出提醒页面，也可以按 F1, 然后输入 ycy: 打开提醒页面来打开提醒页面～

**配置**

- ycy.reminderViewIntervalInMinutes: 展示提醒页面的时间间隔（分钟）。(默认值为 60)
- ycy.title: 提示文字。 (默认值为小哥哥，小哥哥，代码写久了，该休息啦~)
- ycy.type: default (默认图)；url (图片地址)。(默认值为 default)
- ycy.customImages: 配置图片数组（需要搭配 ycy.type 为 url） (默认值为默认图片)

  如下例子，使用自定义图片：

```js
  "ycy.type": "url",
  "ycy.customImages": [
  "http://b-ssl.duitang.com/uploads/item/201806/04/20180604090459_gqqjo.jpg"
  ]
```

#### 坤坤鼓励师

在 VS Code 中连续写代码一小时（时间可配置），会有蔡徐坤专属篮球舞提醒你该休息啦！鸡你太美

除了每过一小时会自动弹出提醒页面，也可以按 F1, 然后输入 ycy: 打开提醒页面来打开提醒页面～

**配置**

- cxk.reminderViewIntervalInMinutes: 展示提醒页面的时间间隔（分钟）。 (默认值为 60)

#### 燕姿鼓励师

燕姿鼓励师 for vscode，写代码不再孤单，孙燕姿陪着你~

在 VS Code 中连续写代码一小时（时间可配置），会有孙燕姿提醒你该休息啦~

**配置**

如下例子，启用网络图片/视频，支持[jpg/png/mp4]格式：

```js
"syz.resWeb": true,
"syz.webResources": [
    "https://github.com/kanbang/links/raw/master/pic/1.jpg",
    "https://github.com/kanbang/links/raw/master/pic/2.jpg",
    "https://github.com/kanbang/links/raw/master/video/Stefanie%20Sun/shenqi.mp4",
    "https://github.com/kanbang/links/raw/master/video/Stefanie%20Sun/banjuzaijian.mp4"
]
```

#### 居老师鼓励师

在 VS Code 中连续写代码一小时（时间可配置），会有居老师提醒你该休息啦~

除了每过一小时会自动弹出提醒页面，也可以按 F1, 然后输入 zyl: 打开提醒页面来打开提醒页面~

**配置**

如下例子，使用自定义图片:

```js
"zyl.type": "url",
"zyl.customImages": [
    "http://zyl.jpg"
]
```

### 二次元鼓励师

#### Miku 鼓励师

在 VS Code 中连续写代码一小时（时间可配置），会有 Miku 出来提醒你休息~

除了每过一小时会自动弹出提醒页面，也可以按 F1, 然后输入 `miku: 世界第一公主殿`下来打开提醒页面~

**配置**

- miku.reminderViewIntervalInMinutes: 展示提醒页面的时间间隔（分钟）。(默认值为 60)
- miku.title: 提示文字。 (默认值为在吗，多喝热水~)
- miku.type: default (默认图)；url (图片地址)。(默认值为 default)
- miku.customImages: 配置图片数组（需要搭配 miku.type 为 url） (默认值为默认图片)

如下例子，使用自定义图片：

```js
"miku.type": "url",
"miku.customImages": [
    "http://xxx.jpg"
]
```

### 多功能鼓励师

#### 超级鼓励师

这里有美图、名言、方便开发的小工具、常见 API、优质博客项目推荐还有各种娱乐项目等你来体验,希望能为努力工作的您带来鼓励和帮助!

**亮点**

- 实时更新的博客/项目推荐页
- 可视化配置
- 基于百度图片搜索，根据用户设置的关键字（可配置多个）进行个性化搜索，您的最爱在等你。
- 支持收藏功能，动手网罗天下美图吧！
- 游戏，破坏，发呆娱乐体验
- 常见 api 推荐
- 提供常见工具
- 一言精选功能
- 不仅支持特定时间间隔召唤，还支持自然时间（半点，整点）召唤。
- 支持百度动图搜索

**使用方法**

召唤鼓励师的几种方式：

- 通过右上编辑器导航（礼物图标）
- 通过点击右下角的状态栏“超级鼓励师”
- 通过文件右键菜单‘super.call:召唤超级鼓励师’
- F1 进入命令选择，激活命令：super.call:召唤鼓励师
- 热键 Ctrl/Cmd+F1

### 总结

娱乐一下，给生活一点甜，赶紧试试吧～

### 最后

- 欢迎加我微信(winty230)，拉你进技术群，长期交流学习...
- 欢迎关注「前端 Q」,认真学前端，做个有专业的技术人...

![GitHub](https://raw.githubusercontent.com/LuckyWinty/blog/master/images/qrcode/%E4%BA%8C%E7%BB%B4%E7%A0%81%E7%BE%8E%E5%8C%96%202.png)
