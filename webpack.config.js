const path = require('path')
const webpack = require('webpack')

const pkg = require('./package.json')

const distFolder = path.resolve(__dirname, 'dist')

const config = {
  entry: './examples/app.js',
  output: {
    path: distFolder,
    publicPath: '/',
    filename: 'bundle.js',
  },
  module: {
    loaders: [{
      test: /\.js$/,
      exclude: /node_modules/,
      loaders: ['babel'],
    }],
  },
  plugins: [
    new webpack.DefinePlugin({
      __VERSION__: JSON.stringify(pkg.version),
    }),
  ],
}

if (process.env.BUILD_EXAMPLES) {
  config.plugins.push(new webpack.optimize.UglifyJsPlugin({
    compress: {
      warnings: false,
    },
  }))
  config.plugins.push(new webpack.DefinePlugin({
    'process.env.NODE_ENV': '"production"',
  }))
}

module.exports = config
