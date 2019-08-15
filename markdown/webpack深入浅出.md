# webpack深入浅出

## 简介
webpack是一个打包模块化 JavaScript 的工具，在 webpack里一切文件皆模块，通过 Loader 转换文件，通过 Plugin 注入钩子，最后输出由多个模块组合成的文件。 webpack专注于构建模块化项目。
##### webpack的优点是
+ 专注于处理模块化的项目，能做到开箱即用、 一
+ 可通过 Plugin 扩展，完整好用又不失灵活
+ 使用场景不局限于 Web 开发：
+ 社区庞大活跃 经常引 入紧跟时代发展的新特性扩展：
+  良好的开发体验
##### webpack的缺点
+ 只能用于采用模块化开发的项目
## webpack核心概念
+ Entry 入口， webpack执行构建的第 步将从 Entry开始，可抽象成输入
+ Module 模块，在webpack里一切皆模块，一个模块对应一个文件webpack从配置的 Entry 开始，递归找出所有依赖的模块
+ Chunk代码块 Chunk 由多个模块组合而成，用于代码合并与分割
+ Loader 模块转换器，用于将模块的原内容按照需求转换成新内容
+ Plugin 扩展插件，在webpack构建流程中的特定时机会广播对应的事件，插件可以监听这些事件的发生，在特定的时机做对应的事情
## webpack流程概括
  webpack的运行流程是一个串行的过程，从启动到结束会依次执行以下流程：
1. 初始化参数 从配置文件和 Shell 语句中读取与合并参数，得出最终的参数
2. 开始编译 用上一步得到的参数初始Compiler对象，加载所有配置的插件，通
过执行对象的run方法开始执行编译
3. 确定入口 根据配置中的 Entry 找出所有入口文件
4. 编译模块 从入口文件出发，调用所有配置的 Loader 对模块进行编译，再找出该模块依赖的模块，再递归本步骤直到所有入口依赖的文件都经过了本步骤的处理
5. 完成模块编译 在经过第4步使用 Loader 翻译完所有模块后， 得到了每个模块被编译后的最终内容及它们之间的依赖关系
6. 输出资源：根据入口和模块之间的依赖关系，组装成一个个包含多个模块的 Chunk,再将每个 Chunk 转换成一个单独的文件加入输出列表中，这是可以修改输出内容的最后机会
7. 输出完成：在确定好输出内容后，根据配置确定输出的路径和文件名，将文件的内容写入文件系统中。

在以上过程中， Webpack 会在特定的时间点广播特定的事件，插件在监听到感兴趣的事件后会执行特定的逻辑，井且插件可以调用 Webpack 提供的 API 改变 Webpack 的运行结果。

#### 打包模型的基本流程
1. 利用babel完成代码转换,并生成单个文件的依赖
2. 生成依赖图谱
3. 生成最后打包代码

