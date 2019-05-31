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

#### Webpakck插件的基本模型
    // 1、BasicPlugin.js 文件（独立模块）

    // 2、模块对外暴露的 js 函数
    class BasicPlugin{ 
        //在构造函数中获取用户为该插件传入的配置
        constructor(pluginOptions) {
            this.options = pluginOptions;
        } 
        //3、原型定义一个 apply 函数，并注入了 compiler 对象
        apply(compiler) { 
            //4、挂载 webpack 事件钩子（这里挂载的是 emit 事件）
            compiler.plugin('emit', function (compilation, callback) {
                // ... 内部进行自定义的编译操作
                // 5、操作 compilation 对象的内部数据
                console.log(compilation);
                // 6、执行 callback 回调
                callback();
            });
        }
    } 
    // 7、暴露 js 函数
    module.exports = BasicPlugin;
##### Apply方法的定义
webpack中调用插件的方式就是plugin.apply()。webpack部分[源码](https://github.com/webpack/webpack/blob/10282ea20648b465caec6448849f24fc34e1ba3e/lib/webpack.js#L35)：

    const webpack = (options, callback) => {
        ...
        for (const plugin of options.plugins) {
            plugin.apply(compiler);
        }
        ...
    }
##### Compiler对象
compiler 对象是 webpack 的编译器对象，compiler 对象会在启动 webpack 的时候被一次性的初始化，compiler 对象中包含了所有 webpack 可自定义操作的配置，例如 loader 的配置，plugin 的配置，entry 的配置等各种原始 webpack 配置等，在 webpack 插件中的自定义子编译流程中，我们肯定会用到 compiler 对象中的相关配置信息，我们相当于可以通过 compiler 对象拿到 webpack 的主环境所有的信息。
webpack部分[源码](https://github.com/webpack/webpack/blob/10282ea20648b465caec6448849f24fc34e1ba3e/lib/webpack.js#L30)

    // webpack/lib/webpack.js
    const Compiler = require("./Compiler")

    const webpack = (options, callback) => {
        ...
        options = new WebpackOptionsDefaulter().process(options) // 初始化 webpack 各配置参数
        let compiler = new Compiler(options.context)     // 初始化 compiler 对象，这里 options.context 为 process.cwd()
        compiler.options = options                      // 往 compiler 添加初始化参数
        new NodeEnvironmentPlugin().apply(compiler)// 往 compiler 添加 Node 环境相关方法
        for (const plugin of options.plugins) {
            plugin.apply(compiler);
        }
        ...
    }

##### Compilation 对象
compilation 实例继承于 compiler，compilation 对象代表了一次单一的版本 webpack 构建和生成编译资源(编译资源是 webpack 通过配置生成的一份静态资源管理 Map（一切都在内存中保存），以 key-value 的形式描述一个 webpack 打包后的文件，编译资源就是这一个个 key-value 组成的 Map)的过程。当运行 webpack 开发环境中间件时，每当检测到一个文件变化，一次新的编译将被创建，从而生成一组新的编译资源以及新的 compilation 对象。一个 compilation 对象包含了 当前的模块资源、编译生成资源、变化的文件、以及 被跟踪依赖的状态信息。编译对象也提供了很多关键点回调供插件做自定义处理时选择使用。

**Compiler 和 Compilation 的区别在于： Compiler 代表了整个 Webpack 从启动到关闭的生命周期，而 Compilation 只代表一次新的编译。**

##### Tapable & Tapable 实例
webpack 的插件架构主要基于 Tapable 实现的，Tapable 是 webpack 项目组的一个内部库，主要是抽象了一套插件机制。webpack 源代码中的一些 Tapable 实例都继承或混合了 Tapable 类。Tapable 能够让我们为 javaScript 模块添加并应用插件。 它可以被其它模块继承或混合。它类似于 NodeJS 的 EventEmitter 类，专注于自定义事件的触发和操作。 除此之外, Tapable 允许你通过回调函数的参数访问事件的生产者。

##### Plugin插件开发调试
**npm link**

Npm link 专门用于开发和调试本地的 Npm 模块，能做到在不发布模块的情况下， 将本地的一个正在开发的模块的源码链接到项目的 node_modules 目录下，让项目可以直接使
用本地的 Npm 模块。由于是通过软链接的方式实现的，编辑了本地的 Npm 模块的代码，所以在项目中也能使用到编辑后的代码。
1. 确保正在开发的本地 Loader 模块的 package.json 已经配置好(最主要的main字段的入口文件指向要正确)
2. 在本地的 Npm 模块根目录下执行 npm link ，将本地模块注册到全局
3. 在项目根目录下执行 npm link loader-name ，将第 2 步注册到全局的本地 Npm
模块链接到项目的 node moduels 下，其中的 loader-name 是指在第 1 步的
package.json 文件中配置的模块名称

**Resolveloader**

ResolveLoader 用于配置 Webpack 如何寻找 Loader ，它在默认情
况下只会去 node_modules 目录下寻找。为了让 Webpack 加载放在本地项目中的 Loader,
需要修改 resolveLoader.modules。

    //假设本地项目中的 Loader 在项目目录的 ./loaders/loader-name 下
    module.exports = { 
        resolveLoader:{ 
            //去哪些目录下寻找 Loader ，有先后顺序之分
            modules :['node modules','./loaders/'], 
        }
    }
