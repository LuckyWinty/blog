### 目录
本文简单介绍几种常见的 web 安全问题：

+ 同源策略
+ XSS
+ CSRF
+ SQL注入
+ 点击劫持
+ window.opener 安全问题
+ 文件上传漏洞 

### 同源策略
如果两个 URL 的协议、域名和端口都相同，我们就称这两个 URL 同源。
+ 同源策略限制了来自不同源的 JavaScript 脚本对当前 DOM 对象读和写的操作。
+ 同源策略限制了不同源的站点读取当前站点的 Cookie、IndexDB、LocalStorage 等数据。
+ 同源策略限制了通过 XMLHttpRequest 等方式将站点的数据发送给不同源的站点。

解决同源策略的方法：
+ `跨文档消息机制`:可以通过 window.postMessage 的 JavaScript 接口来和不同源的 DOM 进行通信。
+ `跨域资源共享（CORS）`:跨域资源在服务端设置允许跨域，就可以进行跨域访问控制，从而使跨域数据传输得以安全进行。
+ `内容安全策略（CSP）`:主要以白名单的形式配置可信任的内容来源，在网页中，能够使白名单中的内容正常执行（包含 JS，CSS，Image 等等），而非白名单的内容无法正常执行。
### XSS，跨站脚本攻击(Cross Site Scripting)
#### 存储型 XSS 攻击
 利用漏洞提交恶意 JavaScript 代码，比如在input, textarea等所有可能输入文本信息的区域，输入`<script src="http://恶意网站"></script>`等，提交后信息会存在服务器中，当用户再次打开网站请求到相应的数据，打开页面，恶意脚本就会将用户的 Cookie 信息等数据上传到黑客服务器。
 #### 反射型 XSS 攻击
 用户将一段含有恶意代码的请求提交给 Web 服务器，Web 服务器接收到请求时，又将恶意代码反射给了浏览器端，这就是反射型 XSS 攻击。
在现实生活中，黑客经常会通过 QQ 群或者邮件等渠道诱导用户去点击这些恶意链接，所以对于一些链接我们一定要慎之又慎。

 `Web 服务器不会存储反射型 XSS 攻击的恶意脚本，这是和存储型 XSS 攻击不同的地方。`
 #### 基于 DOM 的 XSS 攻击
 基于 DOM 的 XSS 攻击是不牵涉到页面 Web 服务器的。它的特点是在 Web 资源传输过程或者在用户使用页面的过程中修改 Web 页面的数据。比如利用工具(如Burpsuite)扫描目标网站所有的网页并自动测试写好的注入脚本等。

预防策略：
1. 将cookie等敏感信息设置为httponly，禁止Javascript通过`document.cookie`获得
2. 对所有的输入做严格的校验尤其是在服务器端，过滤掉任何不合法的输入，比如手机号必须是数字，通常可以采用正则表达式.
3. 净化和过滤掉不必要的html标签，比如：`<iframe>, alt,<script>` ;净化和过滤掉不必要的Javascript的事件标签，比如：`onclick, onfocus`等
4. 转义单引号，双引号，尖括号等特殊字符，可以采用htmlencode编码 或者过滤掉这些特殊字符
5. CSP,CSP 全称为 Content Security Policy，即内容安全策略。主要以白名单的形式配置可信任的内容来源，在网页中，能够使白名单中的内容正常执行（包含 JS，CSS，Image 等等），而非白名单的内容无法正常执行，从而减少跨站脚本攻击（XSS），当然，也能够减少运营商劫持的内容注入攻击。
配置方式：
```js
//1、meta

<meta http-equiv="Content-Security-Policy" content="script-src 'self'">

//2、Http 头部

Content-Security-Policy:
script-src 'unsafe-inline' 'unsafe-eval' 'self' *.54php.cn *.yunetidc.com *.baidu.com *.cnzz.com *.duoshuo.com *.jiathis.com;report-uri /error/csp
```
### CSRF,跨站请求伪造（Cross-site request forgery）
引诱用户打开黑客的网站，在黑客的网站中，利用用户的登录状态发起的跨站请求。

发起 CSRF 攻击的三个必要条件：
1. 目标站点一定要有 CSRF 漏洞；
2. 用户要登录过目标站点，并且在浏览器上保持有该站点的登录状态；
3. 需要用户打开一个第三方站点，如黑客的站点等。

预防策略：
1. 充分利用好 Cookie 的 SameSite 属性。

SameSite 选项通常有 Strict、Lax 和 None 三个值。
+  SameSite 的值是 Strict，那么浏览器会完全禁止第三方 Cookie。
+ Lax 相对宽松一点。在跨站点的情况下，从第三方站点的链接打开和从第三方站点提交 Get 方式的表单这两种方式都会携带 Cookie。但如果在第三方站点中使用 Post 方法，或者通过 img、iframe 等标签加载的 URL，这些场景都不会携带 Cookie。
+ 而如果使用 None 的话，在任何情况下都会发送 Cookie 数据。
如：
```js
set-cookie: 1P_JAR=2019-10-20-06; expires=Tue, 19-Nov-2019 06:36:21 GMT; path=/; domain=.google.com; SameSite=none
```
2. 验证请求的来源站点

在服务器端验证请求来源的站点，就是验证 HTTP 请求头中的 `Origin` 和 `Referer` 属性。Referer 是 HTTP 请求头中的一个字段，记录了该 HTTP 请求的来源地址，而O rigin 属性只包含了域名信息，并没有包含具体的 URL 路径。这是 Origin 和 Referer 的一个主要区别。

