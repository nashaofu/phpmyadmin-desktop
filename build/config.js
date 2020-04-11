const path = require('path')

const context = path.resolve(__dirname, '../')
const srcDir = path.resolve(context, './src')
const distDir = path.resolve(context, './dist')

module.exports = {
  context,
  srcDir,
  distDir,
  entry: {
    main: path.resolve(srcDir, 'main/index.js'),
    renderer: path.resolve(srcDir, 'renderer/index.js')
  },
  port: 8080,
  sourceMap: false
}
