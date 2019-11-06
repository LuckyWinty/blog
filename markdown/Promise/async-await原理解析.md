之前写了篇文章《这一次，彻底理解Promise原理》，剖析了Promise的相关原理。我们都知道，Promise解决了回调地狱的问题，但是如果遇到复杂的业务，代码里面会包含大量的 then 函数，使得代码依然不是太容易阅读。

基于这个原因，ES7 引入了 async/await，这是 JavaScript 异步编程的一个重大改进，提供了在不阻塞主线程的情况下使用同步代码实现异步访问资源的能力，并且使得代码逻辑更加清晰，而且还支持 try-catch 来捕获异常，非常符合人的线性思维。

所以，要研究一下如何实现 async/await。总的来说，async 是Generator函数的语法糖，并对Generator函数进行了改进。

### Generator函数简介
Generator 函数是一个状态机，封装了多个内部状态。执行 Generator 函数会返回一个遍历器对象，可以依次遍历 Generator 函数内部的每一个状态，但是只有调用`next`方法才会遍历下一个内部状态，所以其实提供了一种可以暂停执行的函数。`yield`表达式就是暂停标志。

有这样一段代码：
```js
function* helloWorldGenerator() {
  yield 'hello';
  yield 'world';
  return 'ending';
}

var hw = helloWorldGenerator();
```
调用及运行结果：
```js
hw.next()// { value: 'hello', done: false }
hw.next()// { value: 'world', done: false }
hw.next()// { value: 'ending', done: true }
hw.next()// { value: undefined, done: true }
```
由结果可以看出，`Generator函数`被调用时并不会执行，只有当调用`next方法`、内部指针指向该语句时才会执行，`即函数可以暂停，也可以恢复执行`。每次调用遍历器对象的next方法，就会返回一个有着`value`和`done`两个属性的对象。`value`属性表示当前的内部状态的值，是yield表达式后面那个表达式的值；`done`属性是一个布尔值，表示是否遍历结束。
### Generator函数暂停恢复执行原理
要搞懂函数为何能暂停和恢复，那你首先要了解协程的概念。

>一个线程（或函数）执行到一半，可以暂停执行，将执行权交给另一个线程（或函数），等到稍后收回执行权的时候，再恢复执行。这种可以并行执行、交换执行权的线程（或函数），就称为协程。

协程是一种比线程更加轻量级的存在。普通线程是抢先式的，会争夺cpu资源，而协程是合作的，可以把协程看成是跑在线程上的任务，一个线程上可以存在多个协程，但是在线程上同时只能执行一个协程。它的运行流程大致如下：

1. 协程`A`开始执行
2. 协程`A`执行到某个阶段，进入暂停，执行权转移到协程`B`
3. 协程`B`执行完成或暂停，将执行权交还`A`
4. 协程`A`恢复执行

协程遇到`yield命令`就暂停，等到执行权返回，再从暂停的地方继续往后执行。它的最大优点，就是代码的写法非常像同步操作，如果去除yield命令，简直一模一样。

### 执行器
通常，我们把执行生成器的代码封装成一个函数，并把这个执行生成器代码的函数称为执行器,`co 模块`就是一个著名的执行器。

Generator 是一个异步操作的容器。它的自动执行需要一种机制，当异步操作有了结果，能够自动交回执行权。两种方法可以做到这一点：
1. 回调函数。将异步操作包装成 Thunk 函数，在回调函数里面交回执行权。
2. Promise 对象。将异步操作包装成 Promise 对象，用then方法交回执行权。

一个基于 Promise 对象的简单自动执行器：
```js
function run(gen){
  var g = gen();

  function next(data){
    var result = g.next(data);
    if (result.done) return result.value;
    result.value.then(function(data){
      next(data);
    });
  }

  next();
}
```
我们使用时，可以这样使用即可，
```js

function* foo() {
    let response1 = yield fetch('https://xxx') //返回promise对象
    console.log('response1')
    console.log(response1)
    let response2 = yield fetch('https://xxx') //返回promise对象
    console.log('response2')
    console.log(response2)
}
run(foo);
```
上面代码中，只要 Generator 函数还没执行到最后一步，next函数就调用自身，以此实现自动执行。通过使用生成器配合执行器，就能实现使用同步的方式写出异步代码了，这样也大大加强了代码的可读性。
### async/await
ES7 中引入了 async/await，这种方式能够彻底告别执行器和生成器，实现更加直观简洁的代码。根据 MDN 定义，async 是一个通过异步执行并隐式返回 Promise 作为结果的函数。可以说async 是Generator函数的语法糖，并对Generator函数进行了改进。

