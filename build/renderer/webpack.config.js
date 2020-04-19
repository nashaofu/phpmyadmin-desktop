const path = require('path')
const config = require('../config')
const { ProgressPlugin } = require('webpack')
const HtmlWebpackPlugin = require('html-webpack-plugin')

function resolve (dir) {
  return path.resolve(config.context, dir)
}

module.exports = {
  context: config.context,
  target: 'electron-renderer',
  entry: Object.keys(config.renderer).reduce((entry, key) => {
    entry[key] = config.renderer[key].entry
    return entry
  }, {}),
  output: {
    path: path.join(config.distDir, './renderer'),
    filename: 'js/[name].js'
  },
  resolve: {
    extensions: ['.wasm', '.mjs', '.js', '.jsx', '.json'],
    alias: {
      '@': resolve('src')
    }
  },
  externals: {
    got: 'commonjs2 got',
    execa: 'commonjs2 execa',
    'fs-extra': 'commonjs2 fs-extra',
    decompress: 'commonjs2 decompress',
    'sudo-prompt': 'commonjs2 sudo-prompt'
  },
  module: {
    rules: [
      {
        test: /\.jsx?$/,
        loader: 'eslint-loader',
        enforce: 'pre',
        exclude: [resolve('node_modules')],
        options: {
          emitWarning: true,
          formatter: 'eslint/lib/cli-engine/formatters/codeframe'
        }
      },
      {
        test: /\.jsx?$/,
        exclude: [resolve('node_modules')],
        loader: 'babel-loader'
      },
      {
        test: /\.(png|jpe?g|gif|svg)(\?.*)?$/,
        loader: 'url-loader',
        options: {
          limit: 10000,
          name: 'img/[name].[hash:7].[ext]'
        }
      },
      {
        test: /\.(mp4|webm|ogg|mp3|wav|flac|aac)(\?.*)?$/,
        loader: 'url-loader',
        options: {
          limit: 10000,
          name: 'media/[name].[hash:7].[ext]'
        }
      },
      {
        test: /\.(woff2?|eot|ttf|otf)(\?.*)?$/,
        loader: 'url-loader',
        options: {
          limit: 10000,
          name: 'fonts/[name].[hash:7].[ext]'
        }
      }
    ]
  },
  plugins: [
    new ProgressPlugin(),
    ...Object.keys(config.renderer).map(key => {
      const template = config.renderer[key].template
      return new HtmlWebpackPlugin({
        filename: `${key}.html`,
        template: template,
        inject: true,
        chunksSortMode: 'auto',
        chunks: [key]
      })
    })
  ]
}
