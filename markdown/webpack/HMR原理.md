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

#### 实现过程
1. watch 编译过程、devServer 推送更新消息到浏览器
2. "浏览器"接收到服务端消息做出响应
3. 对模块进行热更新或刷新页面

#### watch 编译过程、devServer 推送更新消息到浏览器
1. webpack-dev-server 里引用了 webpack-dev-middleware，相关的 watch 逻辑就是在里面实现的。

        //webpack-dev-server/lib/Server.js
        setupDevMiddleware() {
            // middleware for serving webpack bundle
            this.middleware = webpackDevMiddleware(
            this.compiler,
            Object.assign({}, this.options, { logLevel: this.log.options.level })
            );
        }
        // webpack-dev-middleware/index.js
        if (!options.lazy) {
            context.watching = compiler.watch(options.watchOptions, (err) => {
            if (err) {
                context.log.error(err.stack || err);
                if (err.details) {
                context.log.error(err.details);
                }
            }
            });
        } else {
            context.state = true;
        }
以上代码可以看出，webpack-dev-middleware 是通过调用 webpack 的 api 对文件系统 watch 的。watchOptions 如果没有配置的话，会取默认值。值的含义见：https://webpack.js.org/configuration/watch/

2. 当文件发生变化时，重新编译输出 bundle.js。devServer 下，是没有文件会输出到 output.path 目录下的，这时 webpack 是把文件输出到了内存中。webpack 中使用的操作内存的库是 memory-fs，它是 NodeJS 原生 fs 模块内存版(in-memory)的完整功能实现，会将你请求的url映射到对应的内存区域当中，因此读写都比较快。

        // webpack-dev-middleware/lib/fs.js
        const isMemoryFs =
        !isConfiguredFs &&
        !compiler.compilers &&
        compiler.outputFileSystem instanceof MemoryFileSystem;

        if (isConfiguredFs) {
        // eslint-disable-next-line no-shadow
        const { fs } = context.options;

        if (typeof fs.join !== 'function') {
            // very shallow check
            throw new Error(
            'Invalid options: options.fs.join() method is expected'
            );
        }

        // eslint-disable-next-line no-param-reassign
        compiler.outputFileSystem = fs;
        fileSystem = fs;
        } else if (isMemoryFs) {
        fileSystem = compiler.outputFileSystem;
        } else {
        fileSystem = new MemoryFileSystem();

        // eslint-disable-next-line no-param-reassign
        compiler.outputFileSystem = fileSystem;
        }

3. devServer 通知浏览器端文件发生改变，在启动 devServer 的时候，sockjs 在服务端和浏览器端建立了一个 webSocket 长连接，以便将 webpack 编译和打包的各个阶段状态告知浏览器，最关键的步骤还是 webpack-dev-server 调用 webpack api 监听 compile的 done 事件，当compile 完成后，webpack-dev-server通过 _sendStatus 方法将编译打包后的新模块 hash 值发送到浏览器端。

        // webpack-dev-server/lib/Server.js
        const addHooks = (compiler) => {
        const { compile, invalid, done } = compiler.hooks;

        compile.tap('webpack-dev-server', invalidPlugin);
        invalid.tap('webpack-dev-server', invalidPlugin);
        done.tap('webpack-dev-server', (stats) => {
            this._sendStats(this.sockets, this.getStats(stats));
            this._stats = stats;
        });
        };
        ...
        // send stats to a socket or multiple sockets
        _sendStats(sockets, stats, force) {
            const shouldEmit =
            !force &&
            stats &&
            (!stats.errors || stats.errors.length === 0) &&
            stats.assets &&
            stats.assets.every((asset) => !asset.emitted);

            if (shouldEmit) {
            return this.sockWrite(sockets, 'still-ok');
            }

            this.sockWrite(sockets, 'hash', stats.hash);

            if (stats.errors.length > 0) {
            this.sockWrite(sockets, 'errors', stats.errors);
            } else if (stats.warnings.length > 0) {
            this.sockWrite(sockets, 'warnings', stats.warnings);
            } else {
            this.sockWrite(sockets, 'ok');
            }
        }

#### "浏览器"接收到服务端消息做出响应

