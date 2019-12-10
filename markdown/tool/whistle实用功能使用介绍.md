whistle是基于Node实现的跨平台web调试代理工具，类似的工具有Windows平台上的Fiddler，主要用于查看、修改HTTP、HTTPS、Websocket的请求/响应，也可以作为HTTP代理服务器使用，不同于Fiddler通过断点修改请求响应的方式，whistle采用的是类似配置系统hosts的方式，一切操作都可以通过配置实现，支持域名、路径、正则表达式、通配符、通配路径等多种匹配方式，且可以通过Node模块扩展功能。

如果你时间充裕，想详细了解，可见官方文档：http://wproxy.org/whistle/

如果想快速上手使用常用的功能，继续往下看。

### mac安装配置
安装 node.js，选择 LTS 版安装。安装完成后在命令行运行 npm install -g whistle（如果提示没有权限，以 sudo 的方式运行） 

在命令行输入w2 start，回车，然后浏览器打开http://127.0.0.1:8899，如果看到如下界面则安装成功。



### whistle 的代理
安装Chrome代理插件，打开chrome的应用商店，搜索SwitchyOmega，添加扩展程序。新建一个whistle的情景模式，各配置参考如下图

浏览器右上角，找到SwitchOmega扩展程序，选中新建的whistle模式。打开http://local.whistlejs.com/，若能打开whistle则设置已成功，可以开始使用啦！

(如不能翻墙请到公众号回复 插件，即可获取插件安装包进行安装)。

### 常用功能
#### 代理接口，修改返回体。
最常用的场景就是在后端接口挂了或者没有开发好的时候，可以模拟返回假数据，让前端调试可以不依赖后端。

方式一：在本地保存返回体，代理到本地

https://xxx.com/test file://D:/path/test/file/test.json
方式二：在whistle新建数据文件保存



创建的文件尽量带文件后缀，有语法高亮，另外如果不是 .json 结尾，whistle 不会在 Response Headers 里自动添加 content-type: application/json; charset=utf-8，那么一些请求库就拿不到正确的返回。

建好之后，这样写规则即可：

https://xxx.com/test file://{createData.json}
#### 接口有跨域等问题，设置请求头信息
常设信息：

Access-Control-Allow-Headers: Content-Type, Access-Control-Allow-Headers, Authorization, token
Access-Control-Allow-Methods: POST, GET, OPTIONS
Access-Control-Allow-Origin: *
Access-Control-Allow-Credentials: true
content-type: application/json
status: 200
在value创建数据



设置规则

https://xxx.com/test resHeaders://{corsHeader}
配host
我们可以为某个域名或具体的 url 指定 ip，绕过 dns 解析，让请求直接到达指定的 ip。通常在开发、测试和预发布境的切换都通过切换 host 来实现，这样访问不同的环境不需要改变代码，或根据环境配置文件访问不同的 url。

10.187.56.202 xxx.com  //可同时指定多个不同的域名
#### 重定向
这个最常用的场景就是，我们某个页面需要在特定环境下调试，但是特定环境却没有入口去打开页面。例如，在小程序环境中，调试h5页面。

https://www.baidu.com/ redirect://https://xxx.com
替换线上文件
如果线上环境，有特殊问题。没法在生产环境复现，这个时候可以直接替换js文件到本地进行调试，提高调试效率。

http://example.com/cdn/example.js file://{example.js}  //也可以替换到本地
修改接口返回状态
这种一般就是用于本地测试容灾情况，指定某个接口返回特定的状态，如500、404等，看页面是否异常等

https://xxx.com/test statusCode://500
#### 插入js
这种情况，一般是临时调试的时候，往页面插入某段js，看执行情况。或插入一些工具js，方便调试的。如插入vConsole.js。这样就会在页面中出现一个控制台，可以看console.log的输出。在移动端调试的时候特别好用

https://xxx.com/test js://{vConsole.js}
效果如下：



不过，whistle 提供了更方便的插件:

npm i -g whistle.inspect
https://www.google.com whistle.inspect://


vConsole.log介绍文档：https://github.com/Tencent/vConsole

#### 正则使用
一般用于某一类的域名/url代理，例如我希望含有baidu.com域名的地址，不经过代理

/^(?!.*baidu.com).*$/ socks://127.0.0.1:1086
reqScript
考虑一种场景：我们要测一个视频上传接口返回 500 的情况，看是否走到了正常的提示逻辑，通常我们模拟状态码就可以解决，但如果接口跨域了，会先发起一个路径一致的 options 请求，我们希望这个 options 请求依然返回 200，只处理 post 请求。

https://xxx.com/test reqScript://{onlyPostRule}
value中的规则

if (method === 'POST') {
    rules.push('https://xxx.com statusCode://500');
}
#### https转http
这是由于hsts或者服务器端不支持 https，证书不对，比如测试环境 https 证书没配好等原因，https的页面有时候打不开，这个时候就需要转换为http。

https://xxx.com http://xxx.com
hsts介绍：https://www.thesslstore.com/blog/clear-hsts-settings-chrome-firefox/