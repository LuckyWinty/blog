# webpack插件机制
webpack 插件机制是整个 webpack 工具的骨架，而 webpack 本身也是利用这套插件机制构建出来的。

#### 插件概念
专注处理 webpack 在编译过程中的某个特定的任务的功能模块，可以称为插件。最常见的如 html-webpack-plugin 。

那么怎么样的一个东西可以称之为 webpack 插件呢？一个完整的 webpack 插件需要满足以下几点规则和特征：

+ 是一个独立的模块。
+ 模块对外暴露一个 js 函数。
+ 函数的原型 (prototype) 上定义了一个注入 compiler 对象的 apply 方法。
+ apply 函数中需要有通过 compiler 对象挂载的 webpack 事件钩子，钩子的回调中能拿到当前编译的 compilation 对象，如果是异步编译插件的话可以拿到回调 callback。
+ 完成自定义子编译流程并处理 complition 对象的内部数据。
+ 如果异步编译插件的话，数据处理完成后执行 callback 回调。

#### webpakck插件的基本模型
    // 1、my-plugin.js 文件（独立模块）

    // 2、模块对外暴露的 js 函数
    function MyPlugin(pluginOpions) {
        this.options = pluginOptions;
    }

    // 3、原型定义一个 apply 函数，并注入了 compiler 对象
    MyPlugin.prototype.apply = function (compiler) {
        // 4、挂载 webpack 事件钩子（这里挂载的是 emit 事件）
        compiler.plugin('emit', function (compilation, callback) {
        // ... 内部进行自定义的编译操作
        // 5、操作 compilation 对象的内部数据
            console.log(compilation);
            // 6、执行 callback 回调
            callback();
        });
    };

    // 暴露 js 函数
    module.exports = MyPlugin;
##### apply方法的定义
webpack中调用插件的方式就是plugin.apply()。webpack核心[源码](https://github.com/webpack/webpack/blob/10282ea20648b465caec6448849f24fc34e1ba3e/lib/webpack.js#L35)：

    const webpack = (options, callback) => {
        ...
        for (const plugin of options.plugins) {
            plugin.apply(compiler);
        }
        ...
    }
##### compiler对象
compiler 对象是 webpack 的编译器对象，compiler 对象会在启动 webpack 的时候被一次性的初始化，compiler 对象中包含了所有 webpack 可自定义操作的配置，例如 loader 的配置，plugin 的配置，entry 的配置等各种原始 webpack 配置等，在 webpack 插件中的自定义子编译流程中，我们肯定会用到 compiler 对象中的相关配置信息，我们相当于可以通过 compiler 对象拿到 webpack 的主环境所有的信息。