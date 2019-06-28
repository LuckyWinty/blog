### React学习

#### 设计高质量的 React 组件
+ 组件的划分要满足高内聚（High Cohesion）和低藕合（LowCoupling）的原则
+ prop 是组件的对外接口， state 是组件的内部状态，对外用prop ，内部用 state
+ 组件不应该改变 prop 的值，而 state 存在的目的就是让组件来改变的
+ 每个 React 组件的 props 中都可以一个特殊属性 children ，代表的是子组件。

#### 组件的生命周期
React 严格定义了组件的生命周期，生命周期可能会经历如下三个过程：
1. 装载过程（Mount ），也就是把组件第一次在 DOM 树中渲染的过程；
2. 更新过程（Update ），当组件被重新渲染的过程；
3. 卸载过程（Unmount ），组件从 DOM 中删除的过程
三种不同的过程， React 库会依次调用组件的一些成员函数，这些函数称为生命周期函数

##### Mount过程
依次被调用的函数为:
1. constructor 
2. getlnitialState
3. getDefaultProps 
4. componentWillMount 
5. render
6. componentDidMount
+ constructor,初始化 state ,绑定成员函数的 this 环境。并不是每个组件都需要定义自己的构造函数。
+ getlnitialState 这个函数的返回值会用来初始化组件的 this.state ;getDefaultProps 函数的返回值可以作为 props 的初始值，这两个函数都只在React.createClass 方法创造的组件类才会用到;实际上 getlnitialState和getDefaultProps 两个方法在 ES6 的方法定义的 React 组件中根本不会用到。
+ render,一定要实现 render 函数，所有 React 组件的父类 React.Component 类对除 render 之外的生命周期函数都有默认实现;render 函数应该是一个纯函数，完全根据this.state 和 this.props 来决定返回的结果，而且不要产生任何副作用。在 render 函数中不能调用 this.setState ，一个纯函数不应该引起状态的改变。
+ componentWillMount 会在调用 render 函数之前被调用， componentDidMount 会在调用 render 函数之后被调用。componentWillMount 可以在服务器端被调用，也可以在浏览器端被调用；而 componentDidMount只能在浏览器端被调用。

##### Update过程
1. componentWillReceiveProps
2. shouldComponentUpdate 
3. componentWillUpdate 
4. render 
5. componentDidUpdate 

+ this.setState 方法触发的更新过程不会调用 componentWillReceiveProps ，这是因为这个函数适合根据新的 props 值来计算出是不是要更新内部状态 state 更新组件内部状态的方法就是 this.setState ，如果 this.setState 的调用导致componentWillReceiveProps 再一次被调用，那就是一个死循环了
+ shouldComponentUpdate的参数就是接下来的 props 和 state 的值,我们可以根据这2个参数的前后对比，判断出是返回 true 还是返回 false，从而决定是否要重新渲染。

        shouldComponentUpdate(nextProps, nextState) { 
            return (nextProps.caption !== this.props.caption)|| 
            (nextState.count !==this.state.count); 
        }
+ 如果组件的 shouldComponentUpdate 函数返回 true, React 接下来就会依次调用对应
组件的 componentWillUpdate 、render 、componentDidUpdate 函数。这对函数，在服务端渲染时同样会执行。

##### Unmount过程

+ React 组件的卸载过程只涉及一个函数 omponentWillUnmount ，React 组件要从
DOM 树上删除掉之前，对应的 componentWillUnmount 函数会被调用，所以这个函数适
合做一些清理性的工作。
+ componentWillUnmount 中的工作往往和 componentDidMount 有关，比如，在
componentDidMount 中用非 React 的方法创造了一些 DOM 元素，如果撒手不管可能会造
成内存泄露，那就需要在 componentWillUnmount 中把这些创造的 DOM 元素清理掉。

#### Redux
基本原则：
1. 唯一数据源（ Single Source of Truth)
2. 保持状态只读（ State is read-only)
3. 数据改变只能通过纯函数完成（Changes are made with pure functions)

