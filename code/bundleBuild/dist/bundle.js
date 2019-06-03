
        (function(graph) {
            //require函数的本质是执行一个模块的代码，然后将相应变量挂载到exports对象上
            function require(module) {
                //localRequire的本质是拿到依赖包的exports变量
                function localRequire(relativePath) {
                    return require(graph[module].dependencies[relativePath]);
                }
                var exports = {};
                (function(require, exports, code) {
                    eval(code);
                })(localRequire, exports, graph[module].code);
                return exports;//函数返回指向局部变量，形成闭包，exports变量在函数执行后不会被摧毁
            }
            require('./src/index.js')
        })({"./src/index.js":{"dependencies":{"./info.js":"./src/info.js"},"code":"\"use strict\";\n\nvar _info = _interopRequireDefault(require(\"./info.js\"));\n\nfunction _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { \"default\": obj }; }\n\nconsole.log(_info[\"default\"]);"},"./src/info.js":{"dependencies":{"./name.js":"./src/name.js"},"code":"\"use strict\";\n\nObject.defineProperty(exports, \"__esModule\", {\n  value: true\n});\nexports[\"default\"] = void 0;\n\nvar _name = require(\"./name.js\");\n\nvar info = \"\".concat(_name.name, \" is beautiful\");\nvar _default = info;\nexports[\"default\"] = _default;"},"./src/name.js":{"dependencies":{},"code":"\"use strict\";\n\nObject.defineProperty(exports, \"__esModule\", {\n  value: true\n});\nexports.name = void 0;\nvar name = 'winty';\nexports.name = name;"}})