先看一个简化后的 webpack 打包好的文件：

    (function(modules) { // webpackBootstrap
        var installedModules = {};
        function __webpack_require__(moduleId) {

          // Check if module is in cache
          if(installedModules[moduleId]) {
            return installedModules[moduleId].exports;
          }
          // Create a new module (and put it into the cache)
          var module = installedModules[moduleId] = {
            i: moduleId,
            l: false,
            exports: {}
          };
          modules[moduleId].call(module.exports, module, module.exports, __webpack_require__);
          module.l = true;
          return module.exports;
        }
        // expose the modules object (__webpack_modules__)
        __webpack_require__.m = modules;

        // expose the module cache
        __webpack_require__.c = installedModules;

        // define getter function for harmony exports
        __webpack_require__.d = function(exports, name, getter) {
          if(!__webpack_require__.o(exports, name)) {
            Object.defineProperty(exports, name, { enumerable: true, get: getter });
          }
        };

        // define __esModule on exports
        __webpack_require__.r = function(exports) {
          if(typeof Symbol !== 'undefined' && Symbol.toStringTag) {
            Object.defineProperty(exports, Symbol.toStringTag, { value: 'Module' });
          }
          Object.defineProperty(exports, '__esModule', { value: true });
        };

        // create a fake namespace object
        // mode & 1: value is a module id, require it
        // mode & 2: merge all properties of value into the ns
        // mode & 4: return value when already ns object
        // mode & 8|1: behave like require
        __webpack_require__.t = function(value, mode) {
          if(mode & 1) value = __webpack_require__(value);
          if(mode & 8) return value;
          if((mode & 4) && typeof value === 'object' && value && value.__esModule) return value;
          var ns = Object.create(null);
          __webpack_require__.r(ns);
          Object.defineProperty(ns, 'default', { enumerable: true, value: value });
          if(mode & 2 && typeof value != 'string') for(var key in value) __webpack_require__.d(ns, key, function(key) { return value[key]; }.bind(null, key));
          return ns;
        };

        // getDefaultExport function for compatibility with non-harmony modules
        __webpack_require__.n = function(module) {
          var getter = module && module.__esModule ?
            function getDefault() { return module['default']; } :
            function getModuleExports() { return module; };
          __webpack_require__.d(getter, 'a', getter);
          return getter;
        };

        // Object.prototype.hasOwnProperty.call
        __webpack_require__.o = function(object, property) { return Object.prototype.hasOwnProperty.call(object, property); };

        // __webpack_public_path__
        __webpack_require__.p = "";

        // Load entry module and return exports
        return __webpack_require__(__webpack_require__.s = "./src/index.js");
      })({
      "./src/index.js":(function(module, __webpack_exports__, __webpack_require__) {
      "use strict";
      __webpack_require__.r(__webpack_exports__);
      /* harmony import */ var _info_js__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ./info.js */ "./src/info.js");
      console.log(_info_js__WEBPACK_IMPORTED_MODULE_0__["default"])
      }),
      "./src/info.js":
      (function(module, __webpack_exports__, __webpack_require__) {
      "use strict";
      __webpack_require__.r(__webpack_exports__);
      /* harmony import */ var _name_js__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ./name.js */ "./src/name.js");

      const info = `${_name_js__WEBPACK_IMPORTED_MODULE_0__["name"]} is beautiful`
      /* harmony default export */ __webpack_exports__["default"] = (info);
      }),
      "./src/name.js":
      (function(module, __webpack_exports__, __webpack_require__) {
      "use strict";
      __webpack_require__.r(__webpack_exports__);
      /* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "name", function() { return name; });
      const name = 'winty'
      })
    }); 

这里的moduleId就是模块路径，如./src/commonjs/index.js。

>webpack4中只有optimization.namedModules为true，此时moduleId才会为模块路径，否则是数字id。为了方便开发者调试，在development模式下optimization.namedModules参数默认为true。

**ES6 module： export/export default 打包**

    "./src/info.js":
      (function(module, __webpack_exports__, __webpack_require__) {
      "use strict";
      __webpack_require__.r(__webpack_exports__);
      /* harmony import */ var _name_js__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ./name.js */ "./src/name.js");

      const info = `${_name_js__WEBPACK_IMPORTED_MODULE_0__["name"]} is beautiful`
      /* harmony default export */ __webpack_exports__["default"] = (info);
      }),
      "./src/name.js":
      (function(module, __webpack_exports__, __webpack_require__) {
      "use strict";
      __webpack_require__.r(__webpack_exports__);
      /* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "name", function() { return name; });
      const name = 'winty'
      })

这里用到了挂载在__webpack_require__上的两个函数d和r：

+ d在exports对象上为某一属性设置getter函数。
+ r在exports对象上设置属性__esModule: true。

设置getter是为了实现ES6模块的动态绑定，即export的值修改之后能够动态更新到import。但如果export default一个非函数或class，则不会动态绑定。

打包更多相关：https://cloud.tencent.com/developer/article/1172453