服务器的策略是优先判断 Origin，如果请求头中没有包含 Origin 属性，再根据实际情况判断是否使用 Referer 值。

3. 在请求地址中添加 token 并验证

CSRF 攻击之所以能够成功，是因为黑客可以完全伪造用户的请求，该请求中所有的用户验证信息都是存在于 cookie 中，因此黑客可以在不知道这些验证信息的情况下直接利用用户自己的 cookie 来通过安全验证。因此要抵御 CSRF，关键在于在请求中放入黑客所不能伪造的信息，并且该信息不存在于 cookie 之中。可以在 HTTP 请求中以参数的形式加入一个随机产生的 token，并在服务器端建立一个拦截器来验证这个 token，如果请求中没有 token 或者 token 内容不正确，则认为可能是 CSRF 攻击而拒绝该请求。

4. 在 HTTP 头中自定义属性并验证

这种方法也是使用 token 并进行验证，和上一种方法不同的是，这里并不是把 token 以参数的形式置于 HTTP 请求之中，而是把它放到 HTTP 头中自定义的属性里。通过 XMLHttpRequest 这个类，可以一次性给所有该类请求加上 csrftoken 这个 HTTP 头属性，并把 token 值放入其中。这样解决了上种方法在请求中加入 token 的不便，同时，通过 XMLHttpRequest 请求的地址不会被记录到浏览器的地址栏，也不用担心 token 会透过 Referer 泄露到其他网站中去。

然而这种方法的局限性非常大。XMLHttpRequest 请求通常用于 Ajax 方法中对于页面局部的异步刷新，并非所有的请求都适合用这个类来发起，而且通过该类请求得到的页面不能被浏览器所记录下，从而进行前进，后退，刷新，收藏等操作，给用户带来不便。另外，对于没有进行 CSRF 防护的遗留系统来说，要采用这种方法来进行防护，要把所有请求都改为 XMLHttpRequest 请求，这样几乎是要重写整个网站，这代价无疑是不能接受的。
### SQL注入
拼接 SQL 时未仔细过滤，黑客可提交畸形数据改变语义。比如查某个文章，提交了这样的数据`id=-1 or 1=1`等。1=1 永远是true，导致where语句永远是ture.那么查询的结果相当于整张表的内容，攻击者就达到了目的。或者，通过屏幕上的报错提示推测 SQL 语句等。

预防策略：
1. 禁止目标网站利用动态拼接字符串的方式访问数据库
2. 减少不必要的数据库抛出的错误信息
3. 对数据库的操作赋予严格的权限控制
4. 净化和过滤掉不必要的SQL保留字，比如：where, or, exec 等

### 点击劫持
+ 诱使用户点击看似无害的按钮（实则点击了透明 iframe 中的按钮）.
+ 监听鼠标移动事件，让危险按钮始终在鼠标下方.
+ 使用 HTML5 拖拽技术执行敏感操作（例如 deploy key）.

预防策略：
1. 服务端添加 X-Frame-Options 响应头,这个 HTTP 响应头是为了防御用 iframe 嵌套的点击劫持攻击。 这样浏览器就会阻止嵌入网页的渲染。
2. JS 判断顶层视口的域名是不是和本页面的域名一致，不一致则不允许操作，`top.location.hostname === self.location.hostname`；
3. 敏感操作使用更复杂的步骤（验证码、输入项目名称以删除）。
###  window.opener 安全问题
window.opener 表示打开当前窗体页面的的父窗体的是谁。例如，在 A 页面中，通过一个带有 target="_blank" 的 a 标签打开了一个新的页面 B，那么在 B 页面里，window.opener 的值为 A 页面的 window 对象。

一般来说，打开同源(域名相同)的页面，不会有什么问题。但对于跨域的外部链接来说，存在一个被钓鱼的风险。比如你正在浏览购物网站，从当前网页打开了某个外部链接，在打开的外部页面，可以通过 window.opener.location 改写来源站点的地址。利用这一点，将来源站点改写到钓鱼站点页面上，例如跳转到伪造的高仿购物页面，当再回到购物页面的时候，是很难发现购物网站的地址已经被修改了的，这个时候你的账号就存在被钓鱼的可能了。

预防策略：
1. 设置 rel 属性
```js
<a href="https://xxxx" rel="noopener noreferrer"> 外链 <a>
```
rel=noopener 规定禁止新页面传递源页面的地址，通过设置了此属性的链接打开的页面，其 window.opener 的值为 null。
2. 将外链替换为内部的跳转连接服务，跳转时先跳到内部地址，再由服务器 redirect 到外链。
3. 可以由 widow.open 打开外链。

### 文件上传漏洞
服务器未校验上传的文件，致使黑客可以上传恶意脚本等方式。

预防策略：
1. 用文件头来检测文件类型，使用白名单过滤(有些文件可以从其中一部分执行，只检查文件头无效，例如 PHP 等脚本语言)；
2. 上传后将文件彻底重命名并移动到不可执行的目录下；
3. 升级服务器软件以避免路径解析漏洞；
4. 升级用到的开源编辑器；
5. 管理后台设置强密码。

### 参考资料
+ 极客时间《浏览器工作原理与实践》

### 最后
+ 欢迎加我微信(winty230)，拉你进技术群，长期交流学习...
+ 欢迎关注「前端Q」,认真学前端，做个有专业的技术人...

![GitHub](https://raw.githubusercontent.com/LuckyWinty/blog/master/images/qrcode/%E4%BA%8C%E7%BB%B4%E7%A0%81%E7%BE%8E%E5%8C%96%202.png)