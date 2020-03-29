### 背景
本文首发于博客园，鉴于目前vue3还没有正式发布，而且里面一些实现思想还是很有参考价值的，于是转发一次到公众号上，希望对你有启发～
### 响应式系统实现
Vue.js 是一款 MVVM 框架，数据模型仅仅是普通的 JavaScript 对象，但是对这些对象进行操作时，却能影响对应视图，它的核心实现就是「响应式系统」。

vue 2.0中，是基于 `Object.defineProperty`实现的「响应式系统」。vue3 中是基于 `Proxy/Reflect` 来实现的，有时间再写了，本文讲的是vue2 的实现。

主要涉及属性：

+ enumerable，属性是否可枚举，默认 false。
+ configurable，属性是否可以被修改或者删除，默认 false。
+ get，获取属性的方法。
+ set，设置属性的方法。

响应式基本原理就是，在 Vue 的构造函数中，对 options 的 data 进行处理。即在初始化vue实例的时候，对data、props等对象的每一个属性都通过Object.defineProperty定义一次，在数据被set的时候，做一些操作，改变相应的视图。

```js
class Vue {
    /* Vue构造类 */
    constructor(options) {
        this._data = options.data;
        observer(this._data);
    }
}
function observer (value) {
    if (!value || (typeof value !== 'object')) {
        return;
    }
    
    Object.keys(value).forEach((key) => {
        defineReactive(value, key, value[key]);
    });
}
function defineReactive (obj, key, val) {
    Object.defineProperty(obj, key, {
        enumerable: true,       /* 属性可枚举 */
        configurable: true,     /* 属性可被修改或删除 */
        get: function reactiveGetter () {
            return val;         
        },
        set: function reactiveSetter (newVal) {
            if (newVal === val) return;
            cb(newVal);
        }
    });
}
```
实际应用中，各种系统复杂无比。假设我们现在有一个全局的对象，我们可能会在多个 Vue 对象中用到它进行展示。又或者写在data中的数据并没有应用到视图中呢，这个时候去更新视图就是多余的了。这就需要依赖收集的过程。

### 依赖收集

所谓依赖收集，就是把一个数据用到的地方收集起来，在这个数据发生改变的时候，统一去通知各个地方做对应的操作。“订阅者”在VUE中基本模式如下：

```js
export default class Dep {
  static target: ?Watcher;
  id: number;
  subs: Array<Watcher>;

  constructor () {
    this.id = uid++
    this.subs = []
  }

  addSub (sub: Watcher) {
    this.subs.push(sub)
  }

  removeSub (sub: Watcher) {
    remove(this.subs, sub)
  }
　//依赖收集，有需要才添加订阅
  depend () {
    if (Dep.target) {
      Dep.target.addDep(this)
    }
  }

  notify () {
    // stabilize the subscriber list first
    const subs = this.subs.slice()
    for (let i = 0, l = subs.length; i < l; i++) {
      subs[i].update()
    }
  }
}
```

有了订阅者，再来看看Watcher的实现。源码Watcher比较多逻辑，简化后的模型如下

```js
class Watcher{
    constructor(vm,expOrFn,cb,options){
        //传进来的对象 例如Vue
        this.vm = vm
        //在Vue中cb是更新视图的核心，调用diff并更新视图的过程
        this.cb = cb
        //收集Deps，用于移除监听
        this.newDeps = []
        this.getter = expOrFn
        //设置Dep.target的值，依赖收集时的watcher对象
        this.value =this.get()
    }

    get(){
        //设置Dep.target值，用以依赖收集
        pushTarget(this)
        const vm = this.vm
        let value = this.getter.call(vm, vm)
        return value
    }

    //添加依赖
      addDep (dep) {
          // 这里简单处理，在Vue中做了重复筛选，即依赖只收集一次，不重复收集依赖
        this.newDeps.push(dep)
        dep.addSub(this)
      }

      //更新
      update () {
        this.run()
    }

    //更新视图
    run(){
        //这里只做简单的console.log 处理，在Vue中会调用diff过程从而更新视图
        console.log(`这里会去执行Vue的diff相关方法，进而更新数据`)
    }
}
```
### defineReactive详细逻辑

```js
export function defineReactive (
  obj: Object,
  key: string,
  val: any,
  customSetter?: ?Function,
  shallow?: boolean
) {
  const dep = new Dep()

  const property = Object.getOwnPropertyDescriptor(obj, key)
  if (property && property.configurable === false) {
    return
  }

  // cater for pre-defined getter/setters
  const getter = property && property.get
  const setter = property && property.set
  if ((!getter || setter) && arguments.length === 2) {
    val = obj[key]
  }

  let childOb = !shallow && observe(val)
  Object.defineProperty(obj, key, {
    enumerable: true,
    configurable: true,
    get: function reactiveGetter () {
      const value = getter ? getter.call(obj) : val
      if (Dep.target) {
        dep.depend()
        if (childOb) {
          childOb.dep.depend()
          if (Array.isArray(value)) {
            dependArray(value)
          }
        }
      }
      return value
    },
    set: function reactiveSetter (newVal) {
      const value = getter ? getter.call(obj) : val
      /* eslint-disable no-self-compare */
      if (newVal === value || (newVal !== newVal && value !== value)) {
        return
      }
      /* eslint-enable no-self-compare */
      if (process.env.NODE_ENV !== 'production' && customSetter) {
        customSetter()
      }
      if (setter) {
        setter.call(obj, newVal)
      } else {
        val = newVal
      }
      childOb = !shallow && observe(newVal)
      dep.notify()
    }
  })
}
```

