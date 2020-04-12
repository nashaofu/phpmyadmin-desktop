const merge = require('webpack-merge')
const webpackConfig = require('./webpack.config')
const FriendlyErrorsPlugin = require('friendly-errors-webpack-plugin')
const ElectronDevWebpackPlugin = require('electron-dev-webpack-plugin')

module.exports = merge(webpackConfig, {
  mode: 'development',
  watch: true,
  devtool: 'source-map',
  plugins: [
    new ElectronDevWebpackPlugin(),
    new FriendlyErrorsPlugin({
      compilationSuccessInfo: {
        messages: ['主进程编译成功']
      }
    })
  ]
})
