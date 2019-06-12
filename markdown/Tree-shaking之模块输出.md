# Tree-shaking之模块输出
Tree-Shaking，它代表的大意就是删除没用到的代码。这样的功能对于构建大型应用时是非常好的，因为日常开发经常需要引用各种库。但大多时候仅仅使用了这些库的某些部分，并非需要全部，此时Tree-Shaking如果能帮助我们删除掉没有使用的代码，将会大大缩减打包后的代码量。

Tree-Shaking的原理，通过静态分析，找出未被引用、未被执行、无法到达的代码进行消除，也就是DCE(dead code elimination)。要做到这一点，就必须保证模块依赖关系是确定的，和运行时的状态无关，而现在前端环境下，能做到这样的，就是ES6 modules 。

##### ES6 module 特点：
+ 只能作为模块顶层的语句出现
+ import 的模块名只能是字符串常量
+ import binding 是 immutable的

再看现有的打包工具，webpack似乎占领了"江湖"。于是自然想到，首先webpack作为打包工具，但是在定义模块输出的时候，webpack确不支持ESM。webpack目前支持的格式如下：out.libraryTarget属性取值分别为：

1. var - 默认值
2. assign
3. this
4. window
5. global
6. commonjs
7. commonjs2
8. amd
9. umd
10. jsonp

这就很鸡肋了...所以写类库的时候，要导出esm的话，无法用webpack编译。webpack插件系统庞大，确实有支持模块级的Tree-Shacking的插件，如webpack-deep-scope-analysis-plugin。但是粒度更细化的，一个模块里面的某个方法，本来如果没有被引用的话也可以去掉的，就不行了....这个时候，就要上rollup了。
明显的2大特性：
1. 它支持导出ES模块的包。
2. 它支持程序流分析，能更加正确的判断项目本身的代码是否有副作用。

#### 结论：
rollup 采用 es6 原生的模块机制进行模块的打包构建，rollup 更着眼于未来，对 commonjs 模块机制不提供内置的支持，是一款更轻量的打包工具。rollup 比较适合打包 js 的 sdk 或者封装的框架等，例如，vue 源码就是 rollup 打包的。而 webpack 比较适合打包一些应用，例如 SPA 或者同构项目等等。