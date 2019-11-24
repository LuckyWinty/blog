在本月 21 日，即2019.11.21，Node.js 发布了 13.2.0 版本，更新了一些特性。其中最令人兴奋的莫过于正式取消了 `--experimental-modules` 启动参数。这说明Node.js 正式支持 ES modules。我们一起看看有哪些特性更新。

### esm 模块
#### Stability Index说明
Stability Index，即 Api 的稳定指数说明。它包括3个值：
1. Stability: 0 ,不推荐使用。表示该Api官方不推荐使用，该功能可能会发出警告。不能保证向后兼容。
2. Stability: 1，实验性的。表示该Api已经支持使用性使用。但是在将来的任何发行版中都可能发生非向后兼容的更改或删除。不建议在生产环境中使用该功能。
+ Stability: 2，稳定版。表示已经试验完成，基本不会再发生改动，可以再生产环境中使用。

#### Unflag --experimental-modules
在 13.2.0的版本中，node 默认情况下会启用对ECMAScript模块的实验支持，也就是不需要启动参数了。那么nodejs是如何区分 esm 和 commonjs 的呢？这里翻译一下官方文档。

Node.js会将把以下内容视为ES模块：
+ 文件后缀为`.mjs`
+ 当文件后缀为`.js`，或者无文件后缀时，看其package.json文件，`package.json 中 type 字段值为 "module"`
+ 启动参数添加 —-input-type=module
+ 使用传递字符参数给`--eval`，如`$ node --eval 'import("http");`

其他情况下，都会被识别为 commonjs。现在node已经支持esm和commonjs了，我们在使用的时候，最好还是指定一下模块。

#### 举个例子🌰
```js
```