#### React-redux
+ Context ,就是"上下文环境"，让一个树状组件上所有组件都能访问一个共同的对象，为了完成这个任务，需要上级组件和下级组件配合
+ 上级组件要宣称自己支持 context ，并且提供一个函数来返回代表 Context对象
+ 这个上级组件之下的所有子孙组件，只要宣称自己需要这个 context ，就可以通过 this.context 访问到这个共同的环境对象

#### 模块化 React 和 Redux 应用
要点：
1. 代码文件的组织结构(提倡按功能组织)；
2. 确定模块的边界(高内聚，低耦合)；
3. Store 的状态树设计(一个模块控制一个状态节点、避免冗余数据、树形结构扁平)

#### React 组件的性能优化
1. 利用 shouldComponentUpdate 函数
2. 列表渲染，用稳定唯一的key值，不要用不稳定的key值，如index
3. 用 reselect 提高数据获取性能
4. 范式化状态树

#### React高级组件
高阶组件，有两种实现方式：一种是代理方式，另一种是继承方式。通过比较不难发现，代理方式更加容易实现和控制，继承方式的唯一优势是可以操纵特定组件的生命周期函数。和高阶组件相比，"以函数为子组件"的模式更加灵活，因为有函数的介入，连接两个组件的方式可以非常自由。

意义：
+ 重用代码,有时候很多 React 组件都需要公用同样一个逻辑，比如说 react-redux 中容器组件的部分，没有必要让每个组件都实现一遍 shouldComponentUpdate 这些生命周期函数，把这部分逻辑提取出来，利用高阶组件的方式应用出去，就可以减少很多组件的重复代码
+ 修改现有 React 组件的行为,我们不想去触碰有些组件的内部逻辑，这时候高阶组件有了用武之地，通过一个独立于原有组件的函数，可以产生新的组件，对原有组件没有任何侵害

分类：
+ 代理方式的高阶组件
+ 继承方式的高阶组件

代理方式的高阶组件，可以应用在下列场景中：
+ 操纵 prop(增加、减少或者编辑后的props重新传递给某个组件);
+ 访问 ref;
+ 抽取状态(参考react-redux中的connect返回的函数)；
+ 包装组件(例如添加div包裹，增加样式展示行为)

继承方式的高阶组件可以应用于下列场景：
+ 操纵 prop (如高阶组件需要根据参数组件渲染结果来决定如何修改 props);
+ 操纵生命周期函数（因为继承方式的高阶函数返回的新组件继承了参数组件，所以可以重新定义任何一个 React 组件的生命周期函数）

**结论：优先考虑代理，然后才考虑继承**

#### Redux异步操作方法
异步action请求终止的常用方法：
1. 从交互入手，当前请求没完成时，锁操作
2. action 构造函数文件中定义一个文件模块级的 nextSeqld 变量，这是一个递增的整数数字，给每一个访问 API 的请求做序列编号，请求回后匹配 nextSeqld 变量是否一致

常用的辅助操作库：
+ redux-thunk
+ redux-saga 
+ redux-effects 
+ redux-side-effects 
+ redux-loop 
+ redux-observable 

#### 单元测试
尽量不让 React 存储状态，把状态存储到 Redux 的 Store 上，也就是让 React 组件只是一个根据数据负责渲染的纯函数就好，这样的 React 组件是非常方便测试的，测试一个根据输入返回输出的纯函数，要比测试一个包含很多状态的对象容易得多 因为纯函数的结果根据输入完全可以预测

+ 单元测试框架；
+ 单元测试代码组织；
+ 辅助工具

常用框架：
1. Mocha+Chai 的组合
2. Jest

单元测试代码组织:
1. 文件名以.test.js 为 后缀的代码文件
2. 存于 __test__ 目录下的代码文件

辅助工具:
1. Enzyme 
2. sinon.js
3. redux-mock-store

#### 扩展Redux