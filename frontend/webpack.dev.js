// webpack.dev.js
const { merge } = require('webpack-merge');
const common = require('./webpack.common.js');

module.exports = merge(common, {
    mode: "development",
    devServer: {
        host: '0.0.0.0',
        allowedHosts: ['rk-devbox1']
      },


    devtool: 'source-map',
});
