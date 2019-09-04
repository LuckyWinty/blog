### Promise链式调用原理

Promise 必须为以下三种状态之一：等待态（Pending）、执行态（Fulfilled）和拒绝态（Rejected）。一旦Promise 被 resolve 或 reject，不能再迁移至其他任何状态（即状态 immutable）。

基本过程：

1. 初始化 Promise 状态（pending）
2. 执行 then(..) 注册回调处理数组（then 方法可被同一个 promise 调用多次）
3. 立即执行 Promise 中传入的 fn 函数，将Promise 内部 resolve、reject 函数作为参数传递给 fn ，按事件机制时机处理
4. Promise里的关键是要保证，then方法传入的参数 onFulfilled 和 onRejected，必须在then方法被调用的那一轮事件循环之后的新执行栈中执行。

真正的链式Promise是指在当前promise达到fulfilled状态后，即开始进行下一个promise.
先从 Promise 执行结果看一下，有如下一段代码：
```js
    new Promise((resolve, reject) => {
        setTimeout(() => {
            resolve({ test: 1 })
            resolve({ test: 2 })
            reject({ test: 2 })
        }, 1000)
    }).then((data) => {
        console.log('result1', data)
    },(data1)=>{
        console.log('result2',data1)
    }).then((data) => {
        console.log('result3', data)
    })
    //result1 { test: 1 }
    //result3 undefined
```
显然这里输出了不同的 data。由此可以看出几点：

