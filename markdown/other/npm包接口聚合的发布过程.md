### npm 包功能

#### request-combo
这是一个接口聚合模块，主要用于以下场景：

+ 一个支持参数合并的接口，在组件化或其他场景下调用了不同参数的相同的接口，这时把这些调用合并成一个或多个接口再请求。
+ 避免发起相同的请求,某些情况下发起了相同的请求，经收集处理后，实际只发起一个请求。但是不同的发起端的callback 都能得到处理。

#### 主要逻辑设计
+ 要知道接口的基本信息,包括但不限于 url、params、callback...
+ 既然要聚合，那么得有一个收集接口的队列
+ 每个接口的队列要有状态，当一个新接口到来时，该接口的队列可能还没创建，可能正在收集，可能刚发完请求。
+ 要有接口队列发起请求的条件，收集时间够了或者收集长度够了...

#### API 设计
调用方法：requestCombo()
参数：

```json
    apiData: ApiData, 
    params: object, 
    callback: Function, 
    request = axios, 
    collectTime = 100, 
    isCombo = true, 
    errorHandle?: Function
```
ApiData 类型中包含以下内容：

|    params    | Description | Type    | Example |
| ----------   | ----------- | ------- | ------- |
|   url        | 接口地址     | string  | http:xxx/api |
|   pack   |  参数合并逻辑函数 | function | fn |
|   unpack   |  数据拆解逻辑函数 | function | fn |
|   maxComboNum | 接口最大收集次数 | number | 10 |
| requestMethod | 当前请求类型 | string | 'get' |

#### 具体实现
由于篇幅限制，代码已经托管到 github 上了，详见：https://github.com/LuckyWinty/ToolLibrary/tree/master/src/RequestCombo

### 作为独立repo打包

这种情况适合使用 webpack 来作为打包器。我们主要配置几个点：
+ 支持各种模式的导入(umd、ES6的export、export default导出)
+ 打包压缩版用于生产环境，未压缩版用于开发环境
+ 将项目名与入口文件的返回值绑定(script引入时可以直接访问项目名称来访问包)

最后配置如下：
```js
    //webpack.config.js
    const TerserPlugin = require('terser-webpack-plugin');

    module.exports = {
        entry: {
            'RequestCombo': './src/index.js',
            'RequestCombo.min': './src/index.js'
        },
        output: {
            filename: '[name].js',
            library: 'RequestCombo',
            libraryTarget: 'umd',
            libraryExport: 'default'
        },
        mode: 'none',
        optimization: {
            minimize: true,
            minimizer: [
                new TerserPlugin({
                    include: /\.min\.js$/,
                })
            ]
        }
    }
```
### 在工具库中，用 rollup 打包

这个跟 webpack 打包的目标是一致的。就是工具不同，配置稍有差异.
```js
//为展示方便，删除了部分插件
const filesize = require('rollup-plugin-filesize')
const path = require('path')
const { terser } = require('rollup-plugin-terser')
const { name, version, author } = require('../package.json')

const componentName = process.env.COMPONENT
const componentType = process.env.COMPONENT_TYPE || 'js'

const banner = `${'/*!\n* '}${name}.js v${version}\n`
  + ` * (c) 2018-${new Date().getFullYear()} ${author}\n`
  + ' * Released under the MIT License.\n'
  + ' */'

module.exports = [
  {
    input: path.resolve(__dirname, `../src/${componentName}/src/index.${componentType}`),
    output: [
      {
        file: path.resolve(
          __dirname,
          `../src/${componentName}/dist/${componentName}.min.js`
        ),
        format: 'umd',
        name,
        banner,
        sourcemap: true,
      }
    ],
    plugins: [terser(), filesize()],
  },
  {
    input: path.resolve(__dirname, `../src/${componentName}/src/index.${componentType}`),
    output: {
      file: path.resolve(
        __dirname,
        `../src/${componentName}/dist/${componentName}.min.esm.js`
      ),
      format: 'esm',
      banner,
    },
    plugins: [terser(), filesize()],
  },
  {
    input: path.resolve(__dirname, `../src/${componentName}/src/index.${componentType}`),
    output: [
      {
        file: path.resolve(
          __dirname,
          `../src/${componentName}/dist/${componentName}.js`
        ),
        format: 'umd',
        name,
        banner,
      }
    ],
    plugins: [],
  }
]
```
### 发布到 npm 
添加用户：npm add user
升级版本：
+ 升级补丁版本号: npm version patch
+ 升级小版本号: npm version minor
+ 升级大版本号: npm version major
发布版本：npm publish