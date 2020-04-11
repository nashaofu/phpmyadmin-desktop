const config = require('../config')
const merge = require('webpack-merge')
const webpackConfig = require('./webpack.config')

module.exports = merge(webpackConfig, {
  mode: 'production',
  devtool: config.sourceMap ? 'source-map' : false
})
