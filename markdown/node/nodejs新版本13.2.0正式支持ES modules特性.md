在本月 21 日，即2019.11.21，Node.js 发布了 13.2.0 版本，更新了一些特性。其中最令人兴奋的莫过于正式取消了 `--experimental-modules` 启动参数。这说明Node.js 正式支持 ES modules。我们一起来看看。

### Stability Index说明
Stability Index，即 Api 的稳定指数说明。它包括3个值：
1. Stability: 0 ,不推荐使用。表示该Api官方不推荐使用，该功能可能会发出警告。不能保证向后兼容。
2. Stability: 1，实验性的。表示该Api已经支持使用性使用。但是在将来的任何发行版中都可能发生非向后兼容的更改或删除。不建议在生产环境中使用该功能。
+ Stability: 2，稳定版。表示已经试验完成，基本不会再发生改动，可以再生产环境中使用。

### Unflag --experimental-modules
在 13.2.0的版本中，node 默认情况下会启用对ECMAScript模块的实验支持，也就是不需要启动参数了。那么nodejs是如何区分 esm 和 commonjs 的呢？这里翻译一下官方文档。

Node.js会将把以下内容视为ES模块：
+ 文件后缀为`.mjs`
+ 当文件后缀为`.js`，或者无文件后缀时，看其package.json文件，`package.json 中 type 字段值为 "module"`
+ 启动参数添加 —-input-type=module
+ 使用传递字符参数给`--eval`，如`$ node --eval 'import("http");`

其他情况下，都会被识别为 commonjs。现在node已经支持esm和commonjs了，我们在使用的时候，最好还是指定一下模块。

### 举个例子🌰
```js
import './legacy-file.cjs';
// Loaded as CommonJS since .cjs is always loaded as CommonJS.

import 'commonjs-package/src/index.mjs';
// Loaded as ES module since .mjs is always loaded as ES module.
```
这种情况，根据文件后缀按不同模块处理。
```js
// package.json
{
  "type": "module"
}
```
当前目录下，或者上级目录中的`package.json`含有`"type": "module"`时，该模块会被当作ES Module。
```js
// my-app.js, in an ES module package scope because there is a package.json
// file in the same folder with "type": "module".

import './startup/init.js';
// Loaded as ES module since ./startup contains no package.json file,
// and therefore inherits the ES module package scope from one level up.

import 'commonjs-package';
// Loaded as CommonJS since ./node_modules/commonjs-package/package.json
// lacks a "type" field or contains "type": "commonjs".

import './node_modules/commonjs-package/index.js';
// Loaded as CommonJS since ./node_modules/commonjs-package/package.json
// lacks a "type" field or contains "type": "commonjs".
```
如上图注释所示，如果当前文件目录不包含`package.json`，则会看其父级目录的`package.json`文件，然后判断type类型。
```js
node --input-type=module --eval "import { sep } from 'path'; console.log(sep);"
echo "import { sep } from 'path'; console.log(sep);" | node --input-type=module
```
这里就是使用传递字符参数给`--eval`，添加 `--input-type`启动参数的情况。

### 快速体验

目前13.2.0版本的官方文档对ES Module的标记是 `Stability: 1 `，你已经可以安装新版本来试验啦。相信在社区的共同努力下，很快就会进入 `Stability: 2` 正式稳定版了。

```js
$ nvs add node/13.2.0
$ nvs use 13.2.0
$ node -v
13.2.0
```
赶紧尝试一下吧～

### 最后
+ 欢迎加我微信(winty230)，拉你进技术群，长期交流学习...
+ 欢迎关注「前端Q」,认真学前端，做个有专业的技术人...

![GitHub](https://raw.githubusercontent.com/LuckyWinty/blog/master/images/qrcode/%E4%BA%8C%E7%BB%B4%E7%A0%81%E7%BE%8E%E5%8C%96%202.png)