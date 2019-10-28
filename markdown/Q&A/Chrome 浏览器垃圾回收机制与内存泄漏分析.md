### Chorme 浏览器中的垃圾回收和内存泄漏

#### 垃圾回收
通常情况下，垃圾数据回收分为`手动回收`和`自动回收`两种策略。

手动回收策略，何时分配内存、何时销毁内存都是由代码控制的。
自动回收策略，产生的垃圾数据是由垃圾回收器来释放的，并不需要手动通过代码来释放。

##### JavaScript 中调用栈中的数据回收

JavaScript 引擎会通过向下移动 ESP(记录当前执行状态的指针) 来销毁该函数保存在栈中的执行上下文。

##### JavaScript 堆中的数据回收

在 V8 中会把堆分为`新生代`和`老生代`两个区域，新生代中存放的是生存时间短的对象，老生代中存放的生存时间久的对象。

新生区通常只支持 1～8M 的容量，而老生区支持的容量就大很多了。对于这两块区域，V8 分别使用两个不同的垃圾回收器，以便更高效地实施垃圾回收。

+ 副垃圾回收器，主要负责新生代的垃圾回收。
+ 主垃圾回收器，主要负责老生代的垃圾回收。

不论什么类型的垃圾回收器，它们都有一套共同的执行流程。

1. 第一步是标记空间中活动对象和非活动对象。所谓活动对象就是还在使用的对象，非活动对象就是可以进行垃圾回收的对象。
2. 第二步是回收非活动对象所占据的内存。其实就是在所有的标记完成之后，统一清理内存中所有被标记为可回收的对象。
3. 第三步是做内存整理。一般来说，频繁回收对象后，内存中就会存在大量不连续空间，我们把这些不连续的内存空间称为`内存碎片`，。当内存中出现了大量的内存碎片之后，如果需要分配较大连续内存的时候，就有可能出现内存不足的情况。所以最后一步需要整理这些内存碎片。(这步其实是可选的，因为有的垃圾回收器不会产生内存碎片).

##### 新生代中垃圾回收

新生代中用`Scavenge 算法`来处理，把新生代空间对半划分为两个区域，一半是对象区域，一半是空闲区域。新加入的对象都会存放到对象区域，当对象区域快被写满时，就需要执行一次垃圾清理操作。

在垃圾回收过程中，首先要对对象区域中的垃圾做标记；标记完成之后，就进入垃圾清理阶段，副垃圾回收器会把这些存活的对象复制到空闲区域中，同时它还会把这些对象有序地排列起来，所以这个复制过程，也就相当于完成了内存整理操作，复制后空闲区域就没有内存碎片了。

完成复制后，对象区域与空闲区域进行角色翻转，也就是原来的对象区域变成空闲区域，原来的空闲区域变成了对象区域。这样就完成了垃圾对象的回收操作，同时这种`角色翻转的操作还能让新生代中的这两块区域无限重复使用下去.`

为了执行效率，一般新生区的空间会被设置得比较小,也正是因为新生区的空间不大，所以很容易被存活的对象装满整个区域。为了解决这个问题，JavaScript 引擎采用了`对象晋升策略`,也就是经过两次垃圾回收依然还存活的对象，会被移动到老生区中。

##### 老生代中的垃圾回收

老生代中用`标记 - 清除（Mark-Sweep）`的算法来处理。首先是标记过程阶段，标记阶段就是从一组根元素开始，递归遍历这组根元素(遍历调用栈)，在这个遍历过程中，能到达的元素称为`活动对象`,没有到达的元素就可以判断为`垃圾数据`.然后在遍历过程中标记，标记完成后就进行清除过程。它和副垃圾回收器的垃圾清除过程完全不同，这个的清楚过程是删除标记数据。

清除算法后，会产生大量不连续的内存碎片。而碎片过多会导致大对象无法分配到足够的连续内存，于是又产生了`标记 - 整理（Mark-Compact）`算法，这个标记过程仍然与`标记 - 清除算法`里的是一样的，但后续步骤不是直接对可回收对象进行清理，而是让所有存活的对象都向一端移动，然后直接清理掉端边界以外的内存，从而让存活对象占用连续的内存块。

##### 全停顿

由于 JavaScript 是运行在主线程之上的，一旦执行垃圾回收算法，都需要将正在执行的 JavaScript 脚本暂停下来，待垃圾回收完毕后再恢复脚本执行。我们把这种行为叫做`全停顿`。

在 V8 新生代的垃圾回收中，因其空间较小，且存活对象较少，所以全停顿的影响不大，但老生代就不一样了。如果执行垃圾回收的过程中，占用主线程时间过久，主线程是不能做其他事情的。比如页面正在执行一个 JavaScript 动画，因为垃圾回收器在工作，就会导致这个动画在垃圾回收过程中无法执行，这将会造成页面的卡顿现象。

