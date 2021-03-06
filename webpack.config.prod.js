const process = require('process');
const webpack = require('webpack');
const _ = require('./webpack.config.dev.js');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const ExtractTextPlugin = require('extract-text-webpack-plugin');
const _package = require('./package.json');

_.entry = './src/index';
_.plugins = [
  /** Will not work if ExtractTextPlugin is removed from module.ruls */
  new ExtractTextPlugin('[name]-[hash].css'),
  new HtmlWebpackPlugin({
    template: 'src/index.html',
  }),

  new webpack.optimize.CommonsChunkPlugin({
    name: 'manifest',
  }),

  new webpack.HashedModuleIdsPlugin(),

  new webpack.DefinePlugin({
    'process.env': {
      NODE_ENV: JSON.stringify('production'),
    },
    ENV_DEVTOOLS_DISABLED: JSON.stringify(process.env.DEVTOOLS_DISBLED),
    ENV_APP_ROOT: JSON.stringify(process.env.APP_ROOT),
    ENV_API_ROOT: JSON.stringify(process.env.API_ROOT),
    ENV_LOGIN_ROOT: JSON.stringify(process.env.LOGIN_ROOT),
    ENV_LISH_ROOT: JSON.stringify(process.env.LISH_ROOT),
    ENV_GA_ID: JSON.stringify(process.env.GA_ID),
    ENV_SENTRY_URL: JSON.stringify(process.env.SENTRY_URL),
    ENV_VERSION: JSON.stringify(_package.version),
  }),
  new webpack.optimize.UglifyJsPlugin({
    sourceMap: true,
    compressor: {
      warnings: false,
    },
  }),
  new webpack.optimize.AggressiveMergingPlugin(),
];

module.exports = _;
