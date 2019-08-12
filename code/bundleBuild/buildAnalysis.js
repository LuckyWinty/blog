var modulesData = {
	"./src/index.js":(function(module, __webpack_exports__, __webpack_require__) {
    __webpack_require__.r(__webpack_exports__);
    var _info_js__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__("./src/info.js");
    console.log(_info_js__WEBPACK_IMPORTED_MODULE_0__["default"])
    }),
    "./src/name.js":
    (function(module, __webpack_exports__, __webpack_require__) {
    __webpack_require__.r(__webpack_exports__);
    __webpack_require__.d(__webpack_exports__, "name", function() { return name; });
    const name = 'winty'
    })
};

(function (modules) {
	function __webpack_require__(moduleId) {...}
	return __webpack_require__("./src/index.js");
})(modulesData);









// 每个模块的缓存
var installedModules = {};

function __webpack_require__(moduleId) {

    // 查看是否已缓存，有则直接返回exports对象
    if (installedModules[moduleId]) {
        return installedModules[moduleId].exports;
    }
    // 无缓存，则新建一个module对象
    var module = installedModules[moduleId] = {
        i: moduleId,
        l: false,
        exports: {}
    };

    // 执行模块文件代码
    modules[moduleId].call(module.exports, module, module.exports, __webpack_require__);

    // 标识为已加载
    module.l = true;

    // 返回module.exports对象
    return module.exports;
}