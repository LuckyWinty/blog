## node命令行参数说明

### node 命令中 & 和 && 的区别
使用`&&`时，将运行第一个命令，如果没有错误，则将运行第二个命令。这就像一个逻辑与，即命令会被串行执行。
使用`&`时，将并行执行 `&` 前后的命令。
例如有如下3个文件：
```js
// demo1.js
console.log('start demo1');

setTimeout(() => {
  console.log('end demo1');
}, 5000);
```
```js
// demo2.js
console.log('start demo2');

setTimeout(() => {
  console.log('end demo2');
}, 2000);
```
```js
// demo3.js
console.log('start demo3');

setTimeout(() => {
  console.log('end demo3');
}, 1000);
```
脚本命令为：
```js
{
  "name": "test",
  "version": "1.0.0",
  "main": "demo.js",
  "scripts": {
    "test":"node demo1.js & node demo2.js && node demo3.js"
  }
}
```
输出顺序为：
```js
start demo1
start demo2
end demo2
start demo3
end demo3
end demo1
```
运行示意图：
// TODO
### node 命令中 -- 和-- --区别