# 高性能javascript书写方法

### 数据存储

在javascript中，数据存储的位置会对代码整体性能产生重大的影响，数据存储共有4种方式：`字面量、变量、数组、对象成员`。

总的来说，字面量和局部变量的访问速度快于数组和对象成员的访问速度。
 
要理解变量的访问速度，就要理解作用域。由于局部变量处于作用域的起始位置，因此访问速度比访问跨域作用域变量(即除起始位置之外的外层作用域变量)更快。即变量处在作用域的位置越深，访问速度越慢。这也就说明，访问全局变量的速度是最慢的。

因此，常见的一些提高数据访问速度的方法有：
+ 避免使用with、try-catch中的catch语句，因为它会改变执行环境的作用域链。
+ 尽量少用嵌套对象、避免对象嵌套过深。
+ 可以把常需要访问的对象成员、数组项、跨域变量保存在局部变量中。

### DOM编程

我们知道用javascript操作DOM会影响性能，这是为什呢。这个问题是“天生”的。
因为DOM是一个独立于语言的，用于操作XML和HTML文档的程序接口，而客户端脚本编程大多数时候是和底层文档打交道。所以推荐的做法就是尽可能少操作DOM。

有这么一些小技巧：

+ 如果需要多次访问某个DOM节点，使用局部变量存储它的引用。
+ 小心处理HTML集合，因为它实时联系着底层文档。例如：
```js
var divs= document.getElementsByTagName('div');
for(var i = 0;i < divs.length; i++){
    document.body.appendChild(document.creatElement('div'))
}
```
这是一个死循环，原因就是divs.length每次迭代都会增加，它反映的是底层文档的当前状态。
因此，我们在需要遍历某个HTML集合的时候，可以先把长度缓存起来再使用。而如果是要经常操作的集合，可以把整个集合拷贝到一个数组中。
+ 使用一些速度更快的API
例如
```js
childNodes -> children
childElementCount -> childNodes.length
firstElementChild -> firstChild
lastElementChild -> last Child
getElementByTagName  ->querySelectorAll
```
+ 注意重绘和重排

1. 由于每次重排都会产生计算消耗，大多数浏览器通过队列化修改并批量执行来优化重排过程。而获取布局信息的操作会导致队列刷新，如下方法：
```js
offsetTop,offsetLeft,offsetWidth,offsetHeight、scrollTop,scrollLeft,scrollWidth,scrollHeight、clientTop,clientLeft,clientWidth,clientHeight、getComputedStyle
```
因为这些属性或方法需要返回最新的布局信息，因此浏览器不得不执行渲染列队中的“待处理变化”并触发重排以返回正确的值。
2. 最小化重绘和重排，合并多次对DOM和样式的修改，如
```js
var el = document.getElementById('mydiv');
el.style.margin = '5px';
el.style.padding = '2px';
el.style.borderLeft= '5px';
```
以上，修改了三个样式，每个都会影响元素的几何结构，最糟糕的情况下会导致三次重排(大部分现代浏览器为此做了优化，只会触发一次)
可以被优化为：
```js
var el = document.getElementById('mydiv');
el.style.cssText = 'margin = '5px';padding = '2px';borderLeft= '5px';
```
3. 需要对DOM元素进行一系列操作时，可以通过以下步骤：

1）使元素脱离文档流

2）对其应用多重改变

3）把元素带回文档中

具体方法有
1. 隐藏元素、应用修改、重新显示
2. 使用文档片段，在别的地方构建一个子树，再把它拷贝回文档
3. 将原始元素拷贝到一个脱离文档的节点，修改后再替换原始元素

### 算法和流程控制
循环处理是最常见的编程模式之一，也是提升性能必须关注的要点之一。常见的优化方案有：
1. JavaScript的四种循环(for、do-while、while、for-in)中，for-in循环比其他几种明显要慢。由于每次迭代操作会同时搜索实例或原型属性，for-in循环的每次迭代都会产生更多的开销，所以比其他类型要慢。因此遍历一个属性数量有限的已知属性列表，可以这样优化：
```js
var props = ['prop1', 'prop2'],i = 0;
whlie(i < props.length){
   precess(object[props[i++]]);
}
```
该代码只关注给定的属性，减少了循环的开销。

2. 减少迭代的工作量。把数组长度保存在局部变量中再遍历、颠倒数组的遍历顺序。
3. 减少迭代次数，“Duffs Device”即“达夫设备“循环体展开技术。适合于迭代次数较大的情况下。
4. 基于函数的迭代比基于循环的迭代消耗性能更多。例：for循环迭代与forEach函数迭代
5. 优化if-else，通常来说，switch比if-else快，但是在判断条件较多时，使用查找表比if-else和switch都快。

### 快速响应的用户界面
用于执行JavaScript和更新用户界面的进程通常被称为“浏览器UI线程”。JavaScript和用户界面更新在同一个进程中运行，因此一次只能处理一件事情。

任何JavaScript任务都不应当执行超过100毫秒，过长的运行时间导致UI更新出现明显延迟，从而会影响用户体验。

浏览器有两类限制JavaScript任务的运行时间的机制，调用栈大小限制（即记录自脚本开始以来执行的语句的数量）和长时间运行脚本限制（记录脚本执行的总时长，超时的时候会有弹框提示用户[chrome没有单独的程云霞脚本限制，替代做法是依赖其通用奔溃检测系统来处理此类问题]）。

一些优化JavaScript任务时间的常见做法：
1. 使定时器让出时间片段
2. 分割任务
3. 使用Worker

### 参考资料
+ 《高性能javascript》
### 最后
+ 欢迎加我微信(winty230)，拉你进技术群，长期交流学习...
+ 欢迎关注「前端Q」,认真学前端，做个有专业的技术人...

![GitHub](https://raw.githubusercontent.com/LuckyWinty/blog/master/images/qrcode/%E4%BA%8C%E7%BB%B4%E7%A0%81%E7%BE%8E%E5%8C%96%202.png)