为了降低老生代的垃圾回收而造成的卡顿，V8 将标记过程分为一个个的子标记过程，同时让垃圾回收标记和 JavaScript 应用逻辑交替进行，直到标记阶段完成，我们把这个算法称为`增量标记（Incremental Marking）算法`.

使用增量标记算法，可以把一个完整的垃圾回收任务拆分为很多小的任务，这些小的任务执行时间比较短，可以穿插在其他的 JavaScript 任务中间执行，这样当执行上述动画效果时，就不会让用户因为垃圾回收任务而感受到页面的卡顿了。

### 内存泄漏
不再用到的内存，没有及时释放，就叫做内存泄漏（memory leak）。
#### 内存泄漏发生的原因
1. 缓存

有时候为了方便数据的快捷复用，我们会使用缓存,但是缓存必须有一个大小上限才有用。高内存消耗将会导致缓存突破上限，因为缓存内容无法被回收。

2. 队列消费不及时
当浏览器队列消费不及时时，会导致一些作用域变量得不到及时的释放，因而导致内存泄漏。

3. 全局变量

除了常规设置了比较大的对象在全局变量中，还可能是意外导致的全局变量，如：
```js
function foo(arg) {
    bar = "this is a hidden global variable";
}
```
在函数中，没有使用 var/let/const 定义变量，这样实际上是定义在`window`上面，变成了`window.bar`。
再比如由于`this`导致的全局变量：
```js
function foo() {
    this.bar = "this is a hidden global variable";
}
foo()
```
这种函数，在window作用域下被调用时，函数里面的`this`指向了`window`,执行时实际上为`window.bar=xxx`,这样也产生了全局变量。

4. 计时器中引用没有清除

先看如下代码：
```js
var someData = getData();
setInterval(function() {
    var node = document.getElementById('Node');
    if(node) {
        node.innerHTML = JSON.stringify(someData));
    }
}, 1000);
```
这里定义了一个计时器，每隔1s把一些数据写到Node节点里面。但是当这个Node节点被删除后，这里的逻辑其实都不需要了，可是这样写，却导致了计时器里面的回调函数无法被回收，同时，someData里的数据也是无法被回收的。

5. 闭包

看以下这个闭包：
```js
var theThing = null;
var replaceThing = function () {
  var originalThing = theThing;
  var unused = function () {
    if (originalThing)
      console.log("hi");
  };
  theThing = {
    longStr: new Array(1000000).join('*'),
    someMethod: function () {
      console.log(someMessage);
    }
  };
};
setInterval(replaceThing, 1000);
```
每次调用 `replaceThing` ，`theThing` 会创建一个大数组和一个新闭包（someMethod）的新对象。同时，变量 `unused` 是一个引用 `originalThing(theThing)` 的闭包，闭包的作用域一旦创建，它们有同样的父级作用域，作用域是共享的。

即 `someMethod` 可以通过 `theThing` 使用，`someMethod` 与 `unused` 分享闭包作用域，尽管 `unused` 从未使用，它引用的 `originalThing` 迫使它保留在内存中（防止被回收）。

因此，当这段代码反复运行，就会看到内存占用不断上升，垃圾回收器（GC）并无法降低内存占用。

本质上，闭包的链表已经创建，每一个闭包作用域携带一个指向大数组的间接的引用，造成严重的内存泄漏。

6. 事件监听

例如，Node.js 中 Agent 的 keepAlive 为 true 时，可能造成的内存泄漏。当 Agent keepAlive 为 true 的时候，将会复用之前使用过的 socket，如果在 socket 上添加事件监听，忘记清除的话，因为 socket 的复用，将导致事件重复监听从而产生内存泄漏。

#### 内存泄漏的识别方法
1. 使用 Chrome 任务管理器实时监视内存使用
打开 chrome 浏览器，点击右上角主菜单，选择`更多工具->任务管理器`，这样就开启了任务管理器面板，然后再右键点击任务管理器的表格标题并启用 JavaScript使用的内存，能看到这样的面板：

