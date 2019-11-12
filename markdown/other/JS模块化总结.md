### 简介
>规范JavaScript的模块定义和加载机制,降低了学习和使用各种框架的门槛，能够以一种统一的方式去定义和使用模块，提高开发效率，降低了应用维护成本。
模块化解决的问题：
+ 命名冲突
+ 文件依赖

### commonJS
1、模块可以多次加载，但是只会在第一次加载时运行一次，然后运行结果就被缓存了，以后再加载，就直接读取缓存结果。要想让模块再次运行，必须清除缓存。

2、模块加载会阻塞接下来代码的执行，需要等到模块加载完成才能继续执行——同步加载。

`适用场景：`服务器环境，nodejs的模块规范是参照commonJS实现的。

`用法：`

1、导入：require('路径')
2、导出：module.exports和exports
```js
// a.js
// 相当于这里还有一行：var exports = module.exports;代码
exports.a = 'Hello world';  // 相当于：module.exports.a = 'Hello world';

// b.js
var moduleA = require('./a.js');
console.log(moduleA.a);     // 打印出hello world
```
注意：module.exports和exports的区别是exports只是对module.exports的一个引用，相当于Node为每个模块提供一个exports变量，指向module.exports。这等同在每个模块头部，有一行var exports = module.exports;这样的命令。

### AMD
1、异步加载
2、管理模块之间的依赖性，便于代码的编写和维护。

`适用场景：`浏览器环境，requireJS是参照AMD规范实现的

`用法：`
1、导入：require(['模块名称'], function ('模块变量引用'){// 代码});
2、导出：define(function (){return '值');
```js
// a.js
define(function (){
　　return {
　　　a:'hello world'
　　}
});
// b.js
require(['./a.js'], function (moduleA){
    console.log(moduleA.a); // 打印出：hello world
});
```
### CMD
1、CMD是在AMD基础上改进的一种规范，和AMD不同在于对依赖模块的执行时机处理不同，CMD是就近依赖，而AMD是前置依赖。

`适用场景：`浏览器环境，seajs是参照UMD规范实现的，requireJS的最新的几个版本也是部分参照了UMD规范的实现。

`用法：`

1、导入：define(function(require, exports, module) {});
2、导出：define(function (){return '值');
```js
// a.js
define(function (require, exports, module){
　　exports.a = 'hello world';
});
// b.js
define(function (require, exports, module){
    var moduleA = require('./a.js');
    console.log(moduleA.a); // 打印出：hello world
});
```
### AMD与CMD区别
最明显的区别就是在模块定义时对依赖的处理不同
1. AMD推崇依赖前置，在定义模块的时候就要声明其依赖的模块
2. CMD推崇就近依赖，只有在用到某个模块的时候再去require

AMD和CMD最大的区别是对依赖模块的执行时机处理不同

很多人说requireJS是异步加载模块，SeaJS是同步加载模块，这么理解实际上是不准确的，其实加载模块都是异步的，只不过AMD依赖前置，js可以方便知道依赖模块是谁，立即加载，而CMD就近依赖，需要使用时把模块变为字符串解析一遍才知道依赖了那些模块，这也是很多人诟病CMD的一点，牺牲性能来带来开发的便利性，实际上解析模块用的时间短到可以忽略

为什么我们说两个的区别是依赖模块执行时机不同，为什么很多人认为ADM是异步的，CMD是同步的（除了名字的原因。。。）

同样都是异步加载模块，AMD在加载模块完成后就会执行改模块，所有模块都加载执行完后会进入require的回调函数，执行主逻辑，这样的效果就是依赖模块的执行顺序和书写顺序不一定一致，看网络速度，哪个先下载下来，哪个先执行，但是主逻辑一定在所有依赖加载完成后才执行

CMD加载完某个依赖模块后并不执行，只是下载而已，在所有依赖模块加载完成后进入主逻辑，遇到require语句的时候才执行对应的模块，这样模块的执行顺序和书写顺序是完全一致的

这也是很多人说AMD用户体验好，因为没有延迟，依赖模块提前执行了，CMD性能好，因为只有用户需要的时候才执行的原因

### UMD
1、兼容AMD和commonJS规范的同时，还兼容全局引用的方式。

`适用场景：`浏览器或服务器环境

`用法：`

无导入导出规范，只有如下的一个常规写法：
```js
(function (root, factory) {
    if (typeof define === 'function' && define.amd) {
        //AMD
        define(['jquery'], factory);
    } else if (typeof exports === 'object') {
        //Node, CommonJS之类的
        module.exports = factory(require('jquery'));
    } else {
        //浏览器全局变量(root 即 window)
        root.returnExports = factory(root.jQuery);
    }
}(this, function ($) {
    //方法
    function myFunc(){};
    //暴露公共方法
    return myFunc;
}));
```
### ES6 module
1、按需加载（编译时加载）
2、import和export命令只能在模块的顶层，不能在代码块之中（如：if语句中）,import()语句可以在代码块中实现异步动态按需动态加载

`适用场景：`浏览器或服务器环境（以后可能支持）
`用法：`

1、导入：import {模块名A，模块名B...} from '模块路径'
2、导出：export和export default
3、import('模块路径').then()方法
```js
/*错误的写法*/
// 写法一
export 1;

// 写法二
var m = 1;
export m;

// 写法三
if (x === 2) {
  import MyModual from './myModual';
}

/*正确的三种写法*/
// 写法一
export var m = 1;

// 写法二
var m = 1;
export {m};

// 写法三
var n = 1;
export {n as m};

// 写法四
var n = 1;
export default n;

// 写法五
if (true) {
    import('./myModule.js')
    .then(({export1, export2}) => {
      // ...·
    });
}

// 写法六
Promise.all([
  import('./module1.js'),
  import('./module2.js'),
  import('./module3.js'),
])
.then(([module1, module2, module3]) => {
   ···
});
```
注意：export只支持对象形式导出，不支持值的导出，export default命令用于指定模块的默认输出，只支持值导出，但是只能指定一个，本质上它就是输出一个叫做default的变量或方法。
### 最后
+ 欢迎加我微信(winty230)，拉你进技术群，长期交流学习...
+ 欢迎关注「前端Q」,认真学前端，做个有专业的技术人...

![GitHub](https://raw.githubusercontent.com/LuckyWinty/blog/master/images/qrcode/%E4%BA%8C%E7%BB%B4%E7%A0%81%E7%BE%8E%E5%8C%96%202.png)