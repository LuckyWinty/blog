# 你应该知道的 options 请求

### 什么是 options 请求

我们可以看下 MDN 中的一段描述：

> HTTP 的 OPTIONS 方法 用于获取目的资源所支持的通信选项。客户端可以对特定的 URL 使用 OPTIONS 方法，也可以对整站（通过将 URL 设置为“\*”）使用该方法。

简单来说，就是可以用 options 请求去嗅探某个请求在对应的服务器中都支持哪种请求方法。

在前端中我们一般不会主动发起这个请求，但是往往你可以看到浏览器中相同的请求发起了 2 次，如图：

<!--图 -->

其实，这是因为在跨域的情况下，在浏览器发起"复杂请求"时主动发起的。跨域共享标准规范要求，对那些可能对服务器数据产生副作用的 HTTP 请求方法（特别是 GET 以外的 HTTP 请求，或者搭配某些 MIME 类型的 POST 请求），浏览器必须首先使用 OPTIONS 方法发起一个预检请求（preflight request），从而获知服务端是否允许该跨域请求。服务器确认允许之后，才发起实际的 HTTP 请求。

### 简单请求与复杂请求

某些请求不会触发 CORS 预检请求，这样的请求一般称为"简单请求",而会触发预检的请求则成为"复杂请求"。

#### 简单请求

- 请求方法为`GET、HEAD、POST`时发的请求
- 人为设置了规范集合之内的首部字段，如`Accept/Accept-Language/Content-Language/Content-Type/DPR/Downlink/Save-Data/Viewport-Width/Width`
- `Content-Type` 的值仅限于下列三者之一,即`application/x-www-form-urlencoded、multipart/form-data、text/plain`
- 请求中的任意 XMLHttpRequestUpload 对象均没有注册任何事件监听器；
- 请求中没有使用 ReadableStream 对象。

#### 复杂请求

- 使用了下面任一 HTTP 方法，PUT/DELETE/CONNECT/OPTIONS/TRACE/PATCH
- 人为设置了以下集合之外首部字段，即简单请求外的字段
- Content-Type 的值不属于下列之一，即`application/x-www-form-urlencoded、multipart/form-data、text/plain`

### options 关键的请求头字段

#### request header 的关键字段

| 关键字段                       | 作用                                           |
| ------------------------------ | ---------------------------------------------- |
| Access-Control-Request-Method  | 告知服务器，实际请求将使用 POST 方法           |
| Access-Control-Request-Headers | 告知服务器，实际请求将携带的自定义请求首部字段 |

如：

```js
Access-Control-Request-Method: POST
Access-Control-Request-Headers: X-PINGOTHER, Content-Type
```

#### response header 的关键字段

| 关键字段                       | 作用                                              |
| ------------------------------ | ------------------------------------------------- |
| Access-Control-Allow-Methods   | 表明服务器允许客户端使用什么方法发起请求          |
| Access-Control-Allow-Origin    | 允许跨域请求的域名，如果要允许所有域名则设置为 \* |
| Access-Control-Request-Headers | 将实际请求所携带的首部字段告诉服务器              |
| Access-Control-Max-Age         | 指定了预检请求的结果能够被缓存多久                |

### Options 请求优化

当我们发起跨域请求时，如果是简单请求，那么我们只会发出一次请求，但是如果是复杂请求则先发出 options 请求，用于确认目标资源是否支持跨域，然后浏览器会根据服务端响应的 header 自动处理剩余的请求，如果响应支持跨域，则继续发出正常请求，如果不支持，则在控制台显示错误。

由此可见，当触发预检时，跨域请求便会发送 2 次请求，既增加了请求数，也延迟了请求真正发起的时间，严重影响性能。

所以，我们可以优化 Options 请求，主要有 2 种方法。

1. 转为简单请求，如用 JSONP 做跨域请求
2. 对 options 请求进行缓存，服务器端设置 `Access-Control-Max-Age` 字段，那么当第一次请求该 URL 时会发出 OPTIONS 请求，浏览器会根据返回的 Access-Control-Max-Age 字段缓存该请求的 OPTIONS 预检请求的响应结果（具体缓存时间还取决于浏览器的支持的默认最大值，取两者最小值，一般为 10 分钟）。在缓存有效期内，该资源的请求（URL 和 header 字段都相同的情况下）不会再触发预检。（chrome 打开控制台可以看到，当服务器响应 Access-Control-Max-Age 时只有第一次请求会有预检，后面不会了。注意要开启缓存，去掉 disable cache 勾选。）

### 总结

options 请求就是预检请求，可用于检测服务器允许的 http 方法。当发起跨域请求时，由于安全原因，触发一定条件时浏览器会在正式请求之前自动先发起 OPTIONS 请求，即 CORS 预检请求，服务器若接受该跨域请求，浏览器才继续发起正式请求。

### 参考资料

- https://developer.mozilla.org/zh-CN/docs/Web/HTTP/Access_control_CORS#Preflighted_requests

* https://zhuanlan.zhihu.com/p/70032617