1. 可进行链式调用，且每次 then 返回了新的 Promise(2次打印结果不一致，如果是同一个实例，打印结果应该一致。
2. 只输出第一次 resolve 的内容，reject 的内容没有输出，即 Promise 是有状态且状态只可以由pending -> fulfilled或 pending-> rejected,是不可逆的。
3. then 中返回了新的 Promise,但是then中注册的回调仍然是属于上一个 Promise 的。

基于以上几点，我们先写个 只含 resolve 方法的 Promise 模型:
```js
    function Promise(fn){ 
        let state = 'pending';
        let value = null;
        const resolveCbs = [];

        this.then = function (onFulfilled){
            return new Promise((resolve, reject)=>{
                handle({ //桥梁，将新 Promise 的 resolve 方法，放到前一个 promise 的回调对象中
                    onFulfilled, 
                    resolve
                })
            })
        }

        function handle(callback){
            if(state === 'pending'){
                resolveCbs.push(callback)
                return;
            }
            
            if(state === 'onFulfilled'){
                if(!callback.onFulfilled){
                    callback.resolve(value)
                    return;
                }
                const ret = callback.onFulfilled(value) //处理回调
                callback.resolve(ret) //处理下一个 promise 的resolve
            }
        }
        function resolve(newValue){
            const fn = ()=>{
                if(state !== 'pending')return

                state = 'onFulfilled';
                value = newValue
                handelFulfilledCb()
            }
            
            setTimeout(fn,0)
        }
        
        function handelFulfilledCb(){
            while(resolveCbs.length) {
                const fulfiledFn = resolveCbs.shift();
                handle(fulfiledFn);
            };
        }
        
        fn(resolve)
    }
```
**这个模型简单易懂，这里最关键的点就是在 then 中新创建的 Promise，它的状态变为 fulfilled 的节点是在上一个 Promise的回调执行完毕的时候。也就是说当一个 Promise 的状态被 fulfilled 之后，会执行其回调函数，而回调函数返回的结果会被当作 value，返回给下一个 Promise(也就是then 中产生的 Promise)，同时下一个 Promise的状态也会被改变(执行 resolve 或 reject)，然后再去执行其回调,以此类推下去...链式调用的效应就出来了。**

但是如果仅仅是例子中的情况，我们可以这样写：
```js
    new Promise((resolve, reject) => {
        setTimeout(() => {
            resolve({ test: 1 })
        }, 1000)
    }).then((data) => {
        console.log('result1', data)
        //dosomething
        console.log('result3')
    })
    //result1 { test: 1 }
    //result3
```
实际上，我们常用的链式调用，是用在异步回调中，以解决"回调地狱"的问题。如下例子：
```js
new Promise((resolve, reject) => {
  setTimeout(() => {
    resolve({ test: 1 })
  }, 1000)
}).then((data) => {
  console.log('result1', data)
  //dosomething
  return test()
}).then((data) => {
  console.log('result2', data)
})

function test(id) {
  return new Promise(((resolve) => {
    setTimeout(() => {
      resolve({ test: 2 })
    }, 5000)
  }))
}
//输出
//result1 { test: 1 }
//result2 Promise {then: ƒ}
```
用上面的 Promise 模型，得到的结果显然不是我们想要的。认真看上面的模型，执行 callback.resolve 时，传入的参数是 callback.onFulfilled 执行完成的返回，显然这个测试例子返回的就是一个 Promise，而我们的 Promise 模型中的 resolve 方法并没有特殊处理。那么我们将 resolve 改一下:

```js
    function Promise(fn){ 
        ...
        function resolve(newValue){
            const fn = ()=>{
                if(state !== 'pending')return

                if(newValue && (typeof newValue === 'object' || || typeof newValue === 'function')){
                    const {then} = newValue
                    if(typeof then === 'function'){
                        // newValue 为新产生的 Promise,this.resolve.bind(this)为上个 promise 的resolve
                        //相当于调用了新产生 Promise 的then方法，注入了上个 promise 的resolve 为其回调
                        then.call(newValue,this.resolve.bind(this))
                        return
                    }
                }
                state = 'onFulfilled';
                value = newValue
                handelFulfilledCb()
            }
            
            setTimeout(fn,0)
        }
        ...
    }
```
用这个模型，再测试我们的例子，就得到了正确的结果：
```js
    new Promise((resolve, reject) => {
        setTimeout(() => {
            resolve({ test: 1 })
        }, 1000)
    }).then((data) => {
        console.log('result1', data)
        //dosomething
        return test()
    }).then((data) => {
        console.log('result2', data)
    })

    function test(id) {
        return new Promise(((resolve) => {
            setTimeout(() => {
            resolve({ test: 2 })
            }, 5000)
        }))
    }
    //result1 { test: 1 }
    //result2 { test: 2 }
```
显然，新增的逻辑就是针对 resolve 入参为 Promise 的时候的处理。我们观察一下 test 里面创建的 Promise，它是没有调用 then方法的。从上面的分析我们已经知道 Promise 的回调函数就是通过调用其 then 方法注册的，因此 test 里面创建的 Promise 其回调函数为空。

显然如果没有回调函数，执行 resolve 的时候，是没办法链式下去的。因此，我们需要主动为其注入回调函数。 

我们只要把第一个 then 中产生的 Promise 的 resolve 函数的执行，延迟到 test 里面的 Promise 的状态为 onFulfilled 的时候再执行，那么链式就可以继续了。所以，当 resolve 入参为 Promise 的时候，调用其 then 方法为其注入回调函数，而注入的是前一个 Promise 的 resolve 方法，所以要用 call 来绑定 this 的指向。
上面的执行过程产生的 Promise 实例及其回调函数，可以用看下表：
Promise | callback
---- | ---
P1 | [{onFulfilled:c1(第一个then中的fn),resolve:p2resolve}]
P2 (P1 调用 then 时产生) |  [{onFulfilled:c2(第二个then中的fn),resolve:p3resolve}]
P3 (P2 调用 then 时产生) |  []
P4 (执行c1中产生[调用 test ]) | [{onFulfilled:p2resolve,resolve:p5resolve}]
P5 (调用p2resolve 时，进入 then.call 逻辑中产生) |  []

有了这个表格，我们就可以知道各个实例中 callback 执行的顺序是：c1 -> p2resolve -> c2 -> p3resolve -> [] -> p5resolve -> []
```js
    function Promise(fn){ 
        let state = 'pending';
        let value = null;
        const resolveCbs = [];
        const rejectCbs = [];

        this.then = function (onFulfilled){
            return new Promise((resolve, reject)=>{
                handle({
                    onFulfilled, 
                    resolve, 
                    reject
                })
            })
        }

        function handle(callback){
            if(state === 'pending'){
                resolveCbs.push(callback)
                return;
            }
            
            if(state === 'onFulfilled'){
                if(!callback.onFulfilled){
                    callback.resolve(value)
                    return;
                }
                const ret = callback.onFulfilled(value)
                callback.resolve(ret)
            }
            if(state === 'rejected'){
                if(!callback.onFulfilled){
                    callback.resolve(value)
                    return;
                }
                const ret = callback.onFulfilled(value)
                callback.resolve(ret)
            }
        }
        function resolve(newValue){
            const fn = ()=>{
                if(state !== 'pending')return

                state = 'onFulfilled';
                value = newValue
                handelFulfilledCb()
            }
            
            setTimeout(fn,0)
        }
        function reject(newValue){
            const fn = ()=>{
                if(this.state !== 'pending')return

                this.state = 'rejected';
                value = newValue
                handelRejectedCb()
            }
            setTimeout(fn,0)
        }
        function handelFulfilledCb(){
            while(resolveCbs.length) {
                const fulfiledFn = resolveCbs.shift();
                handle(fulfiledFn);
            };
        }
        function handelRejectedCb(){
            while(rejectCbs.length) {
                const rejectFn = rejectCbs.shift();
                handle(rejectFn);
            };
        }
        fn(resolve, reject)
    }
```

























```js
//test
function Promise(fn) {
  let state = 'pending'
  let value = null
  const callbacks = []

  this.then = function (onFulfilled) {
    console.log('---------regist then,enter then')
    return new Promise(((resolve) => {
      handle({
        onFulfilled: onFulfilled || null,
        resolve,
      })
    }))
  }
  function handle(callback) {
    console.log('--------------handle state', state, typeof callback.onFulfilled)
    if (state === 'pending') {
      callbacks.push(callback)
      return
    }
    // 如果then中没有传递任何东西
    if (!callback.onFulfilled) {
      callback.resolve(value)
      return
    }
    console.log('--------------apply handle onFulfilled fn', callback.onFulfilled.toString())
    const ret = callback.onFulfilled(value)
    console.log('--------------callback return', ret)
    callback.resolve(ret)
  }

  function resolve(newValue) {
    console.log('--------------resolve', newValue)
    if (newValue && (typeof newValue === 'object' || typeof newValue === 'function')) {
      const { then } = newValue
      if (typeof then === 'function') {
        console.log('-------newValue.then', newValue.callback, then.toString())
        then.call(newValue, this.resolve.bind(this))
        return
      }
    }
    state = 'fulfilled'
    value = newValue
    // setTimeout(() => {
    console.log('------------apply callback', callbacks, 'length', callbacks.length)
    callbacks.forEach((callback) => {
      handle(callback)
    })
    // }, 0)
  }
  fn(resolve)
}

new Promise((resolve, reject) => {
  setTimeout(() => {
    resolve({ test: 1 })
  }, 1000)
}).then((data) => {
  console.log('****result1', data)
  const p1 = getUserJobById()
    .then((data1) => {
      console.log('****getUserJobById', data1)
    })
  console.log('######', p1)
  return p1
}).then((data) => {
  console.log('****result2', data)
})

function getUserJobById(id) {
  return new Promise(((resolve) => {
    setTimeout(() => {
      console.log('****getUserJobById apply resolve')
      resolve({ test: 2 })
    }, 5000)
  }))
}