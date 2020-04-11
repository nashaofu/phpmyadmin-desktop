const path = require('path')
const config = require('../config')
const { ProgressPlugin } = require('webpack')
const { dependencies } = require('../../package.json')

function resolve (dir) {
  return path.resolve(config.context, dir)
}

module.exports = {
  context: config.context,
  target: 'electron-main',
  entry: {
    app: config.entry.main
  },
  output: {
    path: config.distDir,
    filename: 'main/[name].js'
  },
  resolve: {
    alias: {
      '@': resolve('src/main')
    }
  },
  externals: Object.keys(dependencies).reduce((externals, key) => {
    externals[key] = `commonjs2 ${key}`
    return externals
  }, {}),
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
  plugins: [new ProgressPlugin()]
}
