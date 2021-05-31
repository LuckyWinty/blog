# 模块联邦(Module Federation)的应用介绍

### 背景
目前很多公司的业务都涉及到多个端的开发，有PC端/小程序/原生客户端等，而不同端都有对应的一个或几个独立的项目，而这些不同的项目之间都有一些可复用的业务逻辑，开发者往往需要在不同的项目中维护相同的逻辑。因此，为了节省维护成本，都会考虑跨项目模块复用，了解到 webpack5 的模块联邦特性，做了一下调研。

### MF是什么
Module Federation，中文翻译为`"模块联邦"`，是 webpack5 中的一个号称 `改变JavaScript架构的游戏规则`的功能。其文档中定义的使用目的为：
> 多个独立的构建可以形成一个应用程序。这些独立的构建不会相互依赖，因此可以单独开发和部署它们。这通常被称为微前端，但并不仅限于此。

简单说，MF 实际上就是可以把多个无单独依赖的、单独部署的应用合为一个。或者说不止是应用，MF 支持的粒度更细。它可以把多个模块、多个npm包合为一个。

### MF 的特点
1. 支持在项目中直接导出某个模块，直接单独打包。
目前，我们在跨项目/跨团队项目间复用时，主要用的方式还是以导出 npm包 为主，而npm包的抽离、发布、维护都需要一定的成本。而且当多个项目依赖同一个npm包时，若npm有升级，则所有依赖项目都要相应更新，然后重新发布。而且往往你在写某个逻辑的时候，可能并没有预想到后来有复用的可能，那么这个时候抽成npm包来复用还是比较麻烦的。

而 MF 模块是可以在项目中直接导出某个模块，单独打包的，如下图：
// 图1
这样就很灵活，在复用逻辑的时候可以做到尽可能对现有项目少改造，快速导出。

2. 支持运行时加载，可以减少打包时的代码体积，使用起来和在同一个项目下无区别
// 图2
因为拆分打包，所以有了更小的加载体积，而且当前子系统已经下载的chunk可以被共享，如果可以复用，下一个子系统将不会再次下载。这也就具备了可以在项目运行时同步更新不同项目间的同一模块逻辑依赖且节约了代码构建成本，维护成本等。

3. 相比过去， externals 无法多版本共存，dll 无法共享模块，MF 完美解决。
4. 借助运行时动态加载模块的特性，可以做到更好的A/B test
5. MF 可以和服务端渲染结合使用，也与 CDN 的边缘计算契合的很好，畅想一下，它还能结合 serverless 做按需编译的加载。

### 构建一个完整的基于 MF 应用的例子

首先，这是webpack5的能力，所以当然要用webpack5来构建，怕配置麻烦的同学，可以直接看我的demo，demo我已经上传到github上了，地址为：https://github.com/LuckyWinty/vue2-module-federation/tree/master

// 图3

导出方配置：
```js
// home webpack.config.js
    new ModuleFederationPlugin({
      name: "home",
      filename: "remoteEntry.js",
      exposes: {
        "./Content": "./src/components/Content",
        "./Button": "./src/components/Button",
        "./VueDemo": "./src/components/VueDemo", // 组件
        "./Utils": "./src/utils", // 纯函数
      },
    }),
```
使用方配置：
```js
// layout webpack.config.js
    new ModuleFederationPlugin({
      name: "layout",
      filename: "remoteEntry.js",
      remotes: {
        home: "home@http://localhost:3002/remoteEntry.js",//cdn地址
      },
      exposes: {},
    }),
// layout main.js
    import Vue from "vue";
    import Layout from './Layout.vue';

    const Content = () => import("home/Content");
    const Button = () => import("home/Button");
    const VueDemo = () => import("home/VueDemo");

    (async () => {
    const { sayHi } = await import("home/Utils");
    sayHi();
    })();


    Vue.component("content-element", Content);
    Vue.component("button-element", Button);
    Vue.component("vue-demo", VueDemo);

    new Vue({
    render: h => h(Layout),
    }).$mount('#app')
```
通过以上配置，我们对 MF 有了一个初步的认识，即如果要使用 MF，需要配置好几个重要的属性：

