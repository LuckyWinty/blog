### 优化开发体验
1. 优化 Loader 配置
由于 Loader 对文件的转换操作很耗时，所以需要让尽可能少的文件被 Loader 处理。可以通过 test include exclude 三个配置项来命中 Loader 要应用规则的文件。
```js
        module .exports = { 
            module : { 
                rules : [{
                //如果项目源码中只有 文件，就不要写成/\jsx?$/，以提升正则表达式的性能
                test: /\.js$/, 
                //babel -loader 支持缓存转换出的结果，通过 cacheDirectory 选项开启
                use: ['babel-loader?cacheDirectory'] , 
                //只对项目根目录下 src 目录中的文件采用 babel-loader
                include: path.resolve(__dirname,'src'),
                }],
            }
        }
```
webpack 官方文档中提到:https://www.webpackjs.com/loaders/babel-loader/#babel-loader-%E5%BE%88%E6%85%A2-

2. 优化 resolve.modules 配置

resolve.modules 的默认值是［'node_modules'］，含义是先去当前目录的 node_modules 目录下去找我们想找的模块，如果没找到就去上一级目录 ../node_modules 中找，再没有就去 ../../node_modules 中找，以此类推。 这和 Node.js 的模块寻找机制很相似。

当安装的第三方模块都放在项目根目录的 node_modules 目录下时，就没有必要按照默认的方式去一层层地寻找，可以指明存放第三方模块的绝对路径，以减少寻找.
```js
    module.exports = {
        resolve: {
            modules: [path.resolve( __dirname,'node modules')] 
        },
    }
```
3. 优化 resolve.mainFields 配置

在安装的第三方模块中都会有一个 package.json 文件，用于描述这个模块的属性,其中可以存在多个字段描述入口文件，原因是某些模块可以同时用于多个环境中，针对不同的运行环境需要使用不同的代码。

resolve.mainFields 的默认值和当前的 target 配置有关系，对应的关系如下。
+ target web 或者 webworker 时，值是［'browser','module','main']。
+ target 为其他情况时，值是［ 'module','main']。

以 target 等于 web 为例， Webpack 会先采用第三方模块中的 browser 宇段去寻找模块的入口文件，如果不存在，就采用 module 字段，以此类推。

为了减少搜索步骤，在明确第三方模块的入口文件描述字段时，我们可以将它设置得尽量少。 由于大多数第三方模块都采用 main 宇段去描述入口文件的位置，所以可以这样配置：
```js
    module.exports = { 
        resolve: { 
        //只采用 main 字段作为入口文件的描述字段，以减少搜索步骤
        mainFields: ['main']
        }
    }
```
4. 优化 resolve.alias 配置

resolve.alias 配置项通过别名来将原导入路径映射成一个新的导入路径。

在实战项目中经常会依赖一些庞大的第三方模块，以 React 库为例，发布出去的 React 库中包含两套代码
+ 一套是采用 CommonJS 规范的模块化代码，这些文件都放在 lib 录下，以 package.json 中指定的入口文件 react.js 为模块的入口
+ 一套是将 React 的所有相关代码打包好的完整代码放到一个单独的文件中， 这些代码没有采用模块化，可以直接执行。其中 dist/react.js 用于开发环境，里面包含检查和警告的代码。 dist/react.min.js 用于线上环境，被最小化了。

在默认情况下， Webpack 会从入口文件 ./node_modules/react/react.js 开始递归解析和处理依赖的几十个文件，这会是一个很耗时的操作 通过配置 resolve.alias, 可以让 Webpack 在处理 React 库时，直接使用单独、完整的 react.min.js 文件,从而跳过耗时的递归解析操作.
```js
    module.exports = { 
        resolve: { 
        //使用 alias 将导入 react 的语句换成直接使用单独、完整的 react.min.js 文件，
        //减少耗时的递归解析操作
            alias: { 
                'react': path.resolve( __dirname ,'./node_modules/react/dist/react.min.js'), 
            }
        }
    }
```
**但是，对某些库使用本优化方法后，会影响到使用 Tree-Sharking 去除无效代码的优化，因为打包好的完整文件中有部分代码在我们的项目中可能永远用不上。一般对整体性比较强的库采用本方法优化，因为完整文件中的代码是一个整体，每一行都是不可或缺的 但是对于一些工具类的库，则不建议用此方法。**

5. 优化 resolve.extensions 配置

在导入语句没带文件后缀时，Webpack 会自动带上后缀去尝试询问文件是否存在。如果这个列表越长，或者正确的后缀越往后，就会造成尝试的次数越多，所以resolve .extensions 的配置也会影响到构建的性能 在配置resolve.extensions 时需要遵守 以下几点，以做到尽可能地优化构建性能。

