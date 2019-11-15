### 简介
manifest是一个后缀名为minifest的文件，在文件中定义那些需要缓存的文件，支持manifest的浏览器，会将按照manifest文件的规则，像文件保存在本地，从而在没有网络链接的情况下，也能访问页面。

### 基本写法
manifest文件，基本格式为三段：
```js
CACHE， 
NETWORK，
FALLBACK
```
+ `CACHE:`（必须）标识出哪些文件需要缓存，可以是相对路径也可以是绝对路径。
+ `NETWORK:`（可选）这一部分是要绕过缓存直接读取的文件，可以使用通配符＊。
+ `FALLBACK：`（可选）指定了一个后备页面，当资源无法访问时，浏览器会使用该页面。该段落的每条记录都列出两个 URI。第一个表示资源， 第二个表示后备页面。

其中NETWORK和FALLBACK为可选项。而第一行CACHE MANIFEST为固定格式，必须写在前面。
以#号开头的是注释，一般会在第二行写个版本号，用来在缓存的文件更新时，更改manifest的作用，可以是版本号，时间戳或者md5码等等。

### 典型写法
```js
CACHE MANIFEST
#version 1.2.2

CACHE:
#css
http://xxx/style.css
#js
http://xxx/index.js

#img
http://xxx/logo.png

NETWORK:  
*
FALLBACK:
 /error.html
```
### 如何更新缓存
一、更新manifest文件：给manifest添加或删除文件，都可更新缓存，如果我们更改了js，而没有新增或删除，前面例子中注释中的版本号、时间戳或者md5码等进行修改，都可以很好的用来更新manifest文件

二、通过javascript操作：html5中引入了js操作离线缓存的方法，下面的js可以手动更新本地缓存。

window.applicationCache.update();
三、清除浏览器缓存：如果用户清除了浏览器缓存（手动或用其他一些工具）都会重新下载文件。

问题
1、manifest除了缓存manifest.appcache文件所指定的资源外，还必定会缓存当前的html页面。

2、如果manifest文件，或者内部列举的某一个文件不能正常下载，整个更新过程都将失败，浏览器继续全部使用老的缓存。

3、引用manifest的html必须与manifest文件同源，在同一个域下。

4、FALLBACK中的资源必须和manifest文件同源。

5、当一个资源被缓存后，该浏览器直接请求这个绝对路径也会访问缓存中的资源。

6、站点中的其他页面即使没有设置manifest属性，请求的资源如果在缓存中也从缓存中访问。

7、当manifest文件发生改变时，资源请求本身也会触发更新。

manifest坑太多，已经不建议使用。目前，可以用service worker来作为代替方案。