前文中的代码，用`async`实现是这样：
```js
const foo = async () => {
    let response1 = await fetch('https://xxx') 
    console.log('response1')
    console.log(response1)
    let response2 = await fetch('https://xxx') 
    console.log('response2')
    console.log(response2)
}
```
一比较就会发现，async函数就是将 Generator 函数的星号（*）替换成async，将yield替换成await，仅此而已。

async函数对 Generator 函数的改进，体现在以下四点：
1. `内置执行器`。Generator 函数的执行必须依靠执行器，而 async 函数自带执行器，无需手动执行 next() 方法。
2. `更好的语义`。async和await，比起星号和yield，语义更清楚了。async表示函数里有异步操作，await表示紧跟在后面的表达式需要等待结果。
3. `更广的适用性`。co模块约定，yield命令后面只能是 Thunk 函数或 Promise 对象，而async函数的await命令后面，可以是 Promise 对象和原始类型的值（数值、字符串和布尔值，但这时会自动转成立即 resolved 的 Promise 对象）。
4. `返回值是 Promise`。async 函数返回值是 Promise 对象，比 Generator 函数返回的 Iterator 对象方便，可以直接使用 then() 方法进行调用。

这里的重点是自带了执行器，相当于把我们要额外做的(写执行器/依赖co模块)都封装了在内部。比如：
```js
async function fn(args) {
  // ...
}
```
等同于：
```js
function fn(args) {
  return spawn(function* () {
    // ...
  });
}

function spawn(genF) { //spawn函数就是自动执行器，跟简单版的思路是一样的，多了Promise和容错处理
  return new Promise(function(resolve, reject) {
    const gen = genF();
    function step(nextF) {
      let next;
      try {
        next = nextF();
      } catch(e) {
        return reject(e);
      }
      if(next.done) {
        return resolve(next.value);
      }
      Promise.resolve(next.value).then(function(v) {
        step(function() { return gen.next(v); });
      }, function(e) {
        step(function() { return gen.throw(e); });
      });
    }
    step(function() { return gen.next(undefined); });
  });
}
```
### async/await执行顺序
通过上面的分析，我们知道`async`隐式返回 Promise 作为结果的函数,那么可以简单理解为，await后面的函数执行完毕时，await会产生一个微任务(Promise.then是微任务)。但是我们要注意这个微任务产生的时机，它是执行完await之后，直接跳出async函数，执行其他代码(此处就是协程的运作，A暂停执行，控制权交给B)。其他代码执行完毕后，再回到async函数去执行剩下的代码，然后把await后面的代码注册到微任务队列当中。我们来看个例子：
```js
console.log('script start')

async function async1() {
await async2()
console.log('async1 end')
}
async function async2() {
console.log('async2 end')
}
async1()

setTimeout(function() {
console.log('setTimeout')
}, 0)

new Promise(resolve => {
console.log('Promise')
resolve()
})
.then(function() {
console.log('promise1')
})
.then(function() {
console.log('promise2')
})

console.log('script end')
// script start => async2 end => Promise => script end => promise1 => promise2 => async1 end => setTimeout
```
分析这段代码：
+ 执行代码，输出`script start`。
+ 执行async1(),会调用async2(),然后输出`async2 end`,此时将会保留async1函数的上下文，然后跳出async1函数。
+ 遇到setTimeout，产生一个宏任务
+ 执行Promise，输出`Promise`。遇到then，产生第一个微任务
+ 继续执行代码，输出`script end`
+ 代码逻辑执行完毕(当前宏任务执行完毕)，开始执行当前宏任务产生的微任务队列，输出`promise1`，该微任务遇到then，产生一个新的微任务
+ 执行产生的微任务，输出`promise2`,当前微任务队列执行完毕。执行权回到async1
+ 执行await,实际上会产生一个promise返回，即
```js
let promise_ = new Promise((resolve,reject){ resolve(undefined)})
```
执行完成，执行await后面的语句，输出`async1 end`
+ 最后，执行下一个宏任务，即执行setTimeout，输出`setTimeout`
### 参考资料
+ 极客时间《浏览器工作原理与实践》
+ http://es6.ruanyifeng.com/?search=...&x=0&y=0#docs/async
+ https://juejin.im/post/5d401ce4e51d4561d106cb63
### 最后
+ 欢迎加我微信(winty230)，拉你进技术群，长期交流学习...
+ 欢迎关注「前端Q」,认真学前端，做个有专业的技术人...

![GitHub](https://raw.githubusercontent.com/LuckyWinty/blog/master/images/gzh/1571395642.png)