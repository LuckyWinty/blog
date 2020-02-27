# node事件循环机制
浏览器中有事件循环，node 中也有，事件循环是 node 处理非阻塞 I/O 操作的机制，node中事件循环的实现是依靠的libuv引擎。由于 node 11 之后，事件循环的一些原理发生了变化，这里就以新的标准去讲，最后再列上变化点让大家了解前因后果。

### 宏任务和微任务
node 中也有宏任务和微任务，与浏览器中的事件循环类似，其中，

macro-task 大概包括：
+ setTimeout
+ setInterval
+ setImmediate
+ script（整体代码
+ I/O 操作等。

micro-task 大概包括：
+ process.nextTick
+ new Promise().then(回调)等。

### 整体理解
先看一张官网的 node 事件循环简化图：
   ┌───────────────────────────┐
┌─>│           timers          │
│  └─────────────┬─────────────┘
│  ┌─────────────┴─────────────┐
│  │     pending callbacks     │
│  └─────────────┬─────────────┘
│  ┌─────────────┴─────────────┐
│  │       idle, prepare       │
│  └─────────────┬─────────────┘      ┌───────────────┐
│  ┌─────────────┴─────────────┐      │   incoming:   │
│  │           poll            │<─────┤  connections, │
│  └─────────────┬─────────────┘      │   data, etc.  │
│  ┌─────────────┴─────────────┐      └───────────────┘
│  │           check           │
│  └─────────────┬─────────────┘
│  ┌─────────────┴─────────────┐
└──┤      close callbacks      │
   └───────────────────────────┘

图中的每个框被称为事件循环机制的一个阶段，每个阶段都有一个 FIFO 队列来执行回调。虽然每个阶段都是特殊的，但通常情况下，当事件循环进入给定的阶段时，它将执行特定于该阶段的任何操作，然后执行该阶段队列中的回调，直到队列用尽或最大回调数已执行。当该队列已用尽或达到回调限制，事件循环将移动到下一阶段。

因此，从上面这个简化图中，我们可以分析出 node 的事件循环的阶段顺序为：

输入数据阶段(incoming data)->轮询阶段(poll)->检查阶段(check)->关闭事件回调阶段(close callback)->定时器检测阶段(timers)->I/O事件回调阶段(I/O callbacks)->闲置阶段(idle, prepare)->轮询阶段...

### 阶段概述
+ 定时器检测阶段(timers)：本阶段执行 timer 的回调，即 setTimeout、setInterval 里面的回调函数。
+ I/O事件回调阶段(I/O callbacks)：执行延迟到下一个循环迭代的 I/O 回调，即上一轮循环中未被执行的一些I/O回调。
+ 闲置阶段(idle, prepare)：仅系统内部使用。
+ 轮询阶段(poll)：检索新的 I/O 事件;执行与 I/O 相关的回调（几乎所有情况下，除了关闭的回调函数，那些由计时器和 setImmediate() 调度的之外），其余情况 node 将在适当的时候在此阻塞。
+ 检查阶段(check)：setImmediate() 回调函数在这里执行
+ 关闭事件回调阶段(close callback)：一些关闭的回调函数，如：socket.on('close', ...)。
### 三大重点阶段
日常开发中的绝大部分异步任务都是在 poll、check、timers 这3个阶段处理的,所以我们来重点看看。
#### timers
timers 阶段会执行 setTimeout 和 setInterval 回调，并且是由 poll 阶段控制的。 同样，在 Node 中定时器指定的时间也不是准确时间，只能是尽快执行。

#### poll
poll 是一个至关重要的阶段，poll 阶段的执行逻辑流程图如下：
<!-- 图 -->

如果当前已经存在定时器，而且有定时器到时间了，拿出来执行，eventLoop 将回到 timers 阶段。

如果没有定时器, 会去看回调函数队列。
+ 如果 poll 队列不为空，会遍历回调队列并同步执行，直到队列为空或者达到系统限制
+ 如果 poll 队列为空时，会有两件事发生

    + 如果有 setImmediate 回调需要执行，poll 阶段会停止并且进入到 check 阶段执行回调
    + 如果没有 setImmediate 回调需要执行，会等待回调被加入到队列中并立即执行回调，这里同样会有个超时时间设置防止一直等待下去,一段时间后自动进入 check 阶段。

#### check
check 阶段。这是一个比较简单的阶段，直接执行 setImmdiate 的回调。

### process.nextTick
process.nextTick 是一个独立于 eventLoop 的任务队列。

在每一个 eventLoop 阶段完成后会去检查 nextTick 队列，如果里面有任务，会让这部分任务优先于微任务执行。

### node 和 浏览器 eventLoop的主要区别
两者最主要的区别在于浏览器中的微任务是在每个相应的宏任务中执行的，而nodejs中的微任务是在不同阶段之间执行的。

### node 版本差异说明
这里主要说明的是 node11 前后的差异，因为 node11 之后一些特性已经向浏览器看齐了，一起来看看吧～

1. 微任务的执行时机变化
有这样的一段代码：
```js
setTimeout(()=>{
    console.log('timer1')
    Promise.resolve().then(function() {
        console.log('promise1')
    })
}, 0)
setTimeout(()=>{
    console.log('timer2')
    Promise.resolve().then(function() {
        console.log('promise2')
    })
}, 0)
```
+ 如果是 node11 版本一旦执行一个阶段里的一个宏任务(setTimeout,setInterval和setImmediate)就立刻执行微任务队列，这就跟浏览器端运行一致，最后的结果为`timer1=>promise1=>timer2=>promise2`
+ 如果是 node10 及其之前版本要看第一个定时器执行完，第二个定时器是否在完成队列中.
    + 如果是第二个定时器还未在完成队列中，最后的结果为`timer1=>promise1=>timer2=>promise2`
    + 如果是第二个定时器已经在完成队列中，则最后的结果为`timer1=>timer2=>promise1=>promise2`

### 一些需要注意的点
