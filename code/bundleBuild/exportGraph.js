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
            )//敲黑板！关键代码，目的是将入口模块及其所有相关的模块放入数组
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