+ 后缀尝试列表要尽可能小，不要将项目中不可能存在的情况写到后缀尝试列表中。
+ 频率出现最高的文件后缀要优先放在最前面，以做到尽快退出寻找过程。
+ 在源码中写导入语句时，要尽可能带上后缀 从而可以避免寻找过程。例如在确定的情况下将 require ( './data '） 写成 require （'./data.json'）
```js
        module.exports = { 
            resolve : { 
                //尽可能减少后缀尝试的可能性
                extensions : ['js'],
            }
        } 
```
6. 优化 module.noParse 配置
module.noParse 配置项可以让 Webpack 忽略对部分没采用模块化的文件的递归解析处理，这样做的好处是能提高构建性能。原因是一些库如 jQuery。
```js
        module.exports = {
            module: {
                noParse: /jquery/,
            }
        };
```
7. 使用 DllPlugin

DLLPlugin 和 DLLReferencePlugin 用某种方法实现了拆分 bundles，同时还大大提升了构建的速度。

包含大量复用模块的动态链接库只需被编译一次，在之后的构建过程中被动态链接库包含的模块将不会重新编译，而是直接使用动态链接库中 的代码 由于动态链接库中大多数包含的是常用的第三方模块，例如 react、react-dom ，所以只要不升级这些模块的版本，动态链接库就不用重新编译。
```js
    https://github.com/webpack/webpack/tree/master/examples/dll-user

    module.exports = {
        // mode: "development || "production",
        plugins: [
            new webpack.DllReferencePlugin({
                context: path.join(__dirname, "..", "dll"),
                manifest: require("../dll/dist/alpha-manifest.json") // eslint-disable-line
            }),
            new webpack.DllReferencePlugin({
                scope: "beta",
                manifest: require("../dll/dist/beta-manifest.json"), // eslint-disable-line
                extensions: [".js", ".jsx"]
            })
        ]
    };
```
这个理解起来不费劲，操作起来很费劲。所幸，在Webpack5中已经不用它了，而是用`HardSourceWebpackPlugin`，一样的优化效果，但是使用却及其简单
```js
const HardSourceWebpackPlugin = require('hard-source-webpack-plugin')

const plugins = [
	new HardSourceWebpackPlugin()
]
```
更开心的是，这个插件，webapck4就可以用啦，赶紧用起来吧～
**注意：该插件与测量各流程耗时的插件speed-measure-webpack-plugin不兼容。**

8. 使用 HappyPack

Webpack 是单线程模型的，也就是说 Webpack 需要一个一个地处理任务，不能同时处理多个任务。HappyPack将任
务分解给多个子进程去并发执行，子进程处理完后再将结果发送给主进程,从而发挥多核 CPU 电脑的威力。
```js
    const HappyPack = require('happypack')
    const os = require('os')
    const happyThreadPool = HappyPack.ThreadPool({ size: os.cpus().length })

    {
        test: /\.js$/,
        // loader: 'babel-loader',
        loader: 'happypack/loader?id=happy-babel-js', // 增加新的HappyPack构建loader
        include: [resolve('src')],
        exclude: /node_modules/,
    }
    
    plugins: [
        new HappyPack({
        id: 'happy-babel-js',
        loaders: ['babel-loader?cacheDirectory=true'],
        threadPool: happyThreadPool
        })
    ]
```
在整个 Webpack 构建流程中，最耗时的流程可能就是 Loader 对文件的转换操作了，因为要转换的文件数据量巨大，而且这些转换操作都只能一个一个地处理 HappyPack 的核心原理就是将这部分任务分解到多个进程中去并行处理，从而减少总的构建时间。

9. 使用 ParallelUglifyPlugin

webpack默认提供了UglifyJS插件来压缩JS代码，但是它使用的是单线程压缩代码，也就是说多个js文件需要被压缩，它需要一个个文件进行压缩。所以说在正式环境打包压缩代码速度非常慢(因为压缩JS代码需要先把代码解析成用Object抽象表示的AST语法树，再去应用各种规则分析和处理AST，导致这个过程耗时非常大)。

当webpack有多个JS文件需要输出和压缩时候，原来会使用UglifyJS去一个个压缩并且输出，但是ParallelUglifyPlugin插件则会开启多个子进程，把对多个文件压缩的工作分别给多个子进程去完成，但是每个子进程还是通过UglifyJS去压缩代码。无非就是变成了并行处理该压缩了，并行处理多个子任务，效率会更加的提高。

10. 优化文件监昕的性能

在开启监听模式时，默认情况下会监听配置的 Entry 文件和所有 Entry 递归依赖的文件，在这些文件中会有很多存在于 node_modules 下，因为如今的 Web 项目会依赖大量的第三方模块， 所以在大多数情况下我们都不可能去编辑 node_modules 下的文件，而是编辑自己建立的源码文件，而一个很大的优化点就是忽略 node_modules 下的文件，不监听它们。
```js
    module.export = { 
        watchOptions : { 
            //不监听的 node_modules 目录下的文件
            ignored : /node_modules/, 
        }
    }
```
采用这种方法优化后， Webpack 消耗的内存和 CPU 将会大大减少。
### 优化输出质量
1. Webpack 实现 CDN 的接入

总之，构建需要实现以下几点:
+ 静态资源的导入  URL 需要变成指向 DNS 服务的绝对路径的 URL，而不是相对 HTML 文件的
+ 静态资源的文件名需要带上由文件内容算出来的 Hash 值，以防止被缓存
+ 将不同类型的资源放到不同域名的 DNS 服务上，以防止资源的并行加载被阻塞

http://webpack.wuhaolin.cn/4%E4%BC%98%E5%8C%96/4-9CDN%E5%8A%A0%E9%80%9F.html

2. 使用 Tree Shaking 
Tree Shaking 正常工作的前提是，提交给 Webpack 的 JavaScript 代码必须采用了 ES6 的模块化语法，因为 ES6 模块化语法是静态的，可以进行静态分析。

首先，为了将采用 ES6 模块化的代码提交给 Webpack ，需要配置 Babel 以让其保留 ES6 模块化语句。
修改 .babelrc 文件如下：
```js
    {
        'presets':[
            [
                'env',{ 
                    'module':false
                }
            ]
        ]
    }
```
第二个要求，需要使用UglifyJsPlugin插件。如果在mode:"production"模式，这个插件已经默认添加了，如果在其它模式下，可以手工添加它。

另外要记住的是打开optimization.usedExports。在mode: "production"模式下，它也是默认打开了的。它告诉webpack每个模块明确使用exports。这样之后，webpack会在打包文件中添加诸如/* unused harmony export */这样的注释，其后UglifyJsPlugin插件会对这些注释作出理解。
```js
    module.exports = {
        mode: 'none',
        optimization: {
            minimize: true,
            minimizer: [
                new UglifyJsPlugin()
            ],
            usedExports: true,
            sideEffects: true
        }
    }
```
3. 提取公共代码

大型网站通常由多个页面组成，每个页面都是一个独立的单页应，但由于所有页面都采用同样的技术栈及同一套样式代码，就导致这些页面之间有很多相同的代码。可以使用 splitChunks 进行分包：
```js
    splitChunks: {
        chunks: "async",
        minSize: 30000,
        minChunks: 1,
        maxAsyncRequests: 5,
        maxInitialRequests: 3,
        automaticNameDelimiter: '~',
        name: true,
        cacheGroups: {
            vendors: {
                test: /[\\/]node_modules[\\/]/,
                priority: -10
            },
        default: {
                minChunks: 2,
                priority: -20,
                reuseExistingChunk: true
            }
        }
    }
```
4. 分割代码以按需加载

Webpack 支持两种动态代码拆分技术：
+ 符合 ECMAScript proposal 的 import() 语法，推荐使用
+ 传统的 require.ensure

import() 用于动态加载模块，其引用的模块及子模块会被分割打包成一个独立的 chunk。
Webpack 还允许以注释的方式传参，进而更好的生成 chunk。
```js
    // single target
    import(
    /* webpackChunkName: "my-chunk-name" */
    /* webpackMode: "lazy" */
    'module'
    );

    // multiple possible targets
    import(
    /* webpackInclude: /\.json$/ */
    /* webpackExclude: /\.noimport\.json$/ */
    /* webpackChunkName: "my-chunk-name" */
    /* webpackMode: "lazy" */
    `./locale/${language}`
    );
```
回归到实际业务场景，页面基本上都是通过路由的方式呈现，如果按照路由的方式实现页面级的异步加载，岂不是方便很多。例如，react 中可使用 loadable :
```js
    import React from 'react'
    import { Route } from 'react-router-dom'
    import { loadable } from 'react-common-lib'

    const Test = loadable({
        loader: () => import('./test'),
    })

    const AppRouter = () => (
    <>
        <Route path="/test" exact component={Test} />
    </>
    )
```
5. 分析工具

官方可视化工具：http://webpack.github.io/analyse/
