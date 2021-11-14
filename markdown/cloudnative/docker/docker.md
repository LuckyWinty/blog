### 背景
本文主要对 Docker的基础做个概述，如果你对下面几道题已经有答案了，那么就不用再看本文内容啦，分享给别人了解吧～

* 怎么根据一个镜像, 在本地跑起来一个 docker 容器
* 怎么进入到 docker 里面去看 log
* 怎么写一个 dockerfile
* 怎么将自己写的 dockerfile 变成镜像推送到公司的内部镜像源
* 多个 docker 之间怎么联动, 比如 mysql 的 docker, 业务的 docker, redis 的 docker, 这个要了解 docker-compose

如果还没有了解得很清楚的话，那就继续往下看吧～
### 概念
Docker 使用 Google 公司推出的 Go 语言进行开发实现，基于 Linux 内核的 cgroup ，namespace ，以及 OverlayFS 类的 Union FS 等技术，对进程进行封装隔离，属于`操作系统层面的虚拟化技术`。由于隔离的进程独立于宿主和其它的隔离的进程，因此也称其为容器。

Docker 属于 Linux 容器的一种封装，提供简单易用的容器使用接口。它是目前最流行的 Linux 容器解决方案。

Docker 将应用程序与该程序的依赖，打包在一个文件里面。运行这个文件，就会生成一个虚拟容器。程序在这个虚拟容器里运行，就好像在真实的物理机上运行一样。有了 Docker，就不用担心环境问题。

### 使用 Docker 的好处
+ 更高效的利用系统资源
+ 更快速的启动时间
+ 一致的运行环境
+ 持续交付和部署
+ 更轻松的迁移
+ 更轻松的维护和扩展

对比传统虚拟机总结
|特性 |	容器 |	虚拟机|
| ---- | ---- | ---- |
|启动	| 秒级 |	分钟级|
|硬盘使用 |	一般为 MB	| 一般为 GB|
|性能	| 接近原生 |	弱于|
|系统支持量	| 单机支持上千个容器 |	一般几十个|

### 基本概念
Docker 包括三个基本概念

+ 镜像（Image）：Docker 镜像 是一个特殊的文件系统，除了提供容器运行时所需的程序、库、资源、配置等文件外，还包含了一些为运行时准备的一些配置参数（如匿名卷、环境变量、用户等）。镜像`不包含`任何动态数据，其内容在构建之后也不会被改变。

+ 容器（Container）：镜像（Image）和容器（Container）的关系，就像是面向对象程序设计中的 类 和 实例 一样，镜像是静态的定义，容器是镜像运行时的实体。容器可以被创建、启动、停止、删除、暂停等。

+ 仓库（Repository）：镜像构建完成后，可以很容易的在当前宿主机上运行，但是，如果需要在其它服务器上使用这个镜像，我们就需要一个集中的存储、分发镜像的服务，Docker Registry 就是这样的服务。

一个 Docker Registry 中可以包含多个 仓库（Repository）；每个仓库可以包含多个 标签（Tag）；每个标签对应一个镜像。
#### 安装

1. 使用 Homebrew 安装
```js
$ brew install --cask docker
```
2. 手动下载安装
直接下载对应系统的版本，然后安装，https://docs.docker.com/get-docker/
#### 运行
1. 从应用中找到 Docker 图标并点击运行。
// TODO 图
2. 点击启动后，可以在 bash 面板中查看docker的版本

```js
docker --version
Docker version 20.10.8, build 3967b7d
```
如果 docker version、docker info 都正常的话，可以尝试运行一个 Nginx 服务器：
```js
$ docker run -d -p 80:80 --name webserver nginx
```
服务运行后，可以访问 http://localhost，如果看到了 "Welcome to nginx!"，就说明 Docker 安装成功了。
// TODO 图
要停止 Nginx 服务器并删除执行下面的命令：
```js
docker stop webserver
docker rm webserver
```
当然，也可以在docker的图形界面中直接操作，如图：
// TODO 图

### 基本用法
+ 获取镜像,从 Docker 镜像仓库获取镜像的命令是 `docker pull`。其命令格式为：
```js
$ docker pull [选项] [Docker Registry 地址[:端口号]/]仓库名[:标签]
```

比如，拉取 `nginx` 镜像
// TODO 图
+ 运行，`docker run` 就是运行容器的命令,如上文的示例
```js
docker run -d -p 80:80 --name webserver nginx
```

+ 列出镜像,可以使用 `docker image ls `命令
+ 删除本地镜像,可以使用 `docker image rm `命令.其命令格式为：
```js
$ docker image rm [选项] <镜像1> [<镜像2> ...]
```
### dockerfile 指令
### 参考资料
+ https://vuepress.mirror.docker-practice.com/image/dockerfile/copy/
+ https://yeasy.gitbook.io/docker_practice/install/mac