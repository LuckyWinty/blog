# 原生JS封装Ajax插件(同域&&jsonp跨域)

### 前言

抛出一个问题，其实所谓的熟悉原生JS，怎样的程度才是熟悉呢？

用原生Js封装了一个Ajax插件，引入一般的项目，传传数据，感觉挺可行的。。。简单说说思路，有兴趣的可以自己跟着写一个，顺便熟悉一下原生的Ajax...

### Ajax核心，创建XHR对象

Ajax技术的核心是XMLHttpRequest对象（简称XHR），IE5是第一款引入XHR对象的浏览器，而IE5中的XHR对象是通过MSXML库中的一个ActiveX对象实现的，因此在IE中可能有3个版本，即MSXML2.XMLHttp、MSXML2.XMLHttp.3.0和MSXML2.XMLHttp.6.0。所以创建XHR对象的时候要用兼容性写法：

```js
createXHR:function(){
    if(typeof XMLHttpRequest!='undefined'){
    return new XMLHttpRequest();
    }else if(typeof ActiveXObject!='undefined'){
    if(typeof arguments.callee.activeXString!='string'){
        var versions=["MSXML2.XMLHttp.6.0","MSXML2.XMLHttp.3.0","MSXML2.XMLHttp"],i,len;
        for(i=0,len=versions.length;i<len;i++){
        try{
            new ActiveXObject(versions[i]);
            arguments.callee.activeXString=versions[i];
            break;
        }catch(ex){
        }
        }
        return new ActiveXObject(arguments.callee.activeXString);
        }else{
        throw new Error("No XHR object available.");
    }
}
```
### XHR的主要方法属性

#### 方法：

+ open()方法：接受3个参数，要发送的请求的类型、请求的URL、是否异步发送的布尔值

+ send()方法:要作为请求主体发送的数据，如果不需要通过请求主体发送数据，则必须传入null

+ abort()方法：在接收到响应之前调用来取消异步请求。

#### 属性：

+ responseText:作为响应主体被返回的文本。

+ status:响应的HTTP状态

+ statusText:HTTP状态说明

+ readyState:表示请求/响应过程的当前活动阶段

取值分别为：

0：未初始化。尚未调用open()方法

1：启动。已经调用open()方法，但尚未调用send()方法

2：发送。已经调用send()方法，但未接收到响应。

3：接收。已经接受到部分响应数据

4：完成。已经接受到全部响应数据，而且已经可以在客户端使用了。

 

本例中的onreadystatechange事件处理函数：
```js
var complete=function(){
    if(xhr.readyState==4){
     if((xhr.status>=200&&xhr.status<300)||xhr.status==304){
        if(params.success){
         params.success(xhr.responseText);//执行调用ajax时指定的success函数
         }
    }else{
        if(params.fail){
        params.fail();//执行调用ajax时指定的fail函数
       }else{
        throw new Error("Request was unsucessful:"+xhr.status);
       }
    }
    }
}
```
注意：必须在调用open()方法之前指定onreadystatechange事件处理函数才能确保跨浏览器兼容性。

### 同域发送请求

#### GET请求

最常见的请求类型，常用于查询某些信息。通过将查询的字符串参数追加到URL的末尾来将信息发送给服务器。get方法请求需要注意的是，查询字符串中的每个参数名称和值都必须使用encodeURIComponent()进行编码，而且所有名-值对都必须由&号分割。

请求方法：
```js
if((this.config.type=="GET")||(this.config.type=="get")){
   for(var item in this.config.data){
    this.config.url=addURLParam(this.config.url,item,this.config.data[item]);//使用encodeURIComponent()进行编码
    }
   xhr.onreadystatechange=complete;
   xhr.open(this.config.type,this.config.url,this.config.async);
   xhr.send(null);
}
```
#### POST请求