| 字段名 | 类型 | 含义 |
| --- | --- | --- |
| name | string | 必传值，即输出的模块名 |
| library | object | 声明全局变量的方式，name为umd的name |
| filename | string | 构建输出的文件名 |
| remotes | object | 远程引用的应用名及其别名的映射，使用时以key值作为name |
| exposes | object | 被远程引用时可暴露的资源路径及其别名 |
| shared | object | 与其他应用之间可以共享的第三方依赖，使你的代码中不用重复加载同一份依赖 |

由此可见，该方案可以在项目间共享模块且使用方式与正常引入无太大区别。其基本原理为，将独立导出的模块打包为一个单独的包，然后使用方通过CDN地址的方式引用，这样就可以同步更新不同项目间的同一模块逻辑且节约了代码构建成本，维护成本等。

建议可以自行跑一下demo来感受一下它的作用。

### 微信小程序的限制
小程序由于需要在上线前将所有代码打包好，然后送审通过后才能上线。因此无法做到按需动态CDN加载对应的模块。为了兼容小程序的这点，我们可以通过脚本拉取CDN地址的代码到小程序项目指定目录，然后小程序再引用。
图4：

### MF在微前端应用上的对比

Module Federation 和 qiankun/icestark 等框架在微前端应用上的一些差别：

1. 微的定义
MF 基于 `模块`，qiankun/icestark 等框架基于 `应用`，也就是说MF是由多个互相独立的模块聚合而成的应用，框架是由多个互相独立的应用聚合而成的应用。

2. 技术实现
MF 模块本质上是`JS代码片段`，这种代码片段一般称为chunk。因此，模块的聚合，实际上是chunk的聚合。框架应用本质上是`HTML`，而在SPA中，HTML又是main.js进行填充的。因此，应用的聚合，实际上是main.js的聚合。

3. 使用场景
MF 是一种技术升级的创造性工作，有一定成本，目的是为了让系统具备更强大的能力。框架是一种维持现状的保守性工作，成本极小，目的是为了让系统拥有更长久的生命力。

4. 案例体现
由YY业务中台web前端组团队自主研发的EMP微前端方案就是基于 MF 的能力而实现的。项目地址：https://github.com/efoxTeam/emp
qiankun 框架可以直接看官网，地址：https://qiankun.umijs.org/zh/guide/tutorial

两者只不过微的粒度以及使用场景不同罢了，都可以成为微前端。

### MF的缺点
1. 对环境要求略高，需要使用webpack5，旧项目改造成本大。
2. 对代码封闭性高的项目，依旧需要做npm那一套管理和额外的拉取代码，还不如npm复用方便。
3. 拆分粒度需要权衡,虽然能做到依赖共享，但是被共享的lib不能做tree-shaking，也就是说如果共享了一个lodash，那么整个lodash库都会被打包到shared-chunk中。虽然依赖共享能解决传统微前端的externals的版本一致性问题。
4. webpack为了支持加载remote模块对runtime做了大量改造，在运行时要做的事情也因此陡然增加，可能会对我们页面的运行时性能造成负面影响。
5. 运行时共享也是一把双刃剑，如何去做版本控制以及控制共享模块的影响是需要去考虑的问题。
6. 远程模块 typing 的问题。


### 总结
MF 有很多想象空间，值得继续探索和留意。MF 不是银弹，还是需要结合场景去选择。篇幅限制，先到这里。下次再聊聊 MF 的详细实现原理～

### 参考&相关浏览过的资料
+ https://juejin.cn/post/6895324456668495880
+ https://www.zhihu.com/question/378835846
+ https://nextfe.com/5-practical-ways-to-share-code/
+ https://zhuanlan.zhihu.com/p/220138948
+ https://webpack.js.org/concepts/module-federation/#motivation