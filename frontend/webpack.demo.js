const { merge } = require('webpack-merge');
const development = require('./webpack.common.js');

module.exports = merge(development, {
  output: {
    publicPath: "./"
  }
});