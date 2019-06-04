const exportDependencies = require('./exportDependencies')

//entry为入口文件
const exportGraph = (entry)=>{
    const entryModule = exportDependencies(entry)
    //这个数组是核心，虽然现在只有一个元素，往后看你就会明白
    const graphArray = [entryModule]
    for(let i = 0; i < graphArray.length; i++){
        const item = graphArray[i];
        const {dependencies} = item;//拿到文件所依赖的模块集合(键值对存储)
        for(let j in dependencies){
            graphArray.push(
                exportDependencies(dependencies[j])
            )//关键代码，目的是将入口模块及其所有相关的模块放入数组
        }
    }
    //接下来生成图谱
    const graph = {}
    graphArray.forEach(item => {
        graph[item.filename] = {
            dependencies: item.dependencies,
            code: item.code
        }
    })
    return graph
}
module.exports = exportGraph


// //获取用户为 Loader 传入的 options
// const loaderUtils =require ('loader-utils'); 
// module.exports = (source) => {
//     const options= loaderUtils.getOptions(this); 
//     return source; 
// }
// //返回sourceMap
// module.exports = (source)=> { 
//     this.callback(null, source, sourceMaps); 
//     //当我们使用 this.callback 返回内容时 ，该 Loader 必须返回 undefined,
//     //以让 Webpack 知道该 Loader 返回的结果在 this.callback 中，而不是 return中
//     return; 
// }
// // 异步
// module.exports = (source) => {
//     const callback = this.async()
//     someAsyncOperation(source, (err, result, sourceMaps, ast) => {
//         // 通过 callback 返回异步执行后的结果
//         callback(err, result, sourceMaps, ast)
//     })
// }
// //缓存加速
// module.exports = (source) => { 
//     //关闭该 Loader 的缓存功能
//     this.cacheable(false)
//     return source 
// }