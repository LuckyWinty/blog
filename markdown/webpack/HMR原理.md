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