`所以响应式原理就是，我们通过递归遍历，把vue实例中data里面定义的数据，用defineReactive（Object.defineProperty）重新定义。每个数据内新建一个Dep实例，闭包中包含了这个 Dep 类的实例，用来收集 Watcher 对象。在对象被「读」的时候，会触发 reactiveGetter 函数把当前的 Watcher 对象（存放在 Dep.target 中）收集到 Dep 类中去。之后如果当该对象被「写」的时候，则会触发 reactiveSetter 方法，通知 Dep 类调用 notify 来触发所有 Watcher 对象的 update 方法更新对应视图。`

### Watcher的产生
在vue中，共有4种情况会产生Watcher：

1. Vue实例对象上的watcher,观测根数据，发生变化时重新渲染组件
updateComponent = () => {  vm._update(vm._render(), hydrating)}
vm._watcher = new Watcher(vm, updateComponent, noop)
2. 用户在vue对象内用watch属性创建的watcher
3. 用户在vue对象内创建的计算属性，本质上也是watcher
4. 用户使用vm.$watch创建的watcher

Wathcer会增减，也可能在render的时候新增。所以，必须有一个Schedule来进行Watcher的调度。部分主要代码如下：

```js
 queue.sort((a, b) => a.id - b.id)

  // do not cache length because more watchers might be pushed
  // as we run existing watchers
  for (index = 0; index < queue.length; index++) {
    watcher = queue[index]
    if (watcher.before) {
      watcher.before()
    }
    id = watcher.id
    has[id] = null
    watcher.run()
    // in dev build, check and stop circular updates.
    if (process.env.NODE_ENV !== 'production' && has[id] != null) {
      circular[id] = (circular[id] || 0) + 1
      if (circular[id] > MAX_UPDATE_COUNT) {
        warn(
          'You may have an infinite update loop ' + (
            watcher.user
              ? `in watcher with expression "${watcher.expression}"`
              : `in a component render function.`
          ),
          watcher.vm
        )
        break
      }
    }
  }
```

Schedule 调度的作用：

1. 去重，每个Watcher有一个唯一的id。首先，如果id已经在队列里了，跳过，没必要重复执行，如果id不在队列里，要看队列是否正在执行中。如果不在执行中，则在下一个时间片执行队列，因此队列永远是异步执行的。
2. 排序，按解析渲染的先后顺序执行，即Watcher小的先执行。Watcher里面的id是自增的，先创键的比后创建的id小。所以会有如下规律：

　　2.1、组件是允许嵌套的，而且解析必然是先解析了父组件再到子组件。所以父组件的id比子组件小。

　　2.2、用户创建的Watcher会比render时候创建的先解析。所以用户创建的Watcher的id比render时候创建的小。

3. 删除Watcher，如果一个组件的Watcher在队列中，而他的父组件被删除了，这个时候也要删掉这个Watcher。
4. 队列执行过程中，存一个对象circular，里面有每个watcher的执行次数，如果哪个watcher执行超过MAX_UPDATE_COUNT定义的次数就认为是死循环，不再执行，默认是100次。

`总之，调用的作用就是管理 Watcher。`

### 补充

VUE中是如何用Object.defineProperty给数组对象重新定义的呢，为什么我们直接修改数据中某项（arr[3] = 4）的时候，视图并没有响应式地变化呢。

答案是数组的响应式是不够完全的，VUE只重写了有限的方法。重写逻辑如下：

```js
const arrayProto = Array.prototype
export const arrayMethods = Object.create(arrayProto)

const methodsToPatch = [
  'push',
  'pop',
  'shift',
  'unshift',
  'splice',
  'sort',
  'reverse'
]

/**
 * Intercept mutating methods and emit events
 */
methodsToPatch.forEach(function (method) {
  // cache original method
  const original = arrayProto[method]
  def(arrayMethods, method, function mutator (...args) {
    const result = original.apply(this, args)
    const ob = this.__ob__
    let inserted
    switch (method) {
      case 'push':
      case 'unshift':
        inserted = args
        break
      case 'splice':
        inserted = args.slice(2)
        break
    }
    if (inserted) ob.observeArray(inserted)
    // notify change
    ob.dep.notify()
    return result
  })
})
```
 