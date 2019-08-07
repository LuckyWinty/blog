#### 简介

Hot Module Replacement（以下简称 HMR）是 webpack 发展至今引入的最令人兴奋的特性之一 ，当你对代码进行修改并保存后，webpack 将对代码重新打包，并将新的模块发送到浏览器端，浏览器通过新的模块替换老的模块，这样在不刷新浏览器的前提下就能够对应用进行更新。

基本实现原理大致这样的，构建 bundle 的时候，加入一段 HMR runtime 的 js 和一段和服务沟通的 js 。文件修改会触发 webpack 重新构建，服务器通过向浏览器发送更新消息，浏览器通过 jsonp 拉取更新的模块文件，jsonp 回调触发模块热替换逻辑。

#### 热更新配置
+ 使用webpack-dev-server,设置 hot 属性为 true.
写模块时，按照以下写法:

        if (module.hot) { //判断是否有热加载
            module.hot.accept('./hmrTest.js', function() { //热加载的模块路径
                console.log('Accepting the updated printMe module!'); //热加载的回调，即发生了模块更新时，执行什么 callback
                printMe();
            })
        }
缺点：
+ react 的热加载，使用 react-hot-loader

        import { hot } from 'react-hot-loader';
        const Record = ()=>{
            ...
        }
        export default hot(module)(Record);
    或

        if (module.hot) {
            module.hot.accept('./App', function () {
                var NextApp = require('./App')
                ReactDOM.render(<NextApp />, rootEl)
            })
        }

#### HMR原理
1. 在 webpack 的 watch 模式下，文件系统中某一个文件发生修改，webpack 监听到文件变化，根据配置文件对模块重新编译打包，并将打包后的代码通过简单的 JavaScript 对象保存在内存中。
2. 主要是 dev-server 的中间件 webpack-dev-middleware 和 webpack 之间的交互，webpack-dev-middleware 调用 webpack 暴露的 API对代码变化进行监控，并且告诉 webpack，将代码打包到内存中。
3. webpack-dev-server/client 接收到服务端消息做出响应。
4. webpack 接收到最新 hash 值验证并请求模块代码。
5. HotModuleReplacement.runtime 对模块进行热更新。
6. HotModuleReplacement.runtime 是客户端 HMR 的中枢，它接收到上一步传递给他的新模块的 hash 值，它通过 JsonpMainTemplate.runtime 向 server 端发送 Ajax 请求，服务端返回一个 json，该 json 包含了所有要更新的模块的 hash 值，获取到更新列表后，该模块再次通过 jsonp 请求，获取到最新的模块代码。
7. HotModulePlugin 将会对新旧模块进行对比，决定是否更新模块，在决定更新模块后，检查模块之间的依赖关系，更新模块的同时更新模块间的依赖引用。
8. 最后一步，当 HMR 失败后，回退到 live reload 操作，也就是进行浏览器刷新来获取最新打包代码。

#### 实现
+ 服务器构建、推送更新消息
+ 浏览器模块更新
+ 模块更新后页面渲染

