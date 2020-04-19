const path = require('path')
const config = require('../config')
const { dependencies } = require('../../package.json')

function resolve (dir) {
  return path.resolve(config.context, dir)
}

module.exports = {
  context: config.context,
  target: 'electron-main',
  entry: {
    app: config.main
  },
  output: {
    path: config.distDir,
    filename: 'main/[name].js'
  },
  resolve: {
    alias: {
      '@': resolve('src')
    }
  },
  externals: Object.keys(dependencies).reduce(
    (externals, key) => {
      externals[key] = `commonjs2 ${key}`
      return externals
    },
    {
      'electron-debug': 'commonjs2 electron-debug',
      'electron-devtools-installer': 'commonjs2 electron-devtools-installer'
    }
  ),
  module: {
    rules: [
      {
        test: /\.js$/,
        loader: 'eslint-loader',
        enforce: 'pre',
        exclude: [resolve('node_modules')],
        options: {
          emitWarning: true,
          formatter: 'eslint/lib/cli-engine/formatters/codeframe'
        }
      },
      {
        test: /\.js$/,
        exclude: [resolve('node_modules')],
        loader: 'babel-loader'
      }
    ]
  },
  node: {
    __dirname: false,
    __filename: false
  }
}