下面两列可以告诉您与页面的内存使用有关的不同信息：
![GitHub](https://raw.githubusercontent.com/LuckyWinty/blog/master/images/memory/WechatIMG123.png)
1. `内存占用空间(Memory)` 列表示原生内存。DOM 节点存储在原生内存中。 如果此值正在增大，则说明正在创建 DOM 节点。
2. `JavaScript使用的内存(JavaScript Memory)` 列表示 JS 堆。此列包含两个值。 您感兴趣的值是实时数字（括号中的数字）。实时数字表示您的页面上的可到达对象正在使用的内存量。 如果此数字在增大，要么是正在创建新对象，要么是现有对象正在增长。

当你页面稳定下来之后，这两个的值还在上涨，你就可以查一查是否内存泄漏了。

2. 利用chrome 时间轴记录可视化内存泄漏

Performance(时间轴)能够面板直观实时显示JS内存使用情况、节点数量、监听器数量等。

打开 chrome 浏览器，调出调试面板(DevTools),点击`Performance`选项(低版本是Timeline)，勾选Memory复选框。一种比较好的做法是使用强制垃圾回收开始和结束记录。在记录时点击 Collect garbage 按钮 (强制垃圾回收按钮) 可以强制进行垃圾回收。
所以录制顺序可以这样：开始录制前先点击垃圾回收-->点击开始录制-->点击垃圾回收-->点击结束录制。
面板介绍如图：
![GitHub](https://raw.githubusercontent.com/LuckyWinty/blog/master/images/memory/WechatIMG124.png)
录制结果如图：
![GitHub](https://raw.githubusercontent.com/LuckyWinty/blog/master/images/memory/WechatIMG125.png)
首先，从图中我们可以看出不同颜色的曲线代表的含义，这里主要关注JS堆内存、节点数量、监听器数量。鼠标移到曲线上，可以在左下角显示具体数据。在实际使用过程中，如果您看到这种 JS 堆大小或节点大小不断增大的模式，则可能存在内存泄漏。

3. 使用堆快照发现已分离 DOM 树的内存泄漏

只有页面的 DOM 树或 JavaScript 代码不再引用 DOM 节点时，DOM 节点才会被作为垃圾进行回收。 如果某个节点已从 DOM 树移除，但某些 JavaScript 仍然引用它，我们称此节点为“已分离”，已分离的 DOM 节点是内存泄漏的常见原因。

同理，调出调试面板，点击`Memory`，然后选择`Heap Snapshot`，然后点击进行录制。录制完成后，选中录制结果，在 `Class filter` 文本框中键入 `Detached`，搜索已分离的 DOM 树。
以这段代码为例：
```js
<html>
<head>
</head>
<body>
<button id="createBtn">增加节点</button>
<script> 
var detachedNodes;

function create() {
  var ul = document.createElement('ul');
  for (var i = 0; i < 10; i++) {
    var li = document.createElement('li');
    ul.appendChild(li);
  }
  detachedTree = ul;
}

document.getElementById('createBtn').addEventListener('click', create);
</script>
</body>
</html>
```
点击几下，然后记录。可以得到以下信息：
![GitHub](https://raw.githubusercontent.com/LuckyWinty/blog/master/images/memory/WechatIMG126.png)
旧版的面板，还会有颜色标注，黄色的对象实例表示它被JS代码引用，红色的对象实例表示被黄色节点引用的游离节点。上图是新版本的，不会有颜色标识。但是还是可以一个个来看，如上图，点开节点，可以看到下面的引用信息，上面可以看出，有个HTMLUListElement(ul节点)被window.detachedNodes引用。再结合代码，原来是没有加var/let/const声明，导致其成了全局变量,所以DOM无法释放。

4. 按函数调查内存分配
打开面板，点击`JavaScript Profiler`,如果没看到这个选项，你可以点调试面板右上角的三个点，选择`more tools`，然后选择。

ps: chrome 旧版的浏览器，这个功能在 `Profiles` 里面，点`Record Allocation Profile`即可.

操作步骤：点start->在页面进行你要检测的操作->点stop。
![GitHub](https://raw.githubusercontent.com/LuckyWinty/blog/master/images/memory/WechatIMG127.png)
DevTools 按函数显示内存分配明细。默认视图为 Heavy (Bottom Up)，将分配了最多内存的函数显示在最上方，还有函数的位置，你可以看看是哪些函数占用内存较多。

#### 避免内存泄漏的方法
1. 少用全局变量，避免意外产生全局变量
2. 使用闭包要及时注意，有Dom元素的引用要及时清理。
3. 计时器里的回调没用的时候要记得销毁。
4. 为了避免疏忽导致的遗忘，我们可以使用 `WeakSet` 和 `WeakMap`结构，它们对于值的引用都是不计入垃圾回收机制的，表示这是弱引用。
举个例子：
```js
const wm = new WeakMap();

const element = document.getElementById('example');

wm.set(element, 'some information');
wm.get(element) // "some information"
```
这种情况下，一旦消除对该节点的引用，它占用的内存就会被垃圾回收机制释放。Weakmap 保存的这个键值对，也会自动消失。

基本上，如果你要往对象上添加数据，又不想干扰垃圾回收机制，就可以使用 WeakMap。

### 参考资料
+ 极客时间《浏览器工作原理与实践》
+ https://jinlong.github.io/2016/05/01/4-Types-of-Memory-Leaks-in-JavaScript-and-How-to-Get-Rid-Of-Them/
+ https://developers.google.com/web/tools/chrome-devtools/memory-problems?hl=zh-cn

### 最后
+ 欢迎加我微信(winty230)，拉你进技术群，长期交流学习...
+ 欢迎关注「前端Q」,认真学前端，做个有专业的技术人...

![GitHub](https://raw.githubusercontent.com/LuckyWinty/blog/master/images/gzh/1571395642.png)