### JS实现页面返回定位到具体位置

其实浏览器也自带了返回的功能，也就是说，自带了返回定位的功能。正常的跳转，返回确实可以定位，但是有些特殊场景就不适用了。例如，某些元素是在某种情况下才加上的，又或者多级定位。

 目前，我知道的返回定位到具体位置有两种方法：

**①利用id定位，在跳转的时候带上某个模块的id，返回的时候定位到该处。**

**②利用距离顶部的距离，在跳转的时候带上当前位置滚动过的距离，返回的时候定位到该处。**

 

### 应用场景

+ 定位到某一个模块的时候，有二级定位的时候利用方法①.
+ 定位到具体位置的时候，定位到某一个模块的时候，利用方法②。

### 有二级定位的时候具体实现方法

 1. 常见的场景就是有一个tab模块，tab模块下面有相应的内容，进入的时候需要定位到某个tab的某个位置。

场景如图：

2. 初始化页面的时候，需要给每个模块指定一个唯一的id。打开页面的时候，如果url带着位置参数则解释参数定位，如果没有，默认为第一个。代码逻辑如下：
```js
function initPos(){//定位，主要是初始化第几个tabvar 

    hashs = location.hash.slice(1).split('&');
    hashs = hashs.map(function(hash){
        return decodeURIComponent(hash)
    })
   if(parseInt(hashs[0])&gt;=0&&parseInt(hashs[0])&lt;100){
        navHash = parseInt(hashs[0])  //第几个tab
        contentHash = hashs[1]        //tab下的具体模块id
    }
}

var $root=$('ul');
if(navHash && $root.find('li')[navHash].length){
     $root.find('li')[navHash].addClass('cur');                
}else{
    $root.find('li')[0].addClass('cur');
}
loadTabContent(tabIndex,initContent);//加载对应tab下面的内容
```
注意，如果tab下的内容是后来加载的，可能会出现，解析到url后。在页面上，由于加载时间的关系，没有找到对应的tab下面具体模块的id。这时候会定位不成功。所以还需要在加载好数据之后，再保证一下。

**保证逻辑**
```js
if(contentHash){
    var _contentHash = contentHash;
    window.onload = function(){
            setTimeout(function(){
                location.hash = _contentHash;
        },0)
    }            
    contentHash = '';
}
```

### 利用距离顶部的距离定位的具体实现方法：

1.页面有跳转的地址，不是直接link过去。要带着当前位置滚动过距离跳转。
```js
$('[data-link]').on('click',function(event) { //阻止默认跳转行为，阻止冒泡
       event.preventDefault();
       event.stopPropagation();
       savePage();
       window.location.href=$(this).attr('data-link');
 });

 function savePage(){  //操作浏览器的历史记录
      history.replaceState('', document.title, location.href.replace(location.hash, "") + "#nowTop=" + $(window).scrollTop());
 }
//跳转后的判断
    if ($('wrap').height() > nowTop)) {
            scrollTo(0, nowTop);
    }
```

两种实现方式的原理和实现都非常简单。不过要思路清晰才行，不然很容易出错。

### 最后
+ 欢迎加我微信(winty230)，拉你进技术群，长期交流学习...
+ 欢迎关注「前端Q」,认真学前端，做个有态度的技术人...
![GitHub](https://raw.githubusercontent.com/LuckyWinty/blog/master/images/gzh/%E9%BB%98%E8%AE%A4%E6%A0%87%E9%A2%98_%E6%A8%AA%E7%89%88%E4%BA%8C%E7%BB%B4%E7%A0%81_2019.10.19.png)