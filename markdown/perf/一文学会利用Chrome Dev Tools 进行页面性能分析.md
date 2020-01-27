# 一文学会利用 Chrome Dev Tools 进行页面性能分析

### 背景
我们经常使用 Chrome Dev Tools 来开发调试，但是很少知道怎么利用它来分析页面性能，这篇文章，我将详细说明怎样利用 Chrome Dev Tools 进行页面性能分析及性能报告数据如何解读。

### 分析面板介绍
![GitHub](https://raw.githubusercontent.com/LuckyWinty/blog/master/images/perf/1.png)
上图是 Chrome Dev Tools 的一个截图，其中，我认为能用于进行页面性能快速分析的主要是图中圈出来的几个模块功能，这里简单介绍一下：
+ Network : 页面中各种资源请求的情况，这里能看到资源的名称、状态、使用的协议(http1/http2/quic...)、资源类型、资源大小、资源时间线等情况
+ Performance : 页面各项性能指标的火焰图，这里能看到白屏时间、FPS、资源加载时间线、longtask、内存变化曲线等等信息
+ Memory : 可以记录某个时刻的页面内存情况，一般用于分析内存泄露
+ JavaScript Profiler : 可以记录函数的耗时情况，方便找出耗时较多的函数
+ Layers : 展示页面中的分层情况

### 分析步骤说明

首先，我们在分析的时候，建议使用隐身模式打开页面，排除一些插件等因素对页面性能情况的影响。然后，我们把页面缓存勾选去掉，要测 disable cache 的情况，再把网络情况调整一下，我们用电脑打开页面的时候一般都连着 wifi 等，要更真实一些去测页面的性能，还是把网络调到 3G 等情况比较好，如图：
![GitHub](https://raw.githubusercontent.com/LuckyWinty/blog/master/images/perf/2.jpg)
调整好之后，我们切到 Performance 面板，这里先说明一下一些按钮的作用：
![GitHub](https://raw.githubusercontent.com/LuckyWinty/blog/master/images/perf/3.jpg)
上图，从左到右分别代表的是：
1. 手动开始记录，开始后需要手动结束
2. 自动重启页面，并记录整个页面加载的过程。这个是最常用的，一般大概分析页面性能的时候都是点这个就够了
3. 清除性能录制的记录
4. 上传页面性能录制的数据
5. 下载页面性能录制的数据
6. 选择要展示的性能记录。你可能进行了多次分析，这里可以切换去看每次的结果
7. 是否捕捉页面加载过程的截图，这个一般都要勾选
8. 是否记录内存变化，这个一般都要勾选
9. 垃圾回收，点击了即进行一次垃圾回收

这里，我以京东的一个页面为例,勾选 disable cache,网络情况为 Fast 3G，来说明一下，应该如何理解性能结果，找出优化点。

### 从网络面板分析

我们来看看网络面板，看看都有哪些信息。如下图所示：
![GitHub](https://raw.githubusercontent.com/LuckyWinty/blog/master/images/perf/4.jpg)
从图中可以看出，页面中有的一些性能优化手段有：
1. 页面直出，输入`https://wq.jd.com/wxportal/index_v6` ,页面加载回来的 document 就是一个渲染好的 html 页面
2. 图片优化，部署在不同的CDN域名下，用webp/dpg等格式图片，图片切割等
3. http 协议有部分采用 http2，多路复用，加快资源加载
4. 小 logo 使用base42来处理
5. 按需加载，菜单先加载第一屏的图标，滑动到第二屏时再加载第二屏的图标

而从图片，个人认为，还可以考虑用上的一些性能优化手段有：
1. html 的大小为138kb,Content Download的时间为七百多毫秒，感觉可以拆分一下页面，非一二屏的内容分开加载。
2. TTFB(Time To First Byte)为五百多毫秒,在下载第一个字节之前等待的时间过久，不过这里主要是用户网络情况影响，可以做的比较少。如DNS解析优化，减少后端服务处理时间等
3. 合并雪碧图，大轮播图下面的菜单分类那里的图标，可以用一张雪碧图来集合这些图标
4. 顶部轮播图，在首次加载时，可以先加载第一帧的图片，后面几帧延后一下
5. 图片较多，可以的话，都用 http2 协议

### 从性能面板分析

切到 Performance 面板，点击自动重启页面，并记录整个页面加载的过程，然后来分析结果～​

#### 网络&&白屏
性能面板，有很多很多的参数，我们要看一些比较常见的。首先看白屏时间和网络加载情况，如下图：
![GitHub](https://raw.githubusercontent.com/LuckyWinty/blog/master/images/perf/5.jpg)
上图，我们可以看几点信息：
1. 本次页面加载的白屏时间约为 1000 ms
2. FPS 曲线没有标红，如果有很多标红的则说明页面存在渲染卡顿多的地方
3. 从网络资源加载情况来看，图片没有启用 http2，因此每次可以同时加载的图片数有限，未被加载的图片有等待过程
4. 资源的加载时间也可以看到，比如轮播的背景图加载了近 700 毫秒，时间有点长

另外，我们可以看一下资源加载有没有空白期，虽然上图没有，但是如果资源加载之间存在空白期，说明没有充分利用资源加载的空闲时间，可以调整一下。

#### 火焰图
火焰图，主要在 Main 面板中，是我们分析具体函数耗时最常看的面板，我们来看一下，如图：
![GitHub](https://raw.githubusercontent.com/LuckyWinty/blog/master/images/perf/7.png)

首先，面板中会有很多的 Task，如果是耗时长的 Task，其右上角会标红(图中没有，说明页面首屏的逻辑处理分配得还不错)，这个时候，我们可以选中标红的 Task (这里就随手选中一个)，然后放大(选中，滑动鼠标可放大)，看其具体的耗时点。

放大后，这里可以看到都在做哪些操作，哪些函数耗时了多少,这里代码有压缩，看到的是压缩后的函数名。然后我们点击一下某个函数，在面板最下面，就会出现代码的信息，是哪个函数，耗时多少，在哪个文件上的第几行等。这样我们就很方便地定位到耗时函数了。

还可以横向切换 tab ，看它的调用栈等情况，更方便地找到对应代码。具体大家可以试试～

#### 时间线&&内存情况
在 Timings 的区域，我们可以看到本次加载的一些关键时间，分别有：
+ FCP: First Contentful Paint
+ LCP: Largest Contentful Paint
+ FMP: First Meaningful Paint
+ DCL: DOMContentLoaded Event
+ L: Onload Event

我们可以选区(选择从白屏到有内容的区域，代表本次的页面加载过程)，可以对照着看一下上面的时间，截图如下：
![GitHub](https://raw.githubusercontent.com/LuckyWinty/blog/master/images/perf/6.jpg)
另外，我们可以看到页面中的内存使用的情况，比如 JS Heap(堆)，如果曲线一直在增长，则说明存在内存泄露，从图中可以看出，相当长的一段时间，内存曲线都是没有下降的，这里是有发生内存泄露的可能的，在 Onload 之后，内存才得到释放。更多内存泄露产生的原因及分析方法，可以参照我的这篇文章《[Chrome 浏览器垃圾回收机制与内存泄漏分析](https://github.com/LuckyWinty/blog/blob/master/markdown/Q%26A/Chrome%20%E6%B5%8F%E8%A7%88%E5%99%A8%E5%9E%83%E5%9C%BE%E5%9B%9E%E6%94%B6%E6%9C%BA%E5%88%B6%E4%B8%8E%E5%86%85%E5%AD%98%E6%B3%84%E6%BC%8F%E5%88%86%E6%9E%90.md)》

最下方就是页面的一个整理耗时概况，如果 Scripting 时间过长，则说明 js执行的逻辑太多，可以考虑优化js，如果渲染时间过长，则考虑优化渲染过程，如果空闲时间过多，则可以考虑充分利用起来，比如把一些上报操作放到页面空闲时间再上报等。

### 其他面板

以上就是性能面板可以看的一些信息。另外，我们可以借助 Layers面板来查看页面分层情况的3D视图，Rendering面板(点击more tools->Rendering即可打开)，勾选Layer Bordersk可以看到复合层、RenderLayer区域，可以帮助分析动画卡顿、是否开启GPU加速等问题，而 Memory 面板 和 JavaScript Profiler 面板主要是分析内存泄露的，这里就不说了，可以看我另一篇文章《[Chrome 浏览器垃圾回收机制与内存泄漏分析](https://github.com/LuckyWinty/blog/blob/master/markdown/Q%26A/Chrome%20%E6%B5%8F%E8%A7%88%E5%99%A8%E5%9E%83%E5%9C%BE%E5%9B%9E%E6%94%B6%E6%9C%BA%E5%88%B6%E4%B8%8E%E5%86%85%E5%AD%98%E6%B3%84%E6%BC%8F%E5%88%86%E6%9E%90.md)》

### 用Audits工具分析

Audits 其实就是 LightHouse，LightHouse 是Google开源的一个自动化测试工具，它通过一系列的规则来对网页进行评估分析，最终给出一份评估报告。它的面板是这样的：
![GitHub](https://raw.githubusercontent.com/LuckyWinty/blog/master/images/perf/8.jpg)

#### 整体情况
Audits主要从5个方面来给网页打分，当然你也可以去掉某些方面的评估。在选择了设备、评估方面、网络情况等选项后，点击 Run Audits ,我们将会得到一份报告。
![GitHub](https://raw.githubusercontent.com/LuckyWinty/blog/master/images/perf/9.jpg)

上图是一个总体报告，可以看出，这个页面的性能不太合格。当然一次的测试也说明不了什么问题，只能做个参考。我们看它的性能指标分别有：
+ First Contentful Paint：内容首次开始绘制。
+ First Meaningful Paint：可以简单理解为用户看到网页主要内容的时间，分数越低，页面显示其主要内容的速度就越快。图中例子，网页首次有效绘制时间为2.5s。
+ Speed Index：速度指标是一个页面加载性能指标，向你展示明显填充页面内容的速度，此指标的分数越低越好。
+ First CPU Idle：首次 CPU 空闲时间
+ Time to Interactive：可互动时间，页面中的大多数网络资源完成加载并且CPU在很长一段时间都很空闲的所需的时间。此时可以预期cpu非常空闲，可以及时的处理用户的交互操作。
+ Max Potential First Input Delay：最大的输入延迟时间，输入响应能力对用户如何看待你应用的性能起着关键作用。应用有 100 毫秒的时间响应用户输入。如果超过此时间，用户就会认为应用反应迟缓。

这些时间，都可以点击图中红框切换展示方式，会附上对应的时间解释，然后可以点击 Learn more 来查看详细的指标介绍。在文档中，每一项指标都会明确的分为三个部分：为什么说此审查非常重要；如何通过此审查；如何实现此审查；

#### 性能指标优化建议解读

性能建议主要分为3类， Opportunities 可优化项、手动诊断项、通过的审查项。本次的例子如下图：
![GitHub](https://raw.githubusercontent.com/LuckyWinty/blog/master/images/perf/10.jpg)

图中的每一项都可以展开来看明细解释，其中：

**可优化项有2个建议：**

1. 延迟会阻塞渲染的资源加载，这里是一个 navfoot.6bf68af7.css
2. 延迟视口外的图片加载，这里列举了不必要加载的图片(和我上文提的优化建议一致，哈哈)

这项里面的内容指的是LightHouse发现的一些可以直接优化的点，你可以对应这些点来进行优化。

**手动诊断项有6个建议：**

1. 最小化主线程工作
2. 减少JavaScript执行时间
3. 避免DOM太大
4. 通过有效的缓存策略缓存一些静态资源
5. 避免链接关键请求
6. 保持低请求数量和小传输大小

这些项目表示LightHouse并不能替你决定当前是好是坏，但是把详情列出来，由你手动排查每个项目的情况

**通过的审查项**

这里列出的都是做的好的地方，本文例子共有16条，不过即使做的好，依然值得我们进去仔细看一下，因为像所有条目一样，这里的每个条目也有一个showmore，我们可以点进去仔细学习背后的知识和原理！

#### Accessibility辅助功能
辅助功能指的是那些可能超出"普通"用户范围之外的用户的体验，他们以不同于你期望的方式访问你的网页或进行交互，本文的例子建议如下图：
![GitHub](https://raw.githubusercontent.com/LuckyWinty/blog/master/images/perf/11.jpg)

辅助功能类别测试屏幕阅读器的能力和其他辅助技术是否能在页面中正常工作。例如：按元素来使用属性，标签使用是否规范，img 标签是否缺少 alt 属性，可辨别的元素命名等等。这一项我们不展开讲，但是还是建议大家按照审计建议修改一下网页。

其他几项，本文的例子最佳实践评分挺高的，而例子不支持PWA，也不需要考虑SEO，这里就不展开说明了，有对应需求的可以自己详细看看即可。

### 总结
最后总结一下，我们利用Chrome Dev Tools 进行页面性能分析有以下指标可以参考：
+ 从网络面板分析
+ 从性能面板分析
+ 从Memory面板等分析内存泄露
+ 用Audits工具分析

而这些分析方法，本文都详细写了。可以认真看看～

### 最后
+ 欢迎加我微信(winty230)，拉你进技术群，长期交流学习...
+ 欢迎关注「前端Q」,认真学前端，做个有专业的技术人...

![GitHub](https://raw.githubusercontent.com/LuckyWinty/blog/master/images/qrcode/%E4%BA%8C%E7%BB%B4%E7%A0%81%E7%BE%8E%E5%8C%96%202.png)