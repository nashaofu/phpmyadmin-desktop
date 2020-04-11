const config = require('../config')
const merge = require('webpack-merge')
const styleLoader = require('./style-loader')
const TerserPlugin = require('terser-webpack-plugin')
const webpackConfig = require('./webpack.config')
const MiniCssExtractPlugin = require('mini-css-extract-plugin')
const OptimizeCSSAssetsPlugin = require('optimize-css-assets-webpack-plugin')

module.exports = merge(webpackConfig, {
  mode: 'production',
  output: {
    filename: 'js/[name].[contenthash:8].js',
    chunkFilename: 'js/[id].[contenthash:8].js'
  },
  module: {
    rules: styleLoader({
      sourceMap: config.sourceMap,
      extract: true
    })
  },
  devtool: config.sourceMap ? 'source-map' : false,
  optimization: {
    minimizer: [
      new TerserPlugin({
        parallel: true,
        cache: true,
        sourceMap: config.sourceMap
      }),
      new OptimizeCSSAssetsPlugin({
        cssProcessorOptions: {
          map: config.sourceMap
            ? {
              // `inline: false` forces the sourcemap to be output into a
              // separate file
              inline: false,
              // `annotation: true` appends the sourceMappingURL to the end of
              // the css file, helping the browser find the sourcemap
              annotation: true
            }
            : false
        }
      })
    ]
  },
  plugins: [
    new MiniCssExtractPlugin({
      filename: 'css/[name].[contenthash:8].css'
    })
  ]
})