这里的主要逻辑位于 webpack-dev-server/client-src 中，webpack-dev-server 修改了webpack 配置中的 entry 属性，在里面添加了 webpack-dev-client 的代码，这样在最后的 bundle.js 文件中就会有接收 websocket 消息的代码了。

        //webpack-dev-server/lib/utils/addEntries.js
        /** @type {string} */
        const clientEntry = `${require.resolve(
        '../../client/'
        )}?${domain}${sockHost}${sockPath}${sockPort}`;

        /** @type {(string[] | string)} */
        let hotEntry;

        if (options.hotOnly) {
            hotEntry = require.resolve('webpack/hot/only-dev-server');
        } else if (options.hot) {
            hotEntry = require.resolve('webpack/hot/dev-server');
        }
        ...
        [].concat(config).forEach((config) => {
        /** @type {Boolean} */
        const webTarget =
            config.target === 'web' ||
            config.target === 'webworker' ||
            config.target === 'electron-renderer' ||
            config.target === 'node-webkit' ||
            config.target == null;
        /** @type {Entry} */
        const additionalEntries = checkInject(
            options.injectClient,
            config,
            webTarget
        )
            ? [clientEntry]
            : [];

        if (hotEntry && checkInject(options.injectHot, config, true)) {
            additionalEntries.push(hotEntry);
        }

        config.entry = prependEntry(config.entry || './src', additionalEntries);

        if (options.hot || options.hotOnly) {
            config.plugins = config.plugins || [];
            if (
            !config.plugins.find(
                // Check for the name rather than the constructor reference in case
                // there are multiple copies of webpack installed
                (plugin) => plugin.constructor.name === 'HotModuleReplacementPlugin'
            )
            ) {
                config.plugins.push(new webpack.HotModuleReplacementPlugin());
            }
        }
        });
以上代码可以看出，如果选择了热加载，输出的 bundle.js 会包含接收 websocket 消息的代码。而且 plugin 也会注入一个 HotModuleReplacementPlugin，构建过程中热加载相关的逻辑都在这个插件中。这个插件主要处理两部分逻辑：
+ 注入 HMR runtime 逻辑
+ 找到修改的模块，生成一个补丁 js 文件和更新描述 json 文件

先看一张图，看看 websocket 中的消息长什么样子：
![GitHub](https://raw.githubusercontent.com/LuckyWinty/blog/master/images/websocket.jpg)
可以看到，接收的消息只有 type 和 hash 两个内容。在 client 里面的逻辑，他们分别对应不同的处理逻辑：

    // webpack-dev-server/client-src/default/index.js
    hash(hash) {
        status.currentHash = hash;
    },
    ...
    ok() {
        sendMessage('Ok');
        if (options.useWarningOverlay || options.useErrorOverlay) {
        overlay.clear();
        }
        if (options.initial) {
        return (options.initial = false);
        } // eslint-disable-line no-return-assign
        reloadApp(options, status);
    }
可以看出，当接收到 type 为 hash 消息后会将 hash 值暂存起来，当接收到 type 为 ok 的消息后对应用执行 reload 操作，而 hash 消息是在 ok 消息之前的。再看看 reload 里面的处理逻辑：

    // webpack-dev-server/client-src/default/reloadApp.js
    if (hot) {
        log.info('[WDS] App hot update...');
        const hotEmitter = require('webpack/hot/emitter');
        hotEmitter.emit('webpackHotUpdate', currentHash);
        if (typeof self !== 'undefined' && self.window) {
        // broadcast update to window
        self.postMessage(`webpackHotUpdate${currentHash}`, '*');
        }
    }
    // allow refreshing the page only if liveReload isn't disabled
    else if (liveReload) {
        let rootWindow = self;
        // use parent window for reload (in case we're in an iframe with no valid src)
        const intervalId = self.setInterval(() => {
        if (rootWindow.location.protocol !== 'about:') {
            // reload immediately if protocol is valid
            applyReload(rootWindow, intervalId);
        } else {
            rootWindow = rootWindow.parent;
            if (rootWindow.parent === rootWindow) {
            // if parent equals current window we've reached the root which would continue forever, so trigger a reload anyways
            applyReload(rootWindow, intervalId);
            }
        }
        });
    }
可以看出，如果配置了模块热更新，就调用 webpack/hot/emitter 将最新 hash 值发送给 webpack，然后将控制权交给 webpack 客户端代码。如果没有配置模块热更新，就进行 liveReload 的逻辑。webpack/hot/dev-server 中会监听 webpack-dev-server/client-src 发送的 webpackHotUpdate 消息,然后调用 webpack/lib/HotModuleReplacement.runtime 中的 check 方法，检测是否有新的更新：

    // webpack/hot/dev-server.js
    var hotEmitter = require("./emitter");
        hotEmitter.on("webpackHotUpdate", function(currentHash) {
            lastHash = currentHash;
            if (!upToDate() && module.hot.status() === "idle") {
                log("info", "[HMR] Checking for updates on the server...");
                check();
            }
        });
        
    // webpack/lib/HotModuleReplacement.runtime
        function hotCheck(apply) {
           ...
            return hotDownloadManifest(hotRequestTimeout).then(function(update) {
                ...
                    /*globals chunkId */
                    hotEnsureUpdateChunk(chunkId);
                ...
                return promise;
            });
        }
        function hotEnsureUpdateChunk(chunkId) {
            if (!hotAvailableFilesMap[chunkId]) {
                hotWaitingFilesMap[chunkId] = true;
            } else {
                hotRequestedFilesMap[chunkId] = true;
                hotWaitingFiles++;
                hotDownloadUpdateChunk(chunkId);
            }
        }

#### 对模块进行热更新或刷新页面