### Promise链式调用原理

Promise 必须为以下三种状态之一：等待态（Pending）、执行态（Fulfilled）和拒绝态（Rejected）。一旦Promise 被 resolve 或 reject，不能再迁移至其他任何状态（即状态 immutable）。

基本过程：

1. 初始化 Promise 状态（pending）
2. 执行 then(..) 注册回调处理数组（then 方法可被同一个 promise 调用多次）
3. 立即执行 Promise 中传入的 fn 函数，将Promise 内部 resolve、reject 函数作为参数传递给 fn ，按事件机制时机处理
4. Promise里的关键是要保证，then方法传入的参数 onFulfilled 和 onRejected，必须在then方法被调用的那一轮事件循环之后的新执行栈中执行。

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

function test1(id) {
  return new Promise(((resolve) => {
    setTimeout(() => {
      console.log('****getUserJobById apply resolve')
      resolve({ test: 2 })
    }, 5000)
  }))
}