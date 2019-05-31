const client = require('scp2')

class UploadToServerPlugin{
    constructor(pluginOptions){
        this.options = pluginOptions
    }
    apply(compiler){
        compiler.plugin('emit', function (compilation, callback) {
            console.log('compilation',compilation);
        });
        compiler.plugin('done',(stats)=>{
            // console.log('stats:',stats)
            this.doneCallback(stats)
        })
        compiler.plugin('failed',(err)=>{
            this.failCallback(err)
        })
    }
    doneCallback(stats){
        const output_path = stats.compiler.Compiler.outputPath
        client.scp(this.options.local_path||output_path, {
            host: this.options.host,
            username: this.options.username,
            password: this.options.password,
            path: this.options.server_path
        }, function (err) {
            console.error("upload fail",err)
        })
    }
}
module.exports = UploadToServerPlugin