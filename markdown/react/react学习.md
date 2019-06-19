### React学习

#### 设计高质量的 React 组件
+ 组件的划分要满足高内聚（High Cohesion）和低藕合（LowCoupling）的原则
+ prop 是组件的对外接口， state 是组件的内部状态，对外用prop ，内部用 state
+ 组件不应该改变 prop 的值，而 state 存在的目的就是让组件来改变的

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