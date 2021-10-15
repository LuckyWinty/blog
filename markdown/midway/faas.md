# 怎样才算是serverless

### serverless 的概念
我们先用一张图看一下各种概念：

如图，纵观云计算的发展史，从物理机到虚拟机，从 IaaS、PaaS 到 FaaS，从容器到 Serverless，都是一个去服务器的一个过程。有了 IaaS，我们不需要关注物理机；有了 PaaS，我们不需要关注操作系统和运行环境；有了 Faas,我们连应用都不需要了，可以直接写一个函数就部署上线。总的来说 Serverless 技术的出现，能够让我们不再关心传统的运维工作，让我们更专注于业务的实现，把时间精力花在更有意义的事情上，让我们以更快的速度、更低的成本完成应用的开发迭代，进而创造出更大的价值。

因此，Serverless，就是一种让开发者专注业务开发而不用关心服务部署运维等服务器端操作的架构思想，进而提高业务的迭代效率，使用的云服务等资源能做到按需使用，按量付费，从而节省服务器资源成本。
+ `广义上来讲`， Serverless 是一种架构思想，即软件构建和运行时不需要关心服务器。

例如下面的都不需要关心：
1. 备份容灾： 要实现服务器、数据库的备份容灾机制，使一台服务器出故障不影响整个系统。
2. 弹性伸缩： 系统能根据业务流量大 小等指标，响应式地调整服务规模，实现自动弹性伸缩。
3. 日志监控： 需要记录详细的日志，方便排查问题和观察系统运行情况，并且实现实时的系统监控和业务监控。

+ `狭义上来讲`， Serverless 是 FaaS(函数即服务) 和 BaaS(后端即服务) 的组合，是当前主流的技术实现。

#### Faas
Function as a Server, 函数即服务。FaaS 提供了运行函数代码的运行环境，并且具有自动弹性伸缩。基于 FaaS，我们应用的组成就不再是集众多功能于一身的集合体，而是一个个独立的函数。每个函数实现各自的业务逻辑，由这些函数组成复杂的应用。

#### Baas
BaaS 是将后端能力封装成了服务，并以接口的形式提供服务。比如数据库、文件存储等。通过 BaaS 平台的接口，我们运行在 FaaS 中的函数就能调用各种后端服务，进而以更低开发成本实现复杂的业务逻辑。

### FaaS 函数运行原理
Serverless 应用本质上是由一个个 FaaS 函数组成的，Serverless 应用的每一次运行，其实是单个或多个函数的运行，所以 Serverelss 的运行原理，本质上就是函数的运行原理。

平常开发时，我们写一个函数，要运行起来。至少需要几个条件：
1. 函数被触发
2. 有函数的运行环境(浏览器打开的控制台、跑起来的应用、node环境等)
3. 函数依赖和函数要打包在一起

例如，一个node服务中的 controller 函数，其被执行的过程可能是，node服务及其依赖被构建好部署上线->外部流量经nginx层做转发->api请求到达服务器入口->经router后指向到对应的controller函数并返回对应的内容。

在 Faas 中，就是 serverless 平台，根据我们的函数定义，构造我们需要的硬件环境、容器和函数运行环境，然后加载我们上传的业务代码，然后暴露对应的函数触发方式。常见的触发方式有：HTTP 触发器、API 网关触发器、定时触发器、消息触发器等。

举个例子，比如有以下代码,从 onlineLog 中查询一分钟内的调用次数，然后存入数据库：
```js
const now = Date.now();
// 取前一分钟的整点时间作为开始时间，例如 2021-10-15 16:00:00
const startTime = getStartTime(now);
// 取当前分钟的整点时间作为开始时间，例如 2021-10-15 16:01:00
const endTime = getEndTime(now);
// 查询服务
const onlineLog = new OnlineLog();
// 数据库实例
const db = new DB();

async function getPV() {
  return await onlineLog.queryPv(startTime,endTime);
}
// 将 PV 信息存入数据库
async function saveToDB() {
  const pv = await getPV();
  const sql = 'INSERT INTO user( pv) values(?, ?)';
  await db.query(sql, [pv]);
}

// 入口函数
exports.handler = (event, callback) => {
  saveToDB()
  .then((data) => callback(data))
  .catch(callback(error));
}
```
这个代码上传到serverless平台后，经用户触发，会经历以下流程：

+ 下载代码： FaaS 平台本身不会存储代码，而是将代码放在对象存储中，需要执行函数的时候，再从对象存储中将函数代码下载下来并解压，因此 FaaS 平台一般都会对代码包的大小进行限制，通常代码包不能超过 50MB。
+ 启动容器： 代码下载完成后，FaaS 会根据函数的配置，启动对应容器，FaaS 使用容器进行资源隔离。
+ 初始化运行环境： 分析代码依赖、执行用户初始化逻辑、初始化入口函数之外的代码等。
+ 运行代码： 调用入口函数执行代码。

当函数第一次执行时，会经过完整的四个步骤，前三个过程统称为`冷启动`，最后一步称为`热启动`。


### 参考资料
+ https://www.infoq.cn/article/kki1vyk62uoclw23ikyk
+ https://jinyunlong.cc/books/how-to-play-serverless-framework.html