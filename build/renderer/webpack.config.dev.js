const config = require('../config')
const merge = require('webpack-merge')
const styleLoader = require('./style-loader')
const webpackConfig = require('./webpack.config')
const FriendlyErrorsPlugin = require('friendly-errors-webpack-plugin')

module.exports = merge(webpackConfig, {
  mode: 'development',
  watch: true,
  module: {
    rules: styleLoader({
      sourceMap: true,
      extract: false
    })
  },
  devtool: 'eval-cheap-source-map',
  devServer: {
    host: '0.0.0.0',
    port: config.port,
    hot: true,
    publicPath: '',
    disableHostCheck: true,
    clientLogLevel: 'warning',
    compress: true,
    overlay: true,
    quiet: true,
    inline: true
  },
  plugins: [
    new FriendlyErrorsPlugin({
      compilationSuccessInfo: {
        messages: ['渲染进程编译成功']
      }
    })
  ]
})
