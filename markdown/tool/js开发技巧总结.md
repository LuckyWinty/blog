# 12 个实用的前端开发技巧总结

### 1. 利用 CSS 穿透覆盖默认样式

常见发生场景：假如我们需要通过 input，type="file"来上传文件，而这个 input 的默认样式，可以说是非常地`丑`。所以我们希望通过一张图片，与这个 input 大小一样，位置一致地盖在上面。这个时候，显然，这个时候点击图片，input 是不会起作用的。就是因为 img 隔绝了 click 的穿透，而我们希望的是，这个 img 只是视觉上遮挡了 input 的样式，但是点击的时候还是点击到 input。所以，只要让 img 可穿透即可。

css 代码如下：

```css
img {
  pointer-events: none;
}
```

### 2. 实现自定义原生 select 控件的样式

由于 select 移动端原生样式很丑，但是原生弹出效果是符合我们设计的原则。直接修改 select 的样式的时候，一个奇怪的现象出现了，在 chrome 上调试的时候，自己定义的样式起了作用，在 Android 手机上也起了作用，但是到了 ios 手机上就不行了，典型的不兼容问题，这个时候禁用原生的样式即可。

css 代码如下：

```css
select {
  -webkit-appearance: none;
}
```

### 3. 文本溢出处理

移动设备相对来说页面较小，很多时候显示的一些信息都需要省略部分。最常见的是单行标题溢出省略，多行详情介绍溢出省略。现在都用框架开发了，这种建议需求建议形成一个基础组件，方便快捷。

css 代码如下：

```css
//单行
.single {
  overflow: hidden;
  white-space: nowrap;
  text-overflow: ellipsis;
}
//多行
.more {
  display: -webkit-box !important;
  overflow: hidden;
  text-overflow: ellipsis;
  work-break: break-all;
  -webkit-box-orient: vertical;
  -webkit-line-clamp: 2; //指定行数
}
```

### 4. 开启弹性滚动

css 代码如下：

```css
body {
  overflow: scroll;
  -webkit-overflow-scrolling: touch;
}
```

注意：Android 不支持原生的弹性滚动，但可以借助第三方库 iScroll 来实现。

### 5. 一像素边框设置

很多时候，想保持边框的大小在任何设置上都是 1px，但是因为 1px 使用 2dp 渲染，也就是说会显示为 2px 大小。所以，要采用 css3 缩放一下。

css 代码如下：

```css
.folder li {
  position: relative;
  padding: 5px;
}
.folder li + li:before {
  position: absolute;
  top: -1px;
  left: 0;
  content: " ";
  width: 100%;
  height: 1px;
  border-top: 1px solid #ccc;
  -webkit-transform: scaleY(0.5);
}
```

### 6. 防止鼠标选中事件

```html
<div class="mask" onselectstart="return false"></div>
<div class="link">
  <a href="javascrip;;">登录</a>
</div>
```

给元素添加了`onslectstart="return false"`,就可以防止鼠标选中事件。

### 7. 给动态添加的元素绑定事件

利用时间代理达到这个效果即可。如：

```js
$(document).on("click", ".large", slide); //jq中的写法
//第一个参数表示的是对应事件，第二个是需要绑定事件的元素的id或class，第三个是绑定的对应的事件函数名
```

### 8. 兼容 IE 浏览器的透明度处理

```css
.ui {
  width: 100%;
  height: 100%;
  opacity: 0.4;
  filter: Alpha(opacity=40); //兼容IE浏览器的处理
}
```

### 9. 常用的全屏居中 JS 函数

```js
//获取元素
function getElement(ele) {
  return document.getElementById(ele);
}
//自动居中函数
function autoCenter(el) {
  var bodyX = document.documentElement.offsetWidth || document.body.offsetWidth;
  var bodyY =
    document.documentElement.offsetHeight || document.body.offsetHeight;

  var elementX = el.offsetWidth;
  var elementY = el.offsetHeight;

  el.style.left = (bodyX - elementX) / 2 + "px";
  el.style.top = (bodyY - elementY) / 2 + "px";
}
```

### 10. 常用的全屏居中 CSS 函数

```css
body {
  height: 100vh;
  text-align: center;
  line-height: 100vh;
}
```

### 11. 在输入框输入完内容并按回车的时候进行判断

比如说输入完 `11000` 在按下回车的时候。

```js
<input type="textbox" id="textbox1" onkeypress="CheckInfo" />

    <script language="javascript" type="text/javascript">
    function CheckInfo()
    {
    if (event.keyCode==13) {
          alert(textbox1.text);
       }
    }
    </script>
```

### 12. chrome 调试快捷键

① ctrl+shift+f 全文查找

② ctrl+o 查找文件名

③ ctrl+shift+o 查找 js 函数名
