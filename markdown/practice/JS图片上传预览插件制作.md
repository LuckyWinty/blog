# JS图片上传预览插件制作
其实，图片预览功能非常地常见。所以就动手做了一个小插件。在此分享一下思路。

### 实现图片预览的一些方法。

了解了一下，其实方法都是大同小异的。大概有以下几种方式：

1. 订阅input[type=file]元素的onchange事件.

一旦选择的路径被改变就把图片上传至服务器，然后就返回图片在服务器端的地址，并且赋值到img元素上。

缺点：工作量大，有些上传并不是用户最终需要上传的图片，但是这种方式会把上传过程中选择过的图片都保存至服务器端，会造成资源浪费，而且服务器端清理临时的那些预览图片也需要一定的工作量。

2. 利用HTML5的新特性FileReader。

这个对象提供了很多相关的方法，其中最主要用到readAsDataURL这个方法。点我了解更多。

缺点：通过FileReader的readAsDataURL方法获取的Data URI Scheme会生成一串很长的base64字符串，若图片较大那么字符串则更长，若页面出现reflow时则会导致性能下降。且浏览器支持情况不一致，支持的浏览器：FF3.6+，Chrome7+，IE10+。

3. 使用window.URL.createObjectURL代替FileReader，再用DXImageTransform.Microsoft.AlphaImageLoader滤镜兼容IE。

缺点：由于IE11作了安全方面的考虑，使得在input[type=file]元素上通过value、outerHTML和getAttribute的方式都无法获取用户所选文件的真实地址，只能获取到

D:\frontEnd\文件名称。因此需使用document.selection.createRangeCollection方法来获取真实地址。

### 我的插件制作

我选择了比较保守的方法，就是第三种使用window.URL.createObjectURL代替FileReader，再用DXImageTransform.Microsoft.AlphaImageLoader滤镜兼容IE的方法啦。

1. 第一步，HTML的布局
```html
<div id="pic">
    <img id="preview" src="../imgs/default.jpeg">
</div>
<input type="file" id="uploadBtn" accept="image/*" onchange="setPreviewPic()">
```
是不是想说so easy？

2. 第二步，插件js封装。

2.1 建立对象

我主要采用了组合继承的方式，封装了两个方法，分别是单张图片上传和多张图片上传。因为无论是单张图片上传还是单张图片上传，都需要传入、上传图片的input按钮、img标签、包裹着img的div、最大的单张照片的值，单位为KB。所以这四个参数在创建上传图片对象的时候就要传入。创建该对象的方法如下：

```js
var SetPreviewPic=function(fileObj,preview,picWrap,maxImgSize){
    this.fileObj=fileObj;
    this.preview=preview;
    this.picWrap=picWrap;
    this.maxImgSize=maxImgSize;
}
```
2.2 定义匹配模式

因为是上传图片，除了在input里面加了accept="image/*"，做了初步限制之外，还需要一个js的正则来通过路径的检测来判定是否为图片。所以在prototype上面定义该模式以供两个方法使用：

```js
SetPreviewPic.prototype.pattern=new RegExp('\.(jpg|png|jpeg)+$','i');
```

2.3 定义方法

主要就是判断是否低于IE11的环境，编写两类方案。第一种就是直接通过改变img的src来预览图片，第二种就是在低版本的IE下，通过滤镜来达到预览效果。

FF、Chrome、IE11以上：（这里贴出多张图片预览的代码）

```js
if(maxPics){ 
    if(this.fileObj.files && this.fileObj.files[0]){
       var imgs=this.picWrap.querySelectorAll('img'); //查找DOM里面已经有多少张图片了
       var num=imgs.length;
       var html=this.picWrap.innerHTML;
    if(Number(num)<Number(maxPics)){ //判断是否超过最大上传限度
         if(num==1&&(!imgs[0].classList.contains('newLoad'))){ //覆盖第一张默认图片
           html='';
         }
         if(this.pattern.test(fileObj.files[0].name)){
           if(judgeSize(fileObj.files[0].size/1024,this.maxImgSize)){//判断图片的大小是否超限
               html='<img class="newLoad" style="margin:5px;width:'+width+'px;height:'+height+'px;" src='+window.URL.createObjectURL(this.fileObj.files[0])+' />'+html;
               this.picWrap.innerHTML=html;
           }else{
               alert('你上传的图片太大！');
           }
         }else{
           alert('你上传的好像不是图片哦，请检查！');
         }
     }else{
       alert('每次最多上传'+maxPics+'张图片！');
     }
 }
```
IE11下利用滤镜达到效果：
```js
        var nums=this.picWrap.childNodes.length;//因为IE6以下不支持querySelectorAll等方法，就通过childNodes的长度判断
 
        if(nums<maxPics+2){//这里加2是因为本来有一张默认的图片，而且childNodes读出来的长度会多1
            this.fileObj.select();
            if(document.selection){
                var imgSrc=document.selection.createRange().text;
 
                var image=new Image();       
                image.src=imgSrc;       
                filesize=image.fileSize; 
                if(judgeSize(image.fileSize/1024,this.maxImgSize)){
 
        //IE下必须设置div的大小
        var ele=document.createElement('div');
        ele.style.width=width+'px';
        ele.style.height=height+'px';
        ele.style.filter="progid:DXImageTransform.Microsoft.AlphaImageLoader(sizingMethod=scale,src='"+imgSrc+"')";
 
        try{
            this.picWrap.appendChild(ele);
        }catch(e){
            alert('你上传的图片格式有误,请重新选择！');
            return false;
        }
        this.preview.style.display='none';
        document.selection.empty();
    }else{
        alert('你上传的图片太大！');
    }
}
```
至此，就完成啦！


用法：
```js
<script type="text/javascript" src="../js/singlePic.js"></script>
<script>
    var fileObj=document.getElementById('uploadBtn');
    var preview=document.getElementById('preview');
    var picWrap=document.getElementById('pic');
    fileObj.onchange=function(){
        var obj=new SetPreviewPic(fileObj,preview,picWrap,100);
        //定义上传图片对象，参数分别为上传图片的input按钮、img标签包、裹着img的div、最大的单张照片的值，单位为KB
        obj.uploadSinglePic(200,250);//单张图片上传，参数分别为每张的宽度、高度
        // obj.uploadPics(200,250,2);  //多张图片上传，参数分别为每张的宽度、高度、最多上传张数
    }
</script>
``` 

完整项目地址：https://github.com/LuckyWinty/uploadImgs
PS：点击阅读原文即可到达哦～

### 缺点
这里有一个就是其实没办法判断客户端是否将不是图片的文件通过修改后缀名而作为图片来上传，这个只能通过服务器端来判断！