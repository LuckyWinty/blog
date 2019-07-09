const fs = require('fs')
const path = require('path')

const exportBundle = (data)=>{
    const directoryPath = path.resolve(__dirname,'dist')
    if (!fs.existsSync(directoryPath)) {
      fs.mkdirSync(directoryPath)
    }
    const filePath =  path.resolve(__dirname, 'dist/bundle.js')
    fs.writeFileSync(filePath, `${data}\n`)
}
const access = async filePath => new Promise((resolve, reject) => {
    fs.access(filePath, (err) => {
        if (err) {
        if (err.code === 'EXIST') {
            resolve(true)
        }
        resolve(false)
        }
        resolve(true)
    })
})
module.exports = exportBundle