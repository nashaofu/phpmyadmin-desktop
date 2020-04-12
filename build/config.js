const path = require('path')

const context = path.resolve(__dirname, '../')
const srcDir = path.resolve(context, './src')
const distDir = path.resolve(context, './dist')

module.exports = {
  context,
  srcDir,
  distDir,
  main: path.resolve(srcDir, 'main/index.js'),
  renderer: {
    app: {
      entry: path.resolve(srcDir, 'renderer/app/index.js'),
      template: path.resolve(srcDir, 'renderer/app/index.html')
    },
    install: {
      entry: path.resolve(srcDir, 'renderer/install/index.js'),
      template: path.resolve(srcDir, 'renderer/install/index.html')
    }
  },
  port: 8080,
  sourceMap: false
}