通常用于向服务器发送应该被保存的数据，POST请求应该把数据作为请求的主体提交。这里将模仿表单提交。即将Content-Type头部信息设置为application/x-www-form-urlencoded; charset=UTF-8。

序列化函数：
```js
    function serialize(data){
        var val="";
        var str="";
        for(var item in data){
            str=item+"="+data[item];
            val+=str+'&';
        }
        return val.slice(0,val.length-1);
    }
```

请求方法：
```js
if(this.config.type=="POST"||this.config.type=="post"){
    xhr.addEventListener('readystatechange',complete);
    xhr.open(this.config.type,this.config.url,this.config.async);
    if(params.contentType){
        this.config.contentType=params.contentType;
        }
    xhr.setRequestHeader("Content-Type",this.config.contentType);
    xhr.send(serialize(this.config.data));
}
```
#### 两个请求的一些区别：

1. GET请求把参数数据写到URL中，在URL中可以看到，而POST看不到，所以GET不安全，POST较安全。

2. GET传送的数据量较小，不能大于2kb。POST传送的数据量较大，一般默认为不受限制。

3. GET服务器端用Request.QueryString来获取变量的值，POST服务器端用Request.From来获取。

4. GET将数据添加到URL中来传递到服务器，通常利用一个？，后面的参数每一个数据参数以“名称=值”的形式出现，参数与参数之间利用一个连接符&来区分。POST的数据是放在HTTP主体中的，其组织方式不只一种，有&链接方式，也有分隔符方式。可以隐藏参数，传递大批数据，比较方便。

### jsonp跨域发送请求

 首先，跨域是神马情况呢？

一个域名的组成：

http://  |   www | abc.com: |  8080 | / scripts/AjaxPlugin.js
---- | --- | --- | --- | --- | --- | ---
协议   |    子域名   |   主域名  |    端口号  |   请求资源地址

+ 当协议、子域名、主域名、端口号中任意一个不相同时，都算作不同域。

+ 不同域之间互相请求资源，就算作“跨域”。

所有的浏览器都遵守同源策略，这个策略能够保证一个源的动态脚本不能读取或操作其他源的http响应和cookie，这就使浏览器隔离了来自不同源的内容，防止它们互相操作。所谓同源是指协议、域名和端口都一致的情况。浏览器会阻止ajax请求非同源的内容。

JSONP(JSON with Padding) 是一种跨域请求方式。主要原理是利用了script 标签可以跨域请求的特点，由其 src 属性发送请求到服务器，服务器返回 JS 代码，网页端接受响应，然后就直接执行了，这和通过 script 标签引用外部文件的原理是一样的。但是jsonp跨域只支持get请求。

JSONP由两部分组成：回调函数和数据，回调函数一般是由网页端控制，作为参数发往服务器端，服务器端把该函数和数据拼成字符串返回。

#### jsonp跨域主要需要考虑三个问题：

1. 因为 script 标签的 src 属性只在第一次设置的时候起作用，导致 script 标签没法重用，所以每次完成操作之后要移除；
2. JSONP这种请求方式中，参数依旧需要编码；
3. 如果不设置超时，就无法得知此次请求是成功还是失败；

由于代码有点长，就放个计时器的代码吧，完整代码见AjaxPlugin
```js
//超时处理
if(params.time){
   scriptTag.timer=setTimeout(function(){
       head.removeChild(scriptTag);
       params.fail&&params.fail({message:"over time"});
       window[cbName]=null;
    },params.time);
}
```

插件详细解析及使用方法见：https://github.com/LuckyWinty/AjaxPlugin
### 最后
+ 欢迎加我微信(winty230)，拉你进技术群，长期交流学习...
+ 欢迎关注「前端Q」,认真学前端，做个有专业的技术人...

![GitHub](https://raw.githubusercontent.com/LuckyWinty/blog/master/images/qrcode/%E4%BA%8C%E7%BB%B4%E7%A0%81%E7%BE%8E%E5%8C%96%202.png)