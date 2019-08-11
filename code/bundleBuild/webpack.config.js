const path = require('path');

module.exports = {
	mode: 'development', // 不压缩
	entry: {
		chunk1: './src/index.js'
	},
	output: {
		path: path.resolve(__dirname, './build'),
		filename: '[name]-[chunkhash:8].js' // 为了后面的多入口
	},
	devtool: '' // 去掉sourcemap，模块不会被eval包裹，更直观
};