如果我告诉你，你知道的一切都是假的，如果你学的一些近几年发布的深受喜爱的 ECMAScript 的主要特性，是很容易导致性能问题的，会发生什么。

故事发生在几年前，让我们回到 ES5 的天真时代...

我深深地记得 ES5 发布的那天，我们喜爱的 Javascript 引入了一些优秀的数组方法，它们是 forEach, reduce, map, filter——这些方法让我们感受到语言不断发展，功能越来越强大，写代码变得更有趣和流畅，代码变得更通俗易懂。

几乎同时，诞生了 Node.js ，它使得我们能平稳地从前端过渡到后端，同时真正重新定义了全栈开发。

现在，Node.js ，在 V8 引擎上使用最新的 ECMAScript ，争取被认为是主流的服务端开发语言之一。因此，它需要证明在性能方面是高效的。当然，有很多性能参数需要考虑，没有某种语言的性能可以所有参数都优于其他语言。但是，用开箱即用的方法如上面提到的函数写 javascript 对你的应用性能的影响到底是有利还是有害呢？

此外 ，javascript不仅仅是为了展示视图而被认为是客户端开发的合理方案，因为用户的电脑性能会变得更好，网络会更快，但是当我们需要一个超高性能的应用或者非常复杂的应用时，我们能依赖用户的电脑吗？

为了测试这些问题，我尝试比较几个场景并深入理解我的实验结果，我在 Node.js v10.11.0、Chrome浏览器、macOS上做的测试。

**1.遍历数组**

我做的第一个场景是对一个 10万条数据的数组求和。这是现实中一个有效的方法，我从数据库中获取了一个列表并求和，没有额外的 DB 操作。

我用 for , for-of, while, forEach, reduce 比较了在随机的 10万条数据中求和，结果如下：

        For Loop, average loop time: ~10 microseconds
        For-Of, average loop time: ~110 microseconds
        ForEach, average loop time: ~77 microseconds
        While, average loop time: ~11 microseconds
        Reduce, average loop time: ~113 microseconds

从 google 上查如何做数组求和时，reduce 是推荐的最好的实现方式，但是却是性能最差的。我的必用方法 forEach 性能也不是很好。即使是最新的 ES6 方法 for-of ，只是提供了最差的性能方法。它比旧的 for 循环方法(也是性能最好的方法)差了 10 倍。

最新的和最推荐的方法怎么可以使得 Javascript 变得如此慢，造成这个的原因主要有 2 个。reduce 和 forEach 需要一个执行一个回调函数，这个函数被递归调用并使堆栈"膨胀",以及对执行代码进行附加操作和验证。

**2.复制数组**

复制数组看起来不是一个有趣的场景，但这是不可变函数的基石，它在生成输出时不会修改输入。

性能测试同样出现了有意思的结果——当复制 10 万条随机数据时，用老方法还是比新方法快。用 ES6 的扩展运算操作 [...arr] 和 Array.from, 加上 ES5 的 map 方法，arr.map(x=>x) 性能都不如老方法 arr.slice() 和 连接方法 [].concat(arr)

        Duplicate using Slice, average: ~367 microseconds
        Duplicate using Map, average: ~469 microseconds
        Duplicate using Spread, average: ~512 microseconds
        Duplicate using Conct, average: ~366 microseconds
        Duplicate using Array From, average: ~1,436 microseconds
        Duplicate manually, average: ~412 microseconds

**3.对象迭代**

另一个经常遇到的场景就是对象迭代，通常就是我们不能根据特定的 key取值，而必须遍历 JSON 结构 或者 Object。我们有老方法 for-in (for(let key in obj))，也有新方法 Object.keys(obj) 和 Object.entries(obj)。

我们用上述方法，对 10 万个对象，每个对象都包含 1000 个随机的 keys 和 values 进行性能分析。结果如下：

        Object iterate For-In, average: ~240 microseconds
        Object iterate Keys For Each, average: ~294 microseconds
        Object iterate Entries For-Of, average: ~535 